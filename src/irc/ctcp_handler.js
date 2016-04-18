import {VERSION} from "../utils/globals";
/**
 * Handles CTCP requests such as VERSION, PING, etc.
 */
export default class CTCPHandler {
    constructor() {
        /*
         * TODO: Respond with this message when an unknown query is seen.
         */
        this._error = `${CTCPHandler.DELIMITER}ERRMSG${CTCPHandler.DELIMITER}`;
    }
    isCTCPRequest(msg) {
        if (!/\u0001[\w\s]*\u0001/.test(msg)) {
            return false;
        }
        return this.getResponses(msg).length > 0;
    }

    getReadableName(msg) {
        return this._parseMessage(msg)[0];
    }

    getResponses(msg) {
        var parsed = this._parseMessage(msg),
            type = parsed[0],
            responses = this._getResponseText(type, parsed[1]);

        return responses.map(response => this._createCTCPResponse(type, response));
    }

    /**
     * Parses the type and arguments from a CTCP request.
     * @param {string} msg CTCP message in the format: '\0001TYPE ARG1 ARG2\0001'.
     *     Note: \0001 is a single character.
     * @return {string, string[]} Returns the type and the args.
     */
    _parseMessage(msg) {
        var parsed = msg.slice(1, +(msg.length - 2) + 1 || 9e9).split(" "),
            type = parsed[0],
            args = 2 <= parsed.length ? parsed.slice(1) : [];
        return [type, args];
    }

    /**
     * @return {string[]} Returns the unformatted responses to a CTCP request.
     */
    _getResponseText(type, args) {
        /*
         * TODO support the o ther types found here:
         * http://www.irchelp.org/irchelp/rfc/ctcpspec.html
         */

        var environment, name;
        switch (type) {
        case "VERSION":
            name = "CIRC";
            environment = "Chrome";
            return [` ${[name, VERSION, environment].join(" ")}`];
        case "SOURCE":
            return [" https://github.com/flackr/circ/"];
        case "PING":
            return [` ${args[0]}`];
        case "TIME":
            var d = new Date();
            return [` ${d.toUTCString()}`];
        default:
            return [];
        }
    }

    /**
     * @return {string} Returns a correctly formatted response to a CTCP request.
     */
    _createCTCPResponse(type, response) {
        return `${CTCPHandler.DELIMITER + type + response + CTCPHandler.DELIMITER}`;
    }
}
CTCPHandler.DELIMITER = "\u0001";
