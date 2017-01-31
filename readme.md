license-banner-webpack-plugin
===

Insert the license text of the module used for each bundled file at the beginning of each.

## Install
```
$ yarn add license-banner-webpack-plugin
# or
$ npm install
```

## Usage
Import the plugin module into webpack configuration.

```js
const LicenseBannerPlugin = require('license-banner-webpack-pluin'); 
```

Then use this plugin with some options.

```
new LicenseBannerPlugin({
  licenseTemplate: '$name, $version, $author, $license, $repository',
  licenseDirectories: [
    path.join('/path/to/node_modules')
  ]
});
```

Then output file has license banner like this.
```
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

| name                 | type   | description                                                                                                   |
|----------------------|--------|---------------------------------------------------------------------------------------------------------------|
| `licenseTemplate`    | String | license template pattern. you can use `$name` `$version` `$author` `$license` `$repository` in this tepmlate. |
| `licenseDirectories` | Array  | package modules directories. The default is node_modules directory.                                           |

## License
[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author
[RyotaSugawara](https://github.com/RyotaSugawara)

