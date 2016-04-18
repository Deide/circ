/**
 * A traversable stack of all input entered by the user.
 */
export default class InputStack {
    constructor() {
        this._previousInputs = [""];
        this._previousInputIndex = 0;
    }
    /**
     * Keeps track of the unentered input that was present when the user
     * began traversing the stack.
     * @param {string} text
     */
    setCurrentText(text) {
        if (this._previousInputIndex === 0) {
            return this._previousInputs[0] = text;
        }
    }

    showPreviousInput() {
        if (!(this._previousInputIndex >= this._previousInputs.length - 1)) {
            this._previousInputIndex++;
            return this._previousInputs[this._previousInputIndex];
        }
        return void 0;
    }

    showNextInput() {
        if (!(this._previousInputIndex <= 0)) {
            this._previousInputIndex--;
            return this._previousInputs[this._previousInputIndex];
        }
        return void 0;
    }

    /**
     * Restarts the traversal position. Should be called when the user begins
     *  typing a new command.
     */
    reset() {
        return this._previousInputIndex = 0;
    }

    /**
     * Add input to the stack.
     * @param {string} input
     */
    addInput(input) {
        return this._previousInputs.splice(1, 0, input);
    }
}
