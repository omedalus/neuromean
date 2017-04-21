<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?><!DOCTYPE html>
<html data-ng-app="playgroundApp">
  <head>
    <?php include 'php/html_head_common.php'; ?>
    
    <script src="app/playground.js?nocache=<?php echo time(); ?>"></script>

    <link rel="stylesheet" type="text/css" href="style/neuromean.css" />
    <title>Neuro Playground</title>
  </head>

  <body class="container">
    <header class="col-sm-12">
      <h1>Neuro Playground</h1>
      <p>
        A place where Misha can play with some ideas.
      </p>
    </header>
    
    <article data-ng-controller="playgroundCtrl" class="col-md-6 noselect">
      <button class="button" data-ng-click="ctrl.doTimeStep()">Time step</button>
      
      <svg id="mainview" width="1000" height="600">

        <line
            data-ng-repeat="integrator in ctrl.integrators"
            x1="{{positionCalculator.sensorX(sensorHovering)}}"
            y1="{{positionCalculator.sensorY(sensorHovering)}}"
            x2="{{positionCalculator.integratorX(integrator.i)}}" 
            y2="{{positionCalculator.integratorY(integrator.i)}}" 
            class="sensoraxon"
            data-ng-show="sensorHovering != null"
            stroke-width="{{10 * ctrl.connectionStrength(sensorHovering, integrator.i)}}"
            stroke-opacity="{{ctrl.connectionStrength(sensorHovering, integrator.i)}}"
            >
        </line>

        <circle 
            data-ng-repeat="sensor in ctrl.sensors"
            cx="{{positionCalculator.sensorX(sensor.i)}}" 
            cy="{{positionCalculator.sensorY(sensor.i)}}" 
            r="5"
            class="sensor"
            data-index="{{sensor.i}}"
            data-ng-class="{isbeingtouched: sensor.isBeingTouched}"
            stroke-width="{{sensor.activity * 5}}"
            >
        </circle>

        <circle 
            data-ng-repeat="integrator in ctrl.integrators"
            cx="{{positionCalculator.integratorX(integrator.i)}}" 
            cy="{{positionCalculator.integratorY(integrator.i)}}" 
            r="5"
            class="integrator"
            stroke-width="{{integrator.activity * 5}}"
            >
        </circle>

        <circle 
            data-ng-repeat="output in ctrl.outputs"
            cx="{{positionCalculator.outputX(output.i)}}" 
            cy="{{positionCalculator.outputY(output.i)}}" 
            r="5"
            class="output"
            stroke-width="{{output.activity * 5}}"
            >
        </circle>
        
      </svg>
    </article>
  </body>
</html>
    