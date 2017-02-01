license-banner-webpack-plugin
===

Insert the license text of the module used for each bundled file at the beginning of each.

## Install
```bash
$ yarn add license-banner-webpack-plugin --dev
# or
$ npm install license-banner-webpack-plugin --save-dev
```

## Usage
Import the plugin module into webpack configuration.

```js
const LicenseBannerPlugin = require('license-banner-webpack-pluin');
```

Then use this plugin with some options.

```js
new LicenseBannerPlugin({
  licenseTemplate: function(pkg) {
    return `${pkg.name}, ${pkg.version}, ${pkg.author}, ${pkg.license}, ${pkg.repository}`;
  },
  licenseDirectories: [
    path.join('/path/to/node_modules')
  ]
});
```

Then output file has license banner like this.
```js
/*
webpack@2.2.1
  license: MIT
  author: Tobias Koppers @sokra
  repository: https://github.com/webpack/webpack.git:
(...and any other modules you use in your code)
*/
```

#### options
```
new LicenseBannerPlugin(options);
```

| name                   | type     | description                                                                                                                                                     |
|------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `licenseTemplate(pkg)` | Function | license template pattern. argument `pkg` is each packages information object. you can use `pkg.name` `pkg.version` `pkg.author` `pkg.license` `pkg.repository`. |
| `licenseDirectories`   | Array    | package modules directories. The default is node_modules directory.                                                                                             |

## License
[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author
[RyotaSugawara](https://github.com/RyotaSugawara)

