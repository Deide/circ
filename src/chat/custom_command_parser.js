/**
 * Parses raw commands from the user. Used with the /raw command.
 */
class CustomCommandParser {
    parse(...args) {
        var params,
            channel = args[0],
            rest = 2 <= args.length ? args.slice(1) : [];
        if (rest[1] === "-c") {
            params = this._mergeQuotedWords(rest.slice(2));
            return [rest[0].toUpperCase(), channel, ...params];
        } else {
            params = this._mergeQuotedWords(rest.slice(1));
            return [rest[0].toUpperCase(), ...params];
        }
    }

    _mergeQuotedWords(words) {
        var i, word, _i, _len,
            start = -1;

        for (i = _i = 0, _len = words.length; _i < _len; i = ++_i) {
            word = words[i];
            if (word[0] === "\"" && start === -1) {
                start = i;
            }
            if (word[word.length - 1] === "\"" && start !== -1) {
                words.splice(start, i - start + 1, words.slice(start, +i + 1 || 9e9).join(" "));
                words[start] = this._trimQuotes(words[start]);
                return this._mergeQuotedWords(words);
            }
        }
        return words;
    }

    _trimQuotes(word) {
        return word.slice(1, +(word.length - 2) + 1 || 9e9);
    }
}

export default new CustomCommandParser;
