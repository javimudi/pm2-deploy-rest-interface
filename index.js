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
var queue = require('./lib/kueHelper.js');

// Super simple server
var server = restify.createServer({ name: 'pm2-deploy-rest-interface' });
server.use(restify.bodyParser());

var getter = function(req, res){
	res.send(Object.keys(JSON5.parse(eco).deploy));
}

var update = function(req, res){
    try {
        var target = req.body.target;
        debug.info("Preparing update for '" + target + "'");
        queue.create('update', {"title": "Update for " + target, "target": target}).save();
        res.send(202);
    } catch(e){
        debug.error(e);
        res.send(400, e);
    }	
}

var deploy = function(req, res){
    try {
        var target = req.body.target;
        debug.info("Preparing deploy for '" + target + "'");
        queue.create('deploy',  {"title": "Deploy for " + target, "target": target}).save();
        res.send(201);
    } catch(e){
        debug.error(e);
        res.send(400);
    }
}

server.get('/(.*)', getter);
server.put('/(.*)', update);
server.post('/(.*)', deploy);

server.listen(port, function(){
	debug.info("Starting pm2-deploy-rest-interface on port " + port);
});


var app_kue = express();
app_kue.use(kue.app);
app_kue.listen(kueport,  function(){
     debug.info("Kue UI listening on port " + kueport + "...");
});
