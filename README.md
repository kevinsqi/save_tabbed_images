# Chrome Extension - Save Tabbed Images

Download all images opened as tabs in one easy click.



## TODO

High priority:

* When you fill in a subdirectory, make "enter" submit the form 
* Handle invalid path characters (e.g. windows \ / : * ? " < > |), gsub with ''?
  * Test on linux
* Button to close SUCCESSFULLY downloaded tabs immediately after downloading
* Handle download failures - add "retry failed" button
  * Add way to systematically trigger failures
    * Happens for gmail attachments - reports "done" instead of failure, server not found?

Medium priority:

* Nice CSS checkboxes: http://ux.mailchimp.com/patterns/forms

* Optimization - remove additional request?
    * Access
	* Simulate "drag and drop" of image file?
* Add checkbox options to popup
	* Select overwrite setting
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


## Reference

* [Detecting MIME type](http://stackoverflow.com/a/21042958/341512)
