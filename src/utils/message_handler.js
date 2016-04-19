import {assert, getLogger} from "./utils";
import iter from "lazy.js";

/**
 * Generic message handling class.
 */
export default class MessageHandler {
    constructor() {
        this._handlers = this._handlers || {};
        this._log = getLogger(this);
        this._mergedHandlers = [];
    }

    listenTo(emitter) {
        return iter(this._handlers)
            .values()
            .each(type => emitter.on(type, (...args) => this.handle(type, ...args)));
    }

    merge(handlerObject) {
        return this._mergedHandlers.push(handlerObject);
    }

    registerHandlers(handlers) {
        return iter(handlers)
            .pairs()
            .each(([type, handler]) => this.registerHandler(type, handler));
    }

    registerHandler(type, handler) {
        return this._handlers[type] = handler;
    }

    handle(type, ...params) {
        var handler = this._handlers[type];
        this.type = type,
        this.params = params;

        assert(this.canHandle(type));

        if (handler != null) handler.apply(this, this.params);

        return iter(this._mergedHandlers)
            .filter(handler => handler.canHandle(type))
            .each(handler => handler.handle.apply(this, [type, ...params]));
    }

    canHandle(type) {
        if (type in this._handlers) return true;
        return this._mergedHandlers.some(handler => handler.canHandle(type));
    }
}
