import React from 'react';
import chrome from 'chrome';
import pluralize from 'pluralize';
import _ from 'underscore';
import moment from 'moment';

const PENDING = 'pending';
const COMPLETE = 'complete';
const CUSTOM_DOWNLOAD_PATHS_KEY = 'CUSTOM_DOWNLOAD_PATHS';

const SaveImageDialog = React.createClass({
  getInitialState: function() {
    return {
      tabList: [],
      downloadStatuses: {},
      useCustomDownloadPath: false,
      customDownloadPath: "SaveTabbedImages-" + moment().format('YYYY-MM-DD'),
      savedCustomDownloadPaths: [],
    };
  },
  getTabsWithImages: function(callback) {
    chrome.tabs.query(
      { currentWindow: true },
      function(tabs) {
        // Query background process for which tabs are images
        chrome.runtime.sendMessage({ type: 'checktabs', tabs: tabs }, function(response) {
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
    if (this.state.useCustomDownloadPath) {
      return this.state.customDownloadPath + '/';
    } else {
      return '';
    }
  },
  componentDidMount: function() {
    // get image list
    this.getTabsWithImages(function(tabs) {
      this.setState({ tabList: tabs });
    }.bind(this));

    // set download path
    chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
      suggest({
        filename: this.getDownloadPath() + downloadItem.filename
      });
    }.bind(this));

    // get previous download paths
    chrome.storage.local.get(CUSTOM_DOWNLOAD_PATHS_KEY, function(storage) {
      var paths = JSON.parse(storage[CUSTOM_DOWNLOAD_PATHS_KEY]);
      console.log('Getting download paths', storage, paths);
      if (Object.keys(paths).length > 0) {
        this.setState({
          savedCustomDownloadPaths: paths
        });
      }
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
      const statuses = _.reduce(tabs, function(memo, tab) {
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
              const newStatuses = _({}).extend(this.state.downloadStatuses);
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

    // save download location, if customized
    if (this.state.useCustomDownloadPath) {
      var obj = {};
      obj[CUSTOM_DOWNLOAD_PATHS_KEY] = JSON.stringify(
        this.state.savedCustomDownloadPaths.concat([{
          path: this.state.customDownloadPath,
          lastUsage: new Date(),
        }])
      );
      chrome.storage.local.set(obj, function() {
        console.log('Saved download path', obj);
      });
    }
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
            <label>
              <input
                type="radio"
                value="default"
                checked={!this.state.useCustomDownloadPath}
                onChange={this.onChangeCustomDownloadLocation}
              />
              Default download location
            </label>
          </li>
          <li>
            <input
              id="path-option-custom"
              type="radio"
              value="custom"
              checked={this.state.useCustomDownloadPath}
              onChange={this.onChangeCustomDownloadLocation}
            />
            <div className="path-wrapper">
              <label htmlFor="path-option-custom">Subfolder within default location</label>
              <input
                id="path"
                type="text"
                value={this.state.customDownloadPath}
                disabled={!this.state.useCustomDownloadPath}
                onChange={this.onChangeCustomDownloadLocationPath}
              />
            </div>
          </li>
          {
            // TODO sort by path.lastUsage
            this.state.savedCustomDownloadPaths.map(function(path) {
              console.log(path);
              return (
                <li>
                  <label>
                    <input
                      type="radio"
                      value="custom"
                      checked={false}
                    />
                    {path.path}
                  </label>
                </li>
              );
            })
          }
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
      this.setState({ useCustomDownloadPath: false });
    } else {
      this.setState({ useCustomDownloadPath: true });
    }
  },
  onChangeCustomDownloadLocationPath: function(event) {
    this.setState({
      customDownloadPath: event.target.value
    });
  },
  render: function() {
    const content = this.hasImages() ? (
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
    ) : (
      <div>
        <p>No images opened as tabs in current window.</p>
        <button id="dismiss" onClick={this.onClickDismiss}>Close</button>
      </div>
    );

    return (
      <div className="save-image-dialog">
        {content}
      </div>
    );
  }
});

module.exports = SaveImageDialog;
