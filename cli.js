#!/usr/bin/env node

var commander = require('commander');
var pkg = require('./package.json');
var fs = require('fs');
var JSON5 = require('json5');
var process = require('process');

var utils = require('./lib/utils.js');
var eco = utils.eco;


var appDefinition = {
	"name": pkg.name + "_" + utils.projectPkg.name,
	"app": "./node_modules/.bin/pm2dri"
}

var run = function(cmd){
	// Full log
	process.env.DEBUG = 'info,warn,debug';
	require('./app.js').restServer();
}

var init = function(cmd){
	
	// Drop old 
	for(var i=0; i< eco.apps.length; i++){
		if(eco.apps[i].name===appDefinition.name){
			eco.apps.splice(i, 1);
		}
	}

	eco.apps.push(appDefinition);

	fs.writeFileSync(utils.deploymentFile, JSON5.stringify(eco, null, 2));
}


commander.version(pkg.version);

commander.command('init')
	.description("Add app to project ecosystem file")
	.action(init);

commander.command('run')
	.description("Starts service")
	.action(run);

commander.parse(process.argv);
