import iter from "lazy.js";
/**
 * Finds completions for a partial word.
 * Completion candidates can be set using setCompletions() or by specifying a
 *  completion generator function.
 */
export default class CompletionFinder {
    /**
     * Create a new completion finder and optionally set a callback that can be
     *  used to retrieve completion candidates.
     * @param {function:string[]} opt_getCompletionsCallback
     */
    constructor(opt_getCompletionsCallback) {
        this._emptyCompletions = () => iter([]);
        this._completions = this._emptyCompletions();
        this._getCompletions = opt_getCompletionsCallback;
        this.reset();
    }
    /**
     * Set a callback that can be used to retrieve completion candidates.
     * @param {function:string[]} completionGenerator
     */
    setCompletionGenerator(completionGenerator) {
        return this._getCompletions = completionGenerator;
    }
    /**
     * Clear stored completion candidates.
     */
    clearCompletions() {
        return this._completions = this._emptyCompletions();
    }
    /**
     * Add completion candidates.
     * @param {string[]} completions
     */
    addCompletions(completions) {
        return this._completions = this._completions.concat(completions);
    }

    setCompletions(completions) {
        this.clearCompletions();
        return this.addCompletions(completions);
    }
    /**
     * Get a completion for the current stub.
     * The stub only needs to be passed in the first time getCompletion() is
     *  called or after reset() is called.
     * @param {string} opt_stub The partial word to auto-complete.
     */
    getCompletion(opt_stub) {
        if (!this.hasStarted) {
            this._generateCompletions();
            this._currentStub = opt_stub;
            this._findCompletions();
            this.hasStarted = true;
        }
        return this._getNextCompletion();
    }
    /**
     * Add completions from the completion generator, if set.
     */
    _generateCompletions() {
        if (this._getCompletions != null) {
            return this.setCompletions(this._getCompletions());
        }
    }
    /**
     * Create a list of all possible completions for the current stub.
     */
    _findCompletions() {
        var ignoreCase = !/[A-Z]/.test(this._currentStub);

        return this._currentCompletions = this._completions
            .filter(completion => {
                const text = ignoreCase ? completion.toString().toLowerCase() : completion.toString();
                return text.indexOf(this._currentStub) === 0;
            });
    }
    /**
     * Get the next completion, or NONE if no completions are found.
     * Completions are returned by iterating through the list of possible
     *  completions.
     * @returns {string|NONE}
     */
    _getNextCompletion() {
        if (this._currentCompletions.isEmpty())
            return CompletionFinder.NONE;

        const result = this._currentCompletions.get(this._completionIndex);
        this._completionIndex++;
        if (this._completionIndex >= this._currentCompletions.size())
            this._completionIndex = 0;

        return result;
    }
    /**
     * Reset the current stub and clear the list of possible completions.
     * The current stub will be set again the next time getCompletion() is called.
     */
    reset() {
        this._currentCompletions = null;
        this._completionIndex = 0;
        this.currentStub = "";
        return this.hasStarted = false;
    }
}

/**
 * Returned when no completion was found.
 */
CompletionFinder.NONE = void 0;
