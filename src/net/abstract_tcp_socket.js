import EventEmitter from "../utils/event_emitter";

/**
 * Abstract TCP socket.
 * ####Events emitted:
 * - 'connect': the connection succeeded, proceed.
 * - 'data': data received. Argument is the data (array of longs, atm)
 * - 'end': the other end sent a FIN packet, and won't accept any more data.
 * - 'error': an error occurred. The socket is pretty much hosed now.
 * - 'close': emitted when the socket is fully closed.
 * - 'drain': emitted when the write buffer becomes empty
 * ####TODO:
 * Investigate how node deals with errors. The docs say 'close' gets sent right
 * after 'error', so they probably destroy the socket.)
 */
export default class AbstractTCPSocket extends EventEmitter {
    constructor(...args) {
        super(...args);
    }
    /**
     * @param  {any} port
     * @param  {any} host
     */
    connect() {}
    /**
     * @param  {any} data
     */
    write() {}

    close() {}

    setTimeout(ms, callback) {
        if (ms > 0) {
            this.timeout = setTimeout(() => this.emit("timeout"), ms);
            this.timeout_ms = ms;
            if (callback) return this.once("timeout", callback);
        }
        else if (ms === 0) {
            clearTimeout(this.timeout);
            if (callback) {
                this.removeListener("timeout", callback);
            }
            this.timeout = null;
            return this.timeout_ms = 0;
        }
    }

    _active() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            return this.timeout = setTimeout(() => this.emit("timeout"), this.timeout_ms);
        }
    }
}
