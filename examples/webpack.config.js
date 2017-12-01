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
  plugins: [
    new UglifyJsPlugin(),
    new LicenseBannerPlugin({
      licenseDirectories: [
        path.join(__dirname, '../node_modules')
      ]
    })
  ]
};
