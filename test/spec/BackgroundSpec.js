describe("Background", function() {
  it("should distinguish between image and non-image content types", function() {
    var nonImageHeader = getContentTypeHeader(
      [
        {
          "name": "status",
          "value": "200 OK"
        },
        {
          "name": "version",
          "value": "HTTP/1.1"
        },
        {
          "name": "content-encoding",
          "value": "gzip"
        },
        {
          "name": "content-type",
          "value": "text/html; charset=utf-8"
        },
        {
          "name": "x-ua-compatible",
          "value": "IE=Edge,chrome=1"
        }
      ]
    );
    expect(nonImageHeader).toEqual('text/html');

    var imageHeader = getContentTypeHeader(
      [
        {
          "name": "Accept-Ranges",
          "value": "bytes"
        },
        {
          "name": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "name": "Cache-Control",
          "value": "max-age=1209600"
        },
        {
          "name": "Content-Type",
          "value": "image/jpeg"
        },
        {
          "name": "Date",
          "value": "Sun, 15 Feb 2015 19:42:07 GMT"
        },
        {
          "name": "Server",
          "value": "nginx"
        },
        {
          "name": "Content-Length",
          "value": "89762"
        }
      ]
    );
    expect(imageHeader).toEqual('text/jpeg');
  });
});
