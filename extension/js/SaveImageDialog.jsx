import React from 'react';
import chrome from 'chrome';
import update from 'react-addons-update';
import pluralize from 'pluralize';
import _ from 'underscore';
import Select from 'react-select';
import { sanitizeFilePath } from './helpers';
import { getTabsWithImages } from './imageHelpers';

const PENDING = 'pending';
const COMPLETE = 'complete';
const CUSTOM_DOWNLOAD_PATHS_KEY = 'CUSTOM_DOWNLOAD_PATHS';

const SaveImageDialog = React.createClass({
  getInitialState: function() {
    return {
      tabList: [],
      downloadStatuses: {},
      customDownloadPath: null,
      savedCustomDownloadPaths: [],
    };
  },
  getCompletedTabs: function() {
    return _.compact(_.map(this.state.downloadStatuses, function(status, tabID) {
      return (status === COMPLETE) ? parseInt(tabID, 10) : null;
    }));
  },
  getDownloadPath: function() {
    if (this.state.customDownloadPath) {
      return this.state.customDownloadPath + '/';
    } else {
      return '';
    }
  },
  componentDidMount: function() {
    // get image list
    getTabsWithImages(function(tabs) {
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
    getTabsWithImages(function(tabs) {
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
      let obj = {};

      const newSavedCustomDownloadPaths = this.state.savedCustomDownloadPaths.concat([{
        path: this.state.customDownloadPath,
        lastUsage: new Date(),
      }]);

      this.setState(update(this.state, {
        savedCustomDownloadPaths: { $set: newSavedCustomDownloadPaths },
      }));

      obj[CUSTOM_DOWNLOAD_PATHS_KEY] = JSON.stringify(newSavedCustomDownloadPaths);
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
  getDownloadOptions: function(input) {
    const customOptions = this.state.savedCustomDownloadPaths.map((path) => {
      return { label: path.path, value: path.path }
    });
    const sanitizedPath = sanitizeFilePath(input);
    console.log('ez', sanitizedPath);
    return [
      { label: 'Default download location', value: 'default' },
    ].concat(customOptions).concat([
      { label: `Create new subfolder ${sanitizedPath}`, value: sanitizedPath }
    ]);
  },
  renderDownloadOptions: function() {
    return (
      <form id="download-options" onSubmit={this.onSubmitDownloadOptions}>
        <ul>
          <li>
            <label>Destination:</label>
            <Select
              value="default"
              asyncOptions={(input, callback) => {
                return callback(null, {
                  options: this.getDownloadOptions(input),
                  complete: false,
                });
              }}
              onChange={this.onChangeDownloadPath}
            />
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
  onChangeDownloadPath: function(newPath) {
    this.setState({
      customDownloadPath: newPath
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

export default SaveImageDialog;
