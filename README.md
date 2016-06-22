# pm2-deploy-rest-interface
[![Build Status](https://api.travis-ci.org/javimudi/pm2-deploy-rest-interface.png?branch=master)](https://travis-ci.org/javimudi/pm2-deploy-rest-interface)

PM2 DEPLOY API REST Interface

## What is PM2DRI (PM2 Deploy API REST Interface)?

PM2DRI is a node module created to be added to a private (but not restricted) deployment repository. Sometimes you might find yourself having to deploy your software to an unmanaged environment. Thus, sensible deployment information included into your main repo ecosystem file should not be accesible for a third party. An easy solution for this situation could be having a secondary repository, including only deployment data. PM2DRI was born thinking of integrating this sort of repository with your favourite CI tool.

## How does PM2DRI works?

PM2DRI includes (hopefully) three well-known components:
* A [Restify](http://restify.com) REST API, listening to basic PM2 Deploy commands (deploy, update), which will trigger commands on demand. Commands can be requested at the final stage of your CI pipelines.
* One (or several) [Kue](http://automattic.github.io/kue/) job queues, used to efficiently manage your deployment tasks.
* A fucking simple AngularJS web interface, used to force updates and follow PM2 tasks status (COMING SOON). The Kue web component is still accesible.

After launching PM2DRI, your ecosystem file will be found and parsed and the environments under your `deploy` section will be available for future tasks.

## How to install and setup PM2DRI?

```
npm install javimudi/pm2-deploy-rest-interface
```

A CLI called `pm2dri` will be installed into your project npm bin directory (`./node_modules/.bin/pm2dri`).

Two commands are available:

* (optional) `./node_modules/.bin/pm2dri init`. Appends a custom app to your ecosystem file. PM2DRI will be started when using `pm2 start _your_ecosystem_file.json5_`. Two env variables can be used:
	* PM2DRIPORT. The port PM2DRI will be listen to. Defaults to 8090.
	* KUEPORT. The port Kue will be listen to. Defaults to 8091.
* `./node_modules/./bin/pm2dri run`. Actually starts your PM2DRI service.

After PM2DRI is installed and setup, the API and the web component can be accessed at [http://your_project_IP:8090](http://127.0.0.1:8090)


## API (Commands available)

Once PM2DRI is up and running, three commands can be sent.

#### PM2 ENVIRONMENTS GETTER

* `GET http://your_IP:8090/getenvs`. An array with your deployment environments is obtained.
	* E.g. : `['test', 'production', 'client1']`

#### PM2 Deployment Command
* `POST http://your_project_IP:8090/myenvironment`. A deploy for your environ called 'myenvironment' will be queued at the main 'deploy' queue. Thinking of PM2, a `setup` command is performed first.

#### PM2 Update command
* `PUT http://your_project_IP:8090/myenvironment`. An update for your environ called 'myenvironment' will be queued at the main 'update' queue.


# Next Steps

* AngularJS web component to handle tasks
* Authentication engine
* Ecosystem editing
