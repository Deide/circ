import HTMLList from "./html_list";

// TODO sort first by op status, then name
export default class NickList extends HTMLList {
    constructor(surface) {
        super(surface, $("#templates .nick"));

    }
    add(nick) {
        return this.insert(this._getClosestIndex(nick), nick);
    }

    _getClosestIndex(nick) {
        nick = nick.toLowerCase();
        for (let i = 0, l = this.nodeNames.length; i < l; ++i) {
            let name = this.nodeNames[i];
            if (name.toLowerCase() > nick) {
                return i;
            }
        }
        return this.nodeNames.length;
    }
}
