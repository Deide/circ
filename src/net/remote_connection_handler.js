import {getLogger, isOnline} from "../utils/utils";
import Timer from "../utils/timer";

/**
 * Handles sharing an IRC connections between multiple devices.
 */
export default class RemoteConnectionHandler {
    constructor(chat) {
        this._useOwnConnectionWhileWaitingForServer = this._useOwnConnectionWhileWaitingForServer
            .bind(this);
        this._reconnect = this._reconnect.bind(this);
        this._onOffline = this._onOffline.bind(this);
        this._onOnline = this._onOnline.bind(this);
        this._tearDown = this._tearDown.bind(this);

        this._log = getLogger(this);
        this._timer = new Timer();
        this._chat = chat;
        this._addConnectionChangeListeners();
        chat.on("tear_down", this._tearDown);
        if (!isOnline()) {
            this._chat.notice.prompt("No internet connection found. You will be unable to connect to IRC.");
        }
    }

    _tearDown() {
        return this._removeConnectionChangeListeners();
    }

    _addConnectionChangeListeners() {
        $(window).on("online", this._onOnline);
        return $(window).on("offline", this._onOffline);
    }

    _removeConnectionChangeListeners() {
        $(window).off("online", this._onOnline);
        return $(window).off("offline", this._onOffline);
    }

    /**
     * Set the storage handler which is used to store IRC states and which device
     *  is acting as the server
     * @param {Storage} storage
     */
    setStorageHandler(storage) {
        this._storage = storage;
        this._remoteConnection.setIRCStateFetcher(() => this._storage.getState());
        return this._remoteConnection.setChatLogFetcher(() => this._chat.messageHandler.getChatLog());
    }

    /**
     * Set the remote connection which handles sending and receiving data from
     *  connected devices.
     * @param {RemoteConnection} remoteConnection
     */
    setRemoteConnection(remoteConnection) {
        this._remoteConnection = remoteConnection;
        return this._listenToRemoteConnectionEvents();
    }

    _onOnline() {
        this._chat.notice.close();
        this._timer.start("started_connection");
        return this.determineConnection();
    }

    _onOffline() {
        this._chat.notice.prompt("You lost connection to the internet. You will be unable to connect to IRC.");
        return this._chat.remoteConnection.disconnectDevices();
    }

    _listenToRemoteConnectionEvents() {
        this._chat.userCommands.listenTo(this._remoteConnection);
        this._remoteConnection.on("found_addr", () => this.determineConnection());
        this._remoteConnection.on("no_addr", () => this.useOwnConnection());
        this._remoteConnection.on("no_port", () => this.useOwnConnection());
        this._remoteConnection.on("server_found", () => {
            var abruptSwitch;
            this._chat.notice.close();
            abruptSwitch = this._timer.elapsed("started_connection")
                    > RemoteConnectionHandler.NOTIFY_BEFORE_CONNECTING;
            return abruptSwitch ? this._notifyConnectionAvailable()
                : this._remoteConnection.finalizeConnection();
        });
        this._remoteConnection.on("invalid_server", connectInfo => {
            if (this._chat.remoteConnection.isInitializing()) {
                this._onConnected = () => this._displayFailedToConnect(connectInfo);
            } else if (!this._reconnectionAttempt) {
                this._displayFailedToConnect(connectInfo);
            }
            this._reconnectionAttempt = false;
            this.useOwnConnection();
            return this._tryToReconnectToServerDevice();
        });
        this._remoteConnection.on("irc_state", state => {
            this._timer.start("started_connection");
            this._reconnectionAttempt = false;
            this._storage.pause();
            this._chat.closeAllConnections();
            this._stopServerReconnectAttempts();
            return this._storage.loadState(state);
        });
        this._remoteConnection.on("chat_log", chatLog => {
            var connInfo;
            this._chat.messageHandler.replayChatLog(chatLog);
            connInfo = this._remoteConnection.serverDevice;
            if (!connInfo) return;
            return this._chat.displayMessage("notice", this._chat.getCurrentContext(),
                    `Connected through server device ${connInfo.toString()}`);
        });
        this._remoteConnection.on("server_disconnected", () => {
            this._timer.start("started_connection");
            if (!this.manuallyDisconnected) {
                this._onConnected = () => this._displayLostConnectionMessage();
            }
            return this.determineConnection();
        });
        this._remoteConnection.on("client_joined", client => {
            this._chat.displayMessage("notice", this._chat.getCurrentContext(),
                    `${client.addr} connected to this device`);
            return this._chat.updateStatus();
        });
        return this._remoteConnection.on("client_parted", client => {
            this._chat.displayMessage("notice", this._chat.getCurrentContext(),
                    `${client.addr} disconnected from this device`);
            return this._chat.updateStatus();
        });
    }

    isManuallyConnecting() {
        return this._timer.start("started_connection");
    }

    _notifyConnectionAvailable() {
        var message = "Device discovered. Would you like to connect and use its IRC connection? [connect]";
        return this._chat.notice.prompt(message, () => {
            this._reconnectionAttempt = false;
            return this._chat.remoteConnection.finalizeConnection();
        });
    }

    _displayFailedToConnect(connectInfo) {
        if (!connectInfo) return;
        return this._chat.displayMessage("notice", this._chat.getCurrentContext(),
                `Unable to connect to server device ${connectInfo.addr} on port ${connectInfo.port}`);
    }

    _displayLostConnectionMessage() {
        return this._chat.displayMessage("notice", this._chat.getCurrentContext(),
                "Lost connection to server device. Attempting to reconnect...");
    }

    /**
     * Determine if we should connect directly to IRC or connect through another
     *  device's IRC connection.
     */
    determineConnection() {
        if (!isOnline()) return;
        this._log("determining connection...",
                this._remoteConnection.getConnectionInfo().addr,
                this._storage.loadedServerDevice,
                this._storage.password
        );
        if (!(this._remoteConnection.getConnectionInfo().addr
                && this._storage.loadedServerDevice
                && this._storage.password)) return;
        this._log("can make a connection - device:",
                this._storage.serverDevice,
                "- is server?",
                this.shouldBeServerDevice()
        );

        return this._storage.serverDevice && !this.shouldBeServerDevice()
            ? this._useServerDeviceConnection()
            : this.useOwnConnection();
    }

    _useServerDeviceConnection() {
        clearTimeout(this._useOwnConnectionTimeout);
        if (this._alreadyConnectedToServerDevice()) return;
        this._log("automatically connecting to", this._storage.serverDevice);
        if (this._remoteConnection.isInitializing()) {
            this._useOwnConnectionIfServerTakesTooLong();
        }
        return this._remoteConnection.connectToServer(this._storage.serverDevice);
    }

    _alreadyConnectedToServerDevice() {
        var serverDevice = this._remoteConnection.serverDevice,
            status = this._remoteConnection.getState(),
            usingServerDeviceConnection = status === "connected" || status === "connecting",
            isCurrentServerDevice = serverDevice != null
                    ? serverDevice.usesConnection(this._storage.serverDevice) : void 0;
        return usingServerDeviceConnection && isCurrentServerDevice;
    }

    _useOwnConnectionIfServerTakesTooLong() {
        return this._useOwnConnectionTimeout =
            setTimeout(() => this._useOwnConnectionWhileWaitingForServer(), RemoteConnectionHandler.SERVER_DEVICE_CONNECTION_WAIT);
    }

    _tryToReconnectToServerDevice() {
        clearTimeout(this._serverDeviceReconnectTimeout);
        if (this._serverDeviceReconnectBackoff == null) {
            this._serverDeviceReconnectBackoff = RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_WAIT;
        }
        return this._serverDeviceReconnectTimeout = setTimeout(() => this._reconnect(), this._serverDeviceReconnectBackoff);
    }

    _reconnect() {
        var status = this._remoteConnection.getState();
        this._reconnectionAttempt = true;
        this._serverDeviceReconnectBackoff *= 1.2;
        if (this._serverDeviceReconnectBackoff > RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_MAX_WAIT) {
            this._serverDeviceReconnectBackoff = RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_MAX_WAIT;
        }
        if (!(status === "connecting" || status === "connected")) {
            return this.determineConnection();
        }
    }

    _stopServerReconnectAttempts() {
        clearTimeout(this._serverDeviceReconnectTimeout);
        return this._serverDeviceReconnectBackoff = RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_WAIT;
    }

    _useOwnConnectionWhileWaitingForServer() {
        var connectInfo;
        if (!this._remoteConnection.isInitializing()) return;
        this._remoteConnection.becomeIdle();
        connectInfo = this._storage.serverDevice;
        this._onConnected = () => this._displayFailedToConnect(connectInfo);
        return this._resumeIRCConnection();
    }

    useOwnConnection() {
        var shouldResumeIRCConn, usingServerDeviceConnection;
        clearTimeout(this._useOwnConnectionTimeout);
        usingServerDeviceConnection = this._remoteConnection.getState() === "connected";
        if (usingServerDeviceConnection) {
            this.manuallyDisconnected = true;
            this._remoteConnection.disconnectFromServer();
            this.manuallyDisconnected = false;
            return;
        }
        if (this.shouldBeServerDevice()) {
            this._chat.notice.close();
            this._stopServerReconnectAttempts();
            this._tryToBecomeServerDevice();
            return;
        }
        shouldResumeIRCConn = this._notUsingOwnIRCConnection();
        if (this._remoteConnection.isIdle()) {
            return;
        }
        this._stopBeingServerDevice();
        if (shouldResumeIRCConn) {
            return this._resumeIRCConnection();
        }
    }

    _tryToBecomeServerDevice() {
        var shouldResumeIRCConn;
        shouldResumeIRCConn = this._notUsingOwnIRCConnection();
        if (this._remoteConnection.getState() === "finding_port") {
            this._remoteConnection.waitForPort(() => this.determineConnection());
            this._log("should be server, but havent found port yet...");
            return;
        }
        if (this._remoteConnection.getState() === "no_port") {
            if (this._remoteConnection.isServer()) {
                this._stopBeingServerDevice();
            }
        }
        else if (!this._remoteConnection.isServer()
                || this._storage.serverDevice.port !== this._remoteConnection.getConnectionInfo().port) {
            this._becomeServerDevice();
        }
        else return;

        if (shouldResumeIRCConn) {
            return this._resumeIRCConnection();
        }
    }

    _notUsingOwnIRCConnection() {
        return this._remoteConnection.isInitializing() || this._remoteConnection.isClient();
    }

    _stopBeingServerDevice() {
        if (this._remoteConnection.isServer()) {
            this._log("stopped being a server device");
            return this._remoteConnection.disconnectDevices();
        } else {
            return this._remoteConnection.becomeIdle();
        }
    }

    shouldBeServerDevice() {
        /**
         * TODO check something stored in local storage, not IP addr which can change
         */
        var _ref1, _ref2;
        return _ref1 = (_ref2 = this._storage.serverDevice) != null
                ? _ref2.addr
                : void 0, this._remoteConnection.getConnectionInfo().possibleAddrs.indexOf(_ref1) >= 0;
    }

    _becomeServerDevice() {
        this._log("becoming server device");
        if (!this._remoteConnection.isInitializing()) {
            this._chat.displayMessage("notice", this._chat.getCurrentContext(),
                    "Now accepting connections from other devices");
        }
        this._remoteConnection.becomeServer();
        return this._storage.becomeServerDevice(this._remoteConnection.getConnectionInfo());
    }

    _resumeIRCConnection() {
        this._timer.start("started_connection");
        this._log("resuming IRC conn");
        this._chat.closeAllConnections();
        return this._storage.restoreSavedState(() => this._onUsingOwnConnection());
    }

    _onUsingOwnConnection() {
        this._selectFirstRoom();
        this._chat.messageHandler.replayChatLog();
        this._storage.resume();
        if (typeof this._onConnected === "function") {
            this._onConnected();
        }
        this._onConnected = void 0;
        if (!this._storage.completedWalkthrough) {
            return this._chat.startWalkthrough();
        }
    }

    _selectFirstRoom() {
        if (this._chat.winList.length > 1) {
            return this._chat.switchToWindow(this._chat.winList.get(0));
        }
    }
}
/**
 * Number of ms to wait for a connection to be established to a server device
 *  before using our own IRC connection.
 */
RemoteConnectionHandler.SERVER_DEVICE_CONNECTION_WAIT = 650;

/**
 * If this many milliseconds go by after the user has connected to their own
 *  IRC connection, we will notify them before switching to a remote server
 *  connection.
 */
RemoteConnectionHandler.NOTIFY_BEFORE_CONNECTING = 1500;

/**
 * Number of ms to wait before trying to reconnect to the server device.
 */
RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_WAIT = 500;
RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_MAX_WAIT = 5 * 1000;
