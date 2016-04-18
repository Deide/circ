import EventEmitter from "../utils/event_emitter";
import Event from "../utils/event";
import {getLogger, removeFromArray} from "../utils/utils";
import Script from "./script";
import iter from "lazy.js";

/**
 * Handles currently running scripts. Events sent from the user and IRC servers
 *  are intercepted by this class, passed to scripts, and then forwarded on to
 *  their destination.
 */
export default class ScriptHandler extends EventEmitter {
    constructor() {
        super();
        this._handleMessage = this._handleMessage.bind(this);
        this._handleEvent = this._handleEvent.bind(this);

        this._scripts = {};
        this._pendingEvents = Object.create(null);
        this._eventCount = 0;
        this._emitters = [];
        this._propagationTimeoutTimerId = null;
        this._log = getLogger(this);
        addEventListener("message", this._handleMessage);
    }

    listenToScriptEvents(emitter) {
        return emitter.on("script_loaded", this.addScript);
    }

    /**
     * Add a script to the list of currently active scripts. Once added, the script
     *  will receive events from the user and IRC server.
     * @param {Script} script
     */
    addScript(script) {
        return this._scripts[script.id] = script;
    }

    /**
     * Remove a script to the list of currently active scripts. Once removed,
     * the script will not longer receive events from the user or IRC server.
     * @param {Script} script
     */
    removeScript(script) {
        this._getPendingEventsForScript(script)
            .each(eventID => this._stopHandlingEvent(script, eventID));

        return delete this._scripts[script.id];
    }
    /**
     * @param  {Script} script
     * @return {Sequence}
     */
    _getPendingEventsForScript(script) {
        return iter(this._pendingEvents)
            .values()
            .filter(pendingEvent =>
                !pendingEvent.scripts.some(pendingScript => pendingScript.id === script.id))
            .map(({id}) => id);
    }

    on(ev, cb) {
        if (ScriptHandler.HOOKABLE_EVENTS.indexOf(ev) >= 0
        || ScriptHandler.SCRIPTING_EVENTS.indexOf(ev) >= 0) {
            return super.on.call(this, ev, cb);
        } else {
            return this._forwardEvent(ev, cb);
        }
    }

    _forwardEvent(ev, cb) {
        return this._emitters.map(emitter => emitter.on(ev, cb));
    }

    addEventsFrom(emitter) {
        this._emitters.push(emitter);
        return ScriptHandler.HOOKABLE_EVENTS.map(event => emitter.on(event, this._handleEvent));
    }

    removeEventsFrom(emitter) {
        this._emitters.splice(this._emitters.indexOf(emitter), 1);
        return ScriptHandler.HOOKABLE_EVENTS.map(event => emitter.removeListener(event, this._handleEvent));
    }

    _handleEvent(event) {
        event.id = this._eventCount++;
        if (this._eventCanBeForwarded(event)) {
            this._offerEventToScripts(event);
        }
        if (!this._eventIsBeingHandled(event.id)) {
            return this._emitEvent(event);
        }
    }

    /**
     * Certain events are not allowed to be intercepted by scripts for security reasons.
     * @param {Event} event
     * @return {boolean} Returns true if the event can be forwarded to scripts.
     */
    _eventCanBeForwarded(event) {
        return !(event.hook in ScriptHandler.UNINTERCEPTABLE_EVENTS);
    }

    _offerEventToScripts(event) {
        return iter(this._scripts)
            .values()
            .filter(script => script.shouldHandle(event))
            .each(script => this._sendEventToScript(event, script));
    }

    _sendEventToScript(event, script) {
        script.postMessage(event);
        this._markEventAsPending(event, script);
        if (!this._propagationTimeoutTimerId) {
            this._propagationTimeoutTimerId = setTimeout(
                this._checkPropagationTimeout.bind(this), ScriptHandler.PROPAGATION_TIMEOUT);
        }
    }

    _markEventAsPending(event, script) {
        if (!this._pendingEvents[event.id]) {
            this._pendingEvents[event.id] = {};
            this._pendingEvents[event.id].event = event;
            this._pendingEvents[event.id].scripts = [];
            this._pendingEvents[event.id].timestamp = Date.now();
        }
        return this._pendingEvents[event.id].scripts.push(script);
    }

    _checkPropagationTimeout() {
        iter(this._getUnresponsiveScripts())
            .values()
            .each(script => {
                this._log("e", `Removing unresponsive script ${script.getName()}`);
                this.removeScript(script);
            });
        this._propagationTimeoutTimerId = null;
        if (!this._isPendingEventQueueEmpty()) {
            this._propagationTimeoutTimerId = setTimeout(
                this._checkPropagationTimeout.bind(this), this._getNextPendingEventTimeout());
        }
    }

    _getUnresponsiveScripts() {
        var now = Date.now();

        return iter(this._pendingEvents)
            .values()
            .filter(pendingEvent => pendingEvent.timestamp + ScriptHandler.PROPAGATION_TIMEOUT <= now)
            .map(pendingEvent => pendingEvent.scripts)
            .flatten()
            .indexBy("id")
            .toObject();
    }

    _isPendingEventQueueEmpty() {
        for (let id in this._pendingEvents) {
            id;
            return false;
        }
        return true;
    }

    _getNextPendingEventTimeout() {
        var smallestTimestamp = iter(this._pendingEvents)
            .values()
            .reduce((smallest, pendingEvent) => pendingEvent.timestamp < smallest
                ? pendingEvent.timestamp
                : smallest, Number.MAX_VALUE);

        var nextTimeout = smallestTimestamp
                          + ScriptHandler.PROPAGATION_TIMEOUT
                          - Date.now();
        if (nextTimeout > ScriptHandler.PROPAGATION_TIMEOUT || nextTimeout <= 0) {
            nextTimeout = ScriptHandler.PROPAGATION_TIMEOUT;
        }
        return nextTimeout;
    }

    _eventIsBeingHandled(eventId) {
        if (!(eventId in this._pendingEvents)) {
            return false;
        }
        return this._pendingEvents[eventId].scripts.length > 0;
    }

    _handleMessage(message) {
        var type,
            event = message.data,
            script = Script.getScriptFromFrame(this._scripts, message.source);

        if (script == null) return;

        switch (event.type) {
        case "hook_command":
        case "hook_server":
        case "hook_message":
            type = event.type.slice(5);
            return script.beginHandlingType(type, event.name);
        case "command":
        case "sevrer":
        case "message":
            return this._emitEvent(Event.wrap(event));
        case "propagate":
            return this._handleEventPropagation(script, event);
        case "meta":
            return this._handleMetaData(script, event);
        case "storage":
            return this._handleStorageRequest(script, event);
        }
    }

    _handleEventPropagation(script, propagatationEvent) {
        var eventId, scriptsHandlingEvent, _ref1;
        eventId = (_ref1 = propagatationEvent.args) != null ? _ref1[0] : void 0;
        if (!this._eventIsBeingHandled(eventId)) {
            return;
        }
        scriptsHandlingEvent = this._pendingEvents[eventId].scripts;
        if (scriptsHandlingEvent.indexOf(script) < 0) {
            return;
        }
        switch (propagatationEvent.name) {
        case "none":
            return delete this._pendingEvents[eventId];
        case "all":
            return this._stopHandlingEvent(script, eventId);
        default:
            return this._log("w", "received unknown propagation type:", propagatationEvent.name);
        }
    }

    /**
     * Handles a meta data event, such as setting the script name.
     * @param {Script} script
     * @param {Event} event
     */
    _handleMetaData(script, event) {
        var name, uniqueName;
        switch (event.name) {
        case "name":
            name = event.args[0];
            if (!this._isValidName(name)) {
                return;
            }
            uniqueName = this._getUniqueName(name);
            return script.setName(uniqueName);
        }
    }

    /**
     * Returns true if the given script name contains only valid characters.
     * @param {string} name The script name.
     * @return {boolean}
     */
    _isValidName(name) {
        return name && /^[a-zA-Z0-9\/_-]+$/.test(name);
    }

    /**
     * Appends numbers to the end of the script name until it is unique.
     * @param {string} name
     */
    _getUniqueName(name) {
        var originalName, suffix;
        originalName = name = name.slice(0, +(ScriptHandler.MAX_NAME_LENGTH - 1) + 1 || 9e9);
        suffix = 1;
        while (this.getScriptNames().indexOf(name) >= 0) {
            suffix++;
            name = originalName + suffix;
        }
        return name;
    }

    /**
     * Handles loading or saving information to storage for the given script.
     * @param {Script} script The script wishing to use the storage.
     * @param {Event} event The event which contains the object to save.
     */
    _handleStorageRequest(script, event) {
        switch (event.name) {
        case "save":
            // itemToSave = event.args[0];
            return this.emit("save", script.getName(), event.args[0]);
        case "load":
            return this.emit("load", script.getName(), item => script.postMessage(new Event("system", "loaded", item)));
        }
    }

    storageChanged(script, change) {
        return script.postMessage(new Event("system", "storage_changed", change));
    }

    getScriptNames() {
        return iter(this._scripts).values().map(script => script.getName());
    }

    getScriptByName(name) {
        return iter(this._scripts).find(script => script.getName() === name);
    }

    _emitEvent(event) {
        return this.emit(event.type, event);
    }

    _stopHandlingEvent(script, eventId) {
        var scriptsHandlingEvent = this._pendingEvents[eventId].scripts;
        removeFromArray(scriptsHandlingEvent, script);
        if (!this._eventIsBeingHandled(eventId)) {
            let event = this._pendingEvents[eventId].event;
            delete this._pendingEvents[eventId];
            return this._emitEvent(event);
        }
    }

    tearDown() {
        return removeEventListener("message", this._handleEvent);
    }
}
/**
 * Script names that are longer this this are truncated.
 */
ScriptHandler.MAX_NAME_LENGTH = 20;

/**
 * The amount of time a script has to acknowlege an event by calling
 * propagate. If it fails to call propagate within this many milliseconds
 * of receiving the event, the script will be uninstalled.
 */
ScriptHandler.PROPAGATION_TIMEOUT = 5000; // 5 seconds


/**
 * A set of events that cannot be intercepted by scripts.
 */
ScriptHandler.UNINTERCEPTABLE_EVENTS = {
    "command help": "command help",
    "command about": "command about",
    "command install": "command install",
    "command uninstall": "command uninstall",
    "command scripts": "command scripts"
};

/**
 * Events that a script can listen for.
 */
ScriptHandler.HOOKABLE_EVENTS = ["command", "server", "message"];

/**
 * Events that are generated and sent by the script handler.
 */
ScriptHandler.SCRIPTING_EVENTS = ["save", "load"];
