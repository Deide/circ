const SCRIPT = this;

SCRIPT.setName("znc_replay");
SCRIPT.setDescription("suspends notifications on znc buffer playback");

SCRIPT.send("hook_message", "privmsg");

var playbackCount = 0;

this.onMessage = function (e) {
    if (e.type == "message" && e.name == "privmsg") {
        let source = e.args[0],
            message = e.args[1];
        if (source == "***") {
            if (message == "Playback Complete.") {
                playbackCount--;
                if (playbackCount == 0) {
                    // send command to resume notifications.
                    SCRIPT.send(e.context, "command", "suspend-notifications", "off");
                }
                SCRIPT.propagate(e, "none");
                return;
            }

            if (message == "Buffer Playback...") {
                if (playbackCount == 0) {
                    // send command to suspend notifications.
                    SCRIPT.send(e.context, "command", "suspend-notifications", "on");
                }
                playbackCount++;
                SCRIPT.propagate(e, "none");
                return;
            }
        }
    }
    SCRIPT.propagate(e);
};

