# Chrome Extension - Save Tabbed Images

Download all images opened as tabs in one easy click.



## Development

[Link to extension admin](https://chrome.google.com/webstore/developer/edit/hhcoikfhkkadkgklepjkfgafmjoggefh)



## Reference

* [Detecting MIME type](http://stackoverflow.com/a/21042958/341512)


## TODO

High priority:

* Button to close SUCCESSFULLY downloaded tabs immediately after downloading
* Handle download failures - add "retry failed" button
  * Add way to systematically trigger failures
    * Happens for gmail attachments - reports "done" instead of failure, server not found?
* Fix issue where not all images are queued for download?
* Use chrome.downloads.download saveAs parameter for file prompt? (how to manage for multiple downloads?)

Medium priority:

* Optimization - remove additional request?
    * Access
	* Simulate "drag and drop" of image file?
* Add checkbox options to popup
	* Allow specifying custom subdirectory of downloads folder via chrome.downloads.download "filename" option (or automatically creating folder with timestamp)
		* http://stackoverflow.com/questions/22736325/how-can-i-use-chrome-downloads-ondeterminingfilename-to-change-downloaded-file-n
	* Select overwrite setting
	* Add option to "close downloaded tabs" after download
	* Option to only download from current window (default), or all windows?


Low priority or unconfirmed:

* Add javascript tests
* Refactoring
  * Switch to using handlebars templating?
  * Use underscore.js
* Make icon colored if there are images available, grey otherwise

* Better feedback after clicking "download" - say where the files are downloaded to (i.e. chrome.downloads.showDefaultFolder())
* JS error in dev tools?
	Missing reference to chrome.tabs.query?
	"Uncaught TypeError: Cannot read property 'query' of undefined"