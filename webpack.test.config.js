const path = require('path');
const glob = require('glob');
const Mocha = require('mocha');
const fs = require('fs');
const util = require('util');

function getDistTestPath(subfolders = []) {
  return path.resolve.apply(null, [__dirname, 'dist_test', ...subfolders]);
}

const DIST_TEST_PATH = getDistTestPath();
const TEST_TSCONFIG_PATH = getDistTestPath(['tsconfig.json']);
const TEST_BUNDLE_NAME = 'bundle.test.js';
const TEST_BUNDLE_PATH = getDistTestPath([TEST_BUNDLE_NAME]);

const excludedTestPaths = [
  'node_modules',
  'dist_test',
];
const testFiles = glob.sync('**/*.test.ts')
                      .filter(function(element) {
                        for (const excludedTestPath of excludedTestPaths) {
                          if (element.startsWith(excludedTestPath)) {
                            return false;
                          }
                        }
                        return true;
                      })
                      .map(function(element) {
                        return './' + element;
                      });


function createDistTestDirIfNeeded(callback) {
  // Check if the file exists in the current directory.
  fs.access(DIST_TEST_PATH, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdir(DIST_TEST_PATH, callback);
      return;
    }
    callback();
  });
}

class CreateTestTSConfigPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync(
        'CreateTestTSConfigPlugin', (_, callback) => {
          const createTestTSConfig = () => {
            fs.readFile('./tsconfig.json', function(err, data) {
              if (err) {
                callback(err);
                return;
              }

              const config = JSON.parse(data);

              const oldCompilerOptions = config.compilerOptions || {};

              config.compilerOptions = {
                ...oldCompilerOptions,
                'sourceMap': true,
              };

              const writeFileProm = util.promisify(fs.writeFile);

              const writeTempBundle = writeFileProm(TEST_BUNDLE_PATH, '');

              const writeTestTsconfif =
                  writeFileProm(TEST_TSCONFIG_PATH, JSON.stringify(config));

              Promise.all([writeTempBundle, writeTestTsconfif])
                  .then(() => {
                    callback();
                  })
                  .catch(callback);
            });
          };

          createDistTestDirIfNeeded(createTestTSConfig);
        });
  }
}

class RunMochaPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('RunMochaPlugin', (_) => {
      const mocha = new Mocha({ui: 'bdd', reporter: 'list'});
      // remove from the cache so the test can be rerun
      delete require.cache[require.resolve(TEST_BUNDLE_PATH)]
      mocha.addFile(TEST_BUNDLE_PATH);
      require('source-map-support/register');
      mocha.run();
    });
  }
}

module.exports = {
  entry: testFiles,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: TEST_TSCONFIG_PATH,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: TEST_BUNDLE_NAME,
    path: DIST_TEST_PATH,
  },
  plugins: [
    new CreateTestTSConfigPlugin(),
    new RunMochaPlugin(),
  ],
  devtool: 'source-map',
};