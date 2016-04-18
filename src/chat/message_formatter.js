import {capitalizeString} from "../utils/utils";
import {nicksEqual} from "../irc/irc_util";

/**
 * Handles formatting and styling text to be displayed to the user.
 *
 * ###Formatting follows these ruels:
 * - all messages start with a capital letter
 * - messages from the user or to the user have the 'self' style
 * - messages from the user are surrounded by parentheses
 * - the user's nick is replaced by 'you'
 * - 'you is' is replaced by 'you are'
 * - messages not from the user end in a period
 */
export default class MessageFormatter {
    constructor() {
        this._customStyle = [];
        this._nick = void 0;
        this.clear();
    }
    /**
     * Sets the user's nick name, which is used to determine if the message is from
     *  or to the user. This field is not reset when clear() is called.
     * @param {string} nick The user's nick name.
     */
    setNick(nick) {
        return this._nick = nick;
    }
    /**
     * Sets custom style to be used for all formatted messages. This field is not
     *  reset when clear() is called.
     * @param {string[]} customStyle The style to be set
     */
    setCustomStyle(customStyle) {
        return this._customStyle = customStyle;
    }
    /**
     * Clears the state of the message formatter. Used between formatting different
     *  messages.
     */
    clear() {
        this._style = [];
        this._fromUs = this._toUs = false;
        this._forcePrettyFormat = void 0;
        return this._message = "";
    }
    /**
     * Sets the message to be formatted.
     * The following can be used as special literals in the message:
     * - '#from' gets replaced by the the nick the message is from.
     * - '#to' gets replaced by the nick the message pertains to.
     * - '#content' gets replaced by content the message is about.
     * @param {string} message
     */
    setMessage(message) {
        return this._message = message;
    }
    /**
     * Returns true if the formatter has a message to format.
     * @return {boolean}
     */
    hasMessage() {
        return !!this._message;
    }
    /**
     * Set the context of the message.
     * @param {string=} opt_from The nick the message is from.
     * @param {string=} opt_to The nick the message pertains to.
     * @param {string=} opt_content The context of the message.
     */
    setContext(opt_from, opt_to, opt_content) {
        this._from = opt_from;
        this._to = opt_to;
        this._content = opt_content;
        this._fromUs = this._isOwnNick(this._from);
        return this._toUs = this._isOwnNick(this._to);
    }
    /**
     * Set the content of the message.
     * @param {string} content
     */
    setContent(content) {
        return this._content = content;
    }
    /**
     * Sets the content to the given string and the message to be that content.
     * @param {string} content
     */
    setContentMessage(content) {
        this.setContext(void 0, void 0, content);
        this.setContent(content);
        return this.setMessage("#content");
    }
    /**
     * Set whether the message is from the user or not.
     * By default the message is assumed from the user if their nick matches the
     * from field.
     * This is useful for the /nick message, when the user's nick has just changed.
     * @param {boolean} formUs True if the message is from the user
     */
    setFromUs(fromUs) {
        return this._fromUs = fromUs;
    }
    /**
     * Set whether the message pertains to the user or not.
     * By default the message is assumed to pertain to the user if their nick
     *  matches the to field.
     * This is useful for the /nick message, when the user's nick has just changed.
     * @param {boolean} toUs True if the message is to the user
     */
    setToUs(toUs) {
        return this._toUs = toUs;
    }
    /**
     * Sets whether or not pretty formatting should be used.
     * Pretty formatting includes capitalization and adding a period or adding
     * perentheses.
     */
    setPrettyFormat(usePrettyFormat) {
        return this._forcePrettyFormat = usePrettyFormat;
    }

    _usePrettyFormat() {
        var _ref1;
        return (_ref1 = this._forcePrettyFormat) != null ? _ref1 : !this.hasStyle("no-pretty-format");
    }
    /**
     * Returns a message formatted based on the given context.
     * @return {string} Returns the formatted message.
     */
    format() {
        var msg;
        if (!this._message) {
            return "";
        }
        msg = this._incorporateContext();
        if (this._usePrettyFormat()) {
            msg = this._prettyFormat(msg);
        }
        return msg;
    }
    /**
     * Replaces context placeholders, such as '#to', with their corresponding
     *  value.
     * @return {string} Returns the formatted message.
     */
    _incorporateContext() {
        var msg;
        msg = this._message;
        msg = this._fixGrammer("#from", msg);
        msg = msg.replace("#from", this._fromUs ? "you" : this._escapeDollarSign(this._from));
        msg = msg.replace("#to", this._toUs ? "you" : this._escapeDollarSign(this._to));
        return msg.replace("#content", this._escapeDollarSign(this._content));
    }
    /**
     * Escapes dollar signs in text so that they are not interpreted when doing
     * string replacements.
     * @return {string} Returns the escaped string
     */
    _escapeDollarSign(text) {
        if (text) {
            return text.replace("$", "$$$$");
        } else {
            return text;
        }
    }
    /**
     * Handles adding periods, perentheses and capitalization.
     * @return {string} Returns the formatted message.
     */
    _prettyFormat(msg) {
        if (!this._startsWithNick(msg)) {
            msg = capitalizeString(msg);
        }
        if (this._fromUs) {
            msg = `(${msg})`;
        } else if (/[a-zA-Z0-9]$/.test(msg)) {
            msg = `${msg}.`;
        }
        return msg;
    }

    _fixGrammer(you, msg) {
        var youPlaceholders;
        youPlaceholders = [];
        if (this._fromUs) {
            youPlaceholders.push("#from");
        }
        if (this._toUs) {
            youPlaceholders.push("#to");
        }

        return youPlaceholders.reduce((msg, you) => {
            return msg.replace(`${you} is`, `${you} are`)
                .replace(`${you} has`, `${you} have`);
        }, msg);
    }
    /**
     * Returns true if the given message starts with the nick the message pertains
     * to or the nick the message is being sent from.
     */
    _startsWithNick(msg) {
        var startsWithFromNick, startsWithToNick;
        startsWithToNick = msg.indexOf(this._to) === 0 && !this._toUs;
        startsWithFromNick = msg.indexOf(this._from) === 0 && !this._fromUs;
        return startsWithToNick || startsWithFromNick;
    }
    /**
     * Clears the current style and adds the given style.
     * @param {string} style
     */
    setStyle(style) {
        return this._style = [style];
    }
    /**
     * Adds the given style.
     * @param {string[]} style
     */
    addStyle(style) {
        if (!Array.isArray(style)) {
            style = [style];
        }
        return this._style = this._style.concat(style);
    }

    hasStyle(style) {
        return this._customStyle.indexOf(style) >= 0 || this._style.indexOf(style) >= 0;
    }
    /**
     * Returns the style of the message.
     * @param {string} style The combination of the added styles and custom styles.
     * @return {string} A space delimited string of styles to apply to the message.
     */
    getStyle() {
        var style = this._customStyle.concat(this._style);
        if (this._fromUs || this._toUs) {
            style.push("self");
        }
        return style.join(" ");
    }

    /**
     * Returns true if the user's nick equals the given nick.
     * @param nick The nick the check against
     * @return {boolean}
     */
    _isOwnNick(nick) {
        return nicksEqual(this._nick, nick);
    }
}
