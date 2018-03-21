const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const LicenseBannerPlugin = require('../');

module.exports = {
  entry: {
    a: ['./src/a.js', './src/b.js'],
    b: ['./src/b.js'],
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dest',
  },
  // at optimization process, we must use UglifyJsPlugin instanceof default webpack minimize process.
  plugins: [
    new UglifyJsPlugin(),
    new LicenseBannerPlugin({
      licenseDirectories: [
        path.join(__dirname, '../node_modules')
      ]
    })
  ],
  // if webpack v4 or higher and using mode `production`, we must set option below.
  mode: 'production',
  optimization: {
    minimize: false
  }
};
