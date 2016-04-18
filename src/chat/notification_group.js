import EventEmitter from "../utils/event_emitter";
import {truncateIfTooLarge} from "../utils/utils";
import Notification from "./notification";

export default class NotificationGroup extends EventEmitter {
    constructor(opt_channel) {
        super();
        this._channel = opt_channel;
        this._size = 0;
        this._notification = null;
        this._stubs = [];
    }

    add(item) {
        var _ref1;
        if ((_ref1 = this._notification) != null) {
            _ref1.cancel();
        }
        this._size++;
        this._createNotification(item);
        return this._notification.show();
    }

    _createNotification(item) {
        var body, title;
        this._addStubIfUnique(item.getStub());
        if (this._size === 1) {
            title = item.getTitle();
            body = item.getBody();
        } else {
            if (this._channel) {
                title = `${this._size} notifications in ${this._channel}`;
            } else {
                title = `${this._size} notifications`;
            }
            body = this._stubs.join(", ");
        }
        body = truncateIfTooLarge(body, 75);
        this._notification = new Notification(title, body);
        return this._addNotificationListeners();
    }

    _addStubIfUnique(stub) {
        if (this._stubs.indexOf(stub) < 0) {
            return this._stubs.push(stub);
        }
    }

    _addNotificationListeners() {
        this._notification.on("clicked", () => this.emit("clicked"));
        return this._notification.on("close", () => this._clear());
    }

    clear() {
        var _ref1;
        if ((_ref1 = this._notification) != null) {
            _ref1.cancel();
        }
        this._size = 0;
        return this._stubs = [];
    }
}
