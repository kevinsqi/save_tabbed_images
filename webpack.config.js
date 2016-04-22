module.exports = {
  context: __dirname,
  devtool: 'cheap-module-source-map',
  entry: {
    popup: "./src/popup",
    background: "./src/background"
  },
  output: {
    path: "./dist/js",
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
  },
  externals: {
    'chrome': 'chrome'
  }
};
