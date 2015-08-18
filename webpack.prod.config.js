var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "scripts/index.js"),
    vendors: ["react", "kinto", "moment", "uuid", "bootstrap/less/bootstrap.less"]
  },
  output: {
    path: path.join(__dirname, "assets"),
    filename: "bundle.js",
    publicPath: "assets/"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ],
  resolve: {
    extensions: ["", ".js", ".jsx", ".less"]
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ["babel"], include: path.join(__dirname, "scripts") },
      { test: /\.less$/, loader: 'style!css!less' },
      // Font files
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=image/svg+xml" }
    ]
  }
};
