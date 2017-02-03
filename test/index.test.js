"use strict";

const path = require('path');
const should = require('should'); // eslint-disable-line no-unused-vars
const sinon = require('sinon');
const ConcatSource = require('webpack-sources').ConcatSource;
const LicenseBannerPlugin = require('../');
const PluginEnvironment = require('./helpers/PluginEnvironment');

describe('LicenseBannerWebpackPlugin', function() {
  it('has apply function', () => {
    (new LicenseBannerPlugin()).apply.should.be.a.Function();
  });

  describe('when applied with no options', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();
      compilerEnv.context = path.join(__dirname, '..');

      const plugin = new LicenseBannerPlugin();
      plugin.apply(compilerEnv);
      eventBindings = pluginEnvironment.getEventBindings();
    });

    it('binds one event handler', () => {
      eventBindings.length.should.be.exactly(1);
    });

    describe('compilation handler', () => {
      beforeEach(() => {
        eventBinding = eventBindings[0];
      });

      it('bind to compilation event', () => {
        eventBinding.name.should.be.exactly('compilation');
      });

      describe('when called', () => {
        let chunkPluginEnvironment;
        let compilationEventBindings;
        let compilationEventBinding;
        let compilation;
        let callback;

        beforeEach(() => {
          chunkPluginEnvironment = new PluginEnvironment();
          compilation = chunkPluginEnvironment.getEnvironmentStub();

          compilation.assets = {
            'test.js': {
              _value: "require('webpack')"
            }
          };

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds one event handler', () => {
          compilationEventBindings.length.should.be.exactly(1);
        });

        describe('optimize-chunk-assets event', () => {
          let chunks;
          beforeEach(() => {
            compilationEventBinding = compilationEventBindings[0];
            chunks = [
              { modules: [
                { resource: path.join(__dirname, '../node_modules/webpack/lib/AmdMainTemplatePlugin.js') }
              ], files: [
                'test.js'
              ] }
            ];
          });

          it('binds to optimize-chunk-assets event', () => {
            compilationEventBinding.name.should.be.exactly('optimize-chunk-assets');
          });

          it('only call callback once', cb => {
            callback = sinon.spy();
            compilationEventBinding.handler(chunks, function() {
              callback();
              callback.calledOnce.should.be.exactly(true);
              cb();
            });
          });

          it('outputs ConcatSource', cb => {
            compilationEventBinding.handler(chunks, () => {
              var source = compilation.assets['test.js'];
              source.should.be.instanceof(ConcatSource);
              cb();
            });
          });

          it('outputs template comment on ConcatSource.children[0]', cb => {
            compilationEventBinding.handler(chunks, () => {
              var text = compilation.assets['test.js'].children[0];
              text.should.be.String();
              text.should.match(/^\/\*\n/);
              text.should.match(/\*\/\n$/);
              text.should.match(/@license-banner-plugin/);
              cb();
            });
          });
        });

      });
    });
  });

  describe('when applied with options', () => {
    let eventBindings;
    let eventBinding;

    beforeEach(() => {
      const pluginEnvironment = new PluginEnvironment();
      const compilerEnv = pluginEnvironment.getEnvironmentStub();

      const plugin = new LicenseBannerPlugin({
        licenseTemplate: function(pkg) { return `@license ${pkg.name} ${pkg.version} ${pkg.license} ${pkg.author} ${pkg.repository}`; },
        licenseDirectories: [
          path.join(__dirname, './modules')
        ]
      });
      plugin.apply(compilerEnv);
      eventBindings = pluginEnvironment.getEventBindings();
    });

    it('binds one event handler', () => {
      eventBindings.length.should.be.exactly(1);
    });

    describe('compilation handler', () => {
      beforeEach(() => {
        eventBinding = eventBindings[0];
      });

      it('bind to compilation event', () => {
        eventBinding.name.should.be.exactly('compilation');
      });

      describe('when called', () => {
        let chunkPluginEnvironment;
        let compilationEventBindings;
        let compilationEventBinding;
        let compilation;
        let callback;

        beforeEach(() => {
          chunkPluginEnvironment = new PluginEnvironment();
          compilation = chunkPluginEnvironment.getEnvironmentStub();

          compilation.assets = {
            'test.js': {
              _value: "require('webpack')"
            }
          };

          eventBinding.handler(compilation);
          compilationEventBindings = chunkPluginEnvironment.getEventBindings();
        });

        it('binds one event handler', () => {
          compilationEventBindings.length.should.be.exactly(1);
        });

        describe('optimize-chunk-assets event', () => {
          let chunks;
          beforeEach(() => {
            compilationEventBinding = compilationEventBindings[0];
            chunks = [
              { modules: [
                { resource: path.join(__dirname, '../node_modules/webpack/lib/AmdMainTemplatePlugin.js') },
                { resource: path.join(__dirname, './modules/some-npm-pkg/index.js') },
                { resource: path.join(__dirname, './modules/some-npm-pkg-2/index.js') },
                { resource: path.join(__dirname, './modules/some-npm-pkg-3/index.js') }
              ], files: [
                'test.js'
              ] }
            ];
          });

          it('binds to optimize-chunk-assets event', () => {
            compilationEventBinding.name.should.be.exactly('optimize-chunk-assets');
          });

          it('only call callback once', cb => {
            callback = sinon.spy();
            compilationEventBinding.handler(chunks, function() {
              callback();
              callback.calledOnce.should.be.exactly(true);
              cb();
            });
          });

          it('outputs ConcatSource', cb => {
            compilationEventBinding.handler(chunks, () => {
              const source = compilation.assets['test.js'];
              source.should.be.instanceof(ConcatSource);
              cb();
            });
          });

          it('outputs contaions a selected modules folder’s license', cb => {
            compilationEventBinding.handler(chunks, () => {
              const text = compilation.assets['test.js'].children[0];
              let pkg = require('./modules/some-npm-pkg/package.json');
              let pkg2 = require('./modules/some-npm-pkg-2/package.json');
              let pkg3 = require('./modules/some-npm-pkg-3/package.json');
              text.should.containEql(`@license ${pkg.name} ${pkg.version} ${pkg.license} ${pkg.author} ${pkg.repository}`);
              text.should.containEql(`@license ${pkg2.name} ${pkg2.version} ${pkg2.license} ${pkg2.author.name} <${pkg2.author.email}> (${pkg2.author.url}) ${pkg2.repository}`);
              text.should.containEql(`@license ${pkg3.name} ${pkg3.version} ${pkg3.license} ${pkg3.author} ${pkg3.repository.url}`);
              cb();
            });
          });

          it('outputs do not contaions a unselected modules folder’s license', cb => {
            compilationEventBinding.handler(chunks, () => {
              const text = compilation.assets['test.js'].children[0];
              text.should.not.containEql('@license webpack');
              cb();
            });
          });
        });

      });
    });
  });
});
