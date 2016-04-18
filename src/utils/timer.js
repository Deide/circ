/**
 * Utility class for determining the time between events.
 */
export default class Timer {
    /**
     * Mark the start time of an event.
     * @param {string} name The name of the event.
     */
    start(name) {
        return this._events[name] = {
            startTime: this._getCurrentTime()
        };
    }

    /**
     * Destroy the event and return the elapsed time.
     * @param {string} name The name of the event.
     */
    finish(name) {
        var time = this.elapsed(name);
        delete this._events[name];
        return time;
    }

    /**
     * Returns the elapsed time..
     * @param {string} name The name of the event.
     */
    elapsed(name) {
        if (!this._events[name]) {
            return 0;
        }
        return this._getCurrentTime() - this._events[name].startTime;
    }

    _getCurrentTime() {
        return new Date().getTime();
    }
}
/**
 * Maps events to their timing information.
 */
Timer.prototype._events = {};
