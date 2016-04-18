/*eslint no-console: 0 */
import Chat from "../chat/chat";
import Event from "../utils/event";
import {getReadableTime} from "../utils/utils";
import {normaliseNick} from "./irc_util";
import iter from "lazy.js";

export default {
    // RPL_WELCOME
    1: function (from, nick, msg) {
        if (this.irc.state === "disconnecting") {
            this.irc.quit();
            return;
        }
        this.irc.nick = nick;
        this.irc.state = "connected";
        this.irc.emit("connect");
        this.irc.emitMessage("welcome", Chat.SERVER_WINDOW, msg);

        return iter(this.irc.channels)
            .pairs()
            .map(([chanName, channel]) => channel.key ?
                    this.irc.send("JOIN", chanName, channel.key)
                    : this.irc.send("JOIN", chanName)
            ).toArray();
    },

    // RPL_ISUPPORT
    // We might get multiple, so this just adds to the support object.
    5: function (...args) {
        // Parameters passed in arguments, pull out the parts we want.
        iter(args.slice(2, args.length - 1))
            .map(arg => arg.split(/=/, 2))
            .async(0)
            .each(param => {
                let k = param[0].toLowerCase();
                if (param.length === 1) this.irc.support[k] = true;
                else this.irc.support[k] = param[1];
            });
    },

    // RPL_NAMREPLY
    353: function (from, target, privacy, channel, names) {
        var newNameSeq,
            lcChan = channel.toLowerCase(),
            partialNs = this.irc.partialNameLists,
            _ref1 = partialNs[lcChan],
            nameList = _ref1 != null ? _ref1 : partialNs[lcChan] = {};

        newNameSeq = iter(names.split(/\x20/))
            .map(name => name.replace(/^[~&@%+]/, ""))
            .compact();

        newNameSeq
            .async(0)
            .each(name => {
                nameList[normaliseNick(name)] = name;
            });

        return this.irc.emit("names", channel, newNameSeq.toArray());
    },

    // RPL_ENDOFNAMES
    366: function (from, target, channel) {
        let lCChannel = channel.toLowerCase();
        if (this.irc.channels[lCChannel]) {
            this.irc.channels[lCChannel].names = this.irc.partialNameLists[lCChannel];
        }
        return delete this.irc.partialNameLists[channel.toLowerCase()];
    },

    NICK: function (from, newNick) {
        let normNick = this.irc.util.normaliseNick(from.nick),
            newNormNick = this.irc.util.normaliseNick(newNick),
            commonChans = iter(this.irc.channels)
                .pairs()
                .filter(([, chan]) => !(normNick in chan.names));

        if (this.irc.isOwnNick(from.nick)) {
            this.irc.nick = newNick;
            this.irc.emit("nick", newNick);
            this.irc.emitMessage("nick", Chat.SERVER_WINDOW, from.nick, newNick);
        }
        // Update channel names list
        commonChans.each(([, chan]) => {
            delete chan.names[normNick];
            chan.names[newNormNick] = newNick;
        });
        return commonChans
            .map(([chanName]) => this.irc.emitMessage("nick", chanName, from.nick, newNick));
    },

    JOIN: function (from, chanName) {
        var chan = this.irc.channels[chanName.toLowerCase()];
        if (this.irc.isOwnNick(from.nick)) {
            if (chan != null) {
                chan.names = [];
            } else {
                chan = this.irc.channels[chanName.toLowerCase()] = {
                    channel: chanName,
                    names: []
                };
            }
            this.irc.emit("joined", chanName);
        }
        if (chan) {
            chan.names[this.irc.util.normaliseNick(from.nick)] = from.nick;
            return this.irc.emitMessage("join", chanName, from.nick);
        } else {
            return console.warn(`Got JOIN for channel we're not in (${chan})`);
        }
    },

    PART: function (from, chan) {
        var c = this.irc.channels[chan.toLowerCase()];
        if (c) {
            this.irc.emitMessage("part", chan, from.nick);
            if (this.irc.isOwnNick(from.nick)) {
                delete this.irc.channels[chan.toLowerCase()];
                return this.irc.emit("parted", chan);
            } else {
                return delete c.names[this.irc.util.normaliseNick(from.nick)];
            }
        } else {
            return console.warn(`Got TOPIC for a channel we're not in: ${chan}`);
        }
    },

    INVITE: function (from, target, channel) {
        return this.irc.emitMessage("notice", Chat.CURRENT_WINDOW, `${from.nick} invites you to join ${channel}`);
    },

    QUIT: function (from, reason) {
        var normNick = this.irc.util.normaliseNick(from.nick);

        return iter(this.irc.channels)
            .pairs()
            .filter(([, chan]) => !(normNick in chan.names))
            .tap(([, chan]) => delete chan.names[normNick])
            .map(([chanName]) => this.irc.emitMessage("quit", chanName, from.nick, reason));
    },

    PRIVMSG: function (from, target, msg) {
        if (this.ctcpHandler.isCTCPRequest(msg)) {
            return this._handleCTCPRequest(from, target, msg);
        } else {
            return this.irc.emitMessage("privmsg", target, from.nick, msg);
        }
    },

    NOTICE: function (from, target, msg) {
        if (!from.user) {
            return this.irc.emitMessage("notice", Chat.SERVER_WINDOW, msg);
        }
        var event = new Event("message", "privmsg", from.nick, msg);
        event.setContext(this.irc.server, Chat.CURRENT_WINDOW);
        event.addStyle("notice");
        return this.irc.emitCustomMessage(event);
    },

    PING: function (from, payload) {
        return this.irc.send("PONG", payload);
    },
    /**
     * @param  {any} from
     * @param  {any} payload
     */
    PONG: function () { },

    TOPIC: function (from, channel, topic) {
        if (this.irc.channels[channel.toLowerCase()] != null) {
            this.irc.channels[channel.toLowerCase()].topic = topic;
            return this.irc.emitMessage("topic", channel, from.nick, topic);
        } else {
            return console.warn(`Got TOPIC for a channel we're not in (${channel})`);
        }
    },

    KICK: function (from, channel, to, reason) {
        if (!this.irc.channels[channel.toLowerCase()]) {
            console.warn(`Got KICK message from ${from} to ${to} in channel we are not in (${channel})`);
            return;
        }
        delete this.irc.channels[channel.toLowerCase()].names[to];
        this.irc.emitMessage("kick", channel, from.nick, to, reason);
        if (this.irc.isOwnNick(to)) {
            this.irc.emit("parted", channel);
        }
    },

    MODE: function (from, chan, modeList, ...toList) {
        if (toList.length < 1) return;

        iter(modeList.split(/(?=[+-]\w)/))
            .map(modes => iter(modes.split("")).slice(1).map(mode => modes[0] + mode))
            .flatten()
            .zip(toList)
            .each(([mode, argument]) => this.irc.emitMessage("mode", chan, from.nick, argument, mode));
        return;
    },

    // RPL_UMODEIS
    221: function (from, to, mode) {
        return this.irc.emitMessage("user_mode", Chat.CURRENT_WINDOW, to, mode);
    },

    // RPL_AWAY
    301: function (from, to, nick, msg) {
        return this._emitUserNotice(to, nick, `is away: ${msg}`);
    },

    // RPL_UNAWAY
    305: function (from, to, msg) {
        this.irc.away = false;
        return this.irc.emitMessage("away", Chat.CURRENT_WINDOW, msg);
    },

    // RPL_NOWAWAY
    306: function (from, to, msg) {
        this.irc.away = true;
        return this.irc.emitMessage("away", Chat.CURRENT_WINDOW, msg);
    },

    /**
     * RPL_WHOISHELPOP (and others; overloaded).
     * Not useful; drop it
     * @param  {any} from
     * @param  {any} to
     * @param  {any} nick
     * @param  {any} msg
     */
    310: function () {},

    // RPL_WHOISUSER
    311: function (from, to, nick, user, addr, _, info) {
        var message = `is ${nick}!${user}@${addr} (${info})`;
        return this._emitUserNotice(to, nick, message);
    },

    // RPL_WHOISSERVER
    312: function (from, to, nick, server, desc) {
        return this._emitUserNotice(to, nick, `connected via ${server} (${desc})`);
    },

    // RPL_WHOISOPERATOR (is an IRCOp)
    313: function (from, to, nick, msg) {
        // server supplies the message text
        return this._emitUserNotice(to, nick, msg);
    },

    // RPL_WHOWASUSER
    314: function (from, to, nick, user, addr, _, info) {
        var message = `was ${nick}!${user}@${addr} (${info})`;
        return this._emitUserNotice(to, nick, message);
    },

    // RPL_ENDOFWHO
    315: function (from, to, nick, msg) {
        // server supplies the message text
        return this.irc.emitMessage("notice", Chat.SERVER_WINDOW, msg);
    },

    // RPL_WHOISIDLE
    317: function (from, to, nick, seconds, signon) {
        var date = getReadableTime(parseInt(signon) * 1000),
            message = `has been idle for ${seconds} seconds, and signed on at: ${date}`;
        return this._emitUserNotice(to, nick, message);
    },

    // RPL_ENDOFWHOIS
    318: function (from, to, nick, msg) {
        // server supplies the message text
        return this._emitUserNotice(to, nick, msg);
    },

    // RPL_WHOISCHANNELS
    319: function (from, to, nick, channels) {
        return this._emitUserNotice(to, nick, `is on channels: ${channels}`);
    },

    //321 LIST START
    //322 LIST ENTRY
    //323 END OF LIST
    322: function (from, to, channel, users, topic) {
        //var message = `${channel} ${users} ${topic}`;
        return this.irc.emitMessage("list", Chat.SERVER_WINDOW, channel, users, topic);
    },


    // RPL_CHANNELMODEIS
    324: function (from, to, channel, mode, modeParams) {
        var message = `Channel modes: ${mode} ${modeParams || ""}`;
        return this.irc.emitMessage("notice", channel, message);
    },

    // RPL_CHANNELCREATED
    329: function (from, to, channel, secondsSinceEpoch) {
        var message = `Channel created on ${getReadableTime(parseInt(secondsSinceEpoch * 1000))}`;
        return this.irc.emitMessage("notice", channel, message);
    },

    // RPL_WHOISACCOUNT (NickServ registration)
    330: function (from, to, nick, loggedin, msg) {
        return this._emitUserNotice(to, nick, `${msg} ${loggedin}`);
    },

    /**
     * RPL_NOTOPIC
     * @param  {any} from
     * @param  {any} to
     * @param  {any} channel
     * @param  {any} msg
     */
    331: function (from, to, channel) {
        return this.handle("TOPIC", {}, channel);
    },

    // RPL_TOPIC
    332: function (from, to, channel, topic) {
        return this.handle("TOPIC", {}, channel, topic);
    },

    // RPL_TOPICWHOTIME
    333: function (from, to, channel, who, time) {
        return this.irc.emitMessage("topic_info", channel, who, time);
    },

    // RPL_WHOISACTUALLY (ircu, and others)
    338: function (from, to, nick, realident, realip, msg) {
        var message = `is actually ${realident}/${realip} (${msg})`;
        return this._emitUserNotice(to, nick, message);
    },

    // RPL_WHOREPLY
    352: function (from, to, chan, ident, addr, serv, nick, flags, data) {
        var space = data.indexOf(" ");
        var m1 = `${chan}: ${nick}`;
        var m2 = (flags.substring(0, 1) == "G" ? " (AWAY)" : "");
        var m3 = ` | ${ident}@${addr} (${data.substring(space + 1)}) | via ${serv}, hops ${data.substring(0, space)}`;
        return this.irc.emitMessage("notice", Chat.SERVER_WINDOW, m1 + m2 + m3);
    },

    // RPL_ENDOFWHOWAS
    369: function (from, to, nick, msg) {
        // server supplies the message text
        return this._emitUserNotice(to, nick, msg);
    },

    /**
     * Overloaded by Freenode, ignorable WHOIS reply (repeat of info in 311)
     * @param  {any} from
     * @param  {any} to
     * @param  {any} nick
     * @param  {any} msg
     */
    378: function () {},

    // ERR_NICKNAMEINUSE
    433: function (from, nick, taken) {
        var newNick = `${taken}_`;
        if (nick === newNick) {
            newNick = void 0;
        }
        this.irc.emitMessage("nickinuse", Chat.CURRENT_WINDOW, taken, newNick);
        if (newNick) {
            return this.irc.send("NICK", newNick);
        }
    },

    // RPL_WHOISSECURE
    671: function (from, to, nick, msg) {
        // server supplies the message text
        return this._emitUserNotice(to, nick, msg);
    },

    // The default error handler for error messages. This handler is used for
    // all 4XX error messages unless a handler is explicitly specified.
    //
    // Messages are displayed in the following format:
    // "<arg1> <arg2> ... <argn>: <message>
    //
    error: function (from, to, ...args) {
        var message,
            msg = args[args.length - 1];
        args.pop();
        if (args.length > 0) {
            message = `${args.join(" ")} :${msg}`;
        } else {
            message = msg;
        }
        return this.irc.emitMessage("error", Chat.CURRENT_WINDOW, message);
    },

    KILL: function (from, victim, killer, msg) {
        return this.irc.emitMessage("kill", Chat.CURRENT_WINDOW, killer.nick, victim, msg);
    }
};