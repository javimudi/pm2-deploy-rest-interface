
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
	<td>
		<button class="btn btn-primary btn-lg" ng-click="deployEnviron(environ)">
			<span class="glyphicon glyphicon-plus"></span>
			Deploy
		</button>
	</td>
	<td>
		<button class="btn btn-success btn-lg" ng-click="updateEnviron(environ)">
			<span class="glyphicon glyphicon-repeat"></span>			
			Update
		</button>
	</td>
</tbody>
</table>