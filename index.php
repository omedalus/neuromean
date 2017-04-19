<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?><!DOCTYPE html>
<html data-ng-app="neuromeanApp">
  <head>
    <?php include 'php/html_head_common.php'; ?>
    
    <script src="app/neuromean.js?nocache=<?php echo time(); ?>"></script>

    <link rel="stylesheet" type="text/css" href="style/neuromean.css" />
    <title>Neuromean</title>
  </head>

  <body class="container">
    <header>
      <h1>Neuromean</h1>
    </header>
  
    <article data-ng-controller="neuromeanCtrl">
      <svg id="mainview" width="500" height="300">

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
        
        <rect 
            x="160" 
            y="160" 
            width="100" 
            height="20"
            rx="15"
            ry="15"
            id="lateralinhibition"/>
        
      </svg>
    </article>
  </body>
</html>
    