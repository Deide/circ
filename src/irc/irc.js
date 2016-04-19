/*eslint no-console: 0*/
import EventEmitter from "../utils/event_emitter";
import ServerResponseHandler from "./server_response_handler";
import ChromeSocket from "../net/chrome_socket";
import Chat from "../chat/chat";
import {getLogger} from "../utils/utils";
import Event from "../utils/event";
import * as util from "./irc_util";

/**
 * Represents a connection to an IRC server.
 */
export default class IRC extends EventEmitter {
    constructor(opt_socket) {
        super();
        this.reconnect = this.reconnect.bind(this);
        this.onTimeout = this.onTimeout.bind(this);
        this.util = util;
        this.preferredNick = `circ-user-${this.util.randomName(5)}`;
        this.setSocket(opt_socket || new ChromeSocket);
        this.data = this.util.emptySocketData();
        this.exponentialBackoff = 0;
        this.partialNameLists = {};
        this.channels = {};
        this.serverResponseHandler = new ServerResponseHandler(this);
        this.state = "disconnected";
        this.support = {};
        this._log = getLogger(this);
    }

    setSocket(socket) {
        delete this.socket;
        this.socket = socket;
        this.socket.on("connect", () => this.onConnect());
        this.socket.on("data", data => this.onData(data));
        this.socket.on("drain", () => this.onDrain());
        this.socket.on("error", err => this.onError(err));
        this.socket.on("end", err => this.onEnd(err));
        return this.socket.on("close", err => this.onClose(err));
    }

    setPreferredNick(preferredNick) {
        this.preferredNick = preferredNick;
    }
    /**
     * Public
     */
    connect(server, port, password) {
        const state = this.state;
        this.server = server != null ? server : this.server;
        this.port = port != null ? port : this.port;
        this.password = password != null ? password : this.password;
        if (state !== "disconnected" && state !== "reconnecting") {
            return;
        }
        clearTimeout(this.reconnectTimeout);
        this.socket.connect(this.server, this.port);
        return this.state = "connecting";
    }
    /**
     * Public
     */
    quit(reason) {
        if (this.state === "connected" || this.state === "disconnecting") {
            this.send("QUIT", reason != null ? reason : this.quitReason);
            this.state = "disconnected";
            return this.endSocketOnDrain = true;
        } else {
            this.quitReason = reason;
            return this.state = "disconnecting";
        }
    }
    /**
     * Public
     */
    giveup() {
        if (this.state !== "reconnecting") return;
        clearTimeout(this.reconnectTimeout);
        return this.state = "disconnected";
    }

    join(channel, key) {
        if (this.state === "connected") {
            if (key) {
                return this.doCommand("JOIN", channel, key);
            } else {
                return this.doCommand("JOIN", channel);
            }
        } else if (!this.channels[channel.toLowerCase()]) {
            return this.channels[channel.toLowerCase()] = {
                channel: channel,
                names: [],
                key: key
            };
        }
    }

    part(channel, opt_reason) {
        if (this.state === "connected") {
            return this.doCommand("PART", channel, opt_reason);
        } else if (this.channels[channel.toLowerCase()]) {
            return delete this.channels[channel.toLowerCase()];
        }
    }
    /**
     * Public
     * @param  {any} cmd
     * @param  {any} ...rest
     */
    doCommand(...args) {
        return this.sendIfConnected(...args);
    }

    onConnect() {
        if (this.password) {
            this.send("PASS", this.password);
        }
        this.send("NICK", this.preferredNick);
        this.send("USER", this.preferredNick.replace(/[^a-zA-Z0-9]/, ""), "0", "*", "Hyuu");
        return this.socket.setTimeout(60000, this.onTimeout);
    }

    onTimeout() {
        if (this.state === "connected" && this.exponentialBackoff > 0) {
            this.exponentialBackoff--;
        }
        this.send("PING", +(new Date));
        return this.socket.setTimeout(60000, this.onTimeout);
    }

    onError(err) {
        this.emitMessage("socket_error", Chat.SERVER_WINDOW, err);
        this.setReconnect();
        return this.socket.close();
    }

    onClose() {
        this.socket.setTimeout(0, this.onTimeout);
        if (this.state === "connected") {
            this.emit("disconnect");
            return this.setReconnect();
        }
    }

    onEnd() {
        console.error("remote peer closed connection");
        if (this.state === "connecting" || this.state === "connected") {
            this.emit("disconnect");
            return this.setReconnect();
        }
    }

    setReconnect() {
        var backoff;
        this.state = "reconnecting";
        backoff = 2000 * Math.pow(2, this.exponentialBackoff);
        this.reconnectTimeout = setTimeout(this.reconnect, backoff);
        if (!(this.exponentialBackoff > 4)) {
            return this.exponentialBackoff++;
        }
    }

    reconnect() {
        return this.connect();
    }

    onData(pdata) {
        this.data = this.util.concatSocketData(this.data, pdata);
        var dataView = new Uint8Array(this.data);
        var _results = [];
        while (dataView.length > 0) {
            var cr = false;
            var crlf = null;
            for (var i = 0; i < dataView.length; ++i) {
                var d = dataView[i];
                if (d === 0x0d) {
                    // Even though the spec says that lines should end with CRLF some
                    // servers (e.g. irssi proxy) just send LF.
                    cr = true;
                } else if (d === 0x0a) {
                    crlf = i;
                    break;
                } else {
                    cr = false;
                }
            }
            if (crlf !== null) {
                var line = this.data.slice(0, cr ? crlf - 1 : crlf);
                this.data = this.data.slice(crlf + 1);
                dataView = new Uint8Array(this.data);
                _results.push(this.util.fromSocketData(line, lineStr => {
                    this._log("<=", `(${this.server})`, lineStr);
                    return this.onServerMessage(this.util.parseCommand(lineStr));
                }));
            } else {
                break;
            }
        }
        return _results;
    }

    onDrain() {
        if (this.endSocketOnDrain) {
            this.socket.close();
        }
        return this.endSocketOnDrain = false;
    }

    send(...args) {
        var msg = this.util.makeCommand(...args);
        this._log("=>", this.server, msg.slice(0, msg.length - 2));
        return this.util.toSocketData(msg, arr => this.socket.write(arr));
    }

    sendIfConnected(...args) {
        if (this.state === "connected") {
            return this.send(...args);
        }
    }

    onServerMessage(cmd) {
        if (/^\d{3}$/.test(cmd.command)) {
            cmd.command = parseInt(cmd.command, 10);
        }
        if (this.serverResponseHandler.canHandle(cmd.command)) {
            return this.handle(cmd.command, this.util.parsePrefix(cmd.prefix), ...cmd.params);
        } else {
            return this.emitMessage("other", Chat.SERVER_WINDOW, cmd);
        }
    }


    /**
     * @param  {any[]} ...args [cmd, ...rest]
     */
    handle(...args) {
        return this.serverResponseHandler.handle(...args);
    }

    emit(name, channel, ...rest) {
        var event = new Event("server", name, ...rest);
        event.setContext(this.server, channel);
        return this.emitCustomEvent(event);
    }

    emitMessage(name, channel, ...rest) {
        var event = new Event("message", name, ...rest);
        event.setContext(this.server, channel);
        return this.emitCustomMessage(event);
    }

    emitCustomMessage(event) {
        return this.emitCustomEvent(event);
    }

    emitCustomEvent(event) {
        return super.emit.call(this, event.type, event);
    }

    isOwnNick(nick) {
        return util.nicksEqual(this.nick, nick);
    }

    isValidChannelPrefix(channel) {
        var prefixes = this.support["chantypes"] || "#&";
        return prefixes.indexOf(channel.substr(0, 1)) != -1;
    }
}

// Android doesn't implement ArrayBuffer.slice()
window.ArrayBuffer.prototype.slice = window.ArrayBuffer.prototype.slice || window.ArrayBuffer.prototype.webkitSlice || function(...args) {
    var src = Uint8Array.prototype.subarray.apply(new Uint8Array(this), args);
    var dst = new Uint8Array(src.length);
    dst.set(src);
    return dst.buffer;
};
