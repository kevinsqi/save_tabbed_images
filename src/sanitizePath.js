import sanitize from 'sanitize-filename';

// only allow alphanumeric, dashes, underscores, and spaces
export default function sanitizePath(path) {
  return path.replace(/[^ _-\w]/, '');
}
