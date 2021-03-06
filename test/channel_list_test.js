import ChannelList from "../chat/channe_list.js";

(function() {
    "use strict";

    describe("A channel list", function() {
        var cl = {};
        var item = function(index) {
            if (index === -1) {
                return items().last();
            }
            return $(items()[index]);
        };
        var items = function() {
            return $("#rooms-container .rooms .room:not(.footer)");
        };
        var footer = function(index) {
            return $($(".footer")[index]);
        };
        var getVisibleFooter = function() {
            return $("#rooms-and-nicks .current-server + .channels .footer");
        };
        var isFooterVisible = function(index) {
            footer(index).removeClass("testing-is-visible");
            getVisibleFooter().addClass("testing-is-visible");
            return footer(index).hasClass("testing-is-visible");
        };
        var mousedown = function(node, which) {
            node.trigger(new MouseEvent("mousedown", {
                "button": (which - 1) // W3C DOM3 value: 0/1/2 = left/middle/right
            }));
        };
        var textOfItem = function(index) {
            return $(".content-item", item(index)).text();
        };
        beforeEach(function() {
            mocks.dom.setUp();
            cl = new ChannelList();
            return spyOn(cl, "emit");
        });
        afterEach(function() {
            return mocks.dom.tearDown();
        });
        it("can have a server item added", function() {
            cl.addServer("freenode");
            return expect(items().length).toBe(1);
        });
        it("displays servers by their name", function() {
            cl.addServer("freenode");
            return expect(textOfItem(0)).toBe("freenode");
        });
        it("can have a channel item inserted", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.insertChannel(0, "freenode", "#awesome");
            expect(items().length).toBe(3);
            return expect(textOfItem(1)).toBe("#awesome");
        });
        it("displays channel items by their channel name", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            return expect(textOfItem(1)).toBe("#bash");
        });
        it("can have a channel item removed", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.remove("freenode", "#bash");
            return expect(items().length).toBe(1);
        });
        it("can have a server item removed", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.remove("freenode");
            return expect(items().length).toBe(0);
        });
        it("shows items as initially disconnected", function() {
            cl.addServer("freenode");
            return expect(item(0)).toHaveClass("disconnected");
        });
        it("shows items as connected on connect()", function() {
            cl.addServer("freenode");
            cl.connect("freenode");
            return expect(item(0)).not.toHaveClass("disconnected");
        });
        it("supports multiple servers and channels", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.insertChannel(1, "freenode", "#awesome");
            cl.addServer("dalnet");
            cl.insertChannel(0, "dalnet", "#cool");
            return expect(items().length).toBe(5);
        });
        it("can mark an item as selected", function() {
            cl.addServer("freenode");
            cl.select("freenode");
            return expect(item(0)).toHaveClass("selected");
        });
        it("can have only one item selected at a time", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.select("freenode");
            cl.select("freenode", "#bash");
            expect(item(0)).not.toHaveClass("selected");
            return expect(item(1)).toHaveClass("selected");
        });
        it("can mark an item as having activity", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.activity("freenode", "#bash");
            return expect(item(1)).toHaveClass("activity");
        });
        it("can mark an item as having a nick mention", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.mention("freenode", "#bash");
            return expect(item(1)).toHaveClass("mention");
        });
        it("can mark an item as having a nick mention and activity", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.mention("freenode", "#bash");
            cl.activity("freenode", "#bash");
            expect(item(1)).toHaveClass("mention");
            return expect(item(1)).toHaveClass("activity");
        });
        it("selecting a channel clears activity and mention", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            cl.mention("freenode", "#bash");
            cl.activity("freenode", "#bash");
            cl.select("freenode", "#bash");
            expect(item(1)).toHaveClass("selected");
            expect(item(1)).not.toHaveClass("mention");
            return expect(item(1)).not.toHaveClass("activity");
        });
        it("emits a midclicked event when a channel is clicked with the middle button", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            mousedown(item(1), 2);
            return expect(cl.emit).toHaveBeenCalledWith("midclicked", "freenode", "#bash");
        });
        it("does not emit an event when a channel is clicked with the right button", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            mousedown(item(1), 3);
            return expect(cl.emit).not.toHaveBeenCalled();
        });
        it("emits a clicked event when a channel is clicked", function() {
            cl.addServer("freenode");
            cl.insertChannel(0, "freenode", "#bash");
            mousedown(item(1), 1);
            return expect(cl.emit).toHaveBeenCalledWith("clicked", "freenode", "#bash");
        });
        it("emits a clicked event when a server is clicked", function() {
            cl.addServer("freenode");
            mousedown(item(0), 1);
            return expect(cl.emit).toHaveBeenCalledWith("clicked", "freenode", void 0);
        });
        it("displays '<add channel>' when the current server is selected", function() {
            cl.addServer("freenode");
            cl.addServer("dalnet");
            cl.select("freenode");
            expect(isFooterVisible(0)).toBe(true);
            expect(isFooterVisible(1)).toBe(false);
            cl.select("dalnet");
            expect(isFooterVisible(0)).toBe(false);
            expect(isFooterVisible(1)).toBe(true);
        });
    });

}).call(this);
