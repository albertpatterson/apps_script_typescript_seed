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
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('RunTestsPlugin', (_, callback) => {
      webpack(testConfig, (err, stats) => {
        if (err) {
          callback(err);
          return;
        }

        callback();
      });
    });
  }
}

module.exports = {
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
    new RunTestsPlugin(),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {minimize: false},
};