import MessageHandler from "../utils/message_handler";
import Notification from "./notification";

/**
 * Special commands used to make testing easier. These commands are not
 *  displayed in /help.
 */
export default class DeveloperCommands extends MessageHandler {

    /**
     * Initialise the Developer Commands
     * @param  {Chat} chat
     */
    constructor(chat) {
        super(chat);
        this._chat = chat;
    }

    _handleCommand(command, text) {
        text = text || "";
        return this._chat.userCommands(command, this.params[0], ...text.split(" "));
    }
}

DeveloperCommands.prototype._handlers = {
    "test-notif": function () {
        return new Notification("test", "hi!").show();
    },
    "test-upgrade-prompt": function() {
        this._chat._promptToUpdate();
    },
    "get-pw": function () {
        return this._chat.displayMessage(
            "notice",
            this.params[0].context,
            `Your password is: ${this._chat.remoteConnection._password}`);
    },
    "set-pw": function (event) {
        var password = event.args[0] || "bacon";
        this._chat.storage._store("password", password);
        return this._chat.setPassword(password);
    }
};