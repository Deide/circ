import {getReadableTime} from "../utils/utils";
import MessageHandler from "../utils/message_handler";
import NickMentionedNotification from "./nick_mentioned_notification";
import MessageFormatter from "./message_formatter";
import ChatLog from "./chat_log";

/**
 * The formatter.setMessage() method accepts placeholder variables (#to, #from,
 *  #content). By default, the first argument replaces #from, the 2nd argument
 *  replaces #to and the last argument replaces #content.
 */
const HANDLERS = {
    topic(from, topic) {
        this._chat.updateStatus();
        this._formatter.setContent(topic);
        if (!topic) {
            this._formatter.addStyle("notice");
            return this._formatter.setMessage("no topic is set");
        } else if (!from) {
            this._formatter.addStyle("notice");
            return this._formatter.setMessage("the topic is: #content");
        } else {
            this._formatter.addStyle("update");
            return this._formatter.setMessage("#from changed the topic to: #content");
        }
    },
    /**
     * Display when the topic was set and who it was set by.
     */
    topic_info(who, secondsSinceEpoch) {
        this._formatter.addStyle("notice");
        // The time needs converted to milliseconds since javascript doesn't have a way
        // to set the clock in seconds from epoch
        this._formatter.setContent(getReadableTime(parseInt(secondsSinceEpoch * 1000)));
        this._formatter.setMessage("Topic set by #from on #content.");
        return this._formatter.setPrettyFormat(false);
    },
    list(channel, users, topic) {
        this._formatter.addStyle("list");
        this._formatter.setContent(topic);
        var msg = `${channel} ${users} #content`;
        return this._formatter.setMessage(msg);
    },
    join(nick) {
        this._formatter.addStyle("update");
        this._formatter.setMessage("#from joined the channel");
        return this._win.nicks.add(nick);
    },
    part(nick) {
        this._formatter.addStyle("update");
        this._formatter.setMessage("#from left the channel");
        return this._win.nicks.remove(nick);
    },
    /**
     * @param  {any} from
     * @param  {any} to
     * @param  {any} reason
     */
    kick(from, to) {
        this._formatter.addStyle("update");
        this._formatter.setMessage("#from kicked #to from the channel: #content");
        return this._win.nicks.remove(to);
    },
    nick(from, to) {
        if (this._isOwnNick(to)) {
            this._formatter.setFromUs(true);
            this._formatter.setToUs(false);
        }
        this._formatter.addStyle("update");
        this._formatter.setMessage("#from is now known as #to");
        if (!this._win.isServerWindow()) {
            this._win.nicks.remove(from);
            return this._win.nicks.add(to);
        }
    },
    mode(from, to, mode) {
        if (!to) return;
        this._formatter.addStyle("update");
        this._formatter.setContent(this._getModeMessage(mode));
        return this._formatter.setMessage("#from #content #to");
    },
    user_mode(who, mode) {
        this._formatter.addStyle("notice");
        this._formatter.setContext(void 0, who, mode);
        return this._formatter.setMessage("#to has modes #content");
    },
    quit(nick, reason) {
        this._formatter.addStyle("update");
        this._formatter.setMessage("#from has quit: #content");
        this._formatter.setContent(reason);
        return this._win.nicks.remove(nick);
    },
    disconnect() {
        this._formatter.addStyle("update");
        this._formatter.setMessage("Disconnected");
        return this._formatter.setFromUs(true);
    },
    connect() {
        this._formatter.addStyle("update");
        this._formatter.setMessage("Connected");
        return this._formatter.setFromUs(true);
    },
    privmsg(from, msg) {
        this._formatter.addStyle("update");
        this._handleMention(from, msg);
        return this._formatPrivateMessage(from, msg);
    },
    breakgroup(msg) {
        if (msg == null) {
            msg = "";
        }
        return this._formatter.setContentMessage(msg);
    },
    error(msg) {
        return this._formatter.setContentMessage(msg);
    },
    system(msg) {
        return this._formatter.setContentMessage(msg);
    },
    notice(msg) {
        this._formatter.addStyle("notice-group");
        return this._formatter.setContentMessage(msg);
    },
    welcome(msg) {
        this._formatter.addStyle("group");
        return this._formatter.setContentMessage(msg);
    },
    /**
     * Generic messages - usually boring server stuff like MOTD.
     */
    other(cmd) {
        this._formatter.addStyle("group");
        return this._formatter.setContentMessage(cmd.params[cmd.params.length - 1]);
    },
    nickinuse(taken, wanted) {
        var msg;
        this._formatter.addStyle("notice");
        msg = `Nickname ${taken} already in use.`;
        if (wanted) {
            msg += ` Trying to get nickname ${wanted}.`;
        }
        return this._formatter.setMessage(msg);
    },
    away(msg) {
        this._chat.updateStatus();
        this._formatter.addStyle("notice");
        return this._formatter.setContentMessage(msg);
    },
    /**
     * @param  {any} from
     * @param  {any} to
     * @param  {any} msg
     */
    kill: function() {
        this._formatter.addStyle("notice");
        /**
         * TODO: We can't use 'from' or 'msg' because they are not being properly
         *  parsed by irc.util.parseCommand().
         */
        return this._formatter.setMessage("Kill command used on #to");
    },
    socket_error: function(errorCode) {
        this._formatter.addStyle("error");
        this._formatter.setToUs(true);
        switch (errorCode) {
        case -15:
            return this._formatter.setMessage("Disconnected: Remote host closed socket");
        default:
            return this._formatter.setMessage(`Socket Error: ${errorCode}`);
        }
    }
};

/**
 * Displays messages to the user when certain IRC events occur.
 */
export default class IRCMessageHandler extends MessageHandler {

    constructor(chat) {
        super(chat);
        this._chat = chat;
        this._handlers = HANDLERS;
        this._suspendNotifications = false;
        this._formatter = new MessageFormatter;
        this._chatLog = new ChatLog;
        this._chatLog.whitelist("privmsg");
        this._ignoredMessages = {};
    }

    setSuspendNotifications(suspend) {
        this._suspendNotifications = suspend;
    }

    /**
     * Ignore messages of a certain type when in the specified room.
     * @param {Context} context
     * @param {string} type
     */
    ignoreMessageType(context, type) {
        var _base;
        if ((_base = this._ignoredMessages)[context] == null) {
            _base[context] = {};
        }
        this._ignoredMessages[context][type.toLowerCase()] = true;
        return this._chat.storage.ignoredMessagesChanged();
    }

    /**
     * Stop ignoring messages of a certain type when in the specified room.
     * @param {Context} context
     * @param {string} type
     */
    stopIgnoringMessageType(context, type) {
        type = type.toLowerCase();
        if (!this._ignoredMessages[context][type]) return;
        delete this._ignoredMessages[context][type];
        return this._chat.storage.ignoredMessagesChanged();
    }

    getIgnoredMessages() {
        return this._ignoredMessages;
    }

    setIgnoredMessages(ignoredMessages) {
        return this._ignoredMessages = ignoredMessages;
    }

    getChatLog() {
        return this._chatLog.getData();
    }

    logMessagesFromWindow(win) {
        return win.on("message", this._chatLog.add);
    }

    /**
     * Replays the given chatlog so the user can see the conversation they
     * missed.
     */
    replayChatLog(opt_chatLogData) {
        if (opt_chatLogData) {
            this._chatLog.loadData(opt_chatLogData);
        }
        var contextList = this._chatLog.getContextList();
        for (let i = 0, len = contextList.length; i < len; i++) {
            var context = contextList[i];
            var win = this._chat.winList.get(context.server, context.channel);
            if (!win) {
                continue;
            }
            win.rawHTML(this._chatLog.get(context));
        }
    }

    /**
     * Sets which window messages will be displayed on.
     * Call this method before calling handle().
     */
    setWindow(_win) {
        var _ref1;
        this._win = _win;
        return this._formatter.setNick((_ref1 = this._win.conn) != null ? _ref1.irc.nick : void 0);
    }

    setCustomMessageStyle(customStyle) {
        return this._formatter.setCustomStyle(customStyle);
    }

    handle(type, ...params) {
        this._setDefaultValues(params);
        super.handle.apply(this, [type, ...params]);
        return this._sendFormattedMessage();
    }

    _setDefaultValues(params) {
        this.source = "";
        this._formatter.clear();
        return this._formatter.setContext(...params);
    }

    _getModeMessage(mode) {
        var post, pre;
        pre = mode[0] === "+" ? "gave" : "took";
        post = mode[0] === "+" ? "to" : "from";
        mode = this._getMode(mode);
        return `${pre} ${mode} ${post}`;
    }

    _getMode(mode) {
        switch (mode[1]) {
        case "o":
            return "channel operator status";
        case "O":
            return "local operator status";
        case "v":
            return "voice";
        case "i":
            return "invisible status";
        case "w":
            return "wall operator status";
        case "a":
            return "away status";
        default:
            return mode;
        }
    }

    _getUserAction(msg) {
        return /^\u0001ACTION (.*)\u0001/.exec(msg);
    }

    _handleMention(from, msg) {
        var nickMentioned, _ref1, _ref2;
        nickMentioned = this._nickWasMentioned(from, msg);
        if (nickMentioned) {
            this._chat.recordLastUserToMention(this._win.getContext(), from);
            if (!this._win.isPrivate()) {
                this._formatter.addStyle("mention");
            }
            if (this._shouldNotifyMention()) {
                this._createNotification(from, msg);
            }
        }
        if (!this._isFromWindowInFocus()) {
            this._chat.channelDisplay.activity((_ref1 = this._win.conn) != null ? _ref1.name : void 0, this._win.target);
            if (nickMentioned) {
                return this._chat.channelDisplay.mention((_ref2 = this._win.conn) != null ? _ref2.name : void 0, this._win.target);
            }
        }
    }

    _createNotification(from, msg) {
        var notification,
            win = this._win;
        notification = new NickMentionedNotification(win.target, from, msg);
        win.notifications.add(notification);
        return win.notifications.on("clicked", () => {
            var _base;
            this._chat.switchToWindow(win);
            return typeof (_base = chrome.app.window.current()).focus === "function" ? _base.focus() : void 0;
        });
    }

    _nickWasMentioned(from, msg) {
        var _ref1,
            nick = (_ref1 = this._win.conn) != null ? _ref1.irc.nick : void 0;
        if (this._isOwnNick(from)) {
            return false;
        }
        if (this._formatter.hasStyle("notice")) {
            return false;
        }
        if (this._formatter.hasStyle("direct")) {
            return false;
        }
        if (this._win.isPrivate()) {
            return true;
        }
        return NickMentionedNotification.shouldNotify(nick, msg);
    }

    _shouldNotifyMention() {
        return !this._suspendNotifications && (!this._isFromWindowInFocus() || !window.document.hasFocus());
    }

    _isFromWindowInFocus() {
        return this._win.equals(this._chat.currentWindow);
    }

    _formatPrivateMessage(from, msg) {
        var m = this._getUserAction(msg);
        this._formatter.setMessage("#content");
        this._formatter.setPrettyFormat(false);
        if (m) {
            this._formatter.setContent(`${from} ${m[1]}`);
            return this._formatter.addStyle("action");
        } else {
            if (this._formatter.hasStyle("notice")) {
                this.source = `- ${from} -`;
            } else if (this._formatter.hasStyle("direct")) {
                this.source = `> ${from} <`;
            } else {
                this.source = from;
            }
            return this._formatter.setContent(msg);
        }
    }

    _sendFormattedMessage() {
        if (!this._formatter.hasMessage()
                || this._shouldIgnoreMessage(this._win.getContext(), this.type)) {
            return;
        }
        this._formatter.addStyle(this.type);
        return this._win.message(this.source, this._formatter.format(), this._formatter.getStyle());
    }

    _shouldIgnoreMessage(context, type) {
        var _ref1;
        return (_ref1 = this._ignoredMessages[context]) != null ? _ref1[type] : void 0;
    }

    _isOwnNick(nick) {
        var conn = this._win.conn;
        return conn != null ? conn.irc.isOwnNick(nick) : void 0;
    }
}
