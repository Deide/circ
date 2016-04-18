/**
 * Indicates that a dom element can be scrolled and provides scroll utility
 * functions.
 */
export default class Scrollable {
    /**
     * @param {Node} element The jquery DOM element to wrap.
     */
    constructor(node) {
        this._onScroll = this._onScroll.bind(this);

        this._restoreScrollPosition = this._restoreScrollPosition.bind(this);
        this._node = node;
        node.restoreScrollPosition = this._restoreScrollPosition;
        this._scrollPosition = 0;
        this._wasScrolledDown = true;
        $(window).resize(this._restoreScrollPosition);
        $(node).scroll(this._onScroll);
    }

    node() {
        return this._node;
    }

    /**
     * Restore the scroll position to where the user last scrolled. If the node
     *  was scrolled to the bottom it will remain scrolled to the bottom.
     *
     * This is useful for restoring the scroll position after adding content or
     *  resizing the window.
     */
    _restoreScrollPosition() {
        if (this._wasScrolledDown) {
            return this._scrollToBottom();
        }
        else {
            return this._node.scrollTop(this._scrollPosition);
        }
    }

    _scrollToBottom() {
        return this._node.scrollTop(this._getScrollHeight());
    }

    _onScroll() {
        this._wasScrolledDown = this._isScrolledDown();
        return this._scrollPosition = this._node.scrollTop();
    }

    _isScrolledDown() {
        var scrollPosition;
        scrollPosition = this._node.scrollTop() + this._node.height();
        return scrollPosition >= this._getScrollHeight() - Scrollable.SCROLLED_DOWN_BUFFER;
    }

    _getScrollHeight() {
        return this._node[0].scrollHeight;
    }
}
/**
 * The screen will auto scroll as long as the user didn't scroll up more then
 *  this many pixels.
 */
Scrollable.SCROLLED_DOWN_BUFFER = 8;
