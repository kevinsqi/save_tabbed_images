var React = require('react');
var pluralize = require('pluralize');
var _ = require('underscore');

var PENDING = 'pending';
var COMPLETE = 'complete';

var SaveImageDialog = React.createClass({
  getInitialState: function() {
    return {
      imageTabList: [],
      imageDownloadStatuses: {},
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
  getCompletedTabs: function() {
    return _.compact(_.map(this.state.imageDownloadStatuses, function(status, tabID) {
      return (status === COMPLETE) ? parseInt(tabID, 10) : null;
    }));
  },
  componentDidMount: function() {
    this.getTabsWithImages(function(tabs) {
      this.setState({imageTabList: tabs});
    }.bind(this));
  },
  isDownloading: function() {
    return _.any(
      _.values(this.state.imageDownloadStatuses),
      function(status) { return status === PENDING; }
    );
  },
  isComplete: function() {
    return _.size(this.state.imageDownloadStatuses) > 0 &&
      _.all(
        _.values(this.state.imageDownloadStatuses),
        function(status) { return status === COMPLETE; }
      );
  },
  downloadImages: function() {
    this.getTabsWithImages(function(tabs) {
      var statuses = _.reduce(tabs, function(memo, tab) {
        memo[tab.id] = PENDING;
        return memo;
      }, {});
      this.setState({
        imageDownloadStatuses: statuses
      });

      tabs.forEach(function(tab) {
        chrome.downloads.download(
          {
            url: tab.url,
            conflictAction: 'uniquify'
          },
          function(id) {
            if (id) {
              // Download successful
              var newStatuses = _({}).extend(this.state.imageDownloadStatuses);
              newStatuses[tab.id] = COMPLETE;
              this.setState({
                imageDownloadStatuses: newStatuses
              });
            } else {
              // Download failed
            }
          }.bind(this)
        );
      }.bind(this));
    }.bind(this));
  },
  hasImages: function() {
    return this.imageCount() > 0;
  },
  imageTabListItem: function(tab) {
    return (
      <li key={tab.id} className={this.state.imageDownloadStatuses[tab.id]}>
        <a href={tab.url}>{tab.url}</a>
      </li>
    );
  },
  imageCount: function() {
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
  onClickCloseDownloadedTabs: function() {
    chrome.tabs.remove(this.getCompletedTabs());
    this.onClickDismiss();
  },
  onClickDismiss: function() {
    window.close();
  },
  render: function() {
    var content;
    if (this.hasImages()) {
      content = (
        <div>
          <button id="download" disabled={this.isDownloading()} onClick={this.downloadImages}>
            Download {pluralize('image', this.imageCount(), true)}
          </button>
          {this.downloadOptions()}
          <ul id="links">
            {this.state.imageTabList.map(this.imageTabListItem)}
          </ul>
          {this.isComplete() ? <button id="close-tabs" onClick={this.onClickCloseDownloadedTabs}>Close Downloaded Tabs</button> : null}
        </div>
      );
    } else {
      content = (
        <div>
          <p id="message">No images opened as tabs in current window.</p>
          <button id="dismiss" onClick={this.onClickDismiss}>Close</button>
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

module.exports = SaveImageDialog;
