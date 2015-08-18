var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var path = require("path");

new WebpackDevServer(webpack(config), {
  contentBase: path.resolve(__dirname),
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(3000, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3000');
});
