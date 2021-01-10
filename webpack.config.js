const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');
const testConfig = require('./webpack.test.config');
const build_constants = require('./build_utils/constants');

class StripIFFEPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync('StripIFFEPlugin', (_, callback) => {
      fs.readFile('./dist/bundle.js', 'utf8', function(err, data) {
        if (err) {
          callback(err);
          return;
        }

        const lines = data.split('\n');

        let firstConcatLine = null;
        let wrapperConcatLine = null;

        lines.forEach((line, index) => {
          if (line === ';// CONCATENATED MODULE: ./build_utils/wrapper.ts') {
            wrapperConcatLine = index;
          } else if (
              firstConcatLine === null &&
              line.startsWith(';// CONCATENATED MODULE: ')) {
            firstConcatLine = index;
          }
        });

        if (firstConcatLine === null) {
          throw new Error('did not find first concatenated module comment.');
        }

        if (wrapperConcatLine === null) {
          throw new Error('did not find concatenated wrapper module comment.');
        }

        console.log({firstConcatLine, wrapperConcatLine});
        const keptLines =
            lines.slice(firstConcatLine, wrapperConcatLine + 1).join('\n');

        fs.writeFile('./dist/bundle.js', keptLines, callback);
      });
    });
  }
}

class RunTestsPlugin {
  constructor(watchTests = false) {
    this.watchTests = watchTests;
    this.testingAndWatching = false;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('RunTestsPlugin', (_) => {
      if (!this.testingAndWatching) {
        this.testingAndWatching = this.watchTests;
        const config = {...testConfig, watch: this.watchTests};
        webpack(config, (err, stats) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }
    });
  }
}

module.exports = (env, argv) => {
  const watchTests = Boolean(argv.watch);

  return {
    entry: build_constants.INDEX_WRAPPER_PATH,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: './src/config/.clasp.json',
            to: '.clasp.json',
            noErrorOnMissing: true,
          },
          {
            from: './src/config/appsscript.json',
            to: 'appsscript.json',
            noErrorOnMissing: true,
          },
        ],
      }),
      new StripIFFEPlugin(),
      new RunTestsPlugin(watchTests),
    ],
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    optimization: {minimize: false},
  };
}