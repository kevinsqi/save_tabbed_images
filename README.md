# Chrome Extension - Save Tabbed Images

Download all images opened as tabs in one easy click.


## Development

[Link to extension admin](https://chrome.google.com/webstore/developer/edit/hhcoikfhkkadkgklepjkfgafmjoggefh)

## Reference

* [Detecting MIME type](http://stackoverflow.com/a/21042958/341512)

## TODO

* Allow specifying custom subdirectory of downloads folder via chrome.downloads.download "filename" option
* Select overwrite setting

* Handle cases when files' extension isn't labeled, but is still an image file (MIME)

* Add option to "close downloaded tabs" after download

* Better feedback after clicking "download" - say where the files are downloaded to (i.e. chrome.downloads.showDefaultFolder())
* Add number of current windows with images to icon

* Standardize img extensions, iterate dynamically
* Rewrite using jquery
	* Remove jquery dependency for something lighter?
* Option to only download from current window (default), or all windows?
