import React from 'react';
import chrome from 'chrome';
import pluralize from 'pluralize';
import _ from 'underscore';
import moment from 'moment';

const PENDING = 'pending';
const COMPLETE = 'complete';

const SaveImageDialog = React.createClass({
  getInitialState: function() {
    return {
      tabList: [],
      downloadStatuses: {},
      useCustomDownloadLocation: false,
      customDownloadLocation: "SaveTabbedImages-" + moment().format('YYYY-MM-DD')
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
    return _.compact(_.map(this.state.downloadStatuses, function(status, tabID) {
      return (status === COMPLETE) ? parseInt(tabID, 10) : null;
    }));
  },
  getDownloadPath: function() {
    console.log('getDownloadPath', this.state);
    if (this.state.useCustomDownloadLocation) {
      return this.state.customDownloadLocation + "/";
    } else {
      return "";
    }
  },
  componentDidMount: function() {
    // get image list
    this.getTabsWithImages(function(tabs) {
      this.setState({ tabList: tabs });
    }.bind(this));

    // set download location
    chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
      suggest({
        filename: this.getDownloadPath() + downloadItem.filename
      });
    }.bind(this));
  },
  isDownloading: function() {
    return _.any(
      _.values(this.state.downloadStatuses),
      function(status) { return status === PENDING; }
    );
  },
  isComplete: function() {
    return _.size(this.state.downloadStatuses) > 0 &&
      _.all(
        _.values(this.state.downloadStatuses),
        function(status) { return status === COMPLETE; }
      );
  },
  onClickDownload: function() {
    this.getTabsWithImages(function(tabs) {
      var statuses = _.reduce(tabs, function(memo, tab) {
        memo[tab.id] = PENDING;
        return memo;
      }, {});
      this.setState({
        downloadStatuses: statuses
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
              var newStatuses = _({}).extend(this.state.downloadStatuses);
              newStatuses[tab.id] = COMPLETE;
              this.setState({
                downloadStatuses: newStatuses
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
  renderTabListItem: function(tab) {
    return (
      <li key={tab.id} className={this.state.downloadStatuses[tab.id]}>
        <a href={tab.url}>{tab.url}</a>
      </li>
    );
  },
  imageCount: function() {
    return this.state.tabList.length;
  },
  renderDownloadOptions: function() {
    return (
      <form id="download-options" onSubmit={this.onSubmitDownloadOptions}>
        <ul>
          <li>
            <input
              id="path-option-default"
              type="radio"
              value="default"
              checked={!this.state.useCustomDownloadLocation} onChange={this.onChangeCustomDownloadLocation}
            />
            <label htmlFor="path-option-default">Default download location</label>
          </li>
          <li>
            <input
              id="path-option-custom"
              type="radio"
              value="custom"
              checked={this.state.useCustomDownloadLocation} onChange={this.onChangeCustomDownloadLocation}
            />
            <div className="path-wrapper">
              <label htmlFor="path-option-custom">Subfolder within default location</label>
              <input
                id="path"
                type="text"
                value={this.state.customDownloadLocation}
                disabled={!this.state.useCustomDownloadLocation}
                onChange={this.onChangeCustomDownloadLocationPath}
              />
            </div>
          </li>
        </ul>
      </form>
    );
  },
  onSubmitDownloadOptions: function(event) {
    event.preventDefault();
    this.onClickDownload();
  },
  onClickCloseDownloadedTabs: function() {
    chrome.tabs.remove(this.getCompletedTabs());
    this.onClickDismiss();
  },
  onClickDismiss: function() {
    window.close();
  },
  onChangeCustomDownloadLocation: function(event) {
    if (event.target.value === 'default') {
      this.setState({ useCustomDownloadLocation: false });
    } else {
      this.setState({ useCustomDownloadLocation: true });
    }
  },
  onChangeCustomDownloadLocationPath: function(event) {
    this.setState({
      customDownloadLocation: event.target.value
    });
  },
  render: function() {
    var content;
    if (this.hasImages()) {
      content = (
        <div>
          <button id="download" disabled={this.isDownloading()} onClick={this.onClickDownload}>
            Download {pluralize('image', this.imageCount(), true)}
          </button>
          {this.renderDownloadOptions()}
          <ul id="links">
            {this.state.tabList.map(this.renderTabListItem)}
          </ul>
          {this.isComplete() ? <button id="close-tabs" onClick={this.onClickCloseDownloadedTabs}>Close Downloaded Tabs</button> : null}
        </div>
      );
    } else {
      content = (
        <div>
          <p>No images opened as tabs in current window.</p>
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
