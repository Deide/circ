import {getFieldOrNull} from "../utils/utils";
import CompletionFinder from "./completion_finder";
import iter from "lazy.js";

/**
 * Simple storage class for completions which stores the completion text
 *  and type of completion.
 */
class Completion {
    /**
     * @param  {string} text
     * @param  {number} type
     */
    constructor(text, type) {
        this._text = text;
        this._type = type;
        if (this._type === Completion.CMD) {
            this._text = "/" + this._text;
        }
    }
    getText() {
        return this._text;
    }

    getType() {
        return this._type;
    }

    getSuffix(preCompletionLength) {
        if (this._type === Completion.NICK && preCompletionLength === 0) {
            return Completion.COMPLETION_SUFFIX + " ";
        }
        return " ";
    }

    toString() {
        return this.getText();
    }
}
/**
 * Completions can either be commands or nicks.
 */
Completion.CMD = 0;
Completion.NICK = 1;
Completion.COMPLETION_SUFFIX = ":";


/**
 * Takes a string and replaces a word with its completion based on the cursor position.
 * Currently only supports completion of nicks in the current window.
 */
export default class AutoComplete {
    constructor() {
        this._getPossibleCompletions = this._getPossibleCompletions.bind(this);
        this._completionFinder = new CompletionFinder;
    }
    /**
     * Set the context from which the list of nicks can be generated.
     * @param {{currentWindow: {target: string, conn: Object}}} context
     */
    setContext(context) {
        this._context = context;
        return this._completionFinder.setCompletionGenerator(this._getPossibleCompletions);
    }

    /**
     * Returns a list of possible auto-completions in the current channel.
     * @return {Array.<Completion>}
     */
    _getPossibleCompletions() {
        return this._getCommandCompletions().concat(this._getNickCompletions());
    }

    /**
     * Returns a sorted list of visible commands.
     * @return {Array<Completion>}
     */
    _getCommandCompletions() {
        return iter(this._context.userCommands.getCommands())
            .values()
            .filter(command => command.category !== "hidden")
            .sort()
            .map(command => new Completion(command, Completion.CMD));
    }

    /**
     * Returns a list of nicks in the current channel.
     * @return {Array<Completion>}
     */
    _getNickCompletions() {
        var irc = this._context.currentWindow.conn.irc,
            chan = this._context.currentWindow.target,
            nicks = getFieldOrNull(irc, ["channels", chan, "names"]);
        if (nicks != null) {
            return iter(nicks)
                .values()
                .map(nick => new Completion(nick, Completion.NICK));
        }
        return [];
    }

    /**
     * Returns the passed in text, with the current stub replaced with its
     *  completion.
     * @param {string} text The text the user has input.
     * @param {number} cursor The current position of the cursor.
     */
    getTextWithCompletion(text, cursor) {
        let completion, textWithCompletion;
        this._text = text;
        this._cursor = cursor;
        if (this._previousText !== this._text)
            this._completionFinder.reset();

        this._previousCursor = this._cursor;
        if (!this._completionFinder.hasStarted)
            this._extractStub();

        completion = this._getCompletion();
        textWithCompletion = this._preCompletion + completion + this._postCompletion;
        this._updatedCursorPosition = this._preCompletion.length + completion.length;
        this._previousText = textWithCompletion;
        return textWithCompletion;
    }

    getUpdatedCursorPosition() {
        return this._updatedCursorPosition || 0;
    }

    /**
     * Returns the completion for the current stub with the completion suffix and
     *  or space after.
     */
    _getCompletion() {
        const completion = this._completionFinder.getCompletion(this._stub);
        if (completion === CompletionFinder.NONE)
            return this._stub;

        return completion.getText() + completion.getSuffix(this._preCompletion.length);
    }

    /**
     * Finds the stub by looking at the cursor position, then finds the text before
     *  and after the stub.
     */
    _extractStub() {
        var preStubEnd,
            stubEnd = this._findNearest(this._cursor - 1, /\S/);
        if (stubEnd < 0)
            stubEnd = 0;

        preStubEnd = this._findNearest(stubEnd, /\s/);
        this._preCompletion = this._text.slice(0, preStubEnd + 1);
        this._stub = this._text.slice(preStubEnd + 1, +stubEnd + 1 || 9e9);
        return this._postCompletion = this._text.slice(stubEnd + 1);
    }

    /**
     * Searches backwards until the regex matches the current character.
     * @return {number} The position of the matched character or -1 if not found.
     */
    _findNearest(start, regex) {
        var i, _i;
        for (i = _i = start; start <= 0 ? _i <= 0 : _i >= 0; i = start <= 0 ? ++_i : --_i) {
            if (regex.test(this._text[i])) {
                return i;
            }
        }
        return -1;
    }
}

AutoComplete.COMPLETION_SUFFIX = ":";
