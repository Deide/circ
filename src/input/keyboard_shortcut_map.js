
import keyCodes from "./keycodes";

/**
 * Maps keyboard shortcuts to commands and their arguments.
 */
export default class KeyboardShortcutMap {
    constructor() {
        this._hotkeyMap = {};
        this._mapHotkeys();
    }
    /**
     * Returns the mapping of hotkeys to commands.
     * @param {Object.<string: {description: string, group: string,
     *     readableName: string, command: string, args: Array<Object>}>} hotkeys
     */
    getMap() {
        return this._hotkeyMap;
    }

    /**
     * Get the command for the given shortcut if it is valid.
     * @param {KeyboardEvent} shortcut
     * @param {boolean} hasInput True if the input DOM element has text.
     * @return {[string, Array.<Object>]} Returns the name of the command with its
     *     arguments
     */
    getMappedCommand(shortcut, hasInput) {
        var args, command, keyCombination;
        if (!this._isValidShortcut(shortcut, hasInput)) {
            return [];
        }
        keyCombination = KeyboardShortcutMap.getKeyCombination(shortcut);
        if (!this._isMapped(keyCombination)) {
            return [];
        }
        command = this._hotkeyMap[keyCombination].command;
        args = this._hotkeyMap[keyCombination].args;
        return [command, args];
    }

    /**
     * Returns true if the given keyboard input event is a valid keyboard shortcut.
     * @param {KeyboardEvent} shortcut
     * @param {boolean} hasInput True if the input DOM element has text.
     * @return {boolean}
     */
    _isValidShortcut(keyEvent, hasInput) {
        var key = keyEvent.which;
        if (keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey) {
            return true;
        }
        else if (KeyboardShortcutMap.NO_MODIFIER_HOTKEYS.indexOf(key) >= 0) {
            return true;
        }
        else {
            return !hasInput && (KeyboardShortcutMap.NO_INPUT_HOTKEYS.indexOf(key) >= 0);
        }
    }

    /**
     * Returns true if the given shortcut has a command mapped to it.
     * @param {string} shortcutName
     * @return {boolean}
     */
    _isMapped(keyCombination) {
        return keyCombination in this._hotkeyMap;
    }

    /**
     * Maps hotkeys to commands and their arguments.
     * Note: The modifier key order is important and must be consistant with
     *  getKeyCombination().
     * * command: What command the hotkey maps to.
     * * group: What group of hotkeys the hotkey belongs to.
     * * description: A quick description of the command. The command name is used by default.
     * * args: What args should be passed in to the command.
     */
    _mapHotkeys() {
        for (let windowNumber = 1; windowNumber <= 9; windowNumber += 1) {
            this._addHotkey(`Ctrl-${windowNumber}`, {
                command: "win",
                group: "Ctrl-#",
                description: "switch channels",
                args: [windowNumber]
            });
        }
        var nextRoomArray = [
            "Alt-DOWN",
            "Ctrl-TAB",
            "Alt-PAGEDOWN"
        ];
        var previousRoomArray = [
            "Alt-UP",
            "Ctrl-Shift-TAB",
            "Alt-PAGEUP"
        ];

        nextRoomArray.forEach(keys => this._addHotkey(keys, {command: "next-room"}));
        previousRoomArray.forEach(keys => this._addHotkey(keys, {command: "previous-room"}));
        this._addHotkey("Ctrl-W", {
            command: "part",
            description: "close current channel/private chat"
        });
        this._addHotkey("Alt-S", {
            command: "next-server"
        });
        return this._addHotkey("TAB", {
            command: "reply",
            description: "autocomplete or reply to last mention"
        });
    }

    /**
     * TODO: Implement the following commands:
     *
     *    @_addHotkey 'PAGEUP',
     *      command: 'pageup'
     *
     *    @_addHotkey 'PAGEDOWN',
     *      command: 'pageup'
     *
     *   @_addHotkey 'Ctrl-F',
     *     command: 'search'
     *
     *   @_addHotkey 'Ctrl-HOME',
     *     command: 'scroll-to-top'
     *
     *   @_addHotkey 'Ctrl-END',
     *     command: 'scroll-to-bottom'
     */
    _addHotkey(keyCombination, description) {
        var hotkeyCode = this._getHotkeyCode(keyCombination);
        if (description.args == null) description.args = [];
        this._hotkeyMap[hotkeyCode] = description;
        this._hotkeyMap[hotkeyCode].readableName = keyCombination;
        if (description.description) {
            return this._hotkeyMap[hotkeyCode].description = description.description;
        } else {
            return this._hotkeyMap[hotkeyCode].description = description.command.replace(/-/g, " ");
        }
    }

    /**
     * Convert a readable key combination into its key code value.
     * (e.g. 'Alt-S' becomes 'Alt-115').
     */
    _getHotkeyCode(keyCombination) {
        var char, parts;
        parts = keyCombination.split("-");
        char = parts[parts.length - 1];
        parts[parts.length - 1] = keyCodes.toKeyCode(char);
        return parts.join("-");
    }
}
/**
 * Returns the stringified name for the given keyboard shortcut.
 * @param {KeyboardEvent} e
 */
KeyboardShortcutMap.getKeyCombination = function getKeyCombination(e) {
    var name = [];
    if (e.ctrlKey) {
        name.push("Ctrl");
    }
    if (e.metaKey) {
        name.push("Meta");
    }
    if (e.altKey) {
        name.push("Alt");
    }
    if (e.shiftKey) {
        name.push("Shift");
    }
    name.push(e.which);
    return name.join("-");
};
/**
* These keys can be mapped to hotkeys without needing a modifier key to be down.
*/
KeyboardShortcutMap.NO_MODIFIER_HOTKEYS = keyCodes.toKeyCode("PAGEUP", "PAGEDOWN", "CAPSLOCK", "INSERT", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12");

/**
 * These keys can be mapped to hotkeys without needing a modifier key to be
 * down, but only if there is no input entered.
 */
KeyboardShortcutMap.NO_INPUT_HOTKEYS = [keyCodes.toKeyCode("TAB")];
