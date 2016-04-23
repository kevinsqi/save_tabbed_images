import React, { PropTypes } from 'react';
import chrome from 'chrome';
import dateFormat from 'dateformat';

class DownloadOptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      useCustomDownloadLocation: false,
      customDownloadLocation: `SaveTabbedImages-${dateFormat(new Date(), 'yyyy-mm-dd-HHMMss')}`,
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
    if (this.state.useCustomDownloadLocation) {
      return this.state.customDownloadLocation + '/';
    }
    return '';
  }

  onChangeCustomDownloadLocation(event) {
    if (event.target.value === 'default') {
      this.setState({ useCustomDownloadLocation: false });
    } else {
      this.setState({ useCustomDownloadLocation: true });
    }
  }

  onChangeCustomDownloadLocationPath(event) {
    this.setState({
      customDownloadLocation: event.target.value
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
  }
}

DownloadOptions.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default DownloadOptions;
