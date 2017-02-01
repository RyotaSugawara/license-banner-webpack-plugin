const path = require('path');
const webpack = require('webpack');
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
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new LicenseBannerPlugin({
      licenseTemplate: function(pkg) {
        var text = `${pkg.name}@${pkg.version}`;
        return text;
      },
      licenseDirectories: [
        path.join(__dirname, '../node_modules')
      ]
    })
  ]
};
