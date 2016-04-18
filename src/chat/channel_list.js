import EventEmitter from "../utils/event_emitter";
import HTMLList from "./html_list";

/**
 * A list of servers and channels to which the user is connected.
 */
export default class ChannelList extends EventEmitter {
    constructor() {
        super();
        this._handleClick = this._handleClick.bind(this);
        this._handleMiddleClick = this._handleMiddleClick.bind(this);
        this.$surface = $("#rooms-container .rooms");
        this.roomsByServer = {};
        this._addFooter();
    }

    _addFooter() {
        this._footerHtml = this._createAndAppendServerHTML("+ add server");
        var serverRoomHtml = $(".server", this._footerHtml);
        serverRoomHtml.addClass("footer");
        serverRoomHtml.mousedown(event => {
            if (event.which == 1) {
                this._handleAddServerClick();
            }
        });
    }

    select(server, channel) {
        this._removeLastSelected();
        this._addClass(server, channel, "selected");
        this._addClass(server, null, "current-server");
        this._removeClass(server, channel, "activity");
        return this._removeClass(server, channel, "mention");
    }

    _removeLastSelected() {
        this.removeFirstInstanceOfClass("selected");
        this.removeFirstInstanceOfClass("current-server");
    }

    removeFirstInstanceOfClass(cssClass) {
        var elementWithClass = $(`.${cssClass}`, this.$surface);
        if (elementWithClass) {
            elementWithClass.removeClass(cssClass);
        }
    }

    activity(server, opt_channel) {
        return this._addClass(server, opt_channel, "activity");
    }

    mention(server, opt_channel) {
        return this._addClass(server, opt_channel, "mention");
    }

    remove(server, opt_channel) {
        if (opt_channel != null) {
            return this.roomsByServer[server].channels.remove(opt_channel);
        } else {
            this.roomsByServer[server].html.remove();
            return delete this.roomsByServer[server];
        }
    }

    insertChannel(i, server, channel) {
        this.roomsByServer[server].channels.insert(i, channel);
        return this.disconnect(server, channel);
    }

    /**
     * Adds a server that will never have any channels, e.g. when we add the
     * welcome window.
     */
    addAlwaysEmptyServer(serverName) {
        this.addServer(serverName);
        this._addClass(serverName, null, "always-empty");
    }

    addServer(serverName) {
        var channels, html, server;
        html = this._createAndAppendServerHTML(serverName);
        server = $(".server", html);
        channels = this._createChannelList(html);
        this._handleMouseEvents(serverName, server, channels);
        this.roomsByServer[serverName.toLowerCase()] = {
            html: html,
            server: server,
            channels: channels
        };
        return this.disconnect(serverName);
    }

    _createAndAppendServerHTML(serverName) {
        var html;
        html = $("#templates .server-channels").clone();
        $(".server .content-item", html).text(serverName);
        if (this._footerHtml) {
            html.insertBefore(this._footerHtml);
        } else {
            this.$surface.append(html);
        }
        return html;
    }

    _createChannelList(html) {
        var channelList, channelTemplate;
        channelTemplate = $("#templates .channel");
        channelList = new HTMLList($(".channels", html), channelTemplate);
        channelList.setFooterNodeText("+ add channel");
        return channelList;
    }

    _handleMouseEvents(serverName, server, channels) {
        server.mousedown(event => {
            if (event.which == 1) {
                if ($(event.target).hasClass("remove-button")) {
                    this._handleRemoveRoom(serverName);
                } else {
                    this._handleClick(serverName);
                }
            }
        });
        channels.on("clicked", channelName => this._handleClick(serverName, channelName));
        channels.on("midclicked", channelName => this._handleMiddleClick(serverName, channelName));
        channels.on("footer_clicked", () => this._handleAddChannelClick());
        channels.on("remove_button_clicked", channelName => this._handleRemoveRoom(serverName, channelName));
    }

    disconnect(server, opt_channel) {
        return this._addClass(server, opt_channel, "disconnected");
    }

    connect(server, opt_channel) {
        return this._removeClass(server, opt_channel, "disconnected");
    }

    _addClass(server, channel, c) {
        if (channel != null) {
            return this.roomsByServer[server].channels.addClass(channel.toLowerCase(), c);
        } else {
            return this.roomsByServer[server].server.addClass(c);
        }
    }

    _removeClass(server, channel, c) {
        if (channel != null) {
            return this.roomsByServer[server].channels.removeClass(channel.toLowerCase(), c);
        } else {
            return this.roomsByServer[server].server.removeClass(c);
        }
    }

    _handleClick(server, channel) {
        return this.emit("clicked", server, channel);
    }

    _handleMiddleClick(server, channel) {
        return this.emit("midclicked", server, channel);
    }

    _handleAddChannelClick() {
        this.emit("help_type_command", "/join #");
    }

    _handleAddServerClick() {
        this.emit("help_type_command", "/server ");
    }

    _handleRemoveRoom(server, channel) {
        this.emit("remove_button_clicked", server, channel);
    }
}

