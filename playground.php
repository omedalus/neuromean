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
    
    <script src="app/neuron.js"></script>
    <script src="app/playground.js"></script>

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
    
    <article data-ng-controller="playgroundCtrl as ctrl" class="col-md-6 noselect">
      <p>
        TIME(ms): {{ctrl.timer.time_ms}}
      </p>
      <svg id="mainview" width="1000" height="600" data-ng-show="ctrl.isNetworkReady">

        <circle 
            data-ng-repeat="sensor in ctrl.sensors"
            cx="{{sensor.drawPosition().x}}" 
            cy="{{sensor.drawPosition().y}}" 
            r="{{5 + sensor.activity * 3}}"
            class="neuron sensor"
            data-index="{{sensor.layerPosition.index}}"
            data-serial="{{sensor.serial}}"
            data-ng-class="{isbeingtouched: sensor.isBeingTouched}"
            stroke-width="{{sensor.activity * 5}}"
            >
        </circle>

        <circle 
            data-ng-repeat="integrator in ctrl.integrators"
            cx="{{positionCalculator.integratorX(integrator.layerPosition.index)}}" 
            cy="{{positionCalculator.integratorY(integrator.layerPosition.index)}}" 
            r="5"
            class="neuron integrator"
            data-index="{{integrator.layerPosition.index}}"
            data-serial="{{integrator.serial}}"
            stroke-width="{{integrator.activity * 5}}"
            >
        </circle>

        <circle 
            cx="425" 
            cy="300" 
            r="5"
            class="neuron summer"
            data-index="0"
            data-serial="{{ctrl.summer.serial}}"
            stroke-width="{{ctrl.summer.activity * 5}}"
            >
        </circle>

        <circle 
            data-ng-repeat="output in ctrl.outputs"
            cx="{{positionCalculator.outputX(output)}}" 
            cy="{{positionCalculator.outputY(output)}}" 
            r="5"
            class="neuron output"
            data-index="{{output.layerPosition.index}}"
            data-serial="{{output.serial}}"
            stroke-width="{{output.activity * 5}}"
            >
        </circle>
        <!--
        <text
            data-ng-repeat="output in ctrl.outputs"
            x="{{positionCalculator.outputX(output) - 16}}" 
            y="{{positionCalculator.outputY(output) + 16}}" 
            class="outputtext"
            >
          {{output.activity|number:2}}
        </text>
        -->
        
      </svg>
    </article>
  </body>
</html>
    