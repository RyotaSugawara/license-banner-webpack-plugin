/**
 * MIT License https://opensource.org/licenses/mit-license.php
 * Author Ryota Sugawara @ryo_suga
 */

"use strict";

var fs = require('fs');
var path = require('path');
var ConcatSource = require('webpack-sources').ConcatSource;

function uniqueModuleFilter(module, index, source) {
  return source.map(module => module.name).indexOf(module.name) === index;
}

function isArray(source) {
  return Object.prototype.toString.call(source) === '[object Array]';
}

function isObject(source) {
  return typeof source === 'object'
    && source !== null
    && !isArray(source);
}

var DEFAULT_LICENSE_TEMPLATE = function(pkg) {
  var text = `${pkg.name}@${pkg.version}`;
  if (pkg.author) text += `\n  author: ${pkg.author}`;
  if (pkg.license) text += `\n  license: ${pkg.license}`;
  if (pkg.repository) text += `\n  repository: ${pkg.repository}`;
  return text;
}

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
    if (options.licenseDirectories && !isArray(options.licenseDirectories))
      throw new Error('LicenseBannerWebpackPlugin options.licensePattern only takes Array.')
    if (options.licenseTemplate && typeof options.licenseTemplate !== 'function')
      throw new Error('LicenseBannerWebpackPlugin options.licenseTemplate only takes Function.');
    this.options = Object.assign(
      getDefaultOptions(),
      options
    );
  }

  apply(compiler) {
    var directories = this.options.licenseDirectories || [
      path.join(compiler.context, 'node_modules')
    ];
    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {

        Promise.all(
          chunks.map(chunk => {
            var modules = this.getModuleMap(chunk, directories);
            return this.getLicenseBanner(modules)
              .then(banner => {
                if (banner)
                  chunk.files.forEach(file => {
                    compilation.assets[file] = new ConcatSource(
                      `/*\n${banner}\n*/\n`,
                      compilation.assets[file]
                    );
                  });
              });
          })
        ).then(() => {
          callback();
        }, err => {
          callback(err);
        });

      });
    });
  }

  getModuleMap(chunk, directories) {
    return chunk.modules.map(module => {
      return module.resource || '';
    }).filter(resource => {
      for (var dir of directories)
        if (resource.startsWith(dir)) return true;
      return false;
    }).map(resource => {
      for (var dir of directories) {
        if (resource.startsWith(dir)) {
          var name = resource.replace(dir, '').split('/')[1];
          var directory = path.join(dir, name)
          return {
            name,
            directory
          };
        }
      }
    }).filter(uniqueModuleFilter);
  }

  getLicenseBanner(modules) {
    if (!modules.length) return Promise.resolve('');
    return Promise.all(
      modules.map(module => this.getLicensePackage(module))
    ).then(packages => {
      return packages
        .map(pkg => this.getLicenseText(pkg))
        .join('\n');
    });
  }

  getLicenseText(pkg) {
    var { licenseTemplate } = this.options;
    return licenseTemplate(pkg);
  }

  getPackage(module) {
    return new Promise((resolve, reject) => {
      fs.readdir(module.directory, (err, files) => {
        if (err) {
          reject(err);
        } else {
          switch (true) {
            case files.includes('package.json'):
              resolve(this.getPackageJsonPkg(module));
              break;
            default:
              reject('no package files exists');
          }
        }
      });
    });
  }

  getPackageJsonPkg(module) {
    var pkg = require(path.join(module.directory, 'package.json'));
    return {
      name: pkg.name,
      version: pkg.version,
      author: this.getAuthorText(pkg.author),
      license: pkg.license,
      repository: this.getRepositoryText(pkg.repository)
    };
  }

  // TODO: support bower
  getBowerJsonPkg(dir) {
    var pkg = require(path.join(dir, 'bower.json'));
    return {
      name: pkg.name,
      version: pkg.version,
      author: (pkg.authors ? pkg.authors : []).join(', '),
      license: pkg.license,
      repository: this.getRepositoryText(pkg.repository)
    };
  }

  getLicensePackage(module) {
    return this.getPackage(module)
      .then(pkg => {
        return {
          name: pkg.name,
          version: pkg.version,
          author: this.getAuthorText(pkg.author),
          license: pkg.license,
          repository: this.getRepositoryText(pkg.repository),
        };
      }).catch(() => {
        return {
          name: module.name,
          version: null,
          author: null,
          license: null,
          repository: null
        }
      });
  }

  getRepositoryText(repository) {
    if (isObject(repository) && repository.url) {
      return repository.url;
    } else if (typeof repository === 'string') {
      return repository;
    } else {
      return null;
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
      return null;
    }
  }
}

module.exports = LicenseBannerWebpackPlugin;

