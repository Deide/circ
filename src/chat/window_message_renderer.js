import HelpMessageRenderer from "./help_message_renderer";
import {VERSION, PROJECT_URL} from "../utils/globals";
import {display} from "../utils/html";
import {hashString} from "../irc/irc_util";

/**
 * Handles outputing text to the window and provides functions to display
 * some specific messages like help and about.
 */
export default class MessageRenderer {
    constructor(win) {
        this.win = win;
        this.systemMessage = this.systemMessage.bind(this);

        this._userSawMostRecentMessage = false;
        this._activityMarkerLocation = void 0;
        this._helpMessageRenderer = new HelpMessageRenderer(this.systemMessage);
    }
    onFocus() {
        return this._userSawMostRecentMessage = this.win.$messages.children().length > 0;
    }

    displayWelcome() {
        this.systemMessage("Welcome to CIRC!");
        return this.systemMessage(this._getWebsiteBlurb());
    }

    /**
     * Display available commands, grouped by category.
     * @param {Object.<string: {category: string}>} commands
     */
    displayHelp(commands) {
        return this._helpMessageRenderer.render(commands);
    }

    displayHotkeys(hotkeys) {
        return this._helpMessageRenderer.renderHotkeys(hotkeys);
    }

    displayAbout() {
        this._addWhitespace();
        this.systemMessage(`CIRC is a packaged Chrome app developed by Google Inc. ${this._getWebsiteBlurb()}`, "notice about");
        this.systemMessage(`Version: ${VERSION}`, "notice about");
        this.systemMessage("Contributors:", "notice about group");
        this.systemMessage("    * Icon by Michael Cook (themichaelcook@gmail.com)", "notice about group");
        return this.systemMessage("    * UI mocks by Fravic Fernando (fravicf@gmail.com)", "notice about group");
    }

    _getWebsiteBlurb() {
        return `Documentation, issues and source code live at ${PROJECT_URL}.`;
    }

    /**
     * Display content and the source it was from with the given style.
     * @param {string} from
     * @param {string} msg
     * @param {...string} styles
     */
    message(from, msg, ...styles) {
        from = from || "";
        msg = msg || "";
        var isHelpMessage = styles[0] && styles[0].split(" ").indexOf("help") != -1,
            fromNode = this._createSourceFromText(from),
            msgNode = this._createContentFromText(msg, /* allowHtml */isHelpMessage);

        this.rawMessage(fromNode, msgNode, styles.join(" "));
        if (this._shouldUpdateActivityMarker()) {
            return this._updateActivityMarker();
        }
    }

    _createContentFromText(msg, allowHtml) {
        if (!msg)  return "";
        var node = $("<span>");
        node.html(display(msg, allowHtml));
        return node;
    }

    _createSourceFromText(from) {
        var node;
        if (!from) {
            return "";
        }
        node = $("<span>");
        node.text(from);
        return node;
    }

    /**
     * Display a system message to the user. A system message has no from field.
     */
    systemMessage(msg, style) {
        if (msg == null) {
            msg = "";
        }
        if (style == null) {
            style = "system";
        }
        return this.message("", msg, style);
    }

    /**
     * Display a message without escaping the from or msg fields.
     */
    rawMessage(from, msg, style) {
        var message = this._createMessageHTML(from, msg, style);
        this.win.emit("message", this.win.getContext(), style, message[0].outerHTML);
        this.win.$messages.append(message);
        this.win.$messagesContainer.restoreScrollPosition();
        return this._trimMessagesIfTooMany();
    }

    // mock-hookable function
    _createTimestamp() {
        return new Date();
    }

    _createMessageHTML(from, msg, style) {
        var message = $("#templates .message").clone();
        message.addClass(style);
        $(".timestamp", message).append(this._createTimestamp().toLocaleTimeString());
        $(".source", message).append(from);
        $(".content", message).append(msg);
        if (!(typeof from.text === "function" ? from.text() : void 0)) {
            $(".source", message).addClass("empty");
        }
        if (typeof from.text === "function") {
            $(".source", message).attr("colornumber", hashString(from.text().toLocaleLowerCase()) % 31);
        }
        return message;
    }

    /**
     * Trim chat messages when there are too many in order to save on memory.
     */
    _trimMessagesIfTooMany() {
        var messages = this.win.$messagesContainer.children().children();
        if (!(messages.length > MessageRenderer.MAX_MESSAGES)) {
            return;
        }
        return messages.map(message => message.remove());
    }

    _addWhitespace() {
        return this.message();
    }

    /*
     * Update the activity marker when the user has seen the most recent messages
     * and then received a message while the window wasn't focused.
     */
    _shouldUpdateActivityMarker() {
        return !this.win.isFocused() && this._userSawMostRecentMessage;
    }

    _updateActivityMarker() {
        this._userSawMostRecentMessage = false;
        if (this._activityMarkerLocation) {
            this._activityMarkerLocation.removeClass("activity-marker");
        }
        this._activityMarkerLocation = this.win.$messages.children().last();
        return this._activityMarkerLocation.addClass("activity-marker");
    }
}
// The max number of messages a room can display at once.
MessageRenderer.MAX_MESSAGES = 3500;
