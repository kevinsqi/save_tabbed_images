import chrome from 'chrome';

export function getTabsWithImages(callback) {
  chrome.tabs.query(
    { currentWindow: true },
    function(tabs) {
      // Query background process for which tabs are images
      chrome.runtime.sendMessage({ type: 'checktabs', tabs: tabs }, function(response) {
        callback(response.tabs);
      });
    }
  );
}
