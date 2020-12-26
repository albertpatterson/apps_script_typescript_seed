const path = require('path');

module.exports = {
  INDEX_WRAPPER_PATH: path.resolve.apply(null, [__dirname, 'wrapper.ts']),
};