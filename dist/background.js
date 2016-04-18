(function () {
    'use strict';

    (function () {
        "use strict";

        var openTcpServers = [];
        var openConnections = [];
        var currentApp = null;
        var exports = window || {};

        function appIsRunning() {
            return currentApp && !currentApp.contentWindow.closed;
        }

        function cleanup() {
            openConnections.forEach(function (socketID) {
                chrome.sockets.tcp.disconnect(parseInt(socketID));
                chrome.sockets.tcp.close(parseInt(socketID));
            });
            openConnections = [];

            openTcpServers.forEach(function (socketID) {
                chrome.sockets.tcpServer.disconnect(parseInt(socketID));
                chrome.sockets.tcp.close(parseInt(socketID));
            });
            openTcpServers = [];
            window.close();
        }

        exports.registerSocketId = function (socketid) {
            openConnections[socketid] = true;
        };

        exports.unregisterSocketId = function (socketid) {
            delete openConnections[socketid];
        };

        exports.registerTcpServer = function (socketid) {
            openTcpServers[socketid] = true;
        };

        exports.unregisterTcpServer = function (socketid) {
            delete openTcpServers[socketid];
        };

        function onCreated(win) {
            currentApp = win;
            if (win.onClosed) {
                win.onClosed.addListener(cleanup);
            }
        }

        function create() {
            return chrome.app.window.create("main.html", {
                width: 775,
                height: 400,
                minWidth: 320,
                minHeight: 160,
                id: "circ"
            }, onCreated);
        }

        if (chrome.runtime.onStartup != null) {
            chrome.runtime.onStartup.addListener(function () {
                return chrome.storage.sync.get("autostart", function (storageMap) {
                    if (storageMap.autostart) {
                        create();
                    } else {
                        if (!appIsRunning()) {
                            window.close();
                        }
                    }
                });
            });
        }

        if (chrome.app.runtime.onLaunched != null) {
            chrome.app.runtime.onLaunched.addListener(function () {
                if (appIsRunning()) {
                    return currentApp.focus();
                } else {
                    return create();
                }
            });
        }

        /**
         * Repeatedly check if the window has been closed and close the background page
         *  when it has.
         * TODO: Take this out once the onClose event hits stable.
         */
        function closeWhenAppCloses() {
            var interval = setInterval(function () {
                if (!appIsRunning()) {
                    clearInterval(interval);
                    cleanup();
                }
            }, 1000);
        }

        if (chrome.runtime.onUpdateAvailable != null) {
            chrome.runtime.onUpdateAvailable.addListener(function () {
                if (chrome.runtime.reload == null) {
                    return;
                }
                if (appIsRunning()) {
                    return closeWhenAppCloses();
                } else {
                    return window.close();
                }
            });
        }
    }).call(this);

}());