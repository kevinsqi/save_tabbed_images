// Globals
var tabDownloadStatuses = {};

function pluralize(count, str) {
  if (count === 1) {
    return count + ' ' + str;
  } else {
    return count + ' ' + str + 's';
  }
}

// http://stackoverflow.com/a/5199982/341512
jQuery.fn.serializeObject = function() {
  var arrayData, objectData;
  arrayData = this.serializeArray();
  objectData = {};

  $.each(arrayData, function() {
    var value;

    if (this.value != null) {
      value = this.value;
    } else {
      value = '';
    }

    if (objectData[this.name] != null) {
      if (!objectData[this.name].push) {
        objectData[this.name] = [objectData[this.name]];
      }

      objectData[this.name].push(value);
    } else {
      objectData[this.name] = value;
    }
  });

  return objectData;
};

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
      message.text('Images to download');
    } else {
      // No images are loaded
      message.text("No images opened as tabs in current window.");
      $('#download').hide();
      $('#download-options').hide();
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

function getDownloadPath() {
  var path = $('#download-options').serializeObject()['path'];
  if (path && path.length > 0) {
    return path + "/";
  } else {
    return "";
  }
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

window.onload = function() {
  // TODO move this to function, why the eff doesn't it work
  var folderName = "SaveTabbedImages-" + moment().format('YYYY-MM-DD');
  $('#path').val(folderName);

  chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    suggest({
      filename: getDownloadPath() + downloadItem.filename
    });
  });

  showImageUrls();

  $('#download-options input:radio').change(function() {
    var disableCustomPath = $('#download-options').serializeObject()['path-option'] !== 'custom';
    $('#path').prop('disabled', disableCustomPath);
  });
  $('#download').click(downloadImageUrls);
  $('#dismiss').click(closePopup);
  $('#close-tabs').click(closeDownloadedTabs);
};