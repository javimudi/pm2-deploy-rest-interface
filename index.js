var pm2 = require('pm2');
var restify = require('restify');
var kue = require('kue');
var JSON5 = require('json5');
var fs = require('fs');
var env = require('process').env;
var kue = require('kue');
var express = require('express');
var debug = {
	info: require('debug')('info'),
	warn: require('debug')('warn'),
	error: require('debug')('error')
}
var ospath = require('path');
var port = env.PM2RPORT || 8090;
var kueport = env.KUE_PORT || 8091;
var appDir = ospath.join(ospath.dirname(module.filename),'./');
var deploymentFile = ospath.join(appDir, 'deployment.json5');
var eco = fs.readFileSync(deploymentFile);


// Super simple server
var server = restify.createServer({ name: 'pm2-deploy-rest-interface' });

var getter = function(req, res){
	res.send(JSON5.parse(eco).deploy);
}

var action = function(req, res){
	var body = req.params;
	debug.info(body);
	res.send(200);
}

server.get('/(.*)', getter);
server.put('/(.)*', action);

server.listen(port, function(){
	debug.info("Starting pm2-deploy-rest-interface on port " + port);
});


var app_kue = express();
app_kue.use(kue.app);
app_kue.listen(kueport,  function(){
     debug.info("Kue UI listening on port " + kueport + "...");
});
