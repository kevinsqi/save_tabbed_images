import React, { PropTypes } from 'react';

class NoMediaMessage extends React.Component {
  render() {
    return (
      <div>
        <div className="align-center padding">
          <img src="img/icon48.png" alt="icon" />
          <h1>Save Tabbed Images</h1>
          <p>No images or videos opened in current window.</p>
          <p>Right click an image/video and select "Open in New Tab" to get started.</p>
        </div>
        <button onClick={this.props.onClickDismiss}>Got it</button>
      </div>
    );
  }
}

NoMediaMessage.propTypes = {
  onClickDismiss: PropTypes.func.isRequired,
};

export default NoMediaMessage;
