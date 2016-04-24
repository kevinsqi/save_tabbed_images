import React, { PropTypes } from 'react';

class ImageList extends React.Component {
  constructor(props) {
    super(props);

    this.renderImage = this.renderImage.bind(this);
  }

  renderImage(image) {
    return (
      <li key={image.id} className={this.props.downloadStatuses[image.id]}>
        <a href={image.url}>{image.url}</a>
      </li>
    );
  }

  render() {
    return !this.props.hidden ? (
      <ul id="files" className="background-gray padding text-smaller">
        {this.props.imageList.map(this.renderImage)}
      </ul>
    ) : null;
  }
}

ImageList.propTypes = {
  imageList: PropTypes.arrayOf(PropTypes.object),
  downloadStatuses: PropTypes.object,
  hidden: PropTypes.bool,
};

export default ImageList;
