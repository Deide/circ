const SCRIPT = this;

SCRIPT.setName("/dance");
SCRIPT.setDescription("Type /dance have a Kirby dance");

SCRIPT.send("hook_command", "dance");

const dance = "(>'-')> <('-'<) ^(' - ')^ <('-'<) (>'-')>";
this.onMessage = function (e) {
    SCRIPT.send(e.context, "command", "say", dance);
    SCRIPT.propagate(e, "none");
};
