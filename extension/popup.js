// Globals
var tabDownloadStatuses = {};

function pluralize(count, str) {
  if (count === 1) {
    return count + ' ' + str;
  } else {
    return count + ' ' + str + 's';
  }
}

function getTabsWithImages(callback) {
  chrome.tabs.query(
    {currentWindow: true},
    function(tabs) {
      // Query background process for which tabs are images
      chrome.runtime.sendMessage({type: "checktabs", tabs: tabs}, function(response) {
        callback(response.tabs);
      });
    }
  );
}

// List image URLs in popup
function showImageUrls() {
  getTabsWithImages(function(tabs) {
    // Add URLs to list
    var links = $('#links');
    for (var i = 0; i < tabs.length; i++) {
      var url = tabs[i].url;
      var link = $('<a></a>').text(url).prop('href', url);
      var listItem = $('<li></li>').append(link);
      links.append(listItem);
    }

    // Customize controls
    var message = $('#message');
    if (tabs.length > 0) {
      $('#download').text('Download ' + pluralize(tabs.length, "image"));
      message.text("Image list:");
    } else {
      // No images are loaded
      message.text("No images opened as tabs in current window.");
      $('#download').hide();
      $('#dismiss').show();
    }
  });
}

function downloadImageUrls() {
  $('#download').prop('disabled', true);
  $('#close-tabs').prop('disabled', true).show();


  getTabsWithImages(function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      var tabId = tabs[i].id;
      tabDownloadStatuses[tabId] = null;
    }

    for (var i = 0; i < tabs.length; i++) {
      (function() {
        var url = tabs[i].url;
        var tabId = tabs[i].id;

        chrome.downloads.download({
            url: url,
            conflictAction: "uniquify" // TODO add user-editable setting for what conflict action to use
          }, function(id) {
            if (id) {
              // Download successful
              $('#links li a[href="' + url + '"]').parent().addClass('done');
              updateTabDownloadStatus(tabId, true);
            } else {
              // Download failed
              $('#links li a[href="' + url + '"]').parent().addClass('error');
              updateTabDownloadStatus(tabId, false);
            }
          }
        );
      })();
    }
  });
}

function closePopup() {
  window.close();
}

function closeDownloadedTabs() {
  var tabIds = [];
  for (var id in tabDownloadStatuses) {
    if (tabDownloadStatuses.hasOwnProperty(id)) {
      if (tabDownloadStatuses[id] === true) {
        tabIds.push(parseInt(id));
      }
    }
  }
  chrome.tabs.remove(tabIds);
  closePopup();
}

function updateTabDownloadStatus(tabId, success) {
  tabDownloadStatuses[tabId] = success;

  var allDownloaded = true;
  for (var id in tabDownloadStatuses) {
    if (tabDownloadStatuses.hasOwnProperty(id)) {
      if (tabDownloadStatuses[id] !== true) {
        allDownloaded = false;
        break;
      }
    }
  }

  // Show close downloaded button when all images are downloaded successfully
  if (allDownloaded) {
    $('#close-tabs').prop('disabled', false);
  }
}

// TODO domready?
window.onload = function() {
  var folderName = "SaveTabbedImages_" + moment().format('YYYY-MM-DD');

  chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    // Note that this will create separate folders if the downloads cross over different days
    suggest({
      filename: folderName + "/" + downloadItem.filename
    });
  });

  showImageUrls();

  $('#download').click(downloadImageUrls);
  $('#dismiss').click(closePopup);
  $('#close-tabs').click(closeDownloadedTabs);
};
