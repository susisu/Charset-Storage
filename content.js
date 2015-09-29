/*
 * copyright (c) 2015 Susisu
 */
(function () {
    "use strict";

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.action && msg.action === "getCharacterSet") {
            sendResponse(document.characterSet);
        }
    });
})();
