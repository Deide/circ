import {assert} from "../utils/utils";

/**
 * An ordered list of windows with channels sorted by server then alphebetically
 * by name.
 */
export default class WindowList {
    constructor() {
        this._servers = [];
        this.length = 0;
    }
    get(serverName, chan) {
        if (typeof arguments[0] === "number") {
            return this._getByNumber(arguments[0]);
        }

        for (let i = 0, serLen = this._servers.length; i < serLen; i++) {
            let server = this._servers[i];
            if (serverName !== server.name) continue;
            if (chan == null) return server.serverWindow;
            for (let j = 0, winLen = server.windows.length; j < winLen; j++) {
                let win = server.windows[j];
                if (win.target === chan.toLowerCase()) return win;
            }
        }
        return null;
    }

    _getByNumber(num) {
        var server, _i, _len, _ref1;
        _ref1 = this._servers;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            server = _ref1[_i];
            if (num === 0) {
                return server.serverWindow;
            } else {
                num -= 1;
            }
            if (num < server.windows.length) {
                return server.windows[num];
            } else {
                num -= server.windows.length;
            }
        }
        return void 0;
    }
    /**
     * The same as get(), but the index excludes server windows.
     */
    getChannelWindow(index) {
        var server, _i, _len, _ref1;
        _ref1 = this._servers;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            server = _ref1[_i];
            if (index < server.windows.length) {
                return server.windows[index];
            } else {
                index -= server.windows.length;
            }
        }
        return void 0;
    }
    /**
     * The same as get(), but the index excludes channel windows.
     */
    getServerWindow(index) {
        var _ref1;
        return (_ref1 = this._servers[index]) != null ? _ref1.serverWindow : void 0;
    }

    add(win) {
        if (win.target != null) {
            this._addChannelWindow(win);
        } else {
            this._addServerWindow(win);
        }
        return this.length++;
    }

    _addChannelWindow(win) {
        var server, _i, _len, _ref1, _ref2;
        assert(((_ref1 = win.conn) != null ? _ref1.name : void 0) != null);
        _ref2 = this._servers;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            server = _ref2[_i];
            if (win.conn.name === server.name) {
                this._addWindowToServer(server, win);
                return;
            }
        }
        throw `added channel window with no corresponding connection window: ${win}`;
    }

    _addWindowToServer(server, win) {
        server.windows.push(win);
        return server.windows.sort((win1, win2) => win1.target.localeCompare(win2.target));
    }

    _addServerWindow(win) {
        var _ref1;
        assert(((_ref1 = win.conn) != null ? _ref1.name : void 0) != null);
        return this._servers.push({
            name: win.conn.name,
            serverWindow: win,
            windows: []
        });
    }

    remove(win) {
        var candidate, i, server, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
        _ref1 = this._servers;
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            server = _ref1[i];
            if (server.name === ((_ref2 = win.conn) != null ? _ref2.name : void 0)) {
                if (win.isServerWindow()) {
                    this._servers.splice(i, 1);
                    this.length -= server.windows.length + 1;
                    return server.windows.concat([server.serverWindow]);
                }
                _ref3 = server.windows;
                for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
                    candidate = _ref3[i];
                    if (candidate.target === win.target) {
                        server.windows.splice(i, 1);
                        this.length--;
                        return [candidate];
                    }
                }
            }
        }
        return [];
    }

    /**
     * Given a window, returns its corresponding server window.
     * @param {Window} win
     * @return {Window|undefined} The server window.
     */
    getServerForWindow(win) {
        var server, _i, _len, _ref1, _ref2;
        if (win.isServerWindow()) {
            return win;
        }
        _ref1 = this._servers;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            server = _ref1[_i];
            if (server.name === ((_ref2 = win.conn) != null ? _ref2.name : void 0)) {
                return server.serverWindow;
            }
        }
        return void 0;
    }

    indexOf(win) {
        var candidate, count, i, server, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
        if (((_ref1 = win.conn) != null ? _ref1.name : void 0) == null) {
            return -1;
        }
        count = 0;
        _ref2 = this._servers;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            server = _ref2[_i];
            if (win.conn.name === server.name) {
                if (win.target == null) {
                    return count;
                }
                count++;
                _ref3 = server.windows;
                for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
                    candidate = _ref3[i];
                    if (candidate.equals(win)) {
                        return count + i;
                    }
                }
                return -1;
            } else {
                count += server.windows.length + 1;
            }
        }
        return -1;
    }
    /**
     * Return the index of a channel relative to other channels of the same server.
     */
    localIndexOf(win) {
        var candidate, i, server, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
        if (((_ref1 = win.conn) != null ? _ref1.name : void 0) == null) {
            return -1;
        }
        _ref2 = this._servers;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            server = _ref2[_i];
            if (win.conn.name !== server.name) {
                continue;
            }
            _ref3 = server.windows;
            for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
                candidate = _ref3[i];
                if (candidate.equals(win)) {
                    return i;
                }
            }
        }
        return -1;
    }
    /**
     * Returns the index of a server relative to other servers.
     */
    serverIndexOf(win) {
        var i, server, _i, _len, _ref1, _ref2;
        if (((_ref1 = win.conn) != null ? _ref1.name : void 0) == null) {
            return -1;
        }
        _ref2 = this._servers;
        for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
            server = _ref2[i];
            if (win.conn.name === server.name) {
                return i;
            }
        }
        return -1;
    }
}
