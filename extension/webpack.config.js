module.exports = {
  context: __dirname + "/js",
  entry: "./popup.jsx",

  output: {
    filename: "popup.js",
    path: __dirname + "/dist/js",
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"],
      }
    ],
  },
}
