const SCRIPT = this;

SCRIPT.setName("wiki_images");
SCRIPT.setDescription("displays a wikimedia image when one is linked");

SCRIPT.send("hook_message", "privmsg");

const imageRegex = /http:\/\/upload\.wikimedia\.org\/\S+/i;
this.onMessage = function (e) {
    SCRIPT.propagate(e);
    const matches = e.args[1].match(imageRegex);
    if (matches) {
        SCRIPT.send(e.context, "command", "image", matches[0]);
    }
};
