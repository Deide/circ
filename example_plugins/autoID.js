const SCRIPT = this;
SCRIPT.setName("autoID");
SCRIPT.setDescription("hides NickServ password and automatically identifies on startup");

SCRIPT.send("hook_message", "privmsg");
SCRIPT.loadFromStorage();

// Keeps track of the last NickServ password used in each server.
const serverPasswords = {};

SCRIPT.onMessage = function (e) {
    if (e.type == "system" && e.name == "loaded" && e.args[0]) {
        console.log("[AutoID] => Updating passwords...");
        updatePasswords(e.args[0]);
    }
    else if (e.type == "message" && e.name == "privmsg")
        handlePrivateMessage(e);
    else
        SCRIPT.propagate(e);
};

const handlePrivateMessage = function (event) {
    var source = event.args[0],
        message = event.args[1];
    if (source.toLowerCase() !== "nickserv") {
        SCRIPT.propagate(event);
    } else if (shouldAutoIdentify(event.context, message)) {
        console.log("[AutoID] => Auto Identifying...");
        SCRIPT.propagate(event);
        autoIdentify(event.context, message);
    } else if (nickServPasswordIsVisible(message)) {
        console.log("[AutoID] => Registering nickserv password...");
        SCRIPT.propagate(event, "none");
        snoopPassword(event.context, message);
        hideNickServPassword(event);
    } else {
        SCRIPT.propagate(event);
    }
};

const shouldAutoIdentify = function (context, message) {
    return message.indexOf("nickname is registered") >= 0 &&
        serverPasswords[context.server];
};

const autoIdentify = function (context) {
    var pw = serverPasswords[context.server];
    SCRIPT.send(context, "message", "notice", "Automatically identifying nickname with NickServ...");
    SCRIPT.send(context, "command", "raw", "PRIVMSG", "NickServ", "\"identify", pw + "\"");
};

const nickServPasswordIsVisible = function (message) {
    var words = message.split(" "),
        cmd = words[0].toLowerCase();

    return words.length === 2 && (cmd === "identify" || cmd === "id");
};

const snoopPassword = function (context, message) {
    var password = message.split(" ")[1];
    serverPasswords[context.server] = password;
    SCRIPT.saveToStorage(serverPasswords);
};

const hideNickServPassword = function (event) {
    var words = event.args[1].split(" ");
    words[1] = getHiddenPasswordText(words[1].length);
    event.args[1] = words.join(" ");
    SCRIPT.sendEvent(event);
};

const getHiddenPasswordText = function (length) {
    // Is this necessary?
    let hiddenPasswordText = "";
    for (let i = 0; i < length; i++) {
        hiddenPasswordText += "*";
    }
    return hiddenPasswordText;
};

const updatePasswords = function (loadedPasswords) {
    for (var server in loadedPasswords) {
        if (!serverPasswords[server]) {
            serverPasswords[server] = loadedPasswords[server];
        }
    }
};