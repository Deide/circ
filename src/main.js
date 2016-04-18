import Chat from "./chat/chat";
import UserInputHandler from "./input/user_input_handler";
import ScriptHandler from "./script/script_handler";

(function () {
    "use strict";
    var chat, scriptHandler, userInput;
    userInput = new UserInputHandler($("#input"), $(window));
    scriptHandler = new ScriptHandler;
    chat = new Chat;

    userInput.setContext(chat);
    userInput.setKeyboardShortcuts(chat.getKeyboardShortcuts());

    scriptHandler.addEventsFrom(chat);
    scriptHandler.addEventsFrom(userInput);

    chat.listenToCommands(scriptHandler);
    chat.listenToScriptEvents(scriptHandler);
    chat.listenToIRCEvents(scriptHandler);
    chat.init();

}).call(this);
