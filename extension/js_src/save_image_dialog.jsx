var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      imageTabList: [],
      isComplete: false
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
  hasImages: function() {
    return this.state.imageTabList.length > 0;
  },
  imageTabListItem: function(imageTab) {
    return <li><a href={imageTab.url}>{imageTab.url}</a></li>;
  },
  imageTabList: function() {
    return (
      <ul id="links">
        {this.state.imageTabList.map(this.imageTabListItem)}
      </ul>
    );
  },
  closeTabsButton: function() {
    if (this.state.isComplete) {
      return <button id="close-tabs">Close Downloaded Tabs</button>;
    } else {
      return null;
    }
  },
  dismissButton: function() {
    if (this.hasImages()) {
      return null;
    } else {
      return <button id="dismiss">Close</button>;
    }
  },
  render: function() {
    return (
      <div className="save-image-dialog">
        <button id="download"></button>

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

        <p id="message"></p>

        {this.imageTabList()}
        {this.closeTabsButton()}
        {this.dismissButton()}
      </div>
    );
  }
});
