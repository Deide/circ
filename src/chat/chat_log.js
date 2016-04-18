import Context from "./context";

/**
 * Keeps a running chat log.
 */
export default class ChatLog {
    constructor() {
        this.add = this.add.bind(this);
        this._entries = {};
        this._whitelist = [];
    }

    /**
     * Returns a raw representation of the chat log which can be later serialized.
     */
    getData() {
        return this._entries;
    }

    /**
     * Load chat history from another chat log's data.
     * @param {Object.<Context, string>} serializedChatLog
     */
    loadData(serializedChatLog) {
        return this._entries = serializedChatLog;
    }

    whitelist(...args) {
        return this._whitelist = this._whitelist.concat(args);
    }

    add(context, types, content) {
        var entryList, _base, _ref1;
        if (!this._hasValidType(types.split(" "))) {
            return;
        }
        entryList = (_ref1 = (_base = this._entries)[context]) != null ? _ref1 : _base[context] = [];
        entryList.push(content);
        if (entryList.length > ChatLog.MAX_ENTRIES_PER_SERVER) {
            return entryList.splice(0, 25);
        }
    }

    _hasValidType(types) {
        return types.some(type => this._whitelist.indexOf(type) >= 0);
    }

    getContextList() {
        return Object.keys(this._entries)
            .map(context => Context.fromString(context));
    }

    get(context) {
        var _ref1;
        return (_ref1 = this._entries[context]) != null ? _ref1.join(" ") : void 0;
    }
}

ChatLog.MAX_ENTRIES_PER_SERVER = 1000;