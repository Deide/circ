import EventEmitter from "../utils/event_emitter";

/**
 * A wrapper around a webkit notification. Used to display desktop notifications.
 */
export default class Notification extends EventEmitter {
    constructor(title, message, image) {
        super();
        this._title = title;
        this._message = message;
        this._image = image != null ? image : Notification.defaultImage;
        this._createNotification();
        this._addOnClickListener();
        this._addOnCloseListener();
    }

    _createNotification() {
        return this.notification = new window.Notification(this._title,
            {"body": this._message, "icon": this._image});
    }

    _addOnClickListener() {
        return this.notification.onclick = () => {
            this.cancel();
            return this.emit("clicked");
        };
    }

    _addOnCloseListener() {
        return this.notification.onclose = () => this.emit("closed");
    }

    /**
     * Display the notification.
     */
    show() {
        // Notifications are automatically shown.
        chrome.app.window.current().drawAttention();
    }

    /**
     * Close the notification.
     */
    cancel() {
        if (this.notification) this.notification.close();
        chrome.app.window.current().clearAttention();
    }

    /**
     * Used as a hash function for notifications.
     */
    toString() {
        return this._title + this._message;
    }
}
Notification.defaultImage = "http://sourceforge.net/p/acupofjavachat/icon";
