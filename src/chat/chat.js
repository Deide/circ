import EventEmitter from "../utils/event_emitter";
import DeveloperCommands from "./developer_commands";
import IRCMessageHandler from "./irc_message_handler";
import IRC from "../irc/irc";
import Context from "./context";
import UserCommandHandler from "./user_command_handler";
import WindowList from "./window_list";
import Notice from "./notice";
import ChannelList from "./channel_list";
import Window from "./window";
import Walkthrough from "./walkthrough";
import Storage from "./storage";
import ScriptLoader from "../script/script_loader";

import KeyboardShortcutMap from "../input/keyboard_shortcut_map";

import RemoteConnection from "../net/remote_connection";
import RemoteConnectionHandler from "../net/remote_connection_handler";

import Event from "../utils/event";
import {getFieldOrNull, pluralize, html} from "../utils/utils";
import {clientSocketSupported} from "../utils/api";
import {VERSION} from "../utils/globals";
import iter from "lazy.js";

/**
 * Chat Application Class
 */
export default class Chat extends EventEmitter {
    constructor() {
        super();
        // Binding Event Handlers to the instance
        this.onMessageEvent = this.onMessageEvent.bind(this);
        this.onServerEvent = this.onServerEvent.bind(this);
        this.onIRCEvent = this.onIRCEvent.bind(this);

        var devCommands = new DeveloperCommands(this);

        this.connections = {};
        this.messageHandler = new IRCMessageHandler(this);
        this.userCommands = new UserCommandHandler(this);

        this.userCommands.merge(devCommands);
        this._initializeUI();
        this._initializeRemoteConnection();
        this._initializeStorage();
        this._initializeScripts();
        this._listenForUpdates();
        this._keyboardShortcutMap = new KeyboardShortcutMap;
        this.updateStatus();

        window.webkitRequestFileSystem(PERSISTENT, 50 * 1024, function(fileSystem) {
            fileSystem.root.getFile("custom_style.css", { create: false },
                fileEntry => $("#main-style").attr("href", fileEntry.toURL()));
        });
    }
    /**
     * Initialise the chat application
     */
    init() {
        if (clientSocketSupported()) {
            this.storage.init();
            return this.remoteConnection.init();
        } else {
            return this._displaySocketSupportError();
        }
    }

    getKeyboardShortcuts() {
        return this._keyboardShortcutMap;
    }

    /**
     * Tell the user that they need chrome.sockets support to run CIRC.
     */
    _displaySocketSupportError() {
        var message = "CIRC cannot run on this device. Support for chrome.sockets is required to connect to the IRC server. Please update your version of Chrome and try again.";
        return this.displayMessage("error", this.getCurrentContext(), message);
    }

    tearDown() {
        return this.emit("tear_down");
    }

    _initializeUI() {
        this.winList = new WindowList;
        this.notice = new Notice;
        this.toggleChannelDisplay = $("#hide-channels");
        this.toggleChannelDisplay.click(() => {
            $("#rooms-and-nicks")[0].classList.toggle("hidden");
        });
        this.channelDisplay = new ChannelList();
        this.channelDisplay.on("clicked", (server, chan) => {
            let win = this.winList.get(server, chan);
            if (win != null) {
                return this.switchToWindow(win);
            }
        });
        this.channelDisplay.on("midclicked", (server, chan) => {
            this.disconnectAndRemoveRoom(server, chan);
        });
        this.channelDisplay.on("remove_button_clicked", (server, chan) => {
            this.disconnectAndRemoveRoom(server, chan);
        });
        this.channelDisplay.on("help_type_command", (text) => {
            this.emit("set_input", text);
            this.emit("blink_input");
        });
        this._addWelcomeWindow();
    }

    _addWelcomeWindow() {
        this.emptyWindow = new Window("none");
        this.channelDisplay.addAlwaysEmptyServer(this.emptyWindow.name);
        this.switchToWindow(this.emptyWindow);
        return this.emptyWindow.messageRenderer.displayWelcome();
    }

    _initializeRemoteConnection() {
        this.remoteConnection = new RemoteConnection;
        this.remoteConnectionHandler = new RemoteConnectionHandler(this);
        return this.remoteConnectionHandler.setRemoteConnection(this.remoteConnection);
    }

    _initializeStorage() {
        this.storage = new Storage(this);
        return this.remoteConnectionHandler.setStorageHandler(this.storage);
    }

    /**
     * Load prepackaged scripts the first time the app is run. These scripts are
     *  loaded from storage on subsequent runs.
     */
    _initializeScripts() {
        return this.storage.on("initialized", () => {
            if (this.storage.loadedPrepackagedScripts) return;
            ScriptLoader.loadPrepackagedScripts(script => this.addScript(script));
            return this.storage.finishedLoadingPrepackagedScripts();
        });
    }

    /**
     * Inform listeners (like ScriptHandler) that a script has been loaded and
     *  save the script to local storage.
     * @param {Script} script
     */
    addScript(script) {
        this.scriptHandler.addScript(script);
        return this.storage.scriptAdded(script);
    }

    _listenForUpdates() {
        var onUpdateAvailable;
        if (chrome.runtime.reload === null) return;
        return (onUpdateAvailable = chrome.runtime.onUpdateAvailable) != null
                ? onUpdateAvailable.addListener(() => this._promptToUpdate())
                : void 0;
    }

    _promptToUpdate() {
        var message = "A new version of CIRC is available. Would you like to restart and update? [update]";
        return this.notice.prompt(message, () => chrome.runtime.reload());
    }

    startWalkthrough() {
        var walkthrough = new Walkthrough(this, this.storage);
        walkthrough.listenToIRCEvents(this._ircEvents);
        return walkthrough.on("tear_down", () => this.storage.finishedWalkthrough());
    }

    setPassword(password) {
        return this.remoteConnection.setPassword(password);
    }

    closeAllConnections() {
        clearTimeout(this._useOwnConnectionTimeout);
        return iter(this.connections).values().each(connection => this.closeConnection(connection));
    }

    closeConnection(conn, reason) {
        if (conn.irc.state === "reconnecting") {
            conn.irc.giveup();
        } else {
            conn.irc.quit(reason);
        }
        return this.removeWindow(this.winList.get(conn.name));
    }

    listenToCommands(commandEmitter) {
        this.remoteConnection.broadcastUserInput(commandEmitter);
        return this.userCommands.listenTo(commandEmitter);
    }

    listenToScriptEvents(scriptHandler) {
        this.scriptHandler = scriptHandler;
        scriptHandler.on("save", (id, item) => this.storage.saveItemForScript(id, item));
        return scriptHandler.on("load", (id, onLoaded) => this.storage.loadItemForScript(id, onLoaded));
    }

    listenToIRCEvents(ircEvents) {
        this._ircEvents = ircEvents;
        this._ircEvents.on("server", this.onIRCEvent);
        return this._ircEvents.on("message", this.onIRCEvent);
    }

    connect(server, port, password) {
        var irc;
        if (server in this.connections) {
            irc = this.connections[server].irc.state;
            /*
             * TODO disconnect and reconnect if port changed
             */
            if (irc.state === "connected" || irc.state === "connecting") return;
        } else {
            this._createConnection(server, port);
            this._createWindowForServer(server, port, password);
        }
        return this.connections[server].irc.connect(server, port, password);
    }

    _createConnection(server, port) {
        var irc = new IRC(this.remoteConnection.createSocket(server, port));
        if (this.preferredNick) {
            irc.setPreferredNick(this.preferredNick);
        }
        if (this._ircEvents != null) {
            this._ircEvents.addEventsFrom(irc);
        }
        return this.connections[server] = {
            irc: irc,
            name: server,
            windows: {}
        };
    }

    _createWindowForServer(server, port, password) {
        var conn = this.connections[server],
            win = this._makeWin(conn);

        this._replaceEmptyWindowIfExists(win);
        win.message("", `Connecting to ${conn.name}...`);
        this.channelDisplay.addServer(conn.name);
        this.storage.serverJoined(conn.name, port, password);
        return this.switchToWindow(win);
    }

    _replaceEmptyWindowIfExists(win) {
        if (this.currentWindow.equals(this.emptyWindow)) {
            this.channelDisplay.remove(this.emptyWindow.name);
            return win.messageRenderer.displayWelcome();
        }
    }

    join(conn, channel, opt_key) {
        var win;
        if (!conn.irc.isValidChannelPrefix(channel)) {
            channel = "#" + channel;
        }
        win = this._createWindowForChannel(conn, channel);
        this.switchToWindow(win);
        this.storage.channelJoined(conn.name, channel, null, opt_key);
        return conn.irc.join(channel, opt_key);
    }

    setNick(opt_server, nick) {
        var server;
        if (!nick) {
            nick = opt_server;
            server = void 0;
        } else {
            server = opt_server;
        }
        this._setNickLocally(nick);
        this._tellServerNickChanged(nick, server);
        return this._emitNickChangedEvent(nick);
    }

    _setNickLocally(nick) {
        this.preferredNick = nick;
        this.storage.nickChanged(nick);
        return this.updateStatus();
    }

    _tellServerNickChanged(nick, server) {
        var conn = this.connections[server];
        if (conn != null) {
            conn.irc.doCommand("NICK", nick);
        }
        return conn != null ? conn.irc.setPreferredNick(nick) : void 0;
    }

    _emitNickChangedEvent(nick) {
        var event;
        event = new Event("server", "nick", nick);
        event.setContext(this.getCurrentContext());
        return this.emit(event.type, event);
    }

    onIRCEvent(e) {
        var conn = this.connections[e.context.server];
        if (e.type === "server") {
            return this.onServerEvent(conn, e);
        } else {
            return this.onMessageEvent(conn, e);
        }
    }

    onServerEvent(conn, e) {
        if (!conn) return;
        switch (e.name) {
        case "connect":
            return this.onConnected(conn);
        case "disconnect":
            return this.onDisconnected(conn);
        case "joined":
            return this.onJoined.apply(this, [conn, e.context.channel, ...e.args]);
        case "names":
            return this.onNames.apply(this, [e, ...e.args]);
        case "parted":
            return this.onParted(e);
        case "nick":
            return this.updateStatus();
        }
    }

    onMessageEvent(conn, e) {
        var win = this.determineWindow(e);
        if (win === Chat.NO_WINDOW) return;
        this.messageHandler.setWindow(win);
        this.messageHandler.setCustomMessageStyle(e.style);
        return this.messageHandler.handle(...[e.name, ...e.args]);
    }
    /**
     * Determine the window for which the event belongs.
     * @param {Event} e The event whose context we're looking at.
     */
    determineWindow(e) {
        var chan,
            conn = this.connections[e.context.server];
        if (!conn) return this.emptyWindow;
        if (e.context.channel === Chat.CURRENT_WINDOW
                && e.context.server !== getFieldOrNull(this.currentWindow, ["conn", "name"])) {
            e.context.channel = Chat.SERVER_WINDOW;
        }
        chan = e.context.channel;
        if (this._isDirectMessageToUser(conn, chan, e.name)) {
            let from = getFieldOrNull(e, ["args", 0]);
            return this.createPrivateMessageWindow(conn, from);
        }
        if (!chan || chan === Chat.SERVER_WINDOW) {
            return conn.serverWindow;
        }
        if (chan === Chat.CURRENT_WINDOW) {
            return this.currentWindow;
        }
        if (conn.windows[chan.toLowerCase()]) {
            return conn.windows[chan.toLowerCase()];
        }
        return Chat.NO_WINDOW;
    }

    /**
     * Direct messages (e.g. /msg) have the channel set to the user"s nick.
     */
    _isDirectMessageToUser(conn, chan, type) {
        return (conn != null ? conn.irc.isOwnNick(chan) : void 0) && type === "privmsg";
    }

    createPrivateMessageWindow(conn, from) {
        var win,
            lowerCaseFrom = from.toLowerCase();

        if (conn.windows[lowerCaseFrom]) {
            return conn.windows[lowerCaseFrom];
        }
        this.storage.channelJoined(conn.name, from, "private");
        win = conn.windows[lowerCaseFrom] = this._createWindowForChannel(conn, from);
        win.makePrivate();
        win.message("", `You're in a private conversation with ${from}.`, "notice");
        this.channelDisplay.connect(conn.name, from);
        return win;
    }
    /**
     * Keep track of the last person to mention the user"s nick in each room.
     * @param  {string} context
     * @param  {any} user
     */
    recordLastUserToMention(context, user) {
        if (this._lastUsersToMention == null) {
            this._lastUsersToMention = {};
        }
        return this._lastUsersToMention[context] = user;
    }
    /**
     * Returns the last person to mention the user"s nick for a given room.
     * @param  {string} context
     */
    getLastUserToMention(context) {
        return getFieldOrNull(this, ["_lastUsersToMention", context]);
    }

    onConnected(conn) {
        this.displayMessage("connect", {
            server: conn.name
        });
        this.updateStatus();
        this.channelDisplay.connect(conn.name);

        return iter(conn.windows).pairs().each(([channel, win]) => {
            this.displayMessage("connect", {
                server: conn.name,
                channel: win.target
            });
            if (win.isPrivate()) {
                return this.channelDisplay.connect(conn.name, channel);
            }
            else {
                return void 0;
            }
        });
    }

    onDisconnected(conn) {
        this.displayMessage("disconnect", {
            server: conn.name
        });
        this.channelDisplay.disconnect(conn.name);

        return iter(conn.windows).pairs().each(([channel, window]) => {
            this.channelDisplay.disconnect(conn.name, channel);
            return this.displayMessage("disconnect", {
                server: conn.name,
                channel: window.target
            });
        });
    }

    onJoined(conn, chan) {
        var win = this._createWindowForChannel(conn, chan);
        this.channelDisplay.connect(conn.name, chan);
        return win.nicks.clear();
    }

    _createWindowForChannel(conn, chan) {
        var win = conn.windows[chan.toLowerCase()];
        if (!win) {
            win = this._makeWin(conn, chan);
            this.channelDisplay.insertChannel(this.winList.localIndexOf(win), conn.name, chan);
        }
        return win;
    }

    onNames(e, nicks) {
        var win = this.determineWindow(e);
        if (win === Chat.NO_WINDOW) return;
        return nicks.map(nick => win.nicks.add(nick));
    }

    onParted(e) {
        var win = this.determineWindow(e);
        if (win === Chat.NO_WINDOW) return;
        return this.channelDisplay.disconnect(win.conn.name, win.target);
    }

    disconnectAndRemoveRoom(server, channel, opt_reason) {
        var win = this.winList.get(server, channel);
        if (win) {
            if (!channel) {
                this.closeConnection(win.conn, opt_reason);
            }
            else {
                if (!win.isPrivate()) {
                    win.conn.irc.part(channel, opt_reason);
                }
                this.removeWindow(win);
            }
        }
    }

    removeWindow(win) {
        var index, removedWindows;
        if (win == null) {
            win = this.currentWindow;
        }
        index = this.winList.indexOf(win);
        if (win.isServerWindow()) {
            if (this._ircEvents != null) {
                this._ircEvents.removeEventsFrom(win.conn.irc);
            }
        }
        removedWindows = this.winList.remove(win);
        removedWindows.forEach(window => this._removeWindowFromState(window));
        return this._selectNextWindow(index);
    }

    _removeWindowFromState(win) {
        this.channelDisplay.remove(win.conn.name, win.target);
        this.storage.parted(win.conn.name, win.target);
        win.notifications.clear();
        if (win.target != null) {
            delete this.connections[win.conn.name].windows[win.target];
        } else {
            delete this.connections[win.conn.name];
        }
        return win.remove();
    }

    _selectNextWindow(preferredIndex) {
        if (this.winList.length === 0) {
            this.channelDisplay.addAlwaysEmptyServer(this.emptyWindow.name);
            return this.switchToWindow(this.emptyWindow);
        }
        else if (this.winList.indexOf(this.currentWindow) === -1) {
            let windex = this.winList.get(preferredIndex);
            let nextWin = windex != null ? windex : this.winList.get(preferredIndex - 1);
            return this.switchToWindow(nextWin);
        }
        else {
            return this.switchToWindow(this.currentWindow);
        }
    }

    _makeWin(conn, opt_chan) {
        var channel = getFieldOrNull(conn.irc, ["channels", opt_chan, "channel"]) || opt_chan,
            win = new Window(conn.name, channel);
        win.conn = conn;
        if (opt_chan) {
            let ocLowerCase = opt_chan.toLowerCase();
            conn.windows[ocLowerCase] = win;
            win.setTarget(ocLowerCase);
            win.nicks.on("dblclicked",
                    nick => this.switchToWindow(this.createPrivateMessageWindow(win.conn, nick)));
        } else {
            conn.serverWindow = win;
        }
        this.winList.add(win);
        this.messageHandler.logMessagesFromWindow(win);
        return win;
    }

    updateStatus() {
        var away, topic,
            conn = this.currentWindow.conn,
            nick = this.preferredNick;

        if (conn) {
            let channelName = this.currentWindow.target,
                channel = channelName ? this.currentWindow.conn.irc.channels[channelName] : undefined;

            nick = this.currentWindow.conn.irc.nick || this.preferredNick;
            away = this.currentWindow.conn.irc.away;
            if (channel) topic = channel.topic;
        }

        $("#nick").html((nick ? `<span class="name">${html.escape(nick)}</span>` : "")
                + (away ? "<span class=\"away\">away</span>" : ""));
        $("#status").html(topic ? `<span title="${html.escape(topic)}" class="topic">${html.display(topic)}</span>`
                : "");
        return this._updateDocumentTitle();
    }

    _updateDocumentTitle() {
        var connectedDevices,
            remoteConnection = this.remoteConnection,
            titleList = [];
        titleList.push(`CIRC ${VERSION}`);

        if (remoteConnection) {
            if (remoteConnection.isClient()) {
                titleList.push(`- Connected through ${this.remoteConnection.serverDevice.addr}`);
            }
            else if (this.remoteConnection.isServer()) {
                connectedDevices = this.remoteConnection.devices.length;
                titleList.push(`- Server for ${connectedDevices} other ${pluralize("device", connectedDevices)}`);
            }
        }
        return document.title = titleList.join(" ");
    }
    /**
     * Switch to a window that represents a channel by its position in the rooms
     *  list.
     * @param  {any} winNum
     */
    switchToChannelByIndex(winNum) {
        var win = this.winList.getChannelWindow(winNum);
        if (win != null) {
            return this.switchToWindow(win);
        }
    }

    switchToWindow(win) {
        if (win == null) {
            throw new Error("switching to non-existant window");
        }
        if (this.currentWindow) {
            this.currentWindow.detach();
        }
        this.currentWindow = win;
        win.attach();
        this._focusInput();
        this._selectWindowInChannelDisplay(win);
        return this.updateStatus();
    }

    _focusInput() {
        var input = $("#input");
        if (input) {
            setTimeout(() => input.focus(), 0);
        }
    }

    _selectWindowInChannelDisplay(win) {
        if (win.conn) {
            return this.channelDisplay.select(win.conn.name, win.target);
        } else {
            return this.channelDisplay.select(win.name);
        }
    }
    /**
     * Emits a message to the script handler, which decides if it should send it back
     */
    displayMessage(name, context, ...rest) {
        var event = new Event("message", name, ...rest);
        event.setContext(context.server, context.channel);
        return this.emit(event.type, event);
    }

    getCurrentContext() {
        return new Context(getFieldOrNull(this.currentWindow.conn, ["name"]), Chat.CURRENT_WINDOW);
    }
}

Chat.SERVER_WINDOW = "@server_window";
Chat.CURRENT_WINDOW = "@current_window";
Chat.NO_WINDOW = "NO_WINDOW";