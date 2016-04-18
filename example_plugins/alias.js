const SCRIPT = this;

SCRIPT.setName("/alias");
SCRIPT.setDescription("Adds the '/alias' command to create command aliases (which can only call 'real' commands, not other aliases)");

SCRIPT.loadFromStorage();
SCRIPT.send("hook_command", "alias");

var aliases = {
    // some examples, comment or modify to your liking
    "n": ["names"],
    "j": ["join"],
    "i": ["msg", "nickserv", "identify", "hunter2"]
};

for (var a in aliases) {
    SCRIPT.send("hook_command", a);
}


var updateAliases = function (loadedAliases) {
    for (var a in loadedAliases) {
        aliases[a] = loadedAliases[a];
        SCRIPT.send("hook_command", a);
    }
};


var listAliases = function (context) {
    if (Object.keys(aliases).length == 0) {
        SCRIPT.send(context, "message", "notice", "No aliases");
    }
    else {
        SCRIPT.send(context, "message", "notice", "Aliases:");
        for (var a in aliases) {
            SCRIPT.send(context, "message", "notice", "/" + a + " = /" + aliases[a].join(" "));
        }
    }
};


var invokeAlias = function (context, alias, additionalArgs) {
    var args = [context, "command"].concat(alias).concat(additionalArgs);
    SCRIPT.send.apply(SCRIPT, args);

};


SCRIPT.onMessage = function (e) {
    if (e.type == "system" && e.name == "loaded" && e.args[0]) {
        updateAliases(e.args[0]);
    }

    else if (e.type == "command" && e.name == "alias") {

        /* "/alias" without args -> list all aliases (if any)*/
        if (e.args.length == 0) {
            listAliases(e.context);
        }

        /* "/alias somealias [...]" -> add/replace or delete alias */
        else {
            /* remove slashes in front of `somealias` */
            e.args[0] = e.args[0].replace(/^\/+/, "");

            /* "/alias somealias" without args -> delete */
            if (e.args.length == 1) {
                delete aliases[e.args[0]];
                SCRIPT.saveToStorage(aliases);
            }

            /* "/alias somealias somecommand [someargs]" -> add/replace */
            else {
                /* remove slashes in front of `somecommand` */
                e.args[1] = e.args[1].replace(/^\/+/, "");
                var args = e.args;
                var a = args.shift();
                aliases[a] = args;
                SCRIPT.send("hook_command", a);
                SCRIPT.saveToStorage(aliases);
            }
        }
    }

    /* invoke existing alias */
    else if (e.type == "command" && aliases[e.name]) {
        invokeAlias(e.context, aliases[e.name], e.args);
    }
    SCRIPT.propagate(e);
};
