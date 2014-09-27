var tabsWithImages = {};

var imageMimeTypes = {
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/tiff"
};

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