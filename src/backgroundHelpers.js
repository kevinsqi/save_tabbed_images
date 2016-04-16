export function getContentTypeHeader(headers) {
  let contentTypeHeader;
  let contentTypeHeaderValue;

  for (let i = 0; i < headers.length; ++i) {
    const header = headers[i];
    if (header.name.toLowerCase() === 'content-type') {
      contentTypeHeader = header;
      break;
    }
  }

  // If header is set, use its value. Otherwise, use undefined.
  contentTypeHeaderValue = contentTypeHeader && contentTypeHeader.value.toLowerCase().split(';', 1)[0];

  return contentTypeHeaderValue;
}
