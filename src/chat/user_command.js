import {
    getFieldOrNull,
    isOnline,
    getReadableList
} from "../utils/utils";
import {escape} from "../utils/html";
import {nicksEqual} from "../irc/irc_util";
import CTCPHandler from "../irc/ctcp_handler";
import Chat from "./chat";
import Event from "../utils/event";

/**
 * Represents a user command, like /kick or /say.
 */
export default class UserCommand {
    constructor(name, description) {
        this.description = description;
        this.name = name;
        this.describe(this.description);
        this._hasValidArgs = false;
    }
    /**
     * Describe the command using the following format:
     * * description - a description of what the command does; used with /help <command>
     * * category - what category the command falls under. This is used with /help
     * * params - what parameters the command takes, 'opt_<name>' for optional, '<name>...' for variable
     *
     * * validateArgs - returns a truthy variable if the given arguments are valid.
     * * requires - what the command requires to run (e.g. a connections to an IRC server)
     * * usage - manually set a usage message, one will be generated if not specified
     * * run - the function to call when the command is run
     */
    describe(description) {
        var _ref1;
        if (this._description == null) {
            this._description = description.description;
        }
        if (this._params == null) {
            this._params = description.params;
        }
        if (this._requires == null) {
            this._requires = description.requires;
        }
        if (this._validateArgs == null) {
            this._validateArgs = description.validateArgs;
        }
        if (this._usage == null) {
            this._usage = description.usage;
        }
        if (this.run == null) {
            this.run = description.run;
        }
        return (_ref1 = this.category) != null ? _ref1 : this.category = description.category;
    }
    /**
     * Try running the command. A command can fail to run if its requirements
     *  aren't met (e.g. needs a connection to the internet) or the specified
     *  arguments are invalid. In these cases a help message is displayed.
     * @param {Context} context Which server/channel the command came from.
     * @param {Object...} args Arguments for the command.
     */
    tryToRun(context, ...rest) {
        this.setContext(context);
        if (!this.canRun()) {
            if (this.shouldDisplayFailedToRunMessage()) {
                this.displayHelp();
            }
            return;
        }
        this.setArgs(...rest);
        if (this._hasValidArgs) {
            return this.run();
        } else {
            return this.displayHelp();
        }
    }

    setChat(chat) {
        this.chat = chat;
    }

    setContext(context) {
        this.win = this.chat.determineWindow(context);
        if (this.win !== Chat.NO_WINDOW) {
            this.conn = this.win.conn;
            return this.chan = this.win.target;
        }
    }

    setArgs(...args) {
        return this._hasValidArgs = this._tryToAssignArgs(args) && (!this._validateArgs || !!this._validateArgs());
    }

    _tryToAssignArgs(args) {
        var params;
        this.args = [];
        this._removeTrailingWhiteSpace(args);

        if (!this._params) return args.length === 0;

        this._resetParams();
        this._truncateVariableArgs(args);
        params = this._truncateExtraOptionalParams(args.length);

        if (args.length !== params.length) return false;

        params.forEach((param, i) => this[this._getParamName(param)] = args[i]);

        this.args = args;
        return true;
    }

    _resetParams() {
        var param, _i, _len, _ref1, _results;
        _ref1 = this._params;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            param = _ref1[_i];
            _results.push(this[this._getParamName(param)] = void 0);
        }
        return _results;
    }
    /**
     * Remove empty strings from end of the array
     * @param  {string[]} args
     */
    _removeTrailingWhiteSpace(args) {
        while (args[args.length - 1] === "") {
            args.pop();
        }
        return args;
    }

    /**
     * Join all arguments that fit under the variable argument param.
     * Note: only the last argument is allowd to be variable.
     */
    _truncateVariableArgs(args) {
        var _ref1;
        if (args.length < this._params.length) {
            return args;
        }
        if (this._isVariable(this._params[this._params.length - 1])) {
            args[this._params.length - 1] = (_ref1 = args.slice(this._params.length - 1)) != null ? _ref1.join(" ") : void 0;
            return args.length = this._params.length;
        }
    }

    _truncateExtraOptionalParams(numArgs) {
        var i, param, params, _i, _ref1,
            extraParams = this._params.length - numArgs;
        if (extraParams <= 0) {
            return this._params;
        }
        params = [];
        for (i = _i = _ref1 = this._params.length - 1;
            _ref1 <= 0 ? _i <= 0 : _i >= 0;
            i = _ref1 <= 0 ? ++_i : --_i) {
            param = this._params[i];
            if (extraParams > 0 && this._isOptional(param)) {
                extraParams--;
            } else {
                params.splice(0, 0, param);
            }
        }
        return params;
    }

    /**
     * When a command can't run, determine if a helpful message should be
     *  displayed to the user.
     */
    shouldDisplayFailedToRunMessage() {
        if (this.win === Chat.NO_WINDOW) {
            return false;
        }
        return this.name !== "say";
    }

    /**
     * Commands can only run if their requirements are met (e.g. connected to the
     *  internet, in a channel, etc) and a run method is defined.
     */
    canRun(opt_context) {
        if (opt_context) {
            this.setContext(opt_context);
        }
        if (!this.run) {
            return false;
        }
        if (!this._requires) {
            return true;
        }

        // return false if some requirements are not met, else return true
        return !this._requires.some(requirement => !this._meetsRequirement(requirement));
    }

    _meetsRequirement(requirement) {
        switch (requirement) {
        case "online":
            return isOnline();
        case "connection":
            return !!this.conn && isOnline();
        case "channel":
            return !!this.chan;
        default:
            return getFieldOrNull(this, ["conn", "irc", "state"]) === requirement;
        }
    }

    displayHelp(win) {
        if (win == null) {
            win = this.win;
        }
        return win.message("", escape(this.getHelp()), "notice help");
    }

    getHelp() {
        var usageText, _ref1,
            descriptionText = this._description ? `, ${this._description}` : "";
        if (this._usage) {
            usageText = `${this._usage}`;
        }
        if (usageText == null) {
            usageText = ((_ref1 = this._params) != null ? _ref1.length : void 0) > 0 ? this._getUsage() : "";
        }
        return `${this.name.toUpperCase()} ${usageText}${descriptionText}.`;
    }

    _getUsage() {
        return this._params.map(param => {
            let paramName = this._getParamName(param);
            return this._isOptional(param)
                ? `[${paramName}]`
                : `<${paramName}>`;
        }).join(" ");
    }

    _getParamName(param) {
        if (this._isOptional(param)) {
            param = param.slice(4);
        }
        if (this._isVariable(param)) {
            param = param.slice(0, +(param.length - 4) + 1 || 9e9);
        }
        return param;
    }

    _isOptional(param) {
        return param.indexOf("opt_") === 0;
    }

    _isVariable(param) {
        return (param != null ? param.slice(param.length - 3) : void 0) === "...";
    }

    isOwnNick(nick) {
        var _ref1;
        if (nick == null) {
            nick = this.nick;
        }
        return nicksEqual((_ref1 = this.conn) != null ? _ref1.irc.nick : void 0, nick);
    }

    displayDirectMessage(nick, message) {
        var _ref1;
        if (nick == null) {
            nick = this.nick;
        }
        if (message == null) {
            message = this.message;
        }
        if (((_ref1 = this.conn) != null ? _ref1.windows[nick] : void 0) != null) {
            return this._displayDirectMessageInPrivateChannel(nick, message);
        } else {
            return this._displayDirectMessageInline(nick, message);
        }
    }

    /**
     * Used with /msg. Displays the message in a private channel.
     */
    _displayDirectMessageInPrivateChannel(nick, message) {
        var context;
        context = {
            server: this.conn.name,
            channel: nick
        };
        return this.chat.displayMessage("privmsg", context, this.conn.irc.nick, message);
    }

    /**
     * Used with /msg. Displays the private message in the current window.
     * Direct messages always display inline until the user receives a response.
     */
    _displayDirectMessageInline(nick, message) {
        return this.displayMessageWithStyle("privmsg", nick, message, "direct");
    }

    displayMessage(...args) {
        var type = args[0],
            rest = 2 <= args.length ? args.slice(1) : [],
            context = {
                server: getFieldOrNull(this, ["conn", "name"]),
                channel: this.chan
            };
        return this.chat.displayMessage(...[type, context, ...rest]);
    }

    /**
     * Displays a message with a custom style. This is useful for indicating that
     *  a message be rendered in a special way (e.g. no pretty formatting).
     */
    displayMessageWithStyle(...args) {
        var i, type = args[0],
            rest = 3 <= args.length ? args.slice(1, i = args.length - 1) : (i = 1, []),
            style = args[i++],
            e = new Event("message", type, ...rest);
        e.setContext(getFieldOrNull(this, ["conn", "name"]), this.chan);
        e.addStyle(style);
        return this.chat.emit(e.type, e);
    }

    handleCTCPRequest(nick, type) {
        var delimiter = CTCPHandler.DELIMITER,
            message = delimiter + type + delimiter;
        this.displayDirectMessage(nick, `CTCP ${type}`);
        return this.conn.irc.doCommand("PRIVMSG", nick, message);
    }

    /**
     * Used to set the arguments for MODE shortcut commands.
     * @param {string} type E.g. /op, /voice, etc.
     */
    setModeArgs(type) {
        this.nicks = [this.nick];
        this.target = this.chan;
        return this.mode = type;
    }

    /**
     * Determine if the given string is a valid mode expression.
     * TODO: This can be improved. (e.g. ++ and +a++ shouldn't be valid)
     * @param {string} mode E.g. +o, -o, +v, etc.
     */
    isValidMode(mode) {
        var _ref1;
        return (_ref1 = mode != null ? mode[0] : void 0) === "+" || _ref1 === "-";
    }

    listInstalledScripts() {
        var names = this.chat.scriptHandler.getScriptNames();
        if (names.isEmpty()) {
            return "No scripts are currently installed";
        } else {
            return `Installed scripts: ${getReadableList(names)}`;
        }
    }
}
