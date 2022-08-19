import chrome from 'chrome';

export function getContentTypeHeader(headers) {
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

export function getTabsWithMedia(callback) {
  chrome.tabs.query(
    { currentWindow: true },
    (tabs) => {
      // Query background process for which tabs are images/video
      chrome.runtime.sendMessage({ type: 'checktabs', tabs: tabs }, (response) => {
        callback(response.tabs);
      });
    }
  );
}
