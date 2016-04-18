/**
 * A generic event often used in conjuction with emit().
 */
export default class Event {
    constructor(type, name, ...args) {
        this.type = type;
        this.name = name;
        this.args = args;

        /**
         * Info on which window the event took place in.
         */
        this.context = {};
        /**
         * Effects how the event is displayed.
         */
        this.style = [];
        /**
         * Acts as an id for the event.
         */
        this.hook = this.type + " " + this.name;
    }

    setContext(server, channel) {
        return this.context = {
            server: server,
            channel: channel
        };
    }
    /**
     * Adds a custom style for the event that will effect how it's contents are
     *  displayed.
     * @param {Array.<string>} style
     */
    addStyle(style) {
        if (!Array.isArray(style)) {
            style = [style];
        }
        return this.style = this.style.concat(style);
    }
}

/**
 * Creates an Event from an Event-like object. Used for deserialization.
 */
Event.wrap = function(obj) {
    var event;
    if (obj instanceof Event) {
        return obj;
    }
    event = new Event(obj.type, obj.name, ...obj.args);
    event.setContext(obj.context.server, obj.context.channel);
    return event;
};