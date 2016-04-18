const SCRIPT = this;

SCRIPT.setName("images");
SCRIPT.setDescription("Displays an image when one is linked");

SCRIPT.send("hook_message", "privmsg");
this.onMessage = (function () {
    const imageRegex = /https?:\/\/[\w\d-_\/\.]+\.(png|jpe?g|gif)/i;
    return function (e) {
        SCRIPT.propagate(e);
        const message = e.args[1],
            matches = message.match(imageRegex);
        if (matches)
            SCRIPT.send(e.context, "command", "image", matches[0]);
    };
}());