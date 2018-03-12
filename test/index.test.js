"use strict";

const path = require('path');
const _ = require('lodash');
const should = require('should');
const webpack = require('webpack');
const MemoryFileSystem = require('memory-fs');
const plugin = require('../index.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const OUTPUT_DIR = path.join(__dirname, './webpack-out');
const REGEXP = /^\/\*\n@license-banner-plugin([\s\S])*?\*\//m;

function configure(webpackOpts, opts = {}) {
  return _.merge({
    entry: {
      test: path.join(__dirname, './fixtures/index.js')
    },
    output: {
      path: OUTPUT_DIR,
      filename: '[name].js'
    },
    plugins: [
      new plugin(opts)
    ]
  }, webpackOpts);
}

function webpackCompile(webpackOtps, opts, callback) {
  const config = configure(webpackOtps, opts);
  const compiler = webpack(config);
  const fs = compiler.outputFileSystem = new MemoryFileSystem();
  compiler.run((err, stats) => {
    should.not.exist(err);
    should.notEqual(true, stats.hasErrors());
    callback(stats, fs);
  });
}

describe('LicenseBannerWebpackPlugin', () => {
  it('exists', () => {
    should.exist(plugin);
  });

  it('outputs license comment', (done) => {
    webpackCompile({
      mode: 'development',
      plugins: [
        new plugin()
      ]
    }, {}, (stats, fs) => {
      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          const raw = stats.compilation.assets[file].source();
          const comment = REGEXP.exec(raw)[0];
          should.ok(REGEXP.test(raw));
          should.ok(comment.includes('@license-banner-plugin'));
          should.ok(comment.includes('lodash'));
        }
      }
      done();
    });
  });

  it('outputs license comment with module directory', (done) => {
    webpackCompile({
      mode: 'development',
      plugins: [
        new plugin({
          licenseDirectories: [
            path.join(__dirname, './modules')
          ]
        })
      ]
    }, {}, (stats, fs) => {
      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          const raw = stats.compilation.assets[file].source();
          const comment = REGEXP.exec(raw)[0];
          should.ok(REGEXP.test(raw));
          should.ok(comment.includes('@license-banner-plugin'));
          // only show selected modules license
          should.ok(comment.includes('some-npm-pkg'));
          should.ok(comment.includes('some-npm-pkg-2'));
          should.ok(comment.includes('some-npm-pkg-3'));
        }
      }
      done();
    });
  });

  it('outputs license comment with uglify plugin', (done) => {
    webpackCompile({
      mode: 'production',
      optimization: {
        minimize: false
      },
      plugins: [
        new UglifyJsPlugin(),
        new plugin()
      ]
    }, {}, (stats, fs) => {
      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          const raw = stats.compilation.assets[file].source();
          const comment = REGEXP.exec(raw)[0];
          should.ok(REGEXP.test(raw));
          should.ok(comment.includes('@license-banner-plugin'));
        }
      }
      done();
    });
  });
});

