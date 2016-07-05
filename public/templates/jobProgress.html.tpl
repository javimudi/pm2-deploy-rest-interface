<div class="row">
	<div class="col-xs-9">
		<div class="progress">
		  <div class="progress-bar progress-bar-striped progress-bar-warning active" 
		  	role="progressbar" 
		  	aria-valuenow="{{percentage}}" 
		  	aria-valuemin="0" 
		  	aria-valuemax="100" 
		  	style="width: {{percentage}}%"
		  	ng-class="barColor()">
		    <span class="sr-only">{{percentage}}% Complete</span>
		  </div>
		</div>
	</div>
	<div class="col-xs-3">
		<button class="btn btn-danger btn-xs" ng-click="cancelJob({{jobid}})">
			<span class="glyphicon glyphicon-remove"></span>
		</button>
	</div>
</div>