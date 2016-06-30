
<table class="table table-responsive table-striped" ng-init="init()">
<thead>
	<td style="width: 60%"><h2> Deployment Environments </h2></td>
	<td style="width: 10%"></td>
	<td style="width: 10%"></td>
<thead>
<tbody>
<tr ng-repeat="environ in environments">
	<td class="vert-align">
		<h3 class="text-capitalize">{{environ}}</h3>
	</td>


	<td ng-if="!deploying[environ] && !updating[environ]">
		<button class="btn btn-primary btn-lg" 
			ng-click="deployEnviron(environ)"
			ng-disabled="updating[environ]">
			<span class="glyphicon glyphicon-plus"></span>
			Deploy
		</button>
	</td>

	<td ng-if="!updating[environ] && !deploying[environ]">
		<button class="btn btn-success btn-lg" 
			ng-click="updateEnviron(environ)"
			ng-disabled="deploying[environ]">
			<span class="glyphicon glyphicon-repeat"></span>			
			Update
		</button>
	</td>

	<td colspan="2" style="width: 30%" ng-if="updating[environ] || deploying[environ]">
		<job-progress jobid="{{updating[environ]}}"></job-progress>
	</td>
</tbody>

</table>