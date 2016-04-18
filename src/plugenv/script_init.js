import ENV from "./script_environment";

const onInitMessage = function initMessageCallback(e) {
    if (!(e.data.type === "source_code" && (e.data.sourceCode != null))) {
        return;
    }
    removeEventListener("message", onInitMessage);
    (new Function(e.data.sourceCode)).call(ENV);
};

addEventListener("message", onInitMessage);
addEventListener("message", function (e) {
    if (typeof ENV.onMessage === "function") {
        return ENV.onMessage(e.data);
    }
});

window.parent.postMessage({
    type: "onload"
}, "*");

