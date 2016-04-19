/*eslint no-console: ["error", { allow: ["info", "error"] }] */
import MessageHandler from "../utils/message_handler";
import UserCommand from "./user_command";
import userCommandList from "./user_command_list";
import iter from "lazy.js";

/**
 * Handles user commands, including providing help messages and determining if a
 *  command can be run in the current context.
 */
export default class UserCommandHandler extends MessageHandler {
    constructor(chat) {
        super(chat);
        this.chat = chat;
        this._handlers = {};
        this._init();
    }

    getCommands() {
        return this._handlers;
    }

    getCommand(command) {
        return this._handlers[command];
    }

    listenTo(emitter) {
        return emitter.on("command", e => {
            if (this.canHandle(e.name)) {
                return this.handle(e.name, e, ...e.args);
            }
        });
    }

    handle(...args) {
        var command,
            type = args[0],
            context = args[1],
            rest = 3 <= arguments.length ? args.slice(2) : [];
        if (!this._isValidUserCommand(type)) {
            // The command must be a developer command
            super.handle(type, context, ...rest);
            return;
        }
        command = this._handlers[type];
        return command.tryToRun(context, ...rest);
    }

    _isValidUserCommand(type) {
        return type in this._handlers;
    }

    /**
     * Creates all user commands. The "this" parameter in the run() and
     *  validateArgs() functions is UserCommand.
     * @this {UserCommand}
     */
    _init() {
        // Register commands
        iter(userCommandList)
            .pairs()
            .each(([name, spec]) => this._addCommand(name, spec));
    }
    /**
     * @param  {string} name
     * @param  {{description: string, category: string, params: string[], requires: string[]?, extends: string?, usage: string, validateArgs: Function, run: function}} spec
     */
    _addCommand(name, spec) {
        var command = new UserCommand(name, spec),
            commandToExtend = this._handlers[spec["extends"]];
        if (commandToExtend) {
            command.describe(commandToExtend.description);
        }
        command.setChat(this.chat);
        return this._handlers[name] = command;
    }
}
