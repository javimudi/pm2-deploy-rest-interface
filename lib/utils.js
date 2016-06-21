var fs = require('fs');

module.exports = {
  whichFileExists : function(file_arr) {
    var f = null;
    file_arr.some(function(file) {
      try {
        fs.statSync(file);
      } catch(e) {
        return false;
      }
      f = file;
      return true;
    });
    return f;
  }
}