import EventEmitter from "../utils/event_emitter";
import InputStack from "./input_stack";
import AutoComplete from "./auto_complete";
import keyCodes from "./keycodes";
import Event from "../utils/event";

/**
 * Manages keyboard and hotkey input from the user, including autocomplete and
 * traversing through previous commands.
 */
export default class UserInputHander extends EventEmitter {
    /**
     * Initialise the User Input
     * @param  {jQueryElement} input
     * @param  {jQueryWindow} window
     */
    constructor(input, window) {
        super();
        this.input = input;
        this.window = window;
        // Binding Event Handlers and methods to the instance
        this._sendUserCommand = this._sendUserCommand.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleGlobalKeydown = this._handleGlobalKeydown.bind(this);

        this.input.focus();
        this._inputStack = new InputStack;
        this._autoComplete = new AutoComplete;
        this.input.keydown(this._handleKeydown);
        this.window.keydown(this._handleGlobalKeydown);
    }

    setContext(context) {
        this._context = context;
        this._autoComplete.setContext(this._context);
        this._context.on("set_input_if_empty", text => {
            if (!this.input.val()) {
                this.setInput(text);
            }
        });
        this._context.on("set_input", text => this.setInput(text));
        this._context.on("blink_input", () => {
            this.input.css("-webkit-transition", "0");
            this.input.addClass("blink");
            setTimeout(() => {
                this.input.css("-webkit-transition", "300ms");
                this.input.removeClass("blink");
            }, 0);
        });
    }

    setInput(text) {
        this.input.val(text);
        // If setInput was called because of a click, we need to wait for the
        // click to propagate before setting focus.
        setTimeout(() => this.input.focus(), 0);
    }

    setKeyboardShortcuts(keyboardShortcuts) {
        return this._keyboardShortcutMap = keyboardShortcuts;
    }

    _handleGlobalKeydown(e) {
        this.text = this.input.val();
        this._focusInputOnKeyPress(e);
        this._handleKeyboardShortcuts(e);
        if (e.isDefaultPrevented()) {
            return false;
        }
        this._showPreviousCommandsOnArrowKeys(e);
        this._autoCompleteOnTab(e);
        return !e.isDefaultPrevented();
    }

    _focusInputOnKeyPress(e) {
        if (!(e.metaKey || e.ctrlKey)) {
            e.currentTarget = this.input[0];
            return this.input.focus();
        }
    }

    _handleKeyboardShortcuts(e) {
        var event,
            [command, args] = this._keyboardShortcutMap.getMappedCommand(e, this.input.val());

        if (!command) {
            return;
        }
        e.preventDefault();
        event = new Event("command", command, ...args);
        return this._emitEventToCurrentWindow(event);
    }

    _showPreviousCommandsOnArrowKeys(e) {
        if (e.which === keyCodes.toKeyCode("UP") || e.which === keyCodes.toKeyCode("DOWN")) {
            let input;
            e.preventDefault();
            if (e.which === keyCodes.toKeyCode("UP")) {
                this._inputStack.setCurrentText(this.text);
                input = this._inputStack.showPreviousInput();
            } else {
                input = this._inputStack.showNextInput();
            }
            if (input != null) {
                return this.input.val(input);
            }
        } else {
            return this._inputStack.reset();
        }
    }

    _autoCompleteOnTab(e) {
        if (e.which === keyCodes.toKeyCode("TAB")) {
            e.preventDefault();
            if (this.text) {
                let textWithCompletion = this._autoComplete.getTextWithCompletion(this.text, this._getCursorPosition());
                this.input.val(textWithCompletion);
                return this._setCursorPosition(this._autoComplete.getUpdatedCursorPosition());
            }
        }
    }

    _setCursorPosition(pos) {
        return this.input[0].setSelectionRange(pos, pos);
    }

    _getCursorPosition() {
        return this.input[0].selectionStart;
    }

    _handleKeydown(e) {
        this.text = this.input.val();
        if (e.which === keyCodes.toKeyCode("ENTER")) {
            if (this.text.length > 0) {
                this.input.val("");
                this._sendUserCommand();
            }
        }
        return true;
    }
    /**
     * Wrap the input in an event and emit it.
     */
    _sendUserCommand() {
        var event, name, words;
        this._inputStack.addInput(this.text);
        words = this.text.split(/\s/);
        if (this.text[0] === "/") {
            name = words[0].slice(1).toLowerCase();
            words = words.slice(1);
        } else {
            name = "say";
        }
        event  = new Event("command", name, ...words);
        return this._emitEventToCurrentWindow(event);
    }

    _emitEventToCurrentWindow(event) {
        event.context = this._context.currentWindow.getContext();
        return this.emit(event.type, event);
    }
}
