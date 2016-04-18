import EventEmitter from "../utils/event_emitter";
import {listenSupported, getNetworkInterfacesSupported} from "../utils/api";
import {registerTcpServer, registerSocketConnection} from "../utils/utils";
import {toSocketData, fromSocketData} from "../irc/irc_util";

function isDigit(c) {
    return c >= "0" && c <= "9";
}

/**
 * Represents a device running CIRC and handles communication to/from that
 *  device.
 */
export default class RemoteDevice extends EventEmitter {
    constructor(addr, port) {
        super();
        this._listenOnValidPort = this._listenOnValidPort.bind(this);
        this._onReceive = this._onReceive.bind(this);
        this._onReceiveError = this._onReceiveError.bind(this);

        this._receivedMessages = "";
        this.id = addr;
        this._isClient = false;
        if (typeof addr === "string") {
            this._initFromAddress(addr, port);
        } else if (addr) {
            this._initFromSocketId(addr);
        } else {
            this.port = RemoteDevice.FINDING_PORT;
        }
    }

    equals(otherDevice) {
        return this.id === (otherDevice != null ? otherDevice.id : void 0);
    }

    usesConnection(connectionInfo) {
        return connectionInfo.addr === this.addr && connectionInfo.port === this.port;
    }

    getState() {
        if (!this.addr) {
            return "no_addr";
        }
        switch (this.port) {
        case RemoteDevice.FINDING_PORT:
            return "finding_port";
        case RemoteDevice.NO_PORT:
            return "no_port";
        default:
            return "found_port";
        }
    }

    _initFromAddress(addr, port) {
        this.addr = addr;
        this.port = port;
    }

    _initFromSocketId(_socketId) {
        this._socketId = _socketId;
        this._isClient = true;
        return this._listenForData();
    }

    findPossibleAddrs(callback) {
        return chrome.system.network.getNetworkInterfaces(networkInfoList => {
            this.possibleAddrs = networkInfoList.map(networkInfo => networkInfo.address);
            this.addr = this._getValidAddr(this.possibleAddrs);
            return callback();
        });
    }

    _getValidAddr(addrs) {
        if (!addrs || addrs.length === 0) {
            return void 0;
        }
        /**
         * TODO: currently we return the first IPv4 address. Will this always work?
         */
        return addrs.reduce((shortest, addr) => addr.length < shortest.length ? addr: shortest);
    }

    hasGetNetworkInterfacesSupport() {
        if (getNetworkInterfacesSupported()) return true;
        this._log("w", "chrome.system.network.getNetworkInterfaces is not supported!");
        this.possibleAddrs = [];
        this.port = RemoteDevice.NO_PORT;
        return false;
    }

    /**
     * Call chrome.system.network.getNetworkInterfaces in an attempt to find a valid address.
     */
    searchForAddress(callback, timeout) {
        if (timeout == null) timeout = 500;
        if (!this.hasGetNetworkInterfacesSupport()) return;
        if (timeout > 60000) timeout = 60000;
        return setTimeout(() => this.findPossibleAddrs(() => {
            return this.addr ? callback() : this.searchForAddress(callback, timeout *= 1.2);
        }), timeout);
    }

    /**
     * Called when the device is your own device. Listens for connecting client
     *  devices.
     */
    listenForNewDevices(callback) {
        var _ref;
        return (_ref = chrome.sockets.tcpServer) != null ? _ref.create({}, socketInfo => {
            this._socketId = socketInfo.socketId;
            registerTcpServer(socketInfo.socketId);
            if (listenSupported()) {
                return this._listenOnValidPort(callback);
            }
        }) : void 0;
    }

    /**
     * Attempt to listen on the default port, then increment the port by a random
     *  amount if the attempt fails and try again.
     */
    _listenOnValidPort(callback, port) {
        if (!(port >= 0)) {
            port = RemoteDevice.BASE_PORT;
        }
        return chrome.sockets.tcpServer.listen(this._socketId, "0.0.0.0", port, result => {
            return this._onListen(callback, port, result);
        });
    }

    _onListen(callback, port, result) {
        if (result < 0) {
            return this._onFailedToListen(callback, port, result);
        } else {
            this.port = port;
            this.emit("found_port", this);
            this._acceptNewConnection(callback);
        }
    }

    _onFailedToListen(callback, port, result) {
        if (port - RemoteDevice.BASE_PORT > RemoteDevice.MAX_CONNECTION_ATTEMPTS) {
            this._log("w", "Couldn't listen to 0.0.0.0 on any attempted ports",
                `${chrome.runtime.lastError.message} (error ${-result})`);
            this.port = RemoteDevice.NO_PORT;
            return this.emit("no_port");
        } else {
            return this._listenOnValidPort(callback, port + Math.floor(Math.random() * 100));
        }
    }

    _acceptNewConnection(callback) {
        this._log("listening for new connections on port", this.port);
        // TODO(rpaquay): When do we remove the listener?
        chrome.sockets.tcpServer.onAccept.addListener(acceptInfo => {
            if (this._socketId != acceptInfo.socketId) return;
            this._onAccept(acceptInfo, callback);
        });
    }

    _onAccept(acceptInfo, callback) {
        this._log("Connected to a client device", this._socketId);
        registerSocketConnection(acceptInfo.clientSocketId);
        var device = new RemoteDevice(acceptInfo.clientSocketId);
        device.getAddr(function() {
            return callback(device);
        });
    }

    /**
     * Called when acting as a server. Finds the client ip address.
     */
    getAddr(callback) {
        var _ref;
        return (_ref = chrome.sockets.tcp) != null ? _ref.getInfo(this._socketId, socketInfo => {
            this.addr = socketInfo.peerAddress;
            return callback();
        }) : void 0;
    }

    send(type, args) {
        if (args) {
            // Convert Uint8Arrays to regular JS arrays for stringify.
            // TODO(flackr): Preferably this would be done earlier so that send
            // doesn't need to know what's being sent.
            args = args.map(arg => arg instanceof Uint8Array ? Array.from(arg) : arg);
        }
        var msg = JSON.stringify({type, args});
        msg = `${msg.length}$${msg}`;
        return toSocketData(msg, data => {
            var _ref;
            return (_ref = chrome.sockets.tcp) != null ? _ref.send(this._socketId, data, sendInfo => {
                if (sendInfo.resultCode < 0 || sendInfo.bytesSent !== data.byteLength) {
                    this._log("w", "closing b/c failed to send:", type, args,
                        `${chrome.runtime.lastError.message} (error ${-sendInfo.resultCode})`);
                    return this.close();
                } else {
                    return this._log("sent", type, args);
                }
            }) : void 0;
        });
    }

    /**
     * Called when the device represents a remote server. Creates a connection
     *  to that remote server.
     */
    connect(callback) {
        var tcp = chrome.sockets.tcp;
        this.close();
        return tcp != null ? tcp.create(socketInfo => {
            this._socketId = socketInfo.socketId;
            this._isClient = true;
            if (!this._socketId) callback(false);
            tcp.setPaused(this._socketId, true, () => {
                return tcp != null ? tcp.connect(this._socketId, this.addr, this.port, result => {
                    return this._onConnect(result, callback);
                }) : void 0;
            });
        }) : void 0;
    }

    _onConnect(result, callback) {
        if (result < 0) {
            this._log("w", "Couldn't connect to server", this.addr, "on port", this.port, "-",
                `${chrome.runtime.lastError} (error ${-result})`);
            return callback(false);
        } else {
            this._listenForData();
            return callback(true);
        }
    }

    close() {
        if (this._socketId) {
            if (this._isClient) {
                chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
                chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
                registerSocketConnection(this._socketId, true);
                chrome.sockets.tcp.disconnect(this._socketId);
                chrome.sockets.tcp.close(this._socketId);
            } else {
                //chrome.sockets.tcp.onAccept.removeListener(this._onAccept);
                registerTcpServer(this._socketId, true);
                chrome.sockets.tcp.disconnect(this._socketId);
                chrome.sockets.tcp.close(this._socketId);
            }
            this._socketId = undefined;
            return this.emit("closed", this);
        }
    }

    _onReceive(receiveInfo) {
        if (receiveInfo.socketId != this._socketId) return;

        fromSocketData(receiveInfo.data, partialMessage => {
            var completeMessages;
            this._receivedMessages += partialMessage;
            completeMessages = this._parseReceivedMessages();

            return completeMessages.map(data => {
                this._log.apply(this, ["received", data.type, ...data.args]);
                return this.emit.apply(this, [data.type, this, ...data.args]);
            });
        });
    }

    _onReceiveError(receiveInfo) {
        if (receiveInfo.socketId != this._socketId)
            return;

        this._log("w", "bad read - closing socket: ", `(error ${-receiveInfo.resultCode})`);
        this.emit("closed", this);
        this.close();
    }

    _listenForData() {
        chrome.sockets.tcp.onReceive.addListener(this._onReceive);
        chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError);
        chrome.sockets.tcp.setPaused(this._socketId, false, function() { });
    }

    _parseReceivedMessages(result) {
        var length, message, prefixEnd;
        result = result || [];
        if (!this._receivedMessages) return result;
        if (this._receivedMessages.length && !isDigit(this._receivedMessages[0])) {
            this._log.apply(this, ["received message doesn't begin with digit: ", this._receivedMessages]);
        }
        prefixEnd = this._receivedMessages.indexOf("$");
        if (!(prefixEnd >= 0)) return result;
        length = parseInt(this._receivedMessages.slice(0, +(prefixEnd - 1) + 1 || 9e9));
        if (!(this._receivedMessages.length > prefixEnd + length)) return result;
        message = this._receivedMessages.slice(prefixEnd + 1, +(prefixEnd + length) + 1 || 9e9);
        try {
            let json = JSON.parse(message);
            result.push(json);
            if (JSON.stringify(json).length != length) {
                this._log("e", "json length mismatch");
            }
        } catch (e) {
            this._log("e", `failed to parse json: ${message}`);
        }
        if (this._receivedMessages.length > prefixEnd + length + 1 &&
                !isDigit(this._receivedMessages[prefixEnd + length + 1])) {
            this._log("e", `message after split doesn't begin with digit: ${this._receivedMessages}`);
        }
        this._receivedMessages = this._receivedMessages.slice(prefixEnd + length + 1);
        return this._parseReceivedMessages(result);
    }

    toString() {
        if (this.addr) {
            return `${this.addr} on port ${this.port}`;
        } else {
            return `${this.socketId}`;
        }
    }
}

RemoteDevice.getOwnDevice = function (callback) {
    var device = new RemoteDevice;
    if (!device.hasGetNetworkInterfacesSupport()) {
        callback(device);
        return;
    }
    if (!listenSupported()) {
        device.port = RemoteDevice.NO_PORT;
    }
    return device.findPossibleAddrs(() => callback(device));
};

/**
 * Begin at this port and increment by one until an open port is found.
 */
RemoteDevice.BASE_PORT = 1329;

RemoteDevice.MAX_CONNECTION_ATTEMPTS = 30;

RemoteDevice.FINDING_PORT = -1;

RemoteDevice.NO_PORT = -2;
