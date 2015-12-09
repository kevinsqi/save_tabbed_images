module.exports = {
  context: __dirname,
  entry: {
    popup: __dirname + "/js/popup"
  },
  output: {
    path: __dirname + "/dist/js",
    filename: "[name].js"
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
    modulesDirectories: ["node_modules"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel",
        exclude: [__dirname + "/node_modules"],
        query: {
          presets: ["es2015", "react"],
          cacheDirectory: true
        }
      }
    ]
  }
};
