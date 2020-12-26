const fs = require('fs');

module.exports.createDirIfNeeded = function(path, callback) {
  // Check if the file exists in the current directory.
  fs.access(path, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdir(path, callback);
      return;
    }
    callback();
  });
}