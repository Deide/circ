import EventEmitter from "../utils/event_emitter";

/**
 * Walks first time users through the basics of CIRC.
 *
 * TODO: It would be awesome if this was implemented as a script.
 */
export default class Walkthrough extends EventEmitter {
    /**
     * @param {{getCurrentContext: function(), displayMessage: function()}} messageDisplayer
     * @param {Storage} storageState The current state of what's loaded from storage
     */
    constructor(messageDisplayer, storageState) {
        super();
        this._handleIRCEvent = this._handleIRCEvent.bind(this);
        this._messageDisplayer = messageDisplayer;
        this._steps = ["start", "server", "channel", "end"];
        this._findWalkthroughPoisition(storageState);
        this._beginWalkthrough();
    }
    /**
         * Determine which step the user is on in the walkthrough. They may have left
         *  half way through.
         */
    _findWalkthroughPoisition(storageState) {
        if (storageState.channelsLoaded) {
            this._currentStep = 3;
        } else if (storageState.serversLoaded) {
            this._currentStep = 2;
        } else if (storageState.nickLoaded) {
            this._currentStep = 1;
        } else {
            this._currentStep = 0;
        }
        return this._startingStep = this._currentStep;
    }

    /**
     * Based on where the user is in the walkthrough, determine the first message
     *  the user sees.
     */
    _beginWalkthrough() {
        var step;
        step = this._steps[this._currentStep];
        if (step === "end") {
            this.emit("tear_down");
            return;
        }
        if (step === "channel") {
            // Wait for the server to connect before displaying anything.
            this._currentStep--;
            return;
        }
        return this._displayStep(step);
    }

    /**
     * @param {EventEmitter} ircEvents
     */
    listenToIRCEvents(ircEvents) {
        return ircEvents.on("server", this._handleIRCEvent);
    }

    _handleIRCEvent(event) {
        this._context = event.context;
        switch (event.name) {
        case "nick":
            return this._displayWalkthrough("server");
        case "connect":
            return this._displayWalkthrough("channel");
        case "joined":
            return this._displayWalkthrough("end");
        }
    }

    _displayWalkthrough(type) {
        var position;
        position = this._steps.indexOf(type);
        if (position > this._currentStep) {
            this._currentStep = position;
            return this._displayStep(type);
        }
    }

    _displayStep(name) {
        return this[`_${name}Walkthrough`](this._context || this._messageDisplayer.getCurrentContext());
    }

    _isFirstMessage() {
        return this._currentStep === this._startingStep;
    }

    /**
     * Display a message to the user.
     */
    _message(msg, style) {
        var context = this._messageDisplayer.getCurrentContext();
        style = style || "system";
        return this._messageDisplayer.displayMessage(style, context, msg);
    }

    _startWalkthrough() {
        return this._message("To get started, set your nickname with /nick <my_nick>.");
    }

    _serverWalkthrough() {
        if (this._isFirstMessage()) {
            this._message("Join a server by typing /server <server> [port].");
        } else {
            this._message("Great! Now join a server by typing /server <server> [port].");
        }
        return this._message("For example, you can connect to freenode by typing /server chat.freenode.net.");
    }

    _channelWalkthrough(context) {
        /**
         * Display after a delay to allow for MOTD and other output to be displayed.
         */
        return setTimeout(() => {
            return this._displayChannelWalkthough(context);
        }, Walkthrough.SERVER_OUTPUT_DELAY);
    }

    _displayChannelWalkthough(context) {
        this._message(`You've successfully connected to ${context.server}.`);
        return this._message("Join a channel with /join <#channel>.");
    }

    _endWalkthrough(context) {
        if (!this._isFirstMessage()) {
            this._message(`Awesome, you've connected to ${context.channel}.`);
        }
        this._message("If you're ever stuck, type /help to see a list of all commands.");
        this._message("You can switch windows with alt+[0-9] or click in the channel list on the left.");
        return this.emit("tear_down");
    }
}
/**
 * Number of ms to wait after joining a server so the MTOD and other output can be displayed.
 */
Walkthrough.SERVER_OUTPUT_DELAY = 1000;
