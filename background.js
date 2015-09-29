/*
 * copyright (c) 2015 Susisu
 */

(function () {
    "use strict";

    var temp = Object.create(null);

    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "getCharacterSet" }, function (charset) {
            var items = {};
            items[tab.url] = charset;
            chrome.storage.local.set(items);
        });
    });

    chrome.webRequest.onBeforeRequest.addListener(function (details) {
        var url = details.url;
        if (temp[url]) {
            temp[url].counter++;
        }
        else {
            temp[url] = {
                "counter": 1
            };
            // expect this is done when onHeadersReceived fires, but not when the page is first loaded
            chrome.storage.local.get(url, function (results) {
                if (results[url] && temp[url]) {
                    temp[url].charset = results[url];
                }
            });
        }
    }, { "urls": ["<all_urls>"] });

    chrome.webRequest.onHeadersReceived.addListener(function (details) {
        var url = details.url;
        for (var i = 0; i < details.responseHeaders.length; i++) {
            var header = details.responseHeaders[i];
            if (header.name.toLowerCase() === "content-type") {
                if (header.value.toLowerCase().indexOf("text") >= 0 && temp[url]) {
                    if (temp[url].charset) {
                        var charset = temp[url].charset;
                        if (header.value.toLowerCase().indexOf("charset=") >= 0) {
                            header.value = header.value.replace(/charset\=[^\s;]+/, "charset=" + charset)
                        }
                        else {
                            header.value = header.value + "; charset=" + charset;
                        }
                    }
                    temp[url].counter--;
                    if (temp[url].counter < 1) {
                        delete temp[url];
                    }
                }
                break;
            }
        }
        return { "responseHeaders": details.responseHeaders };
    }, { "urls": ["<all_urls>"] }, ["blocking", "responseHeaders"]);
})();
