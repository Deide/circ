
export var arrayBufferConversionCount = 0;

function createBlob(src) {
    var BB = window.BlobBuilder || window.WebKitBlobBuilder;
    if (BB) {
        var bb = new BB();
        bb.append(src);
        return bb.getBlob();
    }
    return new Blob([src]);
}

function concatArrayBuffers(a, b) {
    var result = new ArrayBuffer(a.byteLength + b.byteLength),
        resultView = new Uint8Array(result);

    resultView.set(new Uint8Array(a));
    resultView.set(new Uint8Array(b), a.byteLength);
    return result;
}

function string2ArrayBuffer(string, callback) {
    var blob = createBlob(string),
        f = new FileReader();

    arrayBufferConversionCount++;
    f.onload = e => {
        arrayBufferConversionCount--;
        return callback(e.target.result);
    };
    return f.readAsArrayBuffer(blob);
}

function arrayBuffer2String(buf, callback) {
    var blob = createBlob(buf),
        f = new FileReader();

    arrayBufferConversionCount++;
    f.onload = e => {
        arrayBufferConversionCount--;
        return callback(e.target.result);
    };
    return f.readAsText(blob);
}

export const parseCommand = (() => {
    const partsRegx = /^(?::([^\x20]+?)\x20)?([^\x20]+?)((?:\x20[^\x20:][^\x20]*)+)?(?:\x20:(.*))?$/;
    return function _parseCommand(data) {
        const str = $.trim(data.toString("utf8"));
        let parts = partsRegx.exec(str);
        if (!parts) {
            throw new Error(`invalid IRC message: ${data}`);
        }
        /*
        * Could do more validation here...
        * prefix = servername | nickname((!user)?@host)?
        * command = letter+ | digit{3}
        * params has weird stuff going on when there are 14 arguments
        */
        // trim whitespace
        if (parts[3] != null)
            parts[3] = parts[3].slice(1).split(/\x20/);
        else
            parts[3] = [];

        if (parts[4] != null)
            parts[3].push(parts[4]);
        return {
            prefix: parts[1],
            command: parts[2],
            params: parts[3]
        };
    };
})();

export function hashString(s) {
    var ret = 0;
    for (let i = 0, len = s.length; i < len; i++) {
        ret = (31 * ret + s.charCodeAt(i)) << 0;
    }
    return Math.abs(ret);
}

export function parsePrefix(prefix) {
    var p = /^([^!]+?)(?:!(.+?)(?:@(.+?))?)?$/.exec(prefix);
    return {
        nick: p[1],
        user: p[2],
        host: p[3]
    };
}

const resolveParams = (() => {
    const spacesColons = /^:|\x20/,
        errorString = "some non-final arguments had spaces or initial colons in them";

    return (params) => {
        let last = params.length - 1,
            lastArgIsMsg = params.length > 1 ? params[last] : false;

        if (lastArgIsMsg === true) {
            params.pop();
            last -= 1;
        }

        if (params && params.length > 0) {
            if (params.slice(0, last).some(p => spacesColons.test(p))) {
                throw new Error(`${errorString}\n[PARAMS] ${JSON.stringify(params)}`);
            }
            if (spacesColons.test(params[last]) || lastArgIsMsg === true) {
                params[last] = `:${params[last]}`;
            }
            return params.join(" ");
        } else {
            return "";
        }
    };
})();

export function makeCommand(cmd, ...params) {
    return `${cmd} ${resolveParams(params)}\x0d\x0a`;
}

export function randomName(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    if (length == null) length = 10;
    return Array(length).fill().map(() => chars[Math.floor(Math.random() * chars.length)])
        .join("");
}

export function normaliseNick(nick) {
    return nick.toLowerCase().replace(/[\[\]\\]/g, x => ({
        "[": "{",
        "]": "}",
        "|": "\\"
    }[x]));
}

export function nicksEqual(a, b) {
    var _ref2;
    if (!((typeof a === (_ref2 = typeof b) && _ref2 === "string"))) {
        return false;
    }
    return (a != null) && (b != null) && normaliseNick(a) === normaliseNick(b);
}

export function toSocketData(str, cb) {
    return string2ArrayBuffer(str, ab => cb(ab));
}

export function fromSocketData(ab, cb) {
    return arrayBuffer2String(ab, cb);
}

export function emptySocketData() {
    return new ArrayBuffer(0);
}

export function concatSocketData(a, b) {
    return concatArrayBuffers(a, b);
}

export function isConvertingArrayBuffers() {
    return arrayBufferConversionCount > 0;
}

/**
 * Converts an array containing uint8 values to an ArrayBuffer.
 * @param {Array.<number>} array An array of values in the range [0, 255].
 * @return {ArrayBuffer} An array buffer containing the byte representation of
 *     the passed in array.
 */
export function arrayToArrayBuffer(array) {
    var arrayBuffer = new ArrayBuffer(array.length);
    var arrayView = new Uint8Array(arrayBuffer);
    arrayView.set(array);
    return arrayBuffer;
}
