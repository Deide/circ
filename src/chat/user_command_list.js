/*eslint no-console: ["error", { allow: ["info", "error"] }] */
import customCommandParser from "./custom_command_parser";
import loader from "../script/script_loader";
import {
    getFieldOrNull,
    stringHasContent,
    pluralize,
    getReadableList,
    loadFromFileSystem,
    getEmbedableUrl,
    enableLogging
} from "../utils/utils";
import {ISSUES_URL} from "../utils/globals";
import {listenSupported} from "../utils/api";
import iter from "lazy.js";

function errorHandler(e) {
    console.error("[Error]", e);
}

export default {
    "nick": {
        description: "sets your nick",
        category: "common",
        params: ["nick"],
        run() {
            var _ref1;
            return this.chat.setNick((_ref1 = this.conn) != null ? _ref1.name : void 0, this.nick);
        }
    },
    "server": {
        description: "connects to the server, port 6667 is used by default, reconnects to the current server if no server is specified, use '+' to enable SSL (i.e. +6667)",
        category: "common",
        params: ["opt_server", "opt_port", "opt_password"],
        requires: ["online"],
        validateArgs() {
            if (!this.port) this.port = 6667;
            if (this.server == null) {
                this.server = getFieldOrNull(this.conn, ["name"]);
            }
            return this.server && !isNaN(this.port);
        },
        run() {
            return this.chat.connect(this.server, this.port, this.password);
        }
    },
    "join": {
        description: "joins the channel with the key if provided, reconnects to the current channel if no channel is specified",
        category: "common",
        params: ["opt_channel", "opt_key"],
        requires: ["connection"],
        validateArgs() {
            if (this.channel == null) {
                this.channel = this.chan;
            }
            this.channel = this.channel.toLowerCase();
            return true;
        },
        run() {
            return this.chat.join(this.conn, this.channel, this.key);
        }
    },
    "part": {
        description: "closes the current window and disconnects from the channel",
        category: "common",
        params: ["opt_reason..."],
        requires: ["connection", "channel"],
        run() {
            this.chat.disconnectAndRemoveRoom(this.conn.name, this.chan, this.reason);
        }
    },
    "leave": {
        "extends": "part"
    },
    "close": {
        "extends": "part"
    },
    "invite": {
        description: "invites the specified nick to the current or specified channel",
        category: "common",
        params: ["nick...", "opt_channel"],
        requires: ["connection"],
        usage: "<nick> [channel]",
        run() {
            if (!this.channel) {
                if (this.chan) {
                    this.channel = this.chan;
                } else {
                    return this.displayMessage("error", "you must be in a channel or specify one");
                }
            }
            if (!this.conn.irc.channels[this.channel]) {
                /*
                * According to spec you can invite users to a channel that you are
                *  not a member of if it doesn"t exist
                */
                return this.displayMessage("error", `you must be in ${this.channel} to invite someone to it`);
            }
            this.displayMessage("notice", `inviting ${this.nick} to join ${this.channel}`);
            return this.conn.irc.doCommand("INVITE", this.nick, this.channel);
        }
    },
    "win": {
        description: "switches windows, only channel windows are selected this way",
        category: "misc",
        params: ["windowNum"],
        validateArgs() {
            this.windowNum = parseInt(this.windowNum);
            return !isNaN(this.windowNum);
        },
        run() {
            return this.chat.switchToChannelByIndex(this.windowNum - 1);
        }
    },
    "debug": {
        description: "prints the last 300-400 logs to the developer console and enables future logging of info and warning messages",
        category: "misc",
        run() {
            enableLogging();
            this.displayMessage("notice", "logging enabled. See developer "
                + "console for previous logs. Have a bug to report? File an "
                + "issue at " + ISSUES_URL);
        }
    },
    "say": {
        description: "sends text to the current channel",
        category: "uncommon",
        params: ["text..."],
        requires: ["connection", "channel", "connected"],
        run() {
            this.conn.irc.doCommand("PRIVMSG", this.chan, this.text);
            return this.displayMessage("privmsg", this.conn.irc.nick, this.text);
        }
    },
    "list": {
        description: "lists all channels on the server.",
        category: "uncommon",
        params: ["opt_channels"],
        requires: ["connection"],
        run() {
            return this.conn.irc.doCommand("LIST", this.channels);
        }
    },
    "me": {
        description: "sends text to the current channel, spoken in the 3rd person",
        category: "uncommon",
        "extends": "say",
        validateArgs() {
            return this.text = `\u0001ACTION ${this.text}\u0001`;
        }
    },
    "quit": {
        description: "disconnects from the current server",
        category: "common",
        params: ["opt_reason..."],
        requires: ["connection"],
        run() {
            this.chat.disconnectAndRemoveRoom(this.conn.name, null /* channel */, this.reason);
        }
    },
    "names": {
        description: "lists nicks in the current channel",
        category: "uncommon",
        requires: ["connection", "channel", "connected"],
        run() {
            var msg, names;
            if (this.win.isPrivate()) {
                msg = `You're in a private conversation with ${this.chan}.`;
            }
            else {
                names = iter(this.conn.irc.channels[this.chan].names).values().sort().toArray();
                msg = `Users in ${this.chan}: ${JSON.stringify(names)}`;
            }
            return this.win.message("", msg, "notice names");
        }
    },
    "clear": {
        description: "clears messages in the current window or from all windows if all is passed",
        category: "uncommon",
        params: ["opt_all"],
        validateArgs() {
            if (!this.all || this.all === "all") {
                return true;
            }
        },
        run() {
            if (this.all === "all") {
                let winList = this.chat.winList;
                return winList.map((_, i) => winList.get(i).clear());
            } else {
                return this.win.clear();
            }
        }
    },
    "help": {
        description: "displays information about a command, lists all commands if no command is specified",
        category: "misc",
        params: ["opt_command"],
        run() {
            var commands;
            this.command = this.chat.userCommands.getCommand(this.command);
            if (this.command) {
                return this.command.displayHelp(this.win);
            } else {
                commands = this.chat.userCommands.getCommands();
                return this.win.messageRenderer.displayHelp(commands);
            }
        }
    },
    "hotkeys": {
        description: "lists keyboard shortcuts",
        category: "misc",
        run() {
            return this.win.messageRenderer.displayHotkeys(this.chat.getKeyboardShortcuts().getMap());
        }
    },
    "raw": {
        description: "sends a raw event to the IRC server, use the -c flag to make the command apply to the current channel",
        category: "uncommon",
        params: ["command", "opt_arguments..."],
        usage: "<command> [-c] [arguments...]",
        requires: ["connection"],
        validateArgs() {
            return this["arguments"] = this["arguments"] ? this["arguments"].split(" ") : [];
        },
        run() {
            var command = customCommandParser.parse(this.chan, this.command, ...this["arguments"]);
            return this.conn.irc.send(...command);
        }
    },
    "quote": {
        "extends": "raw"
    },
    "install": {
        description: "loads a script by opening a file browser dialog",
        category: "scripts",
        run() {
            return loader.createScriptFromFileSystem(script => this.chat.addScript(script));
        }
    },
    "uninstall": {
        description: "uninstalls a script, currently installed scripts can be listed with /scripts",
        params: ["scriptName"],
        usage: "<script name>",
        category: "scripts",
        run() {
            var message, script;
            script = this.chat.scriptHandler.getScriptByName(this.scriptName);
            if (script) {
                this.chat.storage.clearScriptStorage(this.scriptName);
                this.chat.scriptHandler.removeScript(script);
                this.chat.storage.scriptRemoved(script);
                return this.displayMessage("notice", `Script ${this.scriptName} was successfully uninstalled`);
            } else {
                message = `No script by the name '${this.scriptName}' was found. ${this.listInstalledScripts()}`;
                return this.displayMessage("error", message);
            }
        }
    },
    "scripts": {
        description: "displays a list of installed scripts",
        category: "scripts",
        run() {
            return this.displayMessage("notice", this.listInstalledScripts());
        }
    },
    "topic": {
        description: "sets the topic of the current channel, displays the current topic if no topic is specified",
        category: "uncommon",
        params: ["opt_topic..."],
        requires: ["connection", "channel"],
        run() {
            return this.conn.irc.doCommand("TOPIC", this.chan, this.topic);
        }
    },
    "kick": {
        description: "removes a user from the current channel",
        category: "uncommon",
        params: ["nick", "opt_reason..."],
        requires: ["connection", "channel"],
        run() {
            return this.conn.irc.doCommand("KICK", this.chan, this.nick, this.reason);
        }
    },
    "mode": {
        /*
        * TODO when used with no args, display current modes
        */
        description: "sets or gets the modes of a channel or user(s), the current channel is used by default",
        category: "uncommon",
        params: ["opt_target", "opt_mode", "opt_nicks..."],
        usage: "< [channel|nick] | [channel] <mode> [nick1] [nick2] ...>",
        requires: ["connection"],
        validateArgs() {
            var _ref1, _ref2;
            if (this.args.length === 0) return true;
            this.nicks = (_ref1 = (_ref2 = this.nicks) != null ? _ref2.split(" ") : void 0) != null ? _ref1 : [];
            if (this.args.length === 1 && !this.isValidMode(this.target)) {
                return true;
            }
            if (this.isValidMode(this.target) && this.target !== this.chan) {
                /*
                * A target wasn't specified, shift variables over by one
                */
                this.nicks.push(this.mode);
                this.mode = this.target;
                this.target = this.chan;
            }
            return this.target && this.isValidMode(this.mode);
        },
        run() {
            if (this.args.length === 0) {
                if (this.chan) {
                    this.conn.irc.doCommand("MODE", this.chan);
                }
                return this.conn.irc.doCommand("MODE", this.conn.irc.nick);
            } else {
                return this.conn.irc.doCommand("MODE", this.target, this.mode, ...this.nicks);
            }
        }
    },
    "op": {
        description: "gives operator status",
        params: ["nick"],
        "extends": "mode",
        usage: "<nick>",
        requires: ["connection", "channel"],
        validateArgs() {
            return this.setModeArgs("+o");
        }
    },
    "deop": {
        description: "removes operator status",
        params: ["nick"],
        "extends": "mode",
        usage: "<nick>",
        requires: ["connection", "channel"],
        validateArgs() {
            return this.setModeArgs("-o");
        }
    },
    "voice": {
        description: "gives voice",
        params: ["nick"],
        "extends": "mode",
        usage: "<nick>",
        requires: ["connection", "channel"],
        validateArgs() {
            return this.setModeArgs("+v");
        }
    },
    "devoice": {
        description: "removes voice",
        params: ["nick"],
        "extends": "mode",
        usage: "<nick>",
        requires: ["connection", "channel"],
        validateArgs() {
            return this.setModeArgs("-v");
        }
    },
    "away": {
        description: "sets your status to away, a response is automatically sent when people /msg or WHOIS you",
        category: "uncommon",
        params: ["opt_response..."],
        requires: ["connection"],
        validateArgs() {
            if (!stringHasContent(this.response)) {
                this.response = "I'm currently away from my computer";
            }
            return true;
        },
        run() {
            return this.conn.irc.doCommand("AWAY", this.response);
        }
    },
    "back": {
        description: "sets your status to no longer being away",
        category: "uncommon",
        requires: ["connection"],
        run() {
            return this.conn.irc.doCommand("AWAY", this.response);
        }
    },
    "msg": {
        description: "sends a private message",
        category: "common",
        params: ["nick", "message..."],
        requires: ["connection"],
        run() {
            this.conn.irc.doCommand("PRIVMSG", this.nick, this.message);
            return this.displayDirectMessage();
        }
    },
    "whois": {
        description: "displays information about a nick",
        category: "uncommon",
        params: ["opt_nick"],
        requires: ["connection"],
        run() {
            return this.conn.irc.doCommand("WHOIS", this.nick);
        }
    },
    "swhois": {
        description: "displays detailed information about a nick (by querying user's connecting server)",
        category: "uncommon",
        params: ["opt_nick"],
        requires: ["connection"],
        run() {
            // Same as WHOIS, but send the nick twice.
            return this.conn.irc.doCommand("WHOIS", this.nick, this.nick);
        }
    },
    "whowas": {
        description: "displays recent login information about a nick",
        category: "uncommon",
        params: ["opt_nick"],
        requires: ["connection"],
        run() {
            return this.conn.irc.doCommand("WHOWAS", this.nick);
        }
    },
    "who": {
        description: "displays detailed user list to server window; add 'o' as second option to restrict to IRCOps",
        category: "uncommon",
        params: ["channel_or_pattern", "opt_o"],
        requires: ["connection"],
        run() {
            return this.conn.irc.doCommand("WHO", this.channel_or_pattern, this.o);
        }
    },
    "about": {
        description: "displays information about this IRC client",
        category: "misc",
        run() {
            return this.win.messageRenderer.displayAbout();
        }
    },
    "join-server": {
        description: "use the IRC connection of another device, allowing you to be logged in with the same nick on multiple devices. Connects to the device that called /make-server if no arguments are given",
        category: "one_identity",
        requires: ["online"],
        params: ["opt_addr", "opt_port"],
        validateArgs() {
            var connectInfo, parsedPort;
            parsedPort = parseInt(this.port);
            if ((this.port || this.addr) && !(parsedPort || this.addr)) {
                return false;
            }
            connectInfo = this.chat.storage.serverDevice;
            this.port = parsedPort || (connectInfo != null ? connectInfo.port : void 0);
            if (this.addr == null) {
                this.addr = connectInfo != null ? connectInfo.addr : void 0;
            }
            return true;
        },
        run() {
            if (this.port && this.addr) {
                if (this.addr === this.chat.remoteConnection.getConnectionInfo().addr) {
                    return this.displayMessage("error", "this device is the server and cannot connect to itself. Call /join-server on other devices to have them connect to this device or call /make-server on another device to make it the server");
                } else {
                    this.chat.remoteConnectionHandler.isManuallyConnecting();
                    return this.chat.remoteConnection.connectToServer({
                        port: this.port,
                        addr: this.addr
                    });
                }
            } else {
                return this.displayMessage("error", "No server exists. Use /make-server on the device you wish to become the server.");
            }
        }
    },
    "make-server": {
        description: "makes this device a server to which other devices can connect. Connected devices use the IRC connection of this device",
        category: "one_identity",
        requires: ["online"],
        run() {
            var state = this.chat.remoteConnection.getState();
            if (this.chat.remoteConnectionHandler.shouldBeServerDevice()) {
                return this.displayMessage("error", "this device is already acting as a server");
            } else if (!listenSupported()) {
                return this.displayMessage("error", "this command cannot be used with your current version of Chrome because it does not support chrome.sockets.tcpServer");
            } else if (state === "no_addr") {
                return this.displayMessage("error", "this device can not be used as a server at this time because it cannot find its own IP address");
            } else if (state === "no_port") {
                return this.displayMessage("error", "this device can not be used as a server at this time because no valid port was found");
            } else if (state === "finding_port") {
                return this.chat.remoteConnection.waitForPort(() => this.run);
            } else {
                this.chat.storage.becomeServerDevice(this.chat.remoteConnection.getConnectionInfo());
                return this.chat.remoteConnectionHandler.determineConnection();
            }
        }
    },
    "network-info": {
        description: "displays network information including port, ip address and remote connection status",
        category: "one_identity",
        run() {
            var connectionInfo;
            this.displayMessage("breakgroup");
            if (this.chat.remoteConnection.isServer()) {
                let numClients = this.chat.remoteConnection.devices.length;
                if (numClients > 0) {
                    this.displayMessage("notice", `acting as a server for ${numClients} other ${pluralize("device", numClients)}`);
                } else {
                    this.displayMessage("notice", "Acting as a server device. No clients have connected.");
                }
            } else if (this.chat.remoteConnection.isClient()) {
                let serverDevice = this.chat.remoteConnection.serverDevice;
                this.displayMessage("notice", `connected to server device ${serverDevice.addr} on port ${serverDevice.port}`);
            } else {
                this.displayMessage("notice", "not connected to any other devices");
            }
            if (this.chat.remoteConnection.getConnectionInfo().getState() !== "found_port") return;
            this.displayMessage("breakgroup");
            connectionInfo = this.chat.remoteConnection.getConnectionInfo();
            this.displayMessageWithStyle("notice", `Port: ${connectionInfo.port}`, "no-pretty-format");
            this.displayMessage("breakgroup");
            this.displayMessage("notice", "IP addresses:");

            return connectionInfo.possibleAddrs
                .map(addr => this.displayMessageWithStyle("notice", `    ${addr}`, "no-pretty-format"));
        }
    },
    "stop-server": {
        description: "stops connecting through another device's IRC connection and starts using a new IRC connection (see /join-server)",
        category: "one_identity",
        requires: ["online"],
        run() {
            this.chat.remoteConnectionHandler.useOwnConnection();
            this.displayMessage("notice", "this device is now using its own IRC connection");
        }
    },
    "autostart": {
        description: "sets whether the application will run on startup, toggles if no arguments are given",
        category: "misc",
        usage: "[ON|OFF]",
        params: ["opt_state"],
        validateArgs() {
            if (!this.state) {
                this.enabled = void 0;
                return true;
            }
            this.state = this.state.toLowerCase();
            if (!(this.state === "on" || this.state === "off")) {
                return false;
            }
            this.enabled = this.state === "on";
            return true;
        },
        run() {
            var willAutostart;
            willAutostart = this.chat.storage.setAutostart(this.enabled);
            if (willAutostart) {
                return this.displayMessage("notice", "CIRC will now automatically run on startup");
            } else {
                return this.displayMessage("notice", "CIRC will no longer automatically run on startup");
            }
        }
    },
    "query": {
        description: "opens a new window for a private conversation with someone",
        category: "uncommon",
        params: ["nick"],
        requires: ["connection"],
        run() {
            var win = this.chat.createPrivateMessageWindow(this.conn, this.nick);
            return this.chat.switchToWindow(win);
        }
    },
    "kill": {
        description: "kicks a user from the server",
        category: "uncommon",
        params: ["nick", "opt_reason"],
        requires: ["connection"],
        run() {
            return this.conn.irc.doCommand("KILL", this.nick, this.reason);
        }
    },
    "version": {
        description: "get the user's IRC version",
        category: "uncommon",
        params: ["nick"],
        requires: ["connection"],
        run() {
            return this.handleCTCPRequest(this.nick, "VERSION");
        }
    },
    "ignore": {
        description: "stop certain message(s) from being displayed in the current channel, for example '/ignore join part' stops join and part messages from being displayed, a list of ignored messages is displayed if no arguments are given",
        category: "misc",
        params: ["opt_types..."],
        requires: ["connection"],
        usage: "[<message type 1> <message type 2> ...]",
        run() {
            var types,
                context = this.win.getContext();
            if (this.types) {
                types = this.types.split(" ");
                types.forEach(type => this.chat.messageHandler.ignoreMessageType(context, type));
                return this.displayMessage("notice", `Messages of type ${getReadableList(types)} will no longer be displayed in this room.`);
            } else {
                types = iter(this.chat.messageHandler.getIgnoredMessages()[context])
                    .values()
                    .toArray();
                if (types && types.length > 0) {
                    return this.displayMessage("notice", `Messages of type ${getReadableList(types)} are being ignored in this room.`);
                } else {
                    return this.displayMessage("notice", "There are no messages being ignored in this room.");
                }
            }
        }
    },
    "unignore": {
        description: "stop ignoring certain message(s)",
        "extends": "ignore",
        usage: "<message type 1> <message type 2> ...",
        run() {
            var types = this.types.split(" ");
            types.forEach(type => this.chat.messageHandler.stopIgnoringMessageType(this.win.getContext(), type));
            return this.displayMessage("notice", `Messages of type ${getReadableList(types)} are no longer being ignored.`);
        }
    },
    "theme": {
        description: "upload and use a custom CSS file, opens a file browser",
        category: "misc",
        run() {
            return loadFromFileSystem(content => {
                window.webkitStorageInfo.requestQuota(PERSISTENT, 50 * 1024, grantedBytes => {
                    window.requestFileSystem(PERSISTENT, grantedBytes, () => { }, errorHandler);
                }, errorHandler);
                return window.webkitRequestFileSystem(PERSISTENT, 50 * 1024, fileSystem => {
                    return fileSystem.root.getFile("custom_style.css", {
                        create: true
                    }, function (fileEntry) {
                        return fileEntry.createWriter(writer => {
                            var blob = new Blob([content], {
                                type: "text/css"
                            });
                            writer.onwriteend = () => {
                                return $("#main-style").attr("href", fileEntry.toURL());
                            };
                            return writer.write(blob);
                        });
                    });
                });
            });
        }
    },
    "untheme": {
        description: "Remove the custom CSS file",
        category: "misc",
        run() {
            return window.webkitRequestFileSystem(PERSISTENT, 50 * 1024, fileSystem => {
                fileSystem.root.getFile("custom_style.css", { create: false },
                    function (fileEntry) {
                        fileEntry.remove(() => {
                            console.info("custom_style.css removed");
                            return $("#main-style").attr("href", "style.css");
                        });
                    });
            });
        }
    },
    /**
     * Hidden commands.
     * These commands don't display in /help or autocomplete. They're used for
     *  scripts and keyboard shortcuts.
     */

    "next-server": {
        description: "switches to the next server window",
        category: "hidden",
        run() {
            var nextServer, server, serverIndex, winList, _ref1;
            winList = this.chat.winList;
            server = winList.getServerForWindow(this.win);
            if (!server) return;
            serverIndex = winList.serverIndexOf(server);
            nextServer = (_ref1 = winList.getServerWindow(serverIndex + 1)) != null ? _ref1 : winList.getServerWindow(0);
            return this.chat.switchToWindow(nextServer);
        }
    },
    "next-room": {
        description: "switches to the next window",
        category: "hidden",
        run() {
            var index, nextWin, winList, _ref1;
            winList = this.chat.winList;
            index = winList.indexOf(this.win);
            if (index < 0) {
                return;
            }
            nextWin = (_ref1 = winList.get(index + 1)) != null ? _ref1 : winList.get(0);
            return this.chat.switchToWindow(nextWin);
        }
    },
    "previous-room": {
        description: "switches to the next window",
        category: "hidden",
        run() {
            var index, nextWin, winList, _ref1;
            winList = this.chat.winList;
            index = winList.indexOf(this.win);
            if (index < 0) {
                return;
            }
            nextWin = (_ref1 = winList.get(index - 1)) != null ? _ref1 : winList.get(winList.length - 1);
            return this.chat.switchToWindow(nextWin);
        }
    },
    "reply": {
        description: "begin replying to the user who last mentioned your nick",
        category: "hidden",
        run() {
            var user;
            user = this.chat.getLastUserToMention(this.win.getContext());
            if (!user) {
                return;
            }
            return this.chat.emit("set_input_if_empty", `${user}: `);
        }
    },
    "image": {
        description: "embed an image in a message",
        category: "hidden",
        params: ["src"],
        run() {
            const win = this.win;
            return getEmbedableUrl(this.src, url => {
                var img = $("<img>");
                img.on("load", () => {
                    img.css("max-width", `${img[0].width}px`);
                    img.css("width", "100%");
                    return win.rawMessage("", img[0].outerHTML);
                });
                return img.attr("src", url);
            });
        }
    },
    "suspend-notifications": {
        description: "suspends notifications temporarily",
        category: "hidden",
        params: ["suspend"],
        run() {
            this.chat.messageHandler.setSuspendNotifications(this.suspend.toLowerCase() == "on");
        }
    }
};