import {escape} from "../utils/html";
import iter from "lazy.js";

/**
 * Displays help messages to the user, such as listing the available commands or
 *  keyboard shortcuts.
 */
export default class HelpMessageRenderer {
    /**
     * @param {function(opt_message, opt_style)} postMessage
     */
    constructor(postMessage) {
        this._postMessage = postMessage;
        this._commands = {};
    }
    /**
     * Displays a help message for the given commands, grouped by category.
     * @param {Object.<string: {category: string}>} commands
     */
    render(commands) {
        this._commands = commands;
        this._postMessage();
        this._printCommands();
        this._postMessage(escape("Type '/help <command>' to see details about a specific command."), "notice help");
        return this._postMessage("Type '/hotkeys' to see the list of keyboard shortcuts.", "notice help");
    }

    _printCommands() {
        return this._groupCommandsByCategory().map(group => {
            this._postMessage(`${this._getCommandGroupName(group.category)} Commands:`, HelpMessageRenderer.COMMAND_STYLE);
            this._postMessage();
            this._printCommandGroup(group.commands.sort());
            return this._postMessage();
        });
    }

    /**
     * @return {number} Returns the number of characters in the longest command.
     */
    _getMaxCommandLength() {
        return Object.keys(this._commands)
            .reduce((max, command) => command.length > max ? command.length : max, 0);
    }

    /**
     * Returns a map of categories mapped to command names.
     * @return {Array.<{string: Array.<string>}>}
     */
    _groupCommandsByCategory() {
        let categories = iter(this._commands)
            .pairs()
            .reduce((categories, [name, command]) => {
                if (command.category === "hidden") return categories;
                let category = command.category || "misc";
                if (categories[category] == null) categories[category] = [];
                categories[category].push(name);
                return categories;
            }, {});

        return this._orderGroups(categories);
    }

    /**
     * Given a map of categories to commands, order the categories in the order
     *  we'd like to display to the user.
     * @param {{category: string[]}} categoryToCommands
     * @return {{category: string, commands: string[]}[]}
     */
    _orderGroups(categoryToCommands) {
        return HelpMessageRenderer.CATEGORY_ORDER
            .map(category => ({category, commands: categoryToCommands[category]}));
    }

    /**
     * Given a category, return the name to display to the user.
     * @param {string} category
     * @return {string}
     */
    _getCommandGroupName(category) {
        switch (category) {
        case "common":
            return "Basic IRC";
        case "uncommon":
            return "Other IRC";
        case "one_identity":
            return "One Identity";
        case "scripts":
            return "Script";
        default:
            return "Misc";
        }
    }

    /**
     * Print an array of commands.
     * @param {string[]} commands
     */
    _printCommandGroup(commands) {
        let line = commands
            .map(command => `<span class="help-command">${command}</span>`)
            .join("");
        this._postMessage(line, HelpMessageRenderer.COMMAND_STYLE);
    }

    /**
     * Display a help message detailing the available hotkeys.
     * @param {{description: string, group: string, readableName: string}} hotkeys
     */
    renderHotkeys(hotkeys) {
        var groupsVisited, hotkeyInfo, id, name, _results;
        this._postMessage();
        this._postMessage("Keyboard Shortcuts:", "notice help");
        this._postMessage();
        groupsVisited = {};
        _results = [];
        for (id in hotkeys) {
            hotkeyInfo = hotkeys[id];
            if (hotkeyInfo.group) {
                if (hotkeyInfo.group in groupsVisited) {
                    continue;
                }
                groupsVisited[hotkeyInfo.group] = true;
                name = hotkeyInfo.group;
            } else {
                name = hotkeyInfo.readableName;
            }
            _results.push(this._postMessage(`  ${name}: ${hotkeyInfo.description}`, "notice help"));
        }
        return _results;
    }
}
/**
 * The total width of the help message, in number of characters (excluding
 *  spaces)
 */
HelpMessageRenderer.TOTAL_WIDTH = 50;
/**
 * The order that command categories are displayed to the user.
 */
HelpMessageRenderer.CATEGORY_ORDER = ["common", "uncommon", "one_identity", "scripts", "misc"];
HelpMessageRenderer.COMMAND_STYLE = "notice help group";
