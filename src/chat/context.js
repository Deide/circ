export default class Context {
    constructor(server, channel) {
        this.server = server;
        this.channel = channel;
    }
    toString() {
        if (this.channel) {
            return `${this.server} ${this.channel}`;
        } else {
            return this.server;
        }
    }

    fromString(str) {
        return new Context(...str.split(" "));
    }

    wrap(obj) {
        obj.toString = this.prototype.toString;
        return obj;
    }
}
