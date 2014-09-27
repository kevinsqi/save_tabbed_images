var tabsWithImages = {};

var imageMimeTypes = {
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
	"image/tiff": true
};

// Track which tabs are images based on MIME type
chrome.webRequest.onHeadersReceived.addListener(function(details) {
	if (details.tabId !== -1) {
		var header = getHeaderByName(details.responseHeaders, 'content-type');

		// If header is set, use its value. Otherwise, use undefined.
		var headerValue = header && header.value.split(';', 1)[0];

		// Store 
		if (imageMimeTypes[headerValue]) {
			tabsWithImages[details.tabId] = true;
		}
	}
}, {
	urls: ['*://*/*'],
	types: ['main_frame']
}, ['responseHeaders']);

function getHeaderByName(headers, name) {
    for (var i = 0; i < headers.length; ++i) {
        var header = headers[i];
        if (header.name.toLowerCase() === name) {
            return header;
        }
    }
}

// Given array of tabs, return URLs of those which are images
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var urls = [];
		if (request.type === "checktabs") {
			var tabs = request.tabs;
			for (var i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				if (tabsWithImages[tab.id]) {
					urls.push(tab.url);
				}
			}
		}
		sendResponse({urls: urls});
	}
);