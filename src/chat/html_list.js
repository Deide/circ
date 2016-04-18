import EventEmitter from "../utils/event_emitter";
import {getLogger, removeFromArray} from "../utils/utils";

/**
 * A list of elements that can be manipulated, keyed by case-insensitive strings.
 */
export default class HTMLList extends EventEmitter {
    constructor($list, $template) {
        super();
        this.$list = $list;
        this.$template = $template;
        this.nodes = {};
        this.nodeNames = [];
        this._addFooterNode();
        this._log = getLogger(this);
    }

    _addFooterNode() {
        this._footerNode = this._createNode("footer");
        this.$list.append(this._footerNode.html);
        this._footerNode.html.addClass("footer");
    }

    // Sets the text of the footer node, e.g. '<add channel>' or '<add server>'.
    setFooterNodeText(text) {
        this._footerNode.content.text(text);
    }

    add(name) {
        return this.insert(this.nodeNames.length, name);
    }

    insert(index, name) {
        var key = name.toLowerCase();
        if (key in this.nodes) {
            return;
        }
        if (index < 0 || index > this.nodeNames.length) {
            throw "invalid index: " + index + "/" + this.nodeNames.length;
        }
        var newNode = this._createNode(name);
        this._insertHTML(index, newNode);
        this.nodes[key] = newNode;
        return this.nodeNames.splice(index, 0, name);
    }

    _insertHTML(index, newNode) {
        var nextNode = this.get(index) || this._footerNode;
        this._log("adding", newNode, "at", index, "with next node", nextNode);
        newNode.html.insertBefore(nextNode.html);
    }

    get(index) {
        var key = this.nodeNames[index];
        if (key) {
            key = key.toLowerCase();
            return this.nodes[key];
        }
        return false;
    }

    getPrevious(nodeName) {
        var i = this.nodeNames.indexOf(nodeName);
        return this.nodeNames[i - 1];
    }

    getNext(nodeName) {
        var i = this.nodeNames.indexOf(nodeName);
        return this.nodeNames[i + 1];
    }

    remove(name) {
        var key = name.toLowerCase(),
            node = this.nodes[key];
        if (node) {
            node.html.remove();
            delete this.nodes[key];
            return removeFromArray(this.nodeNames, key);
        }
    }

    clear() {
        this.nodes = {};
        this.nodeNames = [];
        this.$list.find("li:not(.footer)").remove();
    }

    addClass(name, c) {
        var _ref1;
        return (_ref1 = this.nodes[name]) != null ? _ref1.html.addClass(c) : void 0;
    }

    removeClass(name, c) {
        var _ref1;
        return (_ref1 = this.nodes[name]) != null ? _ref1.html.removeClass(c) : void 0;
    }

    hasClass(nodeName, c) {
        var _ref1;
        return (_ref1 = this.nodes[nodeName]) != null ? _ref1.html.hasClass(c) : void 0;
    }

    rename(name, text) {
        var _ref1;
        return (_ref1 = this.nodes[name]) != null ? _ref1.content.text(text) : void 0;
    }

    _createNode(name) {
        var node = {
            html: this._htmlify(name),
            name: name
        };
        node.content = $(".content-item", node.html);
        node.html.mousedown(event => {
            switch (event.which) {
            case 1:
                if ($(event.target).hasClass("remove-button")) {
                    this._emitClickEvent(node, "remove_button_clicked");
                } else {
                    this._handleClick(node);
                }
                break;
            case 2:
                return this._handleMiddleClick(node);
            // case 3: // not handling right-clicks
            }
        });
        node.html.dblclick(event => {
            if (event.which == 1) {
                return this._handleDoubleClick(node);
            }
        });
        return node;
    }

    _handleClick(node) {
        this._emitClickEvent(node, "clicked");
    }

    _handleMiddleClick(node) {
        this._emitClickEvent(node, "midclicked");
    }

    _handleDoubleClick(node) {
        this._emitClickEvent(node, "dblclicked");
    }

    _emitClickEvent(node, eventName) {
        var emitType;
        if (node == this._footerNode) {
            emitType = `footer_${eventName}`;
        } else {
            emitType = eventName;
        }
        this.emit(emitType, node.name);
    }

    _htmlify(name) {
        var html = this.$template.clone();
        $(".content-item", html).text(name);
        return html;
    }
}
