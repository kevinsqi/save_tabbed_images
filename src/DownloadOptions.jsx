import React, { PropTypes } from 'react';
import chrome from 'chrome';
import dateFormat from 'dateformat';

class DownloadOptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      useDownloadPath: false,
      downloadPath: `SaveTabbedImages-${dateFormat(new Date(), 'yyyy-mm-dd-HHMMss')}`,
    };

    this.getDownloadPath = this.getDownloadPath.bind(this);
    this.onChangeCustomDownloadLocation = this.onChangeCustomDownloadLocation.bind(this);
    this.onChangeCustomDownloadLocationPath = this.onChangeCustomDownloadLocationPath.bind(this);
  }

  componentDidMount() {
    chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
      suggest({
        filename: this.getDownloadPath() + downloadItem.filename
      });
    });
  }

  getDownloadPath() {
    if (this.state.useDownloadPath) {
      return this.state.downloadPath + '/';
    }
    return '';
  }

  onChangeCustomDownloadLocation(event) {
    if (event.target.value === 'default') {
      this.setState({ useDownloadPath: false });
    } else {
      this.setState({ useDownloadPath: true });
    }
  }

  onChangeCustomDownloadLocationPath(event) {
    this.setState({
      downloadPath: event.target.value
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
              checked={!this.state.useDownloadPath} onChange={this.onChangeCustomDownloadLocation}
            />
            <label htmlFor="path-option-default">Default download location</label>
          </li>
          <li>
            <input
              id="path-option-custom"
              type="radio"
              value="custom"
              checked={this.state.useDownloadPath} onChange={this.onChangeCustomDownloadLocation}
            />
            <div className="path-wrapper">
              <label htmlFor="path-option-custom">Subfolder within default location</label>
              <input
                id="path"
                type="text"
                value={this.state.downloadPath}
                disabled={!this.state.useDownloadPath}
                onChange={this.onChangeCustomDownloadLocationPath}
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
