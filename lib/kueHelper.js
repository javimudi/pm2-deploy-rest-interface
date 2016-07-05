var kue = require('kue'),
queue = kue.createQueue(),
pm2 = require('pm2'),
env = require('process').env;

var clientio = require('socket.io-client');
var ioport = env.PM2DRIPORT || 8090;
var socketio = clientio("http://127.0.0.1:" + ioport);

var deploymentFile = require('./utils.js').deploymentFile;
var fakeArgs = require('./utils.js').fakeArgs;

var tick = function(room, percentage, job){
	var msg ={}
	msg[room] = percentage;
	job.progress(percentage, 100);
	job.log("Job " + job.id + " progressing to " + percentage + "%");
	socketio.emit('progress', JSON.stringify(msg));
}

queue.process('update', function(job, done){

	var room = 'jobid_'+job.id;

	tick(room, 5, job);
	
	var fA = new fakeArgs();

	tick(room, 10, job)

	var commands = ['pm2', 'deploy', deploymentFile, job.data.target, 'update'];

	tick(room, 20, job);
	for(command of commands){
		fA.push(command);
	}

	tick(room, 20, job);

    pm2.deploy(deploymentFile, fA, function(){
    	tick(room, 100, job);
    });

    done();

});


queue.process('deploy', function(job, done){
    // Setup first
    var room = 'jobid_'+job.id;
    tick(room, 5, job);

	var fA = new fakeArgs();
	var commands = ['pm2', 'deploy', deploymentFile, job.data.target, 'setup'];
	for(command of commands){
		fA.push(command);
	}
    pm2.deploy(deploymentFile, fA, function(){
    	tick(room, 50, job);
    });

    // Deploy later
	var fA = fakeArgs();
	var commands = ['pm2', 'deploy', deploymentFile, job.data.target];
	for(command of commands){
		fA.push(command);
	}
    pm2.deploy(deploymentFile, fA, function(){
    	tick(room, 100, job);
    });

    done();

});


module.exports = queue;