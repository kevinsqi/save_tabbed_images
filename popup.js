
function getImageUrlsFromTabs() {
	var urls = [];

	chrome.tabs.query(
		{currentWindow: true},
		function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				urls.push(tabs[i].url);
			}
		}
	);

	return urls;
}

function showImageUrlsFromTabs() {
	var linkList = document.getElementById('links');

	
	chrome.tabs.query(
		{	
			currentWindow: true
		},

		// NOTE this is async
		function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				// just for display purposes
				var url  = tabs[i].url;

				// filter to only tabs with image extensions
				if (
						!url.match(new RegExp("https?://.*\.jpg")) &&
						!url.match(new RegExp("https?://.*\.gif")) &&
						!url.match(new RegExp("https?://.*\.png"))) {
					continue;
				}

				var link = document.createElement('li');
				link.innerText = url;
				linkList.appendChild(link);

				// actual download
				chrome.downloads.download({
					url: url,

					// TODO add user-editable setting for what conflict action to use
					conflictAction: "uniquify"
				}, function(id) {});
			}
		}
	);
}

function downloadUrls(urls) {

}

window.onload = function() {
	showImageUrlsFromTabs();
};