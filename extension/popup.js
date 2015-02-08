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
			message.text(pluralize(tabs.length, "image") + " in current window:");
			$('#download').text('Download ' + pluralize(tabs.length, "image"));
		} else {
			// No images are loaded
			message.text("No images opened as tabs in current window.");
			$('#download').hide();
			$('#dismiss').show();
		}
	});
}

function downloadImageUrls() {
	$('#download').prop('disabled', 'disabled');
	$('#close-tabs').show();

	getTabsWithImages(function(tabs) {
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
							tabDownloadStatuses[tabId] = true;
						} else {
							// Download failed
							$('#links li a[href="' + url + '"]').parent().addClass('error');
							tabDownloadStatuses[tabId] = false;
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
}

// TODO currently unused
function timestampedFolderName() {
	moment().format('YYYY-MM-DD') + "/"
}

// TODO domready?
window.onload = function() {
	/* TODO - WIP custom subdirectories in Downloads folder

	chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
		// TODO add "foldername/" before downloadItem.filename to add subdirectory.
		// but it doesn't guarantee batching all downloads correctly.
		suggest({
			filename: downloadItem.filename,
		});
	});
	*/

	showImageUrls();

	$('#download').click(downloadImageUrls);
	$('#dismiss').click(closePopup);
	$('#close-tabs').click(closeDownloadedTabs);
};