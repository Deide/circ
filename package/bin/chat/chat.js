// Generated by CoffeeScript 1.4.0
(function() {
  "use strict";
  var Chat, exports, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  var exports = (_ref = window.chat) != null ? _ref : window.chat = {};

  Chat = (function(_super) {

    __extends(Chat, _super);

    function Chat() {
      this.onMessageEvent = __bind(this.onMessageEvent, this);

      this.onServerEvent = __bind(this.onServerEvent, this);

      this.onIRCEvent = __bind(this.onIRCEvent, this);

      var devCommands;
      Chat.__super__.constructor.apply(this, arguments);
      this.connections = {};
      this.messageHandler = new chat.IRCMessageHandler(this);
      this.userCommands = new chat.UserCommandHandler(this);
      devCommands = new chat.DeveloperCommands(this);
      this.userCommands.merge(devCommands);
      this._initializeUI();
      this._initializeRemoteConnection();
      this._initializeStorage();
      this._initializeScripts();
      this._listenForUpdates();
      this._keyboardShortcutMap = new KeyboardShortcutMap;
      this.updateStatus();

      webkitRequestFileSystem(PERSISTENT, 50 * 1024, function(fileSystem) {
        fileSystem.root.getFile('custom_style.css', { create: false },
	     function(fileEntry) {
            return $('#main-style').attr('href', fileEntry.toURL());
          });
        });
    }

    Chat.prototype.init = function() {
      if (api.clientSocketSupported()) {
        this.storage.init();
        return this.remoteConnection.init();
      } else {
        return this._displaySocketSupportError();
      }
    };

    Chat.prototype.getKeyboardShortcuts = function() {
      return this._keyboardShortcutMap;
    };

    /*
       * Tell the user that they need chrome.sockets support to run CIRC.
    */


    Chat.prototype._displaySocketSupportError = function() {
      var message;
      message = "CIRC cannot run on this device. Support for " + "chrome.sockets is required to connect to the IRC server. " + "Please update your version of Chrome and try again.";
      return this.displayMessage('error', this.getCurrentContext(), message);
    };

    Chat.prototype.tearDown = function() {
      return this.emit('tear_down');
    };

    Chat.prototype._initializeUI = function() {
      var _this = this;
      this.winList = new chat.WindowList;
      this.notice = new chat.Notice;
      this.toggleChannelDisplay = $('#hide-channels');
      this.toggleChannelDisplay.click(function() {
        $('#rooms-and-nicks')[0].classList.toggle('hidden');
      });
      this.channelDisplay = new chat.ChannelList();
      this.channelDisplay.on('clicked', function(server, chan) {
        var win = _this.winList.get(server, chan);
        if (win != null) {
          return _this.switchToWindow(win);
        }
      });
      this.channelDisplay.on('midclicked', function(server, chan) {
        _this.disconnectAndRemoveRoom(server, chan);
      });
      this.channelDisplay.on('remove_button_clicked', function(server, chan) {
        _this.disconnectAndRemoveRoom(server, chan);
      });
      this.channelDisplay.on('help_type_command', function(text) {
        _this.emit('set_input', text);
        _this.emit('blink_input');
      });
      this._addWelcomeWindow();
    };

    Chat.prototype._addWelcomeWindow = function() {
      this.emptyWindow = new chat.Window('none');
      this.channelDisplay.addAlwaysEmptyServer(this.emptyWindow.name);
      this.switchToWindow(this.emptyWindow);
      return this.emptyWindow.messageRenderer.displayWelcome();
    };

    Chat.prototype._initializeRemoteConnection = function() {
      this.remoteConnection = new RemoteConnection;
      this.remoteConnectionHandler = new chat.RemoteConnectionHandler(this);
      return this.remoteConnectionHandler.setRemoteConnection(this.remoteConnection);
    };

    Chat.prototype._initializeStorage = function() {
      this.storage = new chat.Storage(this);
      return this.remoteConnectionHandler.setStorageHandler(this.storage);
    };

    /*
       * Load prepackaged scripts the first time the app is run. These scripts are
       * loaded from storage on subsequent runs.
    */


    Chat.prototype._initializeScripts = function() {
      var _this = this;
      return this.storage.on('initialized', function() {
        if (_this.storage.loadedPrepackagedScripts) {
          return;
        }
        window.script.loader.loadPrepackagedScripts(function(script) {
          return _this.addScript(script);
        });
        return _this.storage.finishedLoadingPrepackagedScripts();
      });
    };

    /*
       * Inform listeners (like ScriptHandler) that a script has been loaded and
       * save the script to local storage.
       * @param {Script} script
    */


    Chat.prototype.addScript = function(script) {
      this.scriptHandler.addScript(script);
      return this.storage.scriptAdded(script);
    };

    Chat.prototype._listenForUpdates = function() {
      var _ref1,
        _this = this;
      if (chrome.runtime.reload == null) {
        return;
      }
      return (_ref1 = chrome.runtime.onUpdateAvailable) != null ? _ref1.addListener(function() {
        return _this._promptToUpdate();
      }) : void 0;
    };

    Chat.prototype._promptToUpdate = function() {
      var message,
        _this = this;
      message = "A new version of CIRC is available. Would you like to " + "restart and update? [update]";
      return this.notice.prompt(message, function() {
        return chrome.runtime.reload();
      });
    };

    Chat.prototype.startWalkthrough = function() {
      var walkthrough,
        _this = this;
      walkthrough = new chat.Walkthrough(this, this.storage);
      walkthrough.listenToIRCEvents(this._ircEvents);
      return walkthrough.on('tear_down', function() {
        return _this.storage.finishedWalkthrough();
      });
    };

    Chat.prototype.setPassword = function(password) {
      return this.remoteConnection.setPassword(password);
    };

    Chat.prototype.closeAllConnections = function() {
      var conn, server, _ref1, _results;
      clearTimeout(this._useOwnConnectionTimeout);
      _ref1 = this.connections;
      _results = [];
      for (server in _ref1) {
        conn = _ref1[server];
        _results.push(this.closeConnection(conn));
      }
      return _results;
    };

    Chat.prototype.closeConnection = function(conn, opt_reason) {
      if (conn.irc.state === 'reconnecting') {
        conn.irc.giveup();
      } else {
        conn.irc.quit(opt_reason);
      }
      return this.removeWindow(this.winList.get(conn.name));
    };

    Chat.prototype.listenToCommands = function(commandEmitter) {
      this.remoteConnection.broadcastUserInput(commandEmitter);
      return this.userCommands.listenTo(commandEmitter);
    };

    Chat.prototype.listenToScriptEvents = function(scriptHandler) {
      var _this = this;
      this.scriptHandler = scriptHandler;
      scriptHandler.on('save', function(id, item) {
        return _this.storage.saveItemForScript(id, item);
      });
      return scriptHandler.on('load', function(id, onLoaded) {
        return _this.storage.loadItemForScript(id, onLoaded);
      });
    };

    Chat.prototype.listenToIRCEvents = function(ircEvents) {
      this._ircEvents = ircEvents;
      this._ircEvents.on('server', this.onIRCEvent);
      return this._ircEvents.on('message', this.onIRCEvent);
    };

    Chat.prototype.connect = function(server, port, password) {
      var _ref1;
      if (server in this.connections) {
        /*
               * TODO disconnect and reconnect if port changed
        */

        if ((_ref1 = this.connections[server].irc.state) === 'connected' || _ref1 === 'connecting') {
          return;
        }
      } else {
        this._createConnection(server, port);
        this._createWindowForServer(server, port, password);
      }
      return this.connections[server].irc.connect(server, port, password);
    };

    Chat.prototype._createConnection = function(server, port) {
      var irc, _ref1;
      irc = new window.irc.IRC;
      irc.setSocket(this.remoteConnection.createSocket(server, port));
      if (this.preferredNick) {
        irc.setPreferredNick(this.preferredNick);
      }
      if ((_ref1 = this._ircEvents) != null) {
        _ref1.addEventsFrom(irc);
      }
      return this.connections[server] = {
        irc: irc,
        name: server,
        windows: {}
      };
    };

    Chat.prototype._createWindowForServer = function(server, port, password) {
      var conn, win;
      conn = this.connections[server];
      win = this._makeWin(conn);
      this._replaceEmptyWindowIfExists(win);
      win.message('', "Connecting to " + conn.name + "...");
      this.channelDisplay.addServer(conn.name);
      this.storage.serverJoined(conn.name, port, password);
      return this.switchToWindow(win);
    };

    Chat.prototype._replaceEmptyWindowIfExists = function(win) {
      if (this.currentWindow.equals(this.emptyWindow)) {
        this.channelDisplay.remove(this.emptyWindow.name);
        return win.messageRenderer.displayWelcome();
      }
    };

    Chat.prototype.join = function(conn, channel, opt_key) {
      var win;
      if (!conn.irc.isValidChannelPrefix(channel)) {
        channel = '#' + channel;
      }
      win = this._createWindowForChannel(conn, channel);
      this.switchToWindow(win);
      this.storage.channelJoined(conn.name, channel, null, opt_key);
      return conn.irc.join(channel, opt_key);
    };

    Chat.prototype.setNick = function(opt_server, nick) {
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
    };

    Chat.prototype._setNickLocally = function(nick) {
      this.preferredNick = nick;
      this.storage.nickChanged(nick);
      return this.updateStatus();
    };

    Chat.prototype._tellServerNickChanged = function(nick, server) {
      var conn;
      conn = this.connections[server];
      if (conn != null) {
        conn.irc.doCommand('NICK', nick);
      }
      return conn != null ? conn.irc.setPreferredNick(nick) : void 0;
    };

    Chat.prototype._emitNickChangedEvent = function(nick) {
      var event;
      event = new Event('server', 'nick', nick);
      event.setContext(this.getCurrentContext());
      return this.emit(event.type, event);
    };

    Chat.prototype.onIRCEvent = function(e) {
      var conn;
      conn = this.connections[e.context.server];
      if (e.type === 'server') {
        return this.onServerEvent(conn, e);
      } else {
        return this.onMessageEvent(conn, e);
      }
    };

    Chat.prototype.onServerEvent = function(conn, e) {
      if (!conn) {
        return;
      }
      switch (e.name) {
        case 'connect':
          return this.onConnected(conn);
        case 'disconnect':
          return this.onDisconnected(conn);
        case 'joined':
          return this.onJoined.apply(this, [conn, e.context.channel].concat(__slice.call(e.args)));
        case 'names':
          return this.onNames.apply(this, [e].concat(__slice.call(e.args)));
        case 'parted':
          return this.onParted(e);
        case 'nick':
          return this.updateStatus();
      }
    };

    Chat.prototype.onMessageEvent = function(conn, e) {
      var win, _ref1;
      win = this.determineWindow(e);
      if (win === chat.NO_WINDOW) {
        return;
      }
      this.messageHandler.setWindow(win);
      this.messageHandler.setCustomMessageStyle(e.style);
      return (_ref1 = this.messageHandler).handle.apply(_ref1, [e.name].concat(__slice.call(e.args)));
    };

    /*
       * Determine the window for which the event belongs.
       * @param {Event} e The event whose context we're looking at.
    */


    Chat.prototype.determineWindow = function(e) {
      var chan, conn, from, _ref1, _ref2;
      conn = this.connections[e.context.server];
      if (!conn) {
        return this.emptyWindow;
      }
      if (e.context.channel === chat.CURRENT_WINDOW && e.context.server !== ((_ref1 = this.currentWindow.conn) != null ? _ref1.name : void 0)) {
        e.context.channel = chat.SERVER_WINDOW;
      }
      chan = e.context.channel;
      if (this._isDirectMessageToUser(conn, chan, e.name)) {
        from = (_ref2 = e.args) != null ? _ref2[0] : void 0;
        if (!conn.windows[from.toLowerCase()]) {
          this.createPrivateMessageWindow(conn, from);
        }
        return conn.windows[from.toLowerCase()];
      }
      if (!chan || chan === chat.SERVER_WINDOW) {
        return conn.serverWindow;
      }
      if (chan === chat.CURRENT_WINDOW) {
        return this.currentWindow;
      }
      if (conn.windows[chan.toLowerCase()]) {
        return conn.windows[chan.toLowerCase()];
      }
      return chat.NO_WINDOW;
    };

    /*
       * Direct messages (e.g. /msg) have the channel set to the user's nick.
    */


    Chat.prototype._isDirectMessageToUser = function(conn, chan, type) {
      return (conn != null ? conn.irc.isOwnNick(chan) : void 0) && type === 'privmsg';
    };

    Chat.prototype.createPrivateMessageWindow = function(conn, from) {
      var win;
      if (conn.windows[from.toLowerCase()]) {
        return conn.windows[from.toLowerCase()];
      }
      this.storage.channelJoined(conn.name, from, 'private');
      win = conn.windows[from.toLowerCase()] = this._createWindowForChannel(conn, from);
      win.makePrivate();
      win.message('', "You're in a private conversation with " + from + ".", 'notice');
      this.channelDisplay.connect(conn.name, from);
      return win;
    };

    /*
       * Keep track of the last person to mention the user's nick in each room.
    */


    Chat.prototype.recordLastUserToMention = function(context, user) {
      var _ref1;
      if ((_ref1 = this._lastUsersToMention) == null) {
        this._lastUsersToMention = {};
      }
      return this._lastUsersToMention[context] = user;
    };

    /*
       * Returns the last person to mention the user's nick for a given room.
    */


    Chat.prototype.getLastUserToMention = function(context) {
      var _ref1;
      return (_ref1 = this._lastUsersToMention) != null ? _ref1[context] : void 0;
    };

    Chat.prototype.onConnected = function(conn) {
      var chan, win, _ref1, _results;
      this.displayMessage('connect', {
        server: conn.name
      });
      this.updateStatus();
      this.channelDisplay.connect(conn.name);
      _ref1 = conn.windows;
      _results = [];
      for (chan in _ref1) {
        win = _ref1[chan];
        if (!(!win.isPrivate())) {
          continue;
        }
        this.displayMessage('connect', {
          server: conn.name,
          channel: win.target
        });
        if (win.isPrivate()) {
          _results.push(this.channelDisplay.connect(conn.name, chan));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Chat.prototype.onDisconnected = function(conn) {
      var chan, win, _ref1, _results;
      this.displayMessage('disconnect', {
        server: conn.name
      });
      this.channelDisplay.disconnect(conn.name);
      _ref1 = conn.windows;
      _results = [];
      for (chan in _ref1) {
        win = _ref1[chan];
        this.channelDisplay.disconnect(conn.name, chan);
        _results.push(this.displayMessage('disconnect', {
          server: conn.name,
          channel: win.target
        }));
      }
      return _results;
    };

    Chat.prototype.onJoined = function(conn, chan) {
      var win;
      win = this._createWindowForChannel(conn, chan);
      this.channelDisplay.connect(conn.name, chan);
      return win.nicks.clear();
    };

    Chat.prototype._createWindowForChannel = function(conn, chan) {
      var i, win;
      win = conn.windows[chan.toLowerCase()];
      if (!win) {
        win = this._makeWin(conn, chan);
        i = this.winList.localIndexOf(win);
        this.channelDisplay.insertChannel(i, conn.name, chan);
      }
      return win;
    };

    Chat.prototype.onNames = function(e, nicks) {
      var nick, win, _i, _len, _results;
      win = this.determineWindow(e);
      if (win === chat.NO_WINDOW) {
        return;
      }
      _results = [];
      for (_i = 0, _len = nicks.length; _i < _len; _i++) {
        nick = nicks[_i];
        _results.push(win.nicks.add(nick));
      }
      return _results;
    };

    Chat.prototype.onParted = function(e) {
      var win;
      win = this.determineWindow(e);
      if (win === chat.NO_WINDOW) {
        return;
      }
      return this.channelDisplay.disconnect(win.conn.name, win.target);
    };

    Chat.prototype.disconnectAndRemoveRoom = function(server, channel, opt_reason) {
      var win = this.winList.get(server, channel);
      if (win) {
        if (!channel) {
          this.closeConnection(win.conn, opt_reason);
        } else {
          if (!win.isPrivate()) {
            win.conn.irc.part(channel, opt_reason);
          }
          this.removeWindow(win);
        }
      }
    };

    Chat.prototype.removeWindow = function(win) {
      var index, removedWindows, _i, _len, _ref1;
      if (win == null) {
        win = this.currentWindow;
      }
      index = this.winList.indexOf(win);
      if (win.isServerWindow()) {
        if ((_ref1 = this._ircEvents) != null) {
          _ref1.removeEventsFrom(win.conn.irc);
        }
      }
      removedWindows = this.winList.remove(win);
      for (_i = 0, _len = removedWindows.length; _i < _len; _i++) {
        win = removedWindows[_i];
        this._removeWindowFromState(win);
      }
      return this._selectNextWindow(index);
    };

    Chat.prototype._removeWindowFromState = function(win) {
      this.channelDisplay.remove(win.conn.name, win.target);
      this.storage.parted(win.conn.name, win.target);
      win.notifications.clear();
      if (win.target != null) {
        delete this.connections[win.conn.name].windows[win.target];
      } else {
        delete this.connections[win.conn.name];
      }
      return win.remove();
    };

    Chat.prototype._selectNextWindow = function(preferredIndex) {
      var nextWin, _ref1;
      if (this.winList.length === 0) {
        this.channelDisplay.addAlwaysEmptyServer(this.emptyWindow.name);
        return this.switchToWindow(this.emptyWindow);
      } else if (this.winList.indexOf(this.currentWindow) === -1) {
        nextWin = (_ref1 = this.winList.get(preferredIndex)) != null ? _ref1 : this.winList.get(preferredIndex - 1);
        return this.switchToWindow(nextWin);
      } else {
        return this.switchToWindow(this.currentWindow);
      }
    };

    Chat.prototype._makeWin = function(conn, opt_chan) {
      var channel = (((conn.irc || {}).channels || {})[opt_chan || ''] || {}).channel || opt_chan,
          win = new chat.Window(conn.name, channel);
      win.conn = conn;
      if (opt_chan) {
        conn.windows[opt_chan.toLowerCase()] = win;
        win.setTarget(opt_chan.toLowerCase());
        var _this = this;
        win.nicks.on('dblclicked', function(nick) {
          var newWin = _this.createPrivateMessageWindow(win.conn, nick);
          return _this.switchToWindow(newWin);
        });
      } else {
        conn.serverWindow = win;
      }
      this.winList.add(win);
      this.messageHandler.logMessagesFromWindow(win);
      return win;
    };

    Chat.prototype.updateStatus = function() {
      var conn = this.currentWindow.conn;
      var nick = this.preferredNick;
      var away, topic;
      if (conn) {
        var channelName = this.currentWindow.target;
        nick = this.currentWindow.conn.irc.nick || this.preferredNick;
        away = this.currentWindow.conn.irc.away;
        var channel = channelName ? this.currentWindow.conn.irc.channels[channelName] : undefined;
        if (channel)
          topic = channel.topic;
      }

      $('#nick').html((nick ? "<span class='name'>" + (html.escape(nick)) + "</span>" : "") +
                      (away ? "<span class='away'>away</span>" : ""));
      $('#status').html(topic ? "<span title='" + (html.escape(topic)) + "' class='topic'>" + (html.display(topic)) + "</span>" : "");
      return this._updateDocumentTitle();
    };

    Chat.prototype._updateDocumentTitle = function() {
      var connectedDevices, titleList, _ref1, _ref2;
      titleList = [];
      titleList.push("CIRC " + globals.VERSION);
      if ((_ref1 = this.remoteConnection) != null ? _ref1.isClient() : void 0) {
        titleList.push('- Connected through ' + this.remoteConnection.serverDevice.addr);
      } else if ((_ref2 = this.remoteConnection) != null ? _ref2.isServer() : void 0) {
        connectedDevices = this.remoteConnection.devices.length;
        titleList.push(("- Server for " + connectedDevices + " ") + ("other " + (pluralize('device', connectedDevices))));
      }
      return document.title = titleList.join(' ');
    };

    /*
       * Switch to a window that represents a channel by its position in the rooms
       * list.
    */


    Chat.prototype.switchToChannelByIndex = function(winNum) {
      var win;
      win = this.winList.getChannelWindow(winNum);
      if (win != null) {
        return this.switchToWindow(win);
      }
    };

    Chat.prototype.switchToWindow = function(win) {
      if (!(win != null)) {
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
    };

    Chat.prototype._focusInput = function() {
      var input = $('#input');
      if (input) {
        setTimeout(function() { input.focus(); }, 0);
      }
    }

    Chat.prototype._selectWindowInChannelDisplay = function(win) {
      if (win.conn) {
        return this.channelDisplay.select(win.conn.name, win.target);
      } else {
        return this.channelDisplay.select(win.name);
      }
    };

    /*
       * emits message to script handler, which decides if it should send it back
    */


    Chat.prototype.displayMessage = function() {
      var args, context, event, name;
      name = arguments[0], context = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      event = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Event, ['message', name].concat(__slice.call(args)), function(){});
      event.setContext(context.server, context.channel);
      return this.emit(event.type, event);
    };

    Chat.prototype.displayMessage = function() {
      var args, context, event, name;
      name = arguments[0], context = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      event = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Event, ['message', name].concat(__slice.call(args)), function(){});
      event.setContext(context.server, context.channel);
      return this.emit(event.type, event);
    };

    Chat.prototype.getCurrentContext = function() {
      var _ref1;
      return new Context((_ref1 = this.currentWindow.conn) != null ? _ref1.name : void 0, chat.CURRENT_WINDOW);
    };

    return Chat;

  })(EventEmitter);

  exports.SERVER_WINDOW = '@server_window';

  exports.CURRENT_WINDOW = '@current_window';

  exports.NO_WINDOW = 'NO_WINDOW';

  exports.Chat = Chat;

}).call(this);
