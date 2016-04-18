import {getLogger} from "./utils";

/**
 * Manages the sending and receiving of events.
 */
export default class EventEmitter {
    constructor() {
        this._log = getLogger(this);
        this._listeners = {};
        this._anyEventListeners = [];
    }
    /**
     * Registers a callback to be invoked upon any event emission
     * @param  {function} callback
     */
    onAny(callback) {
        return this._anyEventListeners.push(callback);
    }
    /**
     * Registers a callback to be invoked upon a specific event emission
     * @param  {string} ev
     * @param  {function} callback
     */
    on(ev, callback) {
        var base, ref;
        return ((ref = (base = this._listeners)[ev]) != null ? ref : base[ev] = []).push(callback);
    }
    /**
     * Calls listeners for the supplied event, plus all "any" listeners
     * @param  {string} ev
     * @param  {any} ...data
     * @return {Array} Results of "any" listeners
     */
    emit(ev, ...data) {
        var anyListenersArray = this._anyEventListeners,
            listenersArray = this._listeners[ev] || [];

        listenersArray.forEach(listener => listener.apply(null, data));
        return anyListenersArray.map(listener => listener.apply(null, [ev, ...data]));
    }
    /**
     * Registers a callback to be invoked only once upon a specific event emission
     * @param  {string} ev
     * @param  {function} callback
     */
    once(ev, callback) {
        var f = (...args) => {
            this.removeListener(ev, f);
            return callback.apply(null, ...args);
        };
        this.on(ev, f);
        return f.listener = callback;
    }
    /**
     * Removes a specific supplied callback from a list of event listeners
     * @param  {string} ev
     * @param  {function} callbackToRemove
     * @return {Array} listeners
     */
    removeListener(ev, callbackToRemove) {
        if (!(this._listeners && this._listeners[ev] && (callbackToRemove != null))) {
            return;
        }

        this._listeners[ev] = this._listeners[ev].filter(listener => listener !== callbackToRemove);

        return this._listeners[ev];
    }
}
