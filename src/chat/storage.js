import EventEmitter from "../utils/event_emitter";
import {getLogger, getFieldOrNull} from "../utils/utils";
import {randomName} from "../irc/irc_util";
import ScriptLoader from "../script/script_loader";
import iter from "lazy.js";

/**
 * Manages storage
 */
export default class Storage extends EventEmitter {
    constructor(chat) {
        super();
        this._restoreScripts = this._restoreScripts.bind(this);
        this._onChanged = this._onChanged.bind(this);
        this._chat = chat;
        this._log = getLogger(this);
        this._scripts = [];
        this._channels = [];
        this._servers = [];
        this._nick = void 0;
        this._autostart = void 0;
        this.password = void 0;
        this.serverDevice = void 0;
        chrome.storage.onChanged.addListener(this._onChanged);
        this.pause();
    }

    /**
     * Save an object to sync storage for the script with the given name.
     * @param {string} name A unique name representing the script.
     * @param {Object} item The item to store.
     */
    saveItemForScript(name, item) {
        return this._store(this._getScriptStorageHandle(name), item);
    }

    /**
     * Load an object from sync storage for the script with the given name.
     * @param {string} name A unique name representing the script.
     * @param {function(Object)} onLoaded The function that is called once the item
     *     is loaded.
     */
    loadItemForScript(name, onLoaded) {
        var storageHandle = this._getScriptStorageHandle(name);
        return chrome.storage.sync.get(storageHandle, state => onLoaded(state[storageHandle]));
    }

    /**
     * Clears the item stored for the given script. This is called after a script
     *  is uninstalled.
     * @param {string} name A unique name representing the script.
     */
    clearScriptStorage(name) {
        return chrome.storage.sync.remove(this._getScriptStorageHandle(name));
    }

    _getScriptStorageHandle(name) {
        return `script_${name}`;
    }

    /**
     * Listen for storage changes.
     * If the password updated then change our own. If the password was cleared
     *  then restore it.
     * @param  {any} changeMap
     * @param  {any} areaName
     */
    _onChanged(changeMap) {
        if (changeMap.password) {
            this._onPasswordChange(changeMap.password);
        }
        if (changeMap.server_device) {
            this._onServerDeviceChange(changeMap.server_device);
        }
        return this._scripts
            .map(script => {
                let change = changeMap[this._getScriptStorageHandle(script.getName())];
                if (change) return this._chat.scriptHandler.storageChanged(script, change);
                return void 0;
            });
    }

    _onPasswordChange(passwordChange) {
        this._log("password changed from", passwordChange.oldValue, "to", passwordChange.newValue);
        if (passwordChange.newValue === this.password) return;
        if (passwordChange.newValue) {
            this.password = passwordChange.newValue;
            return this._chat.setPassword(this.password);
        } else {
            this._log("password was cleared. Setting password back to", this.password);
            return this._store("password", this.password);
        }
    }

    _onServerDeviceChange(serverChange) {
        this._log(
            "device server changed from",
            getFieldOrNull(serverChange, ["oldValue", "addr"]),
            getFieldOrNull(serverChange, ["oldValue", "port"]),
            "to",
            getFieldOrNull(serverChange, ["newValue", "addr"]),
            getFieldOrNull(serverChange, ["newValue", "port"])
        );
        if (serverChange.newValue) {
            this.serverDevice = serverChange.newValue;
            return this._chat.remoteConnectionHandler.determineConnection(this.serverDevice);
        } else if (this.serverDevice) {
            return this._store("server_device", this.serverDevice);
        }
    }

    /**
     * Stops storing state items (channel, server, nick).
     * This is used when the client is resuming it's IRC state and doesn't want
     *  to make redudant writes to storage.
     */
    pause() {
        return this._paused = true;
    }

    resume() {
        return this._paused = false;
    }

    setAutostart(opt_enabled) {
        var enabled;
        enabled = opt_enabled != null ? opt_enabled : !this._autostart;
        this._autostart = enabled;
        this._store("autostart", enabled);
        return this._autostart;
    }

    finishedWalkthrough() {
        return this._store("completed_walkthrough", true, "local");
    }

    finishedLoadingPrepackagedScripts() {
        return this._store("loaded_prepackaged_scripts", true, "local");
    }

    nickChanged(nick) {
        if (this._nick === nick) {
            return;
        }
        this._nick = nick;
        return this._store("nick", nick);
    }

    channelJoined(server, name, type, key) {
        var chan, channelObj, i, _i, _len, _ref1;
        type = type || "normal";
        _ref1 = this._channels;
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            chan = _ref1[i];
            if (chan.server === server && chan.name === name) {
                if (chan.key !== key) {
                    this._channels.splice(i, 1);
                    break;
                }
                return;
            }
        }
        channelObj = {
            server: server,
            name: name,
            key: key
        };
        if (type !== "normal") {
            channelObj.type = type;
        }
        this._channels.push(channelObj);
        return this._store("channels", this._channels);
    }

    serverJoined(name, port, password) {
        if (this._isDuplicateServer(name, port)) {
            return;
        }
        this._servers.push({
            name: name,
            port: port,
            password: password
        });
        return this._store("servers", this._servers);
    }

    _isDuplicateServer(name, port) {
        return this._servers
            .some((server, i) => {
                if (server.name === name) {
                    if (server.port === port) {
                        return true;
                    }
                    this._servers.splice(i, 1);
                    return false;
                }
            });
    }

    parted(server, channel) {
        if (channel != null) {
            return this._channelParted(server, channel);
        } else {
            return this._serverParted(server);
        }
    }

    _channelParted(server, name) {
        let index = this._channels.findIndex(channel => {
            return channel.server === server
                    && channel.name.toLowerCase() === name.toLowerCase();
        });
        this._channels.splice(index, 1);
        return this._store("channels", this._channels);
    }

    _serverParted(name) {
        let index = this._servers.findIndex(server => server.name === name);
        if (index >= 0) {
            this._servers.splice(index, 1);
            return this._store("servers", this._servers);
        }
    }

    ignoredMessagesChanged() {
        return this._store("ignored_messages", this._getIgnoredMessages());
    }

    _getIgnoredMessages() {
        return this._chat.messageHandler.getIgnoredMessages();
    }

    scriptAdded(script) {
        if (this._isDuplicateScript(script)) return;
        this._scripts.push(script);
        return this._store("scripts", this._scripts, "local");
    }

    scriptRemoved(scriptToRemove) {
        let index = this._scripts.findIndex(script => script.id === scriptToRemove.id);
        if (index >= 0) {
            this._scripts.splice(index, 1);
            this._store("scripts", this._scripts, "local");
        }
    }

    _isDuplicateScript(newScript) {
        return this._scripts.some(script => script.id === newScript.id);
    }

    _store(key, value, type) {
        var storageObj;
        type = type || "sync";
        if (!this.shouldStore(key)) return;
        this._log("storing", key, "=>", value, "to", type);
        storageObj = {};
        storageObj[key] = value;
        if (type === "sync") {
            return chrome.storage.sync.set(storageObj);
        } else {
            return chrome.storage.local.set(storageObj);
        }
    }

    shouldStore(key) {
        return !(this._paused && Storage.STATE_ITEMS.indexOf(key) >= 0);
    }

    getState() {
        return {
            ircStates: this._createIRCStates(),
            servers: this._servers,
            channels: this._channels,
            nick: this._nick,
            ignoredMessages: this._getIgnoredMessages()
        };
    }

    _createIRCStates() {
        return iter(this._chat.connections)
            .values()
            .map(connection => ({
                server: connection.name,
                state: connection.irc.state,
                channels: connection.irc.channels,
                away: connection.irc.away,
                nick: connection.irc.nick
            }));
    }

    /**
     * Load initial items, such as whether to show the walkthrough.
     */
    init() {
        return chrome.storage.local.get(Storage.INITIAL_ITEMS_LOCAL, state => {
            this._initializeLocalItems(state);
            return chrome.storage.sync.get(Storage.INITIAL_ITEMS, state => {
                this._initializeSyncItems(state);
                return this.emit("initialized");
            });
        });
    }

    _initializeSyncItems(state) {
        this._state = state;
        this._restorePassword();
        this._loadServerDevice();
        return this._autostart = state.autostart;
    }

    _initializeLocalItems(state) {
        this.completedWalkthrough = state["completed_walkthrough"];
        this.loadedPrepackagedScripts = state["loaded_prepackaged_scripts"];
        return this._restoreScripts(state);
    }

    _restoreScripts(state) {
        if (!state.scripts) return;
        this._log(state.scripts.length, "scripts loaded from storage:", state.scripts);
        return ScriptLoader.loadScriptsFromStorage(state.scripts, script => {
            this._scripts.push(script);
            return this._chat.scriptHandler.addScript(script);
        });
    }

    restoreSavedState(opt_callback) {
        return chrome.storage.sync.get(Storage.STATE_ITEMS, savedState => {
            this.loadState(savedState);
            return typeof opt_callback === "function" ? opt_callback() : void 0;
        });
    }

    loadState(state) {
        this._state = state;
        this._restoreNick();
        this._restoreServers();
        this._restoreChannels();
        this._restoreIgnoredMessages();
        this._restoreIRCStates();
        return this._markItemsAsLoaded(Storage.STATE_ITEMS, state);
    }

    _restorePassword() {
        this.password = this._state.password;
        if (!this.password) {
            this.password = randomName();
            this._log("no password found, setting new password to", this.password);
            this._store("password", this.password);
        } else {
            this._log("password loaded from storage:", this.password);
        }
        this._chat.setPassword(this.password);
        return this._chat.remoteConnectionHandler.determineConnection();
    }

    _restoreServers() {
        let servers = this._state.servers;
        if (!servers) return;
        this._servers = servers;
        return servers.map(server => this._chat.connect(server.name, server.port, server.password));
    }

    _restoreChannels() {
        var channels = this._state.channels;
        if (!channels) return;
        this._channels = channels;

        return channels.reduce((cs, channel) => {
            let connection = this._chat.connections[channel.server];
            if (!connection) return cs;
            if (channel.type === "private") {
                cs.push(this._chat.createPrivateMessageWindow(connection, channel.name));
            }
            else {
                cs.push(this._chat.join(connection, channel.name, channel.key));
            }
            return cs;
        }, []);
    }

    _restoreIgnoredMessages() {
        var ignoredMessages = this._state["ignored_messages"];
        if (!ignoredMessages) return;
        this._log("restoring ignored messages from storage:", ignoredMessages);
        return this._chat.messageHandler.setIgnoredMessages(ignoredMessages);
    }

    _restoreNick() {
        var nick = this._state.nick;
        if (!(nick && typeof nick === "string")) return;
        this._nick = nick;
        return this._chat.setNick(nick);
    }

    _restoreIRCStates() {
        var connectedServers,
            ircStates = this._state.ircStates;
        if (!ircStates) return;

        connectedServers = ircStates.map(ircState => {
            let connection = this._chat.connections[ircState.server];
            if (connection) {
                this._setIRCState(connection, ircState);
            }
            return ircState.server;
        });
        return this._disconnectServersWithNoState(connectedServers);
    }

    _disconnectServersWithNoState(connectedServers) {
        return iter(this._chat.connections)
            .pairs()
            .filter(([name]) => connectedServers.indexOf(name) < 0)
            .each(([, connection]) => connection.irc.state = "disconnected");
    }

    _getNicksInChannel(channel) {
        return iter(channel.names).values();
    }

    /**
     * Loads servers, channels and nick from the given IRC state.
     * The state has the following format:
     * {
     *  nick: string,
     *  channels: Array<{sevrer, name}>,
     *  servers: Array<{name, port}>,
     *  irc_state: object,
     *  server_device: {port: number, addr: string},
     *  password: string
     * }
     * @param {Object} ircState An object that represents the current state of an IRC client.
     */
    _setIRCState(conn, ircState) {
        if (ircState.state === "connected") this._chat.onConnected(conn);
        if (ircState.state) conn.irc.state = ircState.state;
        if (ircState.away) conn.irc.away = ircState.away;
        if (ircState.channels) conn.irc.channels = ircState.channels;
        conn.irc.nick = ircState.nick;
        if (!ircState.channels) return;

        return iter(ircState.channels)
            .pairs()
            .each(([channelName, channel]) => {
                this._chat.onJoined(conn, channelName);
                return this._chat.onNames({
                    context: {
                        server: conn.name,
                        channel: channelName
                    }
                }, this._getNicksInChannel(channel));
            });
    }

    _loadServerDevice() {
        this.loadedServerDevice = true;
        this.serverDevice = this._state.server_device;
        if (!this.serverDevice) {
            this._log("no remote server found", this._state);
        }
        if (this.serverDevice) {
            this._log("loaded server device", this.serverDevice);
        }
        return this._chat.remoteConnectionHandler.determineConnection();
    }

    /**
     * Marks that a certain item has been loaded from storage.
     */
    _markItemsAsLoaded(items, state) {
        return items.map(item => this[`${item}Loaded`] = state[item] != null);
    }

    becomeServerDevice(connectionInfo) {
        this.serverDevice = {
            addr: connectionInfo.addr,
            port: connectionInfo.port
        };
        return this._store("server_device", this.serverDevice);
    }
}
/**
 * Items loaded from sync storage related to the user's IRC state
 */
Storage.STATE_ITEMS = ["nick", "servers", "channels", "ignored_messages"];

/**
 * Items loaded from sync storage on startup
 */
Storage.INITIAL_ITEMS = ["password", "server_device", "autostart"];

/**
 * Items loaded from local storage on startup
 */
Storage.INITIAL_ITEMS_LOCAL = ["completed_walkthrough", "scripts", "loaded_prepackaged_scripts"];
