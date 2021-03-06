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

// Local dependencies
var queue = require('./lib/kueHelper.js');
var eco = require('./lib/utils.js').eco;

// Network settings
var port = env.PM2DRIPORT || 8090;
var kueport = env.KUEPORT || 8091;



var restServer = function(){

    // Super simple server
    var server = restify.createServer({ name: 'pm2-deploy-rest-interface' });
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(express.static(__dirname+"/public"));




    var getter = function(req, res){
    	res.send(Object.keys(eco.deploy));
    }

    var update = function(req, res){
        try {
            var target = req.params.environ;
            debug.info("Preparing update for '" + target + "'");
            var job = queue.create('update', {"title": "Update for " + target, "target": target})
            .save(function(err){
                if(!err){
                    res.send(202, job.id);
                } else {
                    res.send(400, err);
                }
            });
        } catch(e){
            debug.error(e);
            res.send(400, e);
        }	
    }

    var deploy = function(req, res){
        try {
            var target = req.params.environ;
            debug.info("Preparing deploy for '" + target + "'");
            var job = queue.create('deploy',  {"title": "Deploy for " + target, "target": target})
            .save(function(err){
                if(!err){
                    res.send(201, job.id);
                } else {
                    res.send(400, err);
                }
            });
        } catch(e){
            debug.error(e);
            res.send(400, e);
        }
    }

    // API 
    server.get('/getenvs(.*)', getter);
    server.put('/:environ', update);
    server.post('/:environ', deploy);


    // Super simple app
    server.get(/\/public\/?.*/, restify.serveStatic({
        directory: __dirname
    }));

    server.get('/', restify.serveStatic({ 
        directory: 'public',
        default: 'index.html'
    }));


    var app = server.listen(port, function(){
        debug.info("Starting pm2-deploy-rest-interface on port " + port);
    });

    // Socket.io stuff
    var io = require('socket.io').listen(app, function() {
        debug.info("Socket.io listening... ")
    });


    io.sockets.on('connection', function(socket) {
        debug.info("New client");
        socket.on('progress', function(data){
            io.sockets.emit('updates', data);
        })
    });


    // Kue stuff
    var app_kue = express();
    app_kue.use(kue.app);
    app_kue.listen(kueport,  function(){
         debug.info("Kue UI listening on port " + kueport + "...");
    });


}


exports.restServer = restServer;
if(require.main === module){
    restServer();
}



