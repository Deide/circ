/**
 * This class provides convenience functions for scripts which make talking to
 *  the IRC client easier.
 */
export default {
    /**
     * Set the name of the script. This is the name displayed in /scripts and used with /uninstall.
     * @param {string} name
     */
    setName(name) {
        return this.send("meta", "name", name);
    },
    /**
     * @param  {string} description
     */
    setDescription() {
        /**
         * TODO
         */
    },
    /**
     * Retrieve the script's saved information, if any, from sync storage.
     */
    loadFromStorage() {
        return this.send({}, "storage", "load");
    },
    /**
     * Save the script's information to sync storage.
     * @param {Object} item The item to save to storage.
     */
    saveToStorage(item) {
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
    send(opt_context, type, name, ...args) {
        var context;
        if (typeof opt_context === "string") {
            args = [name, ...args];
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
    sendEvent(event) {
        return window.parent.postMessage(event, "*");
    },
    propagate(event, propagation) {
        if (propagation == null) {
            propagation = "all";
        }
        return this.send(event.context, "propagate", propagation, event.id);
    }
};
