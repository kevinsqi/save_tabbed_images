import chrome from 'chrome';

// Reference on detecting MIME type:
// http://stackoverflow.com/a/21042958/341512

const tabsWithImages = {};

const imageMimeTypes = {
  'image/jpeg': true,
  'image/png':  true,
  'image/gif':  true,
  'image/webp': true
};

const imageExtensions = {
  'jpg':  true,
  'jpeg': true,
  'png':  true,
  'gif':  true,
  'webp': true
};

// Track which tabs are images based on MIME type
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId !== -1) {
      const headerValue = getContentTypeHeader(details.responseHeaders);

      // If false, we know tab is not an image, and skip fallback check.
      tabsWithImages[details.tabId] = imageMimeTypes[headerValue] || false;
    }
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame'],
  },
  ['responseHeaders']
);

function getContentTypeHeader(headers) {
  let contentTypeHeader;
  let contentTypeHeaderValue;

  for (let i = 0; i < headers.length; ++i) {
    const header = headers[i];
    if (header.name.toLowerCase() === 'content-type') {
      contentTypeHeader = header;
      break;
    }
  }

  // If header is set, use its value. Otherwise, use undefined.
  contentTypeHeaderValue = contentTypeHeader && contentTypeHeader.value.toLowerCase().split(';', 1)[0];

  return contentTypeHeaderValue;
}

// Given array of tabs, return URLs of those which are images
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.type === 'checktabs') {
      const tabsToReturn = [];
      const tabs = request.tabs;
      let match;
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabObj = { id: tab.id, url: tab.url };
        if (tabsWithImages[tab.id] === true) {
          tabsToReturn.push(tabObj);
        } else if (tabsWithImages[tab.id] === false) {
          // Tab is not an image, do nothing.
        } else if (match = tab.url.match(/.+\.([^?]+)(\?|$)/)) {  // regex captures the URL's file extension
          // If we didn't get it from MIME checking (i.e. if extension had been disabled or just installed), check the file extension as a fallback.
          // Can create false positives, but better than overlooking files.
          const ext = match[1].toLowerCase();
          if (imageExtensions[ext]) {
            tabsToReturn.push(tabObj);
          }
        }
      }
      sendResponse({ tabs: tabsToReturn });
    }
  }
);
