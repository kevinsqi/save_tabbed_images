var React = require('react');
var pluralize = require('pluralize');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      imageTabList: [],
      isComplete: false,
      isDownloading: false
    };
  },
  getTabsWithImages: function(callback) {
    chrome.tabs.query(
      {currentWindow: true},
      function(tabs) {
        // Query background process for which tabs are images
        chrome.runtime.sendMessage({type: "checktabs", tabs: tabs}, function(response) {
          callback(response.tabs);
        });
      }
    );
  },
  componentDidMount: function() {
    this.getTabsWithImages(function(tabs) {
      this.setState({imageTabList: tabs});
    }.bind(this));
  },
  downloadImages: function() {
    this.setState({isDownloading: true});
    this.getTabsWithImages(function(tabs) {
      tabs.forEach(function(tab) {
        chrome.downloads.download(
          {
            url: tab.url,
            conflictAction: "uniquify"
          },
          function(id) {
            if (id) {
              // Download successful
            } else {
              // Download failed
            }
          }
        );
      }.bind(this));
    });
  },
  hasImages: function() {
    return this.imageCount() > 0;
  },
  imageTabListItem: function(imageTab) {
    return <li><a href={imageTab.url}>{imageTab.url}</a></li>;
  },
  imageCount: function() {
    console.log(this.state.imageTabList);
    return this.state.imageTabList.length;
  },
  downloadOptions: function() {
    return (
      <form id="download-options">
        <ul>
          <li>
            <input id="path-option-default" type="radio" name="path-option" value="default" checked />
            <label htmlFor="path-option-default">Default download location</label>
          </li>
          <li>
            <input id="path-option-custom" type="radio" name="path-option" value="custom" />

            <div className="path-wrapper">
              <label htmlFor="path-option-custom">Subfolder within default location</label>
              <input type="text" name="path" id="path" disabled />
            </div>
          </li>
        </ul>
      </form>
    );
  },
  render: function() {
    var content;
    if (this.hasImages()) {
      content = (
        <div>
          <button id="download" disabled={this.state.isDownloading} onClick={this.downloadImages}>
            Download {pluralize('image', this.imageCount(), true)}
          </button>
          {this.downloadOptions()}
          <ul id="links">
            {this.state.imageTabList.map(this.imageTabListItem)}
          </ul>
          {this.state.isComplete ? <button id="close-tabs">Close Downloaded Tabs</button> : null}
        </div>
      );
    } else {
      content = (
        <div>
          <p id="message">No images opened as tabs in current window.</p>
          <button id="dismiss">Close</button>
        </div>
      );
    }
    return (
      <div className="save-image-dialog">
        {content}
      </div>
    );
  }
});
