const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');
const testConfig = require('./webpack.test.config');

class StripIFFEPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync('StripIFFEPlugin', (_, callback) => {
      fs.readFile('./dist/bundle.js', 'utf8', function(err, data) {
        if (err) {
          callback(err);
          return;
        }

        const lines = data.split('\n');
        var keptLines = lines.slice(2, lines.length - 3).join('\n');

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
    entry: './src/index.ts',
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