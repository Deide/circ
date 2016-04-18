/**
 * A notification used when the user's nick is mentioned.
 * Provides functions for determining if a nick was mentioned.
 */
export default class NickMentionedNotification {
    /**
     * Creates a notification that's used when the user's nick is mensioned.
     * Provides functions for determining if a nick was mentioned.
     * @param  {any} channel
     * @param  {any} from
     * @param  {any} message
     */
    constructor(channel, from, message) {
        this._channel = channel;
        this._from = from;
        this._message = message;
    }
    getBody() {
        return this._message;
    }

    getTitle() {
        return `${this._from} mentioned you in ${this._channel}`;
    }

    /**
     * When there are multiple notifications, a list of stubs is displayed from
     *  each notification
     */
    getStub() {
        return `${this._from} mentioned you`;
    }
    /**
     * @param  {string} nick
     * @param  {string} msg
     */
    static shouldNotify(nick, msg) {
        var msgToTest;
        if (nick == null) return false;
        nick = this._escapeTextForRegex(nick.replace(/_+$/, ""));
        msgToTest = this._prepMessageForRegex(msg, nick);
        return /\#nick\#_*([!?.]*|[-:;~\*\u0001]?)(?!\S)/i.test(msgToTest);
    }
    /**
     * @param  {string} text
     */
    static _escapeTextForRegex(text) {
        return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    /**
     * @param  {string} msg
     * @param  {string} nick
     */
    static _prepMessageForRegex(msg, nick) {
        msg = msg.replace(/,/g, " ");
        msg = msg.replace(/\#nick\#/gi, "a");
        msg = msg.replace(new RegExp("@\?" + nick, "ig"), "#nick#");
        // simulate a negative lookbehind to make sure only whitespace precedes the nick
        return msg.replace(/\S\#nick\#/i, "a");
    }
}
