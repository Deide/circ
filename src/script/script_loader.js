import {loadFromFileSystem} from "../utils/utils";
import Script from "./script";
import prepackagedScripts from "./prepackaged/source_array";

class ScriptLoader {
    constructor() {
        this._sendSourceCode = this._sendSourceCode.bind(this);
        this._scripts = {};
        addEventListener("message", this._sendSourceCode);
    }

    _sendSourceCode(e) {
        var script = Script.getScriptFromFrame(this._scripts, e.source);
        if (script && e.data.type === "onload") {
            script.postMessage({
                type: "source_code",
                sourceCode: script.sourceCode
            });
            return delete this._scripts[script.id];
        }
    }

    loadPrepackagedScripts(callback) {
        return prepackagedScripts.map(sourceCode => callback(this._createScript(sourceCode)));
    }

    loadScriptsFromStorage(scripts, callback) {
        return scripts.map(script => callback(this._createScript(script.sourceCode)));
    }

    createScriptFromFileSystem(callback) {
        /*eslint no-console: 0 */
        return loadFromFileSystem(sourceCode => {
            try {
                return callback(this._createScript(sourceCode));
            } catch (error) {
                return console.error("failed to eval:", error.toString());
            }
        });
    }

    /**
     * @param {string} sourceCode The raw JavaScript source code of the script.
     * @return {Script} Returns a handle to the script.
     */
    _createScript(sourceCode) {
        var frame = this._createIframe(),
            script = new Script(sourceCode, frame);
        this._scripts[script.id] = script;
        return script;
    }

    _createIframe() {
        var iframe;
        iframe = document.createElement("iframe");
        iframe.src = "plugenv/script_frame.html";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        return iframe.contentWindow;
    }

    /**
     * Removes the iFrame in which the script is running from the DOM.
     * @param {Script} script
     */
    unloadScript(script) {
        document.body.removeChild(script.frame);
        return delete script.frame;
    }
}

export default new ScriptLoader;
