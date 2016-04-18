
export function escape(html) {
    var escaped = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&apos;"
    };
    return String(html).replace(/[&<>"\']/g, function(character) {
        var _ref;
        return (_ref = escaped[character]) != null ? _ref : character;
    });
}

export function stripColorCodes(html) {
    return html.replace(/\u0003\d{1,2}(,\d{1,2})?/g, "").replace(/[\x0F\x02\x1F\x1D]/g, "");
}

/**
 * Somewhat naive implementation of parsing color codes that does not respect
 * proper order of HTML open and close tags. Chrome doesn't seem to mind, though.
 */
export function parseColorCodes(html) {
    var colors = [
        "rgb(255, 255, 255)",
        "rgb(0, 0, 0)",
        "rgb(0, 0, 128)",
        "rgb(0, 128, 0)",
        "rgb(255, 0, 0)",
        "rgb(128, 0, 64)",
        "rgb(128, 0, 128)",
        "rgb(255, 128, 64)",
        "rgb(255, 255, 0)",
        "rgb(128, 255, 0)",
        "rgb(0, 128, 128)",
        "rgb(0, 255, 255)",
        "rgb(0, 0, 255)",
        "rgb(255, 0, 255)",
        "rgb(128, 128, 128)",
        "rgb(192, 192, 192)"
    ];

    var color = null,
        background = null,
        bold = false,
        italics = false,
        underline = false;

    var res = html.replace(/(\x0F|\x02|\x1F|\x1D|\u0003(\d{0,2})(?:,(\d{1,2}))?)([^\x0F\x02\x1F\x1D\u0003]*)/g, function(match, gr1, gr2, gr3, gr4) {
        if (gr1 == "\x0F") {
            color = null;
            background = null;
            bold = false;
            italics = false;
            underline = false;
        } else if (gr1 == "\x02") {
            bold = !bold;
        } else if (gr1 == "\x1F") {
            underline = !underline;
        } else if (gr1 == "\x1D") {
            italics = !italics;
        } else {
            if (gr2)
                color = colors[parseInt(gr2)];

            if (gr3)
                background = colors[parseInt(gr3)];
        }

        if (!gr4)
            return "";

        return "<font style='" +
            (color ? "color: " + color + ";" : "") +
            (background ? "background-color: " + background + ";" : "") +
            (bold ? "font-weight: bold;" : "") +
            (underline ? "text-decoration: underline;" : "") +
            (italics ? "font-style: italic;" : "") +
            "'>" +
            gr4 +
            "</font>";
    });

    return res;
}

export function _display(text, allowHtml, regx) {
    var canonicalise, innerEscape, res, textIndex;
    var escapeHTML = escape;

    canonicalise = url => {
        url = stripColorCodes(url);
        url = escapeHTML(url);
        if (url.match(/^[a-z][\w-]+:/i)) {
            return url;
        } else {
            return `http://${url}`;
        }
    };

    innerEscape = str => {
        if (allowHtml) return str;
        // long words need to be extracted before escaping so escape HTML characters
        // don't scew the word length
        var longWords = (str.match(/\S{40,}/g) || []).map(word => escapeHTML(word));

        str = escapeHTML(str);

        return longWords.reduce((result, word) => {
            let replacement, n;
            replacement = `<span class="longword">${word}</span>`;
            str = str.replace(word, replacement);
            n = str.indexOf(replacement) + replacement.length;
            result += str.slice(0, +(n - 1) + 1 || 9e9);
            str = str.slice(n);
            return result;
        }, "") + str;
    };

    res = "";
    textIndex = 0;
    for (let m = regx.exec(text); m; m = regx.exec(text)) {
        res += innerEscape(text.substr(textIndex, m.index - textIndex));
        res += `<a target="_blank" href="${canonicalise(m[0])}">${escape(m[0])}</a>`;
        textIndex = m.index + m[0].length;
    }
    res += innerEscape(text.substr(textIndex));
    res = parseColorCodes(res);

    return res;
}

function makeDisplay(rurl) {
    return (text, allowHtml) => _display(text, allowHtml, rurl);
}

/**
 * Escapes HTML and linkifies
 */
export const display = makeDisplay(/\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gi);