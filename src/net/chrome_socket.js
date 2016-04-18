/*eslint no-console: 0 */
import AbstractTCPSocket from "./abstract_tcp_socket";
import {registerSocketConnection}  from "../utils/utils";

/**
 * A socket connected to an IRC server. Uses chrome.sockets.tcp.
 */
export default class ChromeSocket extends AbstractTCPSocket {
    constructor() {
        super();
        this._onCreate = this._onCreate.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onReceive = this._onReceive.bind(this);
        this._onReceiveError = this._onReceiveError.bind(this);
    }

    connect(addr, port) {
        this._active();
        return chrome.sockets.tcp.create({}, si => {
            this._onCreate(si, addr, parseInt(port));
        });
    }

    _onCreate(si, addr, port) {
        this.socketId = si.socketId;
        if (this.socketId > 0) {
            registerSocketConnection(si.socketId);
            chrome.sockets.tcp.setPaused(this.socketId, true, () => {
                chrome.sockets.tcp.connect(this.socketId, addr, port, this._onConnect);
            });
        } else {
            return this.emit("error", "couldn't create socket");
        }
    }

    _onConnect(rc) {
        if (rc < 0) {
            let msg = `Couldn't connect to socket: ${chrome.runtime.lastError.message} (error ${-rc})`;
            return this.emit("error", msg);
        } else {
            this.emit("connect");
            chrome.sockets.tcp.onReceive.addListener(this._onReceive);
            chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError);
            chrome.sockets.tcp.setPaused(this.socketId, false);
        }
    }

    _onReceive(info) {
        if (info.socketId != this.socketId) return;
        this._active();
        this.emit("data", info.data);
    }

    _onReceiveError(info) {
        if (info.socketId != this.socketId) return;
        this._active();
        if (info.resultCode == -100) {// connection closed
            this.emit("end");
            this.close();
        }
        else {
            this.emit("error", `read from socket: error ${-info.resultCode})`);
            this.close();
        }
    }

    write(data) {
        this._active();
        return chrome.sockets.tcp.send(this.socketId, data, sendInfo => {
            if (sendInfo.resultCode < 0) {
                let msg = chrome.runtime.lastError.message;
                console.error("SOCKET ERROR on send: ", `${msg} (error ${-sendInfo.resultCode})`);
            }
            if (sendInfo.bytesSent === data.byteLength) {
                return this.emit("drain");
            } else {
                if (sendInfo.bytesSent >= 0) {
                    console.error("Can't handle non-complete send: wrote "
                        + `${sendInfo.bytesSent} expected ${data.byteLength}`);
                }
                return this.emit("error", `Invalid send on socket, code: ${sendInfo.bytesSent}`);
            }
        });
    }

    close() {
        if (this.socketId != null) {
            chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
            chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
            chrome.sockets.tcp.disconnect(this.socketId);
            chrome.sockets.tcp.close(this.socketId);
            registerSocketConnection(this.socketId, true);
        }
        return this.emit("close");
    }
}
