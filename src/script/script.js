import iter from "lazy.js";

export default class Script {
    constructor(sourceCode, frame) {
        this.sourceCode = sourceCode;
        this.frame = frame;
        this.id = Script.getUniqueID();
        this._messagesToHandle = [];
        this._name = `script${this.id + 1}`;
    }
    postMessage(msg) {
        return this.frame.postMessage(msg, "*");
    }

    shouldHandle(event) {
        return this._messagesToHandle.indexOf(event.hook) >= 0;
    }

    /**
     * Begin handling events of the given type and name.
     * @param {string} type The event type (command, message or server)
     * @param {string} name The name of the event (e.g. kick, NICK, privmsg, etc)
     */
    beginHandlingType(type, name) {
        return this._messagesToHandle.push(`${type} ${name}`);
    }

    setName(_name) {
        this._name = _name;
    }

    getName() {
        return this._name;
    }
}

Script.getScriptFromFrame = function (scripts, frame) {
    return iter(scripts)
        .values()
        .find(script => script.frame === frame);
};

Script.scriptCount = 0;

Script.getUniqueID = function () {
    return this.scriptCount++;
};
