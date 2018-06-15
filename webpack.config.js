module.exports = {
  entry: {
    content: "./content/app.js",
    popup: "./popup/app.js",
    event: "./event/app.js"
  },
  output: {
    path: "./dist",
    filename: "[name].bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015", "stage-3"]
        }
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  devtool: "source-map"
};
