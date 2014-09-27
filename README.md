# Chrome Extension - Save Tabbed Images

Download all images opened as tabs in one easy click.



## Development

[Link to extension admin](https://chrome.google.com/webstore/developer/edit/hhcoikfhkkadkgklepjkfgafmjoggefh)



## Reference

* [Detecting MIME type](http://stackoverflow.com/a/21042958/341512)



## TODO

* Add extension checking back as fallback to MIME, for cases when extension is loaded after tabs are (add to chrome.runtime.onMessage.addListener)

* Options page https://developer.chrome.com/extensions/options
	* Allow specifying custom subdirectory of downloads folder via chrome.downloads.download "filename" option (or automatically creating folder with timestamp)
		* http://stackoverflow.com/questions/22736325/how-can-i-use-chrome-downloads-ondeterminingfilename-to-change-downloaded-file-n
	* Select overwrite setting
	* Add option to "close downloaded tabs" after download (ALSO show immediately after downloading)
	* Option to only download from current window (default), or all windows?

* Better feedback after clicking "download" - say where the files are downloaded to (i.e. chrome.downloads.showDefaultFolder())

* Add number of current windows with images to icon

* Remove jquery dependency for something lighter?
