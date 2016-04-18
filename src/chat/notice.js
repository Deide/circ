/**
 * A UI element to inform and/or prompt the user.
 */
export default class Notice {
    constructor() {
        this.$notice = $("#notice");
        this.$content = $("#notice .content");
        this.$close = $("#notice button.close");
        this.$option1 = $("#notice button.option1");
        this.$option2 = $("#notice button.option2");
        this.$close.click(() => this._hide());
    }
    /**
     * Display a message to the user.
     * The prompt representation has the following format:
     *  "message_text [button_1_text] [button_2_text]"
     *
     * @param {string} representation A string representation of the message.
     * @param {...function} callbacks Specifies what function should be called when
     *  an option is clicked.
     */
    prompt(...args) {
        var representation = args[0],
            callbacks = 2 <= args.length ? args.slice(1) : [];
        this._hide();
        this._callbacks = callbacks;
        this._parseRepresentation(representation);
        this.$option1.click(() => {
            var _base;
            this._hide();
            return typeof (_base = this._callbacks)[0] === "function" ? _base[0]() : void 0;
        });
        this.$option2.click(() => {
            var _base;
            this._hide();
            return typeof (_base = this._callbacks)[1] === "function" ? _base[1]() : void 0;
        });
        return this._show();
    }

    close() {
        return this._hide();
    }

    _hide() {
        this.$notice.addClass("hide");
        this.$option1.off("click");
        return this.$option2.off("click");
    }

    _show() {
        this.$notice.removeClass("hide");
    }

    _parseRepresentation(representation) {
        var options;
        this._setMessageText(representation);
        options = representation.match(/\[.+?\]/g);
        this._setOptionText(this.$option1, options != null ? options[0] : void 0);
        return this._setOptionText(this.$option2, options != null ? options[1] : void 0);
    }

    _setMessageText(representation) {
        representation = representation.split("[")[0];
        return this.$content.text($.trim(representation));
    }

    _setOptionText(button, textWithBrackets) {
        var text;
        if (textWithBrackets) {
            text = textWithBrackets.slice(1, +(textWithBrackets.length - 2) + 1 || 9e9);
            button.removeClass("hidden");
            return button.text(text);
        } else if (!button.hasClass("hidden")) {
            return button.addClass("hidden");
        }
    }
}
