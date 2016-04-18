import AbstractTCPSocket from "./abstract_tcp_socket.js";

/**
 * A fake socket used when using another device's IRC connection.
 */
export default class RemoteSocket extends AbstractTCPSocket {
    constructor(...args) {
        super(...args);
    }
    setTimeout() {}
    _active() {}
}
