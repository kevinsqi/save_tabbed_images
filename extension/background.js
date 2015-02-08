var tabsWithImages = {};

var imageMimeTypes = {
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true
};

var imageExtensions = {
	"jpg":  true,
	"jpeg": true,
	"png":  true,
	"gif":  true,
	"webp": true
};

// Track which tabs are images based on MIME type
chrome.webRequest.onHeadersReceived.addListener(function(details) {
	if (details.tabId !== -1) {
		var header = getHeaderByName(details.responseHeaders, 'content-type');

		// If header is set, use its value. Otherwise, use undefined.
		var headerValue = header && header.value.split(';', 1)[0];

		// If false, we know tab is not an image, and skip fallback check.
		tabsWithImages[details.tabId] = imageMimeTypes[headerValue] || false;
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
		if (request.type === "checktabs") {
			var urls = [];
			var tabs = request.tabs;
			for (var i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				if (tabsWithImages[tab.id] === true) {
					urls.push(tab.url);
				} else if (tabsWithImages[tab.id] === false) {
					// Tab is not an image, do nothing.
				} else if (match = tab.url.match(/.+\.([^?]+)(\?|$)/)) {  // regex captures the URL's file extension
					// If we didn't get it from MIME checking (i.e. if extension had been disabled or just installed), check the file extension as a fallback.
					// Can create false positives, but better than overlooking files.
					var ext = match[1].toLowerCase();
					if (imageExtensions[ext]) {
						urls.push(tab.url);
					}
				}
			}
			sendResponse({urls: urls});
		}
	}
);