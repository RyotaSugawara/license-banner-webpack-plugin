
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
    new LicenseBannerPlugin({
      licenseTemplate: '$name@$version\n  repository: $repository\n  licenses: $license'
    })
  ]
};
