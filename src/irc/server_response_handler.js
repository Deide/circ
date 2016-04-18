import MessageHandler from "../utils/message_handler";
import CTCPHandler from "./ctcp_handler";
import handlers from "./server_response_handler_map";
import Chat from "../chat/chat";
import Event from "../utils/event";

/**
 * Handles messages from an IRC server
 * Good references for numeric (raw) response codes:
 * https://www.alien.net.au/irc/irc2numerics.html
 * http://www.mirc.org/mishbox/reference/rawhelp.htm
 */
export default class ServerResponseHandler extends MessageHandler {
    constructor(irc) {
        super();
        this.irc = irc;
        this.ctcpHandler = new CTCPHandler;
    }

    canHandle(type) {
        if (this._isErrorMessage(type)) {
            return true;
        } else {
            return super.canHandle.call(this, type);
        }
    }
    /**
     * Handle a message of the given type. Error messages are handled with the
     *  default error handler unless a handler is explicitly specified.
     * @param  {string} type The type of message (e.g. PRIVMSG).
     * @param  {any} ...params A variable number of arguments.
     */
    handle(type, ...params) {
        if (this._isErrorMessage(type) && !(type in this._handlers)) {
            type = "error";
        }
        return super.handle.apply(this, [type, ...params]);
    }

    _isErrorMessage(type) {
        var _ref1;
        return (400 <= (_ref1 = parseInt(type)) && _ref1 < 600);
    }

    _handleCTCPRequest(from, target, msg) {
        var name = this.ctcpHandler.getReadableName(msg),
            message = `Received a CTCP ${name} from ${from.nick}`;
        this.irc.emitMessage("notice", Chat.CURRENT_WINDOW, message);
        return this.ctcpHandler.getResponses(msg)
            .map(response => this.irc.doCommand("NOTICE", from.nick, response, true));
    }


    /**
     * Called by various nick-specific raw server responses (e.g., /WHOIS responses)
     * @param  {any} to
     * @param  {any} nick
     * @param  {any} msg
     */
    _emitUserNotice(to, nick, msg) {
        var event = new Event("message", "privmsg", nick, msg);
        event.setContext(this.irc.server, to);
        event.addStyle("notice");
        return this.irc.emitCustomMessage(event);
    }
}

ServerResponseHandler.prototype._handlers = handlers;
