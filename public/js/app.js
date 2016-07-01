'use strict';

var app = angular.module('pm2dri', []);


app.factory('socketService', ['$rootScope', function($rootScope) {
    var socket = io.connect({
        'reconnect': true
    });
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}]);

app.factory('envsService', [ '$http', 
	function($http){

		var envs = [];
		var updating = [];
		var deploying = [];

		var getenvs = function(){
			return $http.get('/getenvs').then(function(response){
				envs = response.data;
				return response.data;
			})
		}

		var deployEnviron = function(environ){
			return $http.post('/'+environ).then(function(response){
				if(response.status === 201){
					return response.data
				}
				else {
					return false;
				}
			}, function(){ return false });
		}

		var updateEnviron = function(environ){
			return $http.put('/'+environ).then(function(response){
				if(response.status === 202){ 
					return response.data 
				}
				else {
					return false;
				}
			}, function(){ return false });
		}

		return {
			getenvs: getenvs,
			envs : function(){ return envs; },
			deployEnviron: deployEnviron,
			updateEnviron: updateEnviron,
			pushDeploying: deploying.push,
			pushUpdating: updating.push,
			getUpdating: function(){ return updating },
			getDeploying: function(){ return deploying }
		}

	}]);

app.controller('deployTableCtrl', [ '$scope', 'envsService', 'updatesService',
	function($scope, envsService, updatesService){
		$scope.init = function(){
			envsService.getenvs().then(function(response){
				$scope.environments = response;
			});

			updatesService.init();

		}

		$scope.deploying = {};
		$scope.updating = {};

		$scope.deployEnviron = function(environ){
			swal({
				"title": "Sure?",
				"text": "You're about to deploy a new environment",
				"type": "warning",
				showCancelButton: true,
				confirmButtonText: "Click2Deploy!",
				closeOnConfirm: false
				},
				function(){
					envsService.deployEnviron(environ).then(function(response){
						swal(response);
						if(response!==false){
							swal("Good job!", "It was enqueued", "success");
							$scope.deploying[environ] = response;
						} else {
							swal("Bad news", "The action was rejected", "error")
						}
					});
				});

		}

		$scope.updateEnviron = function(environ){
			swal({
				title: "Sure?",
				text: "You're about to update <strong>"+environ+"</strong>",
				type: "warning",
				html: true,
				showCancelButton: true,
				confirmButtonText: "Update!",
				closeOnConfirm: false
				},
				function(){
					envsService.updateEnviron(environ).then(function(response){
						if(response!==false){
							swal("Good job!", "It was enqueued", "success");
							$scope.updating[environ] = response
						} else {
							swal("Bad news", "The action was rejected", "error")
						}
					});
				});

		}

	}]);


app.directive('deployTable', function(){
	return {
		restrict: 'E',
		templateUrl: '/public/templates/deployTable.html.tpl',
		controller: 'deployTableCtrl'
	}
});


app.factory('updatesService', ['socketService',
	function(socketService){

		var updates = {};

        // Init
	    var init = function() {


            socketService.on('connect', function() {
                console.log("Connected to Socket.IO");
            });

            socketService.on('error', function(error){
            	console.log(error);
            })
                
			socketService.on('updates', function(data){
				console.log("New update");
				var parsed = JSON.parse(data);
				console.log(parsed);
				parsed.forEach(function(key){
					console.log(key);

				});
			});


        };


		return {
			getUpdates: function(){ return updates },
			init: init
		}


	}]);

app.controller('jobProgressCtrl', ['$scope', 'updatesService',
	function($scope, updatesService){

		$scope.$watch(function(){
			return $scope.jobid;
		},
		function(newV){
			if(typeof newV!='undefined'){
				var room = 'jobid_'+$scope.jobid;
				console.log(room);

				$scope.$watch(function(){
					return updatesService.getUpdates(); 
				}, function(newV, oldV){
					console.log("Changed");
				}); // Object Value, not reference
			}
		}); 

	}]);



app.directive('jobProgress', function(){
	return {
		restrict: 'AE',
		templateUrl: '/public/templates/jobProgress.html.tpl',		
		link: function(scope, elem, attrs){
			attrs.$observe('jobid', function(id){
				scope.jobid = id;
			})
		},
		controller: "jobProgressCtrl"
	}
})