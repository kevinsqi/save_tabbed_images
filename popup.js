
function getImageUrlsFromTabs(callback) {
	chrome.tabs.query(
		{currentWindow: true},
		function(tabs) {
			var urls = [];
			for (var i = 0; i < tabs.length; i++) {
				var url = tabs[i].url;

				// TODO add more extensions
				// filter to only tabs with image extensions
				if (
						!url.match(new RegExp("https?://.*\.jpg")) &&
						!url.match(new RegExp("https?://.*\.gif")) &&
						!url.match(new RegExp("https?://.*\.png"))) {
					continue;
				}
				
				urls.push(url);
			}

			callback(urls);
		}
	);
}

function showImageUrls() {
	getImageUrlsFromTabs(function(urls) {
		var linkList = $('#links');
		for (var i = 0; i < urls.length; i++) {
			var url = $('<a></a>').text(urls[i]).prop('href', urls[i]);

			var link = $('<li></li>').append(url);
			linkList.append(link);
		}

		var message = document.getElementById('message');
		if (urls.length > 0) {
			message.innerText = urls.length + " images in current window";
		} else {
			message.innerText = "No images opened in current window. Open images in tabs (.jpg, .png, .gif) in order for this extension to download it.";
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

// TODO domready
window.onload = function() {
	showImageUrls();

	// document.getElementById('download').addEventListener('click', downloadImageUrls);

	$('#download').click(downloadImageUrls);

	$('#dismiss').click(closePopup);
};