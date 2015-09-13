var React = require('react');

module.exports = React.createClass({
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
        <ul id="links"></ul>
        <button id="close-tabs">Close Downloaded Tabs</button>
        <button id="dismiss">Close</button>
      </div>
    );
  }
});
