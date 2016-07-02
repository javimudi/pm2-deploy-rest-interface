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