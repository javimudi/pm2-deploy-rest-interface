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


app.factory('updatesService', ['$timeout', 'socketService',
	function($timeout, socketService){

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
				var parsed = JSON.parse(data);
				angular.forEach(Object.keys(parsed), function(key){
					$timeout(function(){
						updates[key] = parsed[key];
					}, 1000);
				});
			});

        };

		return {
			getUpdates: function(){ return updates },
			init: init
		}


	}]);

app.controller('jobProgressCtrl', ['$scope','$timeout', 'updatesService',
	function($scope, $timeout, updatesService){
		$scope.$watch(function(){
			return $scope.jobid;
		},
		function(newV){
			if(typeof newV!='undefined'){
				var room = 'jobid_'+$scope.jobid;
				$scope.$watch(function(){
					return updatesService.getUpdates();
				},
				function(newV){
					$scope.percentage = newV[room];
					if(newV[room]>=100){
						$timeout(function(){
							delete $scope.$parent.updating[$scope.environ];
						}, 5000);
					}
				}, true);
			}
		}); 


		$scope.barColor = function(){
			if($scope.percentage<=40){
				return 'progress-bar-warning';
			}
			else if ($scope.percentage>40 && $scope.percentage < 100){
				return 'progress-bar-info';
			}
			else {
				return 'progress-bar-success';
			}
		}
	}]);



app.directive('jobProgress', function(){
	return {
		restrict: 'E',
		templateUrl: '/public/templates/jobProgress.html.tpl',		
		link: function(scope, elem, attrs){
			attrs.$observe('jobid', function(id){
				scope.jobid = id;
			})

			attr.$observe('environ', function(environ){
				scope.environ = environ;
			});
		},
		controller: "jobProgressCtrl"
	}
})