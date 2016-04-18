(function () {
    'use strict';

    var babelHelpers = {};

    babelHelpers.toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      } else {
        return Array.from(arr);
      }
    };

    babelHelpers;

    /**
     * This class provides convenience functions for scripts which make talking to
     *  the IRC client easier.
     */
    var ENV = {
        /**
         * Set the name of the script. This is the name displayed in /scripts and used with /uninstall.
         * @param {string} name
         */

        setName: function setName(name) {
            return this.send("meta", "name", name);
        },

        /**
         * @param  {string} description
         */
        setDescription: function setDescription() {
            /**
             * TODO
             */
        },

        /**
         * Retrieve the script's saved information, if any, from sync storage.
         */
        loadFromStorage: function loadFromStorage() {
            return this.send({}, "storage", "load");
        },

        /**
         * Save the script's information to sync storage.
         * @param {Object} item The item to save to storage.
         */
        saveToStorage: function saveToStorage(item) {
            return this.send({}, "storage", "save", item);
        },

        /**
         * Send a message to the IRC server or client.
         * @param {{server: string, channel: string}} Specifies which room the event
         *     takes place in. Events like registering to handle a command don't need
         *     a context.
         * @param {string} type The type of event (command, message, server)
         * @param {string} name The sub-type of the event (e.g. the type of command or message)
         * @param {any[]} args A variable number of arguments for the event.
         */
        send: function send(opt_context, type, name) {
            for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                args[_key - 3] = arguments[_key];
            }

            var context;
            if (typeof opt_context === "string") {
                args = [name].concat(babelHelpers.toConsumableArray(args));
                name = type;
                type = opt_context;
                context = {};
            } else {
                context = opt_context;
            }
            return this.sendEvent({
                context: context,
                type: type,
                name: name,
                args: args
            });
        },
        sendEvent: function sendEvent(event) {
            return window.parent.postMessage(event, "*");
        },
        propagate: function propagate(event, propagation) {
            if (propagation == null) {
                propagation = "all";
            }
            return this.send(event.context, "propagate", propagation, event.id);
        }
    };

    var onInitMessage = function initMessageCallback(e) {
        if (!(e.data.type === "source_code" && e.data.sourceCode != null)) {
            return;
        }
        removeEventListener("message", onInitMessage);
        new Function(e.data.sourceCode).call(ENV);
    };

    addEventListener("message", onInitMessage);
    addEventListener("message", function (e) {
        if (typeof ENV.onMessage === "function") {
            return ENV.onMessage(e.data);
        }
    });

    window.parent.postMessage({
        type: "onload"
    }, "*");

}());