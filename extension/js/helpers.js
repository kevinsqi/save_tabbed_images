export function sanitizeFilePath(path) {
  return path.replace(/[^\w\d\s_-]/, '');
}
