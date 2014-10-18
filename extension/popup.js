function pluralize(count, str) {
	if (count === 1) {
		return count + ' ' + str;
	} else {
		return count + ' ' + str + 's';
	}
}

function getImageUrlsFromTabs(callback) {
	chrome.tabs.query(
		{currentWindow: true},
		function(tabs) {
			var urls = [];

			// Query background process for which tabs are images
			chrome.runtime.sendMessage({type: "checktabs", tabs: tabs}, function(response) {
				callback(response.urls);
			});
		}
	);
}

// List image URLs in popup
function showImageUrls() {
	getImageUrlsFromTabs(function(urls) {
		// Add URLs to list
		var linkList = $('#links');
		for (var i = 0; i < urls.length; i++) {
			var url = $('<a></a>').text(urls[i]).prop('href', urls[i]);

			var link = $('<li></li>').append(url);
			linkList.append(link);
		}

		var message = document.getElementById('message');
		if (urls.length > 0) {
			message.innerText = pluralize(urls.length, "image") + " in current window:";
		} else {
			// No images are loaded
			message.innerText = "No images opened in current window. Images must be open in tabs to be downloaded.";
			$('#download').hide();
			$('#dismiss').show();
		}
	});
}

function downloadImageUrls() {
	getImageUrlsFromTabs(function(urls) {
		for (var i = 0; i < urls.length; i++) {
			var url = urls[i];

			chrome.downloads.download({
				url: url,

				// TODO add user-editable setting for what conflict action to use
				conflictAction: "uniquify"
			}, function(id) {});
		}
	});
}

function closePopup() {
    window.close();
}

// TODO currently unused
function timestampedFolderName() {
	moment().format('YYYY-MM-DD') + "/"
}

// TODO domready?
window.onload = function() {
	/*
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
};