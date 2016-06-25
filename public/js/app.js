'use strict';

var app = angular.module('pm2dri', []);

app.factory('envsService', [ '$http', 
	function($http){

		var envs = [];

		var getenvs = function(){
			return $http.get('/getenvs').then(function(response){
				envs = response.data;
				return response.data;
			})
		}

		var deployEnviron = function(environ){
			return $http.post('/'+environ).then(function(response){
				return (response.status === 201);
			});
		}

		var updateEnviron = function(environ){
			return $http.put('/'+environ).then(function(response){
				return (response.status === 202);
			})
		}

		return {
			getenvs: getenvs,
			envs : function(){ return envs; },
			deployEnviron: deployEnviron,
			updateEnviron: updateEnviron
		}

	}]);

app.controller('deployTableCtrl', [ '$scope', 'envsService',
	function($scope, envsService){
		$scope.init = function(){
			envsService.getenvs().then(function(response){
				console.log(response);
				$scope.environments = response;
			})
		}

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
						if(response===true){
							swal("Good job!", "It was enqueued", "success")
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
						console.log(response);
						if(response===true){
							swal("Good job!", "It was enqueued", "success")
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



app.filter('capitalize', function() {
  return function(input, scope) {
    if (input!=null)
    input = input.toLowerCase();
    return input.substring(0,1).toUpperCase()+input.substring(1);
  }
});