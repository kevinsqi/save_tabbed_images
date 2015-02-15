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
    var headerValue = getContentTypeHeader(details.responseHeaders);

    // If false, we know tab is not an image, and skip fallback check.
    tabsWithImages[details.tabId] = imageMimeTypes[headerValue] || false;
  }
}, {
  urls: ['*://*/*'],
  types: ['main_frame']
}, ['responseHeaders']);

function getContentTypeHeader(headers) {
  var contentTypeHeader;
  var contentTypeHeaderValue;

  for (var i = 0; i < headers.length; ++i) {
    var header = headers[i].toLowerCase();
    if (header.name === 'content-type') {
      contentTypeHeader = header;
      break;
    }
  }

  // If header is set, use its value. Otherwise, use undefined.
  contentTypeHeaderValue = contentTypeHeader && contentTypeHeader.value.split(';', 1)[0];

  // Normalize case
  if (contentTypeHeaderValue) {
    contentTypeHeaderValue = contentTypeHeaderValue.toLowerCase();
  }

  return contentTypeHeaderValue;
}

// Given array of tabs, return URLs of those which are images
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === "checktabs") {
      var tabsToReturn = [];
      var tabs = request.tabs;
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        var tabObj = {id: tab.id, url: tab.url};
        if (tabsWithImages[tab.id] === true) {
          tabsToReturn.push(tabObj);
        } else if (tabsWithImages[tab.id] === false) {
          // Tab is not an image, do nothing.
        } else if (match = tab.url.match(/.+\.([^?]+)(\?|$)/)) {  // regex captures the URL's file extension
          // If we didn't get it from MIME checking (i.e. if extension had been disabled or just installed), check the file extension as a fallback.
          // Can create false positives, but better than overlooking files.
          var ext = match[1].toLowerCase();
          if (imageExtensions[ext]) {
            tabsToReturn.push(tabObj);
          }
        }
      }
      sendResponse({tabs: tabsToReturn});
    }
  }
);
