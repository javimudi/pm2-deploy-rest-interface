var kue = require('kue'),
queue = kue.createQueue(),
pm2 = require('pm2');

var deploymentFile = require('./utils.js').deploymentFile;
var fakeArgs = require('./utils.js').fakeArgs;

queue.process('update', function(job, done){
	var fA = new fakeArgs();
	var commands = ['pm2', 'deploy', deploymentFile, job.data.target, 'update'];
	for(command of commands){
		fA.push(command);
	}
    pm2.deploy(deploymentFile, fA, done);

});


queue.process('deploy', function(job, done){
    // Setup first
	var fA = new fakeArgs();
	var commands = ['pm2', 'deploy', deploymentFile, job.data.target, 'setup'];
	for(command of commands){
		fA.push(command);
	}
    pm2.deploy(deploymentFile, fA);

    // Deploy later
	var fA = fakeArgs();
	var commands = ['pm2', 'deploy', deploymentFile, job.data.target];
	for(command of commands){
		fA.push(command);
	}
    pm2.deploy(deploymentFile, fA, done);

});


module.exports = queue;