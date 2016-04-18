import EventEmitter from "../utils/event_emitter";
import RemoteDevice from "./remote_device";
import RemoteSocket from "./remote_socket";
import SslSocket from "./ssl_socket";
import ChromeSocket from "./chrome_socket";
import {randomName, arrayToArrayBuffer} from "../irc/irc_util";
import {hex_md5} from "../utils/rsa";

/**
 * Handles sending and receiving data from connected devices running different
 * instances of CIRC.
 */
export default class RemoteConnection extends EventEmitter {
    constructor() {
        super();
        this._onDeviceClosed = this._onDeviceClosed.bind(this);
        this._onConnectionMessage = this._onConnectionMessage.bind(this);
        this._onSocketData = this._onSocketData.bind(this);
        this._onUserInput = this._onUserInput.bind(this);
        this._authenticateDevice = this._authenticateDevice.bind(this);
        this._addUnauthenticatedDevice = this._addUnauthenticatedDevice.bind(this);
        this._onHasOwnDevice = this._onHasOwnDevice.bind(this);
        this._getAuthToken = this._getAuthToken.bind(this);

        this.serverDevice = void 0;
        this._connectingTo = void 0;
        this._type = void 0;
        this.devices = [];
        this._ircSocketMap = {};
        this._thisDevice = {};
        this._state = "device_state";
        this._getIRCState = function () { };
        this._getChatLog = function () { };
    }
    /**
     * Begin finding own IP addr and then listen for incoming connections.
     */
    init() {
        return RemoteDevice.getOwnDevice(this._onHasOwnDevice);
    }

    setPassword(password) {
        return this._password = password;
    }

    _getAuthToken(value) {
        return hex_md5(this._password + value);
    }

    getConnectionInfo() {
        return this._thisDevice;
    }

    getState() {
        if (this._state === "device_state") {
            if (!this._thisDevice.port) {
                return "finding_port";
            }
            return this._thisDevice.getState();
        } else {
            return this._state;
        }
    }

    setIRCStateFetcher(getState) {
        return this._getIRCState = getState;
    }

    setChatLogFetcher(getChatLog) {
        return this._getChatLog = getChatLog;
    }

    _onHasOwnDevice(device) {
        this._thisDevice = device;
        if (this._thisDevice.getState() === "no_addr") {
            this._log("w", "Wasn't able to find address of own device");
            this.emit("no_addr");
            this._thisDevice.searchForAddress(() => this._onHasOwnDevice(this._thisDevice));
            return;
        }
        this.emit("found_addr");
        return this._thisDevice.listenForNewDevices(this._addUnauthenticatedDevice);
    }

    _addUnauthenticatedDevice(device) {
        this._log("adding unauthenticated device", device.id);
        device.password = randomName();
        device.send("authentication_offer", [device.password]);
        return device.on("authenticate", this._authenticateDevice);
    }

    _authenticateDevice(device, authToken) {
        if (authToken === this._getAuthToken(device.password)) {
            return this._addClientDevice(device);
        } else {
            this._log("w", "AUTH FAILED", authToken, "should be", this._getAuthToken(device.password));
            return device.close();
        }
    }

    _addClientDevice(device) {
        this._log("auth passed, adding client device", device.id, device.addr);
        this._listenToDevice(device);
        this._addDevice(device);
        this.emit("client_joined", device);
        device.send("connection_message", ["irc_state", this._getIRCState()]);
        return device.send("connection_message", ["chat_log", this._getChatLog()]);
    }

    _addDevice(newDevice) {
        this.devices.forEach(device => {
            if (device.addr === newDevice.addr) device.close();
        });
        return this.devices.push(newDevice);
    }

    _listenToDevice(device) {
        device.on("user_input", this._onUserInput);
        device.on("socket_data", this._onSocketData);
        device.on("connection_message", this._onConnectionMessage);
        device.on("closed", this._onDeviceClosed);
        return device.on("no_port", () => this.emit("no_port"));
    }

    _onUserInput(device, event) {
        if (this.isServer()) {
            this._broadcast(device, "user_input", event);
        }
        return this.emit(event.type, Event.wrap(event));
    }

    _onSocketData(device, server, type, data) {
        var _ref;
        if (type === "data") {
            data = arrayToArrayBuffer(data);
        }
        return (_ref = this._ircSocketMap[server]) != null ? _ref.emit(type, data) : void 0;
    }

    _onConnectionMessage(...args) {
        var isValid,
            device = args[0],
            type = args[1],
            rest = 3 <= args.length ? args.slice(2) : [];
        if (type === "irc_state") {
            isValid = this._onIRCState(device, rest);
            if (!isValid) return;
        }
        return this.emit(...[type, ...args]);
    }

    _onIRCState(device, args) {
        if (this.getState() !== "connecting") {
            this._log("w", "got IRC state, but we're not connecting to a server -", device.toString(), args);
            device.close();
            return false;
        }
        this._setServerDevice(device);
        this._becomeClient();
        return true;
    }

    _setServerDevice(device) {
        var _ref;
        if ((_ref = this.serverDevice) != null) {
            _ref.close();
        }
        return this.serverDevice = device;
    }

    _onDeviceClosed(closedDevice) {
        if (this._deviceIsClient(closedDevice)) {
            this.emit("client_parted", closedDevice);
        }
        if (this._deviceIsServer(closedDevice) && this.getState() === "connected") {
            this._log("w", "lost connection to server -", closedDevice.addr);
            this._state = "device_state";
            this._type = void 0;
            this.emit("server_disconnected");
        }
        else if (closedDevice.equals(this._connectingTo) && this.getState() !== "connected") {
            this.emit("invalid_server");
        }

        this.devices = this.devices.filter(device => device.id !== closedDevice.id);
        return this.devices;
    }

    _deviceIsServer(device) {
        return device != null ? device.equals(this.serverDevice) : void 0;
    }

    _deviceIsClient(device) {
        if (device.equals(this.serverDevice || device.equals(this._thisDevice))) {
            return false;
        }
        return this.devices.some(clientDevice => device.equals(clientDevice));
    }

    /**
     * Create a socket for the given server. A fake socket is used when using
     *  another devices IRC connection.
     * @param {string} server The name of the IRC server that the socket is
     *  connected to.
     */
    createSocket(server, port) {
        var socket;
        if (this.isClient()) {
            socket = new RemoteSocket;
            this._ircSocketMap[server] = socket;
        } else {
            if (port && port.substr && port.substr(0, 1) === "+")
                socket = new SslSocket;
            else
                socket = new ChromeSocket;
            this.broadcastSocketData(socket, server);
        }
        return socket;
    }

    broadcastUserInput(userInput) {
        return userInput.on("command", event => {
            var name = event.name;
            if (name !== "network-info"
                    && name !== "join-server"
                    && name !== "make-server"
                    && name !== "about") {
                return this._broadcast("user_input", event);
            }
        });
    }

    broadcastSocketData(socket, server) {
        return socket.onAny((type, data) => {
            if (type === "data") {
                data = new Uint8Array(data);
            }
            return this._broadcast("socket_data", server, type, data);
        });
    }

    _broadcast(opt_blacklistedDevice, type, ...rest) {
        var blacklistedDevice;
        if (typeof opt_blacklistedDevice === "string") {
            rest = [type, ...rest];
            type = opt_blacklistedDevice;
            blacklistedDevice = void 0;
        } else {
            blacklistedDevice = opt_blacklistedDevice;
        }

        return this.devices
            .filter(device => !device.equals(blacklistedDevice))
            .map(device => device.send(type, rest));
    }

    disconnectDevices() {
        this.devices.forEach(device => device.close());
        return this.becomeIdle();
    }

    waitForPort(callback) {
        if (this.getState() === "found_port") {
            return callback(true);
        }
        if (this.getState() === "no_port" || this.getState() === "no_addr") {
            return callback(false);
        }
        if (this._thisDevice != null) {
            this._thisDevice.once("found_port", () => callback(true));
        }
        if (this._thisDevice != null) {
            this._thisDevice.once("no_port", () => callback(false));
        }
        return this.once("no_addr", () => callback(false));
    }

    becomeServer() {
        if (this.isClient()) {
            this.disconnectDevices();
        }
        this._type = "server";
        return this._state = "device_state";
    }

    becomeIdle() {
        this._type = "idle";
        return this._state = "device_state";
    }

    _becomeClient() {
        this._log("this device is now a client of", this.serverDevice.toString());
        this._type = "client";
        this._state = "connected";
        return this._addDevice(this.serverDevice);
    }

    disconnectFromServer() {
        var _ref;
        return (_ref = this.serverDevice) != null ? _ref.close() : void 0;
    }
    /**
     * Connect to a remote server. The IRC connection of the remote server will
     *  replace the local connection.
     * @params {{port: number, addr: string}} connectInfo
     */
    connectToServer(connectInfo) {
        var device, deviceToClose;
        if (this._connectingTo) {
            deviceToClose = this._connectingTo;
            this._connectingTo = void 0;
            deviceToClose.close();
        }
        this._state = "connecting";
        device = new RemoteDevice(connectInfo.addr, connectInfo.port);
        this._connectingTo = device;
        this._listenToDevice(device);
        return device.connect(success => {
            if (success) {
                return this._onConnectedToServer(device);
            } else {
                return this._onFailedToConnectToServer(device);
            }
        });
    }

    _onConnectedToServer(device) {
        this._log("connected to server", device.toString());
        return device.on("authentication_offer", (device, password) => {
            device.password = password;
            return this.emit("server_found", device);
        });
    }

    _onFailedToConnectToServer(device) {
        this._state = "device_state";
        return this.emit("invalid_server", device);
    }

    finalizeConnection() {
        if (!this._connectingTo) {
            return;
        }
        this._state = "connecting";
        return this._connectingTo.send("authenticate", [this._getAuthToken(this._connectingTo.password)]);
    }

    isServer() {
        return this._type === "server";
    }

    isClient() {
        return this._type === "client";
    }

    isIdle() {
        return this._type === "idle";
    }

    isInitializing() {
        return this._type === void 0;
    }
}
