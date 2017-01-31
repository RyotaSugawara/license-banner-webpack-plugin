/**
 * MIT License https://opensource.org/licenses/mit-license.php
 * Author Ryota Sugawara @ryo_suga
 */

"use strict";

var ConcatSource = require('webpack-sources').ConcatSource;

function uniqueFilter(value, index, source) {
  return source.indexOf(value) === index;
}

function isObject(T) {
  return typeof T === 'object'
    && T !== null
    && Object.prototype.toString.call(T) !== '[object Array]';
}

var UNKNOWN = 'UNKNOWN';
var DEFAULT_LICENSE_TEMPLATE =
`$name
  license: $license
  author: $author
  version: $version`;

function getDefaultOptions() {
  return {
    licensePattern: /node_modules/,
    licenseTemplate: DEFAULT_LICENSE_TEMPLATE
  };
}

class LicenseBannerWebpackPlugin {
  constructor(options) {
    if (arguments.length > 1)
      throw new Error('LicenseBannerWebpackPlugin only takes one argument (pass an options object)');
    if (!options)
      options = getDefaultOptions();
    if (!isObject(options))
      throw new Error('LicenseBannerWebpackPlugin only takes an object argument.');
    if (options.licensePattern && !(options.licensePattern instanceof RegExp))
      throw new Error('LicenseBannerWebpackPlugin options.licensePattern only takes RegExp patterns.')
    if (options.licenseTemplate && typeof options.licenseTemplate !== 'string')
      throw new Error('LicenseBannerWebpackPlugin options.licenseTemplate only takes String.');
    this.options = Object.assign(
      getDefaultOptions(),
      options
    );
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {

        chunks.forEach(chunk => {
          var modules = this.getModuleMap(chunk);
          var banner = this.getLicenseBanner(modules);
          if (banner) {
            chunk.files
              .forEach(file => {
                console.log(`append license banner to ${file}\n`, banner); // eslint-disable-line no-console
                compilation.assets[file] = new ConcatSource(
                  `/* \n${banner}\n */\n`,
                  compilation.assets[file]
                );
              });
          }
        });

        callback();
      });
    });
  }

  getModuleMap(chunk) {
    var { licensePattern } = this.options;
    return chunk.modules
      .map(module => module.resource)
      .filter(resource => licensePattern.test(resource))
      .map(resource => {
        var matches = resource.match(licensePattern);
        var moduleName = resource
          .split(matches[0])
          .pop()
          .split('/')[1];
        return moduleName;
      })
      .filter(uniqueFilter);
  }

  getLicenseBanner(modules) {
    if (!modules.length) return '';
    return modules.map(module => {
      var license = this.getLicense(module);
      return this.getLicenseText(license);
    }).join('\n');
  }

  getLicenseText(license) {
    var { licenseTemplate } = this.options;
    return licenseTemplate
      .replace('$name', license.name)
      .replace('$version', license.version)
      .replace('$license', license.license)
      .replace('$author', license.author)
      .replace('$repository', license.repository);
  }

  getLicense(moduleName) {
    var license;
    try {
      var pkg = require(`${moduleName}/package.json`);
      license = {
        name: moduleName,
        version: pkg.version,
        author: this.getAuthorText(pkg.author),
        license: pkg.license,
        repository: this.getRepositoryText(pkg.repository),
      };
    } catch (e) {
      license = {
        name: moduleName,
        version: UNKNOWN,
        author: UNKNOWN,
        license: UNKNOWN,
        repository: UNKNOWN
      };
    }
    return license;
  }

  getRepositoryText(repository) {
    if (isObject(repository) && repository.url) {
      return repository.url;
    } else if (typeof repository === 'string') {
      return repository;
    } else {
      return UNKNOWN;
    }
  }

  getAuthorText(author) {
    if (isObject(author)) {
      var text = [];
      if (author.name) text.push(author.name);
      if (author.email) text.push(`<${author.email}>`);
      if (author.url) text.push(`(${author.url})`);
      return text.join(' ');
    } else if (typeof author === 'string') {
      return author;
    } else {
      return UNKNOWN;
    }
  }
}

module.exports = LicenseBannerWebpackPlugin;

