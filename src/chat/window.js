import EventEmitter from "../utils/event_emitter";
import NotificationGroup from "./notification_group";
import MessageRenderer from "./window_message_renderer";
import Context from "./context";
import Scrollable from "./scrollable";
import NickList from "./nick_list";

/**
 * A window for a specific IRC channel.
 */
export default class Window extends EventEmitter {
    constructor(server, opt_channel) {
        super();
        this._onBlur = this._onBlur.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this.name = server + (opt_channel ? " " + opt_channel : "");
        this.messageRenderer = new MessageRenderer(this);
        this._addUI();
        this.notifications = new NotificationGroup(opt_channel);
        this._isVisible = false;
        this._isFocused = false;
        this._height = 0;
        this._private = false;

        $(window).focus(this._onFocus);
        $(window).blur(this._onBlur);

        var dragging;
        $(".dragbar").mousedown(e => {
            e.preventDefault();
            dragging = true;
            var main = $("#messages-and-input");
            var ghostbar = $("<div>", {
                id: "ghostbar",
                css: {
                    height: main.outerHeight(),
                    top: main.offset().top,
                    left: main.offset().left - 4
                }
            }).appendTo("body");
            $(document).mousemove(e => {
                ghostbar.css("left", e.pageX);
            });
        });

        $(document).mouseup(e => {
            if (dragging) {
                $("#rooms-and-nicks").css("width", e.pageX);
                $("#ghostbar").remove();
                $(document).unbind("mousemove");
                dragging = false;
            }
        });
    }

    getContext() {
        if (this._context == null)
            this._context = new Context(this.conn != null ? this.conn.name : void 0, this.target);

        return this._context;
    }

    _onFocus() {
        if (!this._isVisible)
            return;

        this._isFocused = true;
        this.notifications.clear();
        return this.messageRenderer.onFocus();
    }

    _onBlur() {
        return this._isFocused = false;
    }

    isFocused() {
        return this._isFocused && this._isVisible;
    }

    _addUI() {
        this._addMessageUI();
        this._addNickUI();
        return this.$roomsAndNicks = $("#rooms-and-nicks");
    }

    _addMessageUI() {
        this.$messagesContainer = (new Scrollable($("#messages-container"))).node();
        return this.$messages = $("#templates .messages").clone();
    }

    _addNickUI() {
        this.$nicksContainer = $("#nicks-container");
        this.$nicks = $("#templates .nicks").clone();
        return this.nicks = new NickList(this.$nicks);
    }

    /**
     * Sets the window's channel.
     * @param {string} target
     */
    setTarget(target) {
        this.target = target;
        if (this.isPrivate()) {
            return;
        }
        return this.$roomsAndNicks.removeClass("no-nicks");
    }

    isServerWindow() {
        return !this.target;
    }

    equals(win) {
        return this.name === win.name;
    }

    /**
     * Marks the window as private.
     * Private windows are used for direct messages from /msg.
     */
    makePrivate() {
        return this._private = true;
    }

    isPrivate() {
        return this._private;
    }

    detach() {
        this.$roomsAndNicks.addClass("no-nicks");
        this.$messages.detach();
        this.$nicks.detach();
        return this._isVisible = false;
    }

    remove() {
        this.detach();
        this.$messages.remove();
        return this.$nicks.remove();
    }

    attach() {
        this._isVisible = true;
        this._onFocus();
        if (this.target && !this.isPrivate()) {
            this.$roomsAndNicks.removeClass("no-nicks");
        }
        this.$messagesContainer.append(this.$messages);
        this.$nicksContainer.append(this.$nicks);
        return this.$messagesContainer.restoreScrollPosition();
    }
    /**
     * @param  {any} from
     * @param  {any} msg
     * @param  {any} ...style
     */
    message(...args) {
        return this.messageRenderer.message(...args);
    }

    /**
     * Display a raw html to the user.
     * This is useful for scripts to embed images or video.
     */
    rawMessage(from, node, ...style) {
        return this.messageRenderer.rawMessage(from, node, style.join(" "));
    }

    /**
     * Append raw html to the message list.
     * This is useful for adding a large number of messages quickly, such as
     * loading chat history.
     */
    rawHTML(html) {
        this.$messages.html(this.$messages.html() + html);
        return this.$messagesContainer.restoreScrollPosition();
    }

    clear() {
        return this.$messages.html("");
    }
}
