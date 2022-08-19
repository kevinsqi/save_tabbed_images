import React, { PropTypes } from 'react';
import chrome from 'chrome';
import dateFormat from 'dateformat';
import sanitizePath from './sanitizePath';

class DownloadOptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      useDownloadPath: false,
      downloadPath: `SaveTabbedMedia-${dateFormat(new Date(), 'yyyy-mm-dd-HHMMss')}`,
    };

    this.getDownloadPath = this.getDownloadPath.bind(this);
    this.onChangeUseDownloadPath = this.onChangeUseDownloadPath.bind(this);
    this.onChangeDownloadPath = this.onChangeDownloadPath.bind(this);
  }

  componentDidMount() {
    chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
      const path = this.getDownloadPath();
      suggest({
        filename: (path ? `${path}/${downloadItem.filename}` : downloadItem.filename)
      });
    });
  }

  getDownloadPath() {
    if (this.state.useDownloadPath && this.state.downloadPath && this.state.downloadPath.trim()) {
      return this.state.downloadPath.trim();  // need to trim right side of string
    }
    return null;
  }

  onChangeUseDownloadPath(event) {
    if (event.target.value === 'default') {
      this.setState({ useDownloadPath: false });
    } else {
      this.setState({ useDownloadPath: true });
    }
  }

  onChangeDownloadPath(event) {
    this.setState({
      downloadPath: sanitizePath(event.target.value).trimLeft()
    });
  }

  render() {
    return (
      <form
        id="download-options"
        className="padding background-gray"
        onSubmit={this.props.onSubmit}
      >
        <ul>
          <li>
            <input
              id="path-option-default"
              type="radio"
              value="default"
              checked={!this.state.useDownloadPath} onChange={this.onChangeUseDownloadPath}
            />
            <label htmlFor="path-option-default">Default download location</label>
          </li>
          <li>
            <input
              id="path-option-custom"
              type="radio"
              value="custom"
              checked={this.state.useDownloadPath} onChange={this.onChangeUseDownloadPath}
            />
            <div className="path-wrapper">
              <label htmlFor="path-option-custom">Subfolder within default location</label>
              <input
                type="text"
                value={this.state.downloadPath}
                disabled={!this.state.useDownloadPath}
                onChange={this.onChangeDownloadPath}
              />
            </div>
          </li>
        </ul>
      </form>
    );
  }
}

DownloadOptions.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default DownloadOptions;
