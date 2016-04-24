import React from 'react';
import update from 'react-addons-update';
import chrome from 'chrome';
import pluralize from 'pluralize';
import _ from 'underscore';

import { getTabsWithImages } from './backgroundHelpers';
import DownloadOptions from './DownloadOptions';
import ImageList from './ImageList';
import NoImagesMessage from './NoImagesMessage';

const PENDING = 'pending';
const COMPLETE = 'complete';

class Extension extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageList: [],
      downloadStatuses: {},
      hideImageList: true,
    };

    this.getCompletedTabs = this.getCompletedTabs.bind(this);
    this.getImageCount = this.getImageCount.bind(this);
    this.isDownloading = this.isDownloading.bind(this);
    this.isComplete = this.isComplete.bind(this);
    this.onToggleFileList = this.onToggleFileList.bind(this);
    this.onClickDownload = this.onClickDownload.bind(this);
    this.onSubmitDownloadOptions = this.onSubmitDownloadOptions.bind(this);
    this.onClickCloseDownloadedTabs = this.onClickCloseDownloadedTabs.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
  }

  componentDidMount() {
    getTabsWithImages((tabs) => {
      this.setState({ imageList: tabs });
    });
  }

  isDownloading() {
    return _.any(
      _.values(this.state.downloadStatuses),
      (status) => (status === PENDING)
    );
  }

  isComplete() {
    return (
      _.size(this.state.downloadStatuses) > 0 &&
      _.all(
        _.values(this.state.downloadStatuses),
        (status) => (status === COMPLETE)
      )
    );
  }

  getCompletedTabs() {
    return _.compact(
      _.map(this.state.downloadStatuses, (status, tabID) => {
        return (status === COMPLETE) ? parseInt(tabID, 10) : null;
      })
    );
  }

  getImageCount() {
    return this.state.imageList.length;
  }

  onSubmitDownloadOptions(event) {
    event.preventDefault();
    this.onClickDownload();
  }

  onClickCloseDownloadedTabs() {
    chrome.tabs.remove(this.getCompletedTabs());
    this.onClickDismiss();
  }

  onClickDismiss() {
    window.close();
  }

  onToggleFileList() {
    this.setState({
      hideImageList: !this.state.hideImageList,
    });
  }

  downloadImage(tab) {
    chrome.downloads.download(
      { url: tab.url, conflictAction: 'uniquify' },
      (downloadID) => {
        if (downloadID) {
          // download successful
          this.setState(update(this.state, {
            downloadStatuses: {
              [tab.id]: { $set: COMPLETE }
            }
          }));
        } else {
          // download failed
        }
      }
    );
  }

  onClickDownload() {
    getTabsWithImages((tabs) => {
      this.setState({
        downloadStatuses: _.reduce(tabs, (memo, tab) => {
          memo[tab.id] = PENDING;
          return memo;
        }, {})
      });

      tabs.forEach(this.downloadImage);
    });
  }

  renderCloseButton() {
    return this.isComplete() ? (
      <button id="close-tabs" onClick={this.onClickCloseDownloadedTabs}>Close downloaded tabs</button>
    ) : null;
  }

  renderProgress() {
    return (
      <div className="progress align-center padding" title="Click to see image list" onClick={this.onToggleFileList}>
        <div className="progress-count">{this.getCompletedTabs().length} of {this.getImageCount()}</div>
        <div className="text-smaller">images downloaded</div>
      </div>
    );
  }

  render() {
    return this.getImageCount() > 0 ? (
      <div>
        <button id="download" disabled={this.isDownloading()} onClick={this.onClickDownload}>
          Download {pluralize('image', this.getImageCount(), true)}
        </button>

        <DownloadOptions onSubmit={this.onSubmitDownloadOptions} />

        {this.renderProgress()}

        <ImageList
          imageList={this.state.imageList}
          downloadStatuses={this.state.downloadStatuses}
          hidden={this.state.hideImageList}
        />

        {this.renderCloseButton()}
      </div>
    ) : (
      <NoImagesMessage onClickDismiss={this.onClickDismiss} />
    );
  }
}

export default Extension;
