/*eslint no-console: 0 */
import * as HTMLUtils from "./html";
export const html = HTMLUtils;
var loggingEnabled = false;
var storedLogs = [];
const MAX_NUM_STORED_LOGS = 400;

function getLoggerForType(type) {
    switch (type) {
    case "w":  // warning
        return (...args) => {
            if (args.length < 1) return;
            if (loggingEnabled) console.warn.apply(console, args);
            else storeLog("warn", args);
        };
    case "e":  // error
        return (...args) => {
            if (args.length < 1) return;
            console.error(...args);
        };
    default:  // info
        return function (...args) {
            if (args.length < 1) return;
            if (loggingEnabled) console.log(...args);
            else storeLog("log", args);
        };
    }
}

/**
 * @param  {any} obj Object to traverse
 * @param  {Array} fieldPath Array of fields to traverse in order
 * @return {any or null} Returns the last field if it exists, or null if it doesn't
 */
export function getFieldOrNull(obj, fieldPath) {
    return fieldPath.reduce((o, field) => {
        if (o === undefined || o === null) return null;
        return o[field];
    }, obj);
}

export function assert(cond) {
    if (!cond) {
        throw new Error("assertion failed");
    }
}

export function getLogger(caller) {
    return function (...args) {
        var type,
            opt_type = args[0],
            msg = 2 <= args.length ? args.slice(1) : [];

        if (opt_type === "l" || opt_type === "w" || opt_type === "e") {
            type = opt_type;
        } else {
            msg = [opt_type].concat(msg);
        }
        return getLoggerForType(type).apply(null, [`${caller.constructor.name}:`, ...msg]);
    };
}

export function enableLogging() {
    loggingEnabled = true;
    // Display the last 300-400 logs.
    storedLogs.forEach(log => console[log.type].apply(console, log.msg));
    console.log("---------------------------------------------------");
    console.log(`DEBUG: printed the last ${storedLogs.length} logs.`);
    console.log("---------------------------------------------------");
}
/**
 * @param  {string} word
 * @param  {number} num
 */
export function pluralize(word, num) {
    if (!word || num === 1) {
        return word;
    }
    if (word[word.length - 1] === "s") {
        return word + "es";
    } else {
        return word + "s";
    }
}

export function storeLog(type, msg) {
    storedLogs.push({ type: type, msg: msg });
    if (storedLogs.length > MAX_NUM_STORED_LOGS) {
        storedLogs = storedLogs.slice(100);
    }
}

/**
 * Download an asset at the given URL and a return a local url to it that can be
 *  embeded in CIRC. A remote asset can not be directly embeded because of
 *  packaged apps content security policy.
 * @param {string} url
 * @param {function(string)} onload The callback which is passed the new url
 */
export function getEmbedableUrl(url, onload) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function onXHRLoad() {
        return onload(window.URL.createObjectURL(this.response));
    };
    xhr.onerror = (...args) => {
        return console.error("Failed to get embedable url for asset:", url, ...args);
    };
    return xhr.send();
}

/**
 * Returns a human readable representation of a list.
 * For example, [1, 2, 3] becomes "1, 2 and 3".
 * @param {Array<Object>} array
 * @return {string} readable list
 */
export function getReadableList(array) {
    if (array.size() === 1) {
        return array.first().toString();
    } else {
        return `${array.initial().join(", ")} and ${array.last()}`;
    }
}

export function getReadableTime(epochMilliseconds) {
    var date = new Date();
    //The time coming from the server here is actually epoc time, so we need to set it accordingly.
    date.setTime(epochMilliseconds);
    return date.toString();
}

export function isOnline() {
    return window.navigator.onLine;
}

export function removeFromArray(array, toRemove) {
    var i = array.indexOf(toRemove);
    if (i < 0) {
        return false;
    }
    return array.splice(i, 1);
}

export function truncateIfTooLarge(text, maxSize, suffix) {
    if (suffix == null) {
        suffix = "...";
    }
    if (text.length > maxSize) {
        return text.slice(0, +(maxSize - suffix.length - 1) + 1 || 9e9) + suffix;
    } else {
        return text;
    }
}

/**
 * Capitalizes the given string.
 * @param {string} sentence
 * @return {string} upper case string
 */
export function capitalizeString(sentence) {
    if (!sentence) return sentence;
    return sentence[0].toUpperCase() + sentence.slice(1);
}

/**
 * Returns whether or not the given string has non-whitespace characters.
 * @param {string} phrase
 * @return {boolean} result
 */
export function stringHasContent(phrase) {
    if (!phrase) return false;
    return /\S/.test(phrase);
}

/**
 * Opens a file browser and returns the contents of the selected file.
 * @param {function(string)} callback The function to call after the file content has be retrieved.
 */
export function loadFromFileSystem(callback) {
    return chrome.fileSystem.chooseFile({
        type: "openFile"
    }, function (fileEntry) {
        if (!fileEntry) {
            return;
        }
        return fileEntry.file(function (file) {
            var fileReader;
            fileReader = new FileReader();
            fileReader.onload = function (e) {
                return callback(e.target.result);
            };
            fileReader.onerror = function (e) {
                return console.error("Read failed:", e);
            };
            return fileReader.readAsText(file);
        });
    });
}

export function registerSocketConnection(socketId, remove) {
    if (window.chrome && chrome.runtime) {
        chrome.runtime.getBackgroundPage(function (page) {
            if (!page || !page.registerSocketId || !page.unregisterSocketId)
                return;
            if (remove)
                page.unregisterSocketId(socketId);
            else
                page.registerSocketId(socketId);
        });
    }
}

export function registerTcpServer(socketId, remove) {
    if (window.chrome && chrome.runtime) {
        chrome.runtime.getBackgroundPage(function (page) {
            if (!page || !page.registerTcpServer || !page.unregisterTcpServer)
                return;
            if (remove) page.unregisterTcpServer(socketId);
            else page.registerTcpServer(socketId);
        });
    }
}
