var kue = require('kue'),
queue = kue.createQueue(),
pm2 = require('pm2');

queue.process('update', function(job, done){
    // pm2 update job.data.target update
    done();
});


queue.process('deploy', function(job, done){
    // pm2 job.data.target setup
    // pm2 job.data.target
    done();
});


module.exports = queue;