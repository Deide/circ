/*eslint no-console: 0*/
import ChromeSocket from "./chrome_socket";

export default class SslSocket extends ChromeSocket {
    constructor() {
        super();
    }

    _onConnect(rc) {
        try {
            this.secure(status => {
                if (status < 0) {
                    this.emit("error", `Socket #${this.socketId} failed to upgrade to a secure connection with code ${rc}`);
                    this.close();
                }
                else {
                    super._onConnect(rc);
                    console.info("Successfully secured the connection");
                }
            });
        } catch (e) {
            this.emit("error", `Socket #${this.socketId} failed to upgrade to a secure connection with code ${rc}`);
            console.error(e.stack);
        }
    }

    secure(callback) {
        if (!this.socketId) {
            this.emit("error", `Socket #${this.socketId} is not created. Failed to upgrade.`);
            callback(-1);
            return;
        }
        chrome.sockets.tcp.secure(this.socketId, callback);
    }
}