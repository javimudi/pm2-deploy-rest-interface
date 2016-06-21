'use strict';


var fs = require('fs');
var ospath = require('path');
var appDir = require('app-root-path').path;
var _ = require('lodash');
var JSON5 = require('json5');

var debug = {
  info: require('debug')('info'),
  warn: require('debug')('warn'),
  error: require('debug')('error')
}


var fakeArgs = function(){

  var args = [];

  return {
    push: args.push,
    rawArgs: args
  }
}

var whichFileExists = function(file_arr){
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

// Ecosystem file detection
var deploymentFile = whichFileExists(
    _.map(['ecosystem.js', 'ecosystem.json', 'ecosystem.json5'], function(file){
        return ospath.join(appDir, file);
    }));

try {
    var eco = fs.readFileSync(deploymentFile);
    debug.info("Using " + deploymentFile + " as deployment file");
} catch(e){
    debug.error("Ecosystem file not found");
    debug.error("Valid files: ecosystem.js, ecosystem.json, ecosystem.json5");
    process.exit(1);
}

var projectPkg = require(ospath.join(appDir, 'package.json'));

module.exports = {
  deploymentFile: deploymentFile,
  eco: JSON5.parse(eco),
  projectPkg: projectPkg,
  fakeArgs: fakeArgs
}