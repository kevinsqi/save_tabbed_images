import chrome from 'chrome';
import { getContentTypeHeader } from './backgroundHelpers';

// Reference on detecting MIME type:
// https://stackoverflow.com/a/21042958/341512

const tabsWithMedia = {};

// Mime types and file extensions come from here:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

const imageMimeTypes = {
  'image/gif': true,
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
  'video/3gpp': true,
  'video/3gpp2': true,
  'video/mp2t': true,
  'video/mp4': true,
  'video/mpeg': true,
  'video/ogg': true,
  'video/webm': true,
  'video/x-msvideo': true,
};

const mediaExtensions = {
  '3g2': true,
  '3gp': true,
  'avi': true,
  'gif': true,
  'jpeg': true,
  'jpg': true,
  'mkv': true,
  'mp4': true,
  'mpeg': true,
  'ogv': true,
  'png': true,
  'ts': true,
  'webm': true,
  'webp': true
};

// Track which tabs are image/video based on MIME type
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId !== -1) {
      const headerValue = getContentTypeHeader(details.responseHeaders);

      // If false, we know tab is not an image/video, and skip fallback check.
      tabsWithMedia[details.tabId] = imageMimeTypes[headerValue] || false;
    }
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame'],
  },
  ['responseHeaders']
);

// Given array of tabs, return URLs of those which are images/video
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.type === 'checktabs') {
      const tabsToReturn = [];
      const tabs = request.tabs;
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabObj = { id: tab.id, url: tab.url };
        const urlFileExtension = tab.url.match(/.+\.([^?]+)(\?|$)/);  // regex captures extension
        if (tabsWithMedia[tab.id] === true) {
          tabsToReturn.push(tabObj);
        } else if (tabsWithMedia[tab.id] === false) {
          // Tab is not an image or a video, do nothing.
        } else if (urlFileExtension) {
          // If we didn't get it from MIME checking (i.e. if extension had been disabled or just installed), check the file extension as a fallback.
          // Can create false positives, but better than overlooking files.
          const ext = urlFileExtension[1].toLowerCase();
          if (mediaExtensions[ext]) {
            tabsToReturn.push(tabObj);
          }
        }
      }
      sendResponse({ tabs: tabsToReturn });
    }
  }
);
