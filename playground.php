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
      <svg id="mainview" width="1000" height="600">

        <circle 
            data-ng-repeat="sensor in ctrl.sensors"
            cx="{{positionCalculator.sensorX(sensor.i)}}" 
            cy="{{positionCalculator.sensorY(sensor.i)}}" 
            r="5"
            class="neuron sensor"
            data-index="{{sensor.i}}"
            data-serial="{{sensor.serial}}"
            data-ng-class="{isbeingtouched: sensor.isBeingTouched}"
            stroke-width="{{sensor.activity * 5}}"
            >
        </circle>

        <circle 
            data-ng-repeat="integrator in ctrl.integrators"
            cx="{{positionCalculator.integratorX(integrator.i)}}" 
            cy="{{positionCalculator.integratorY(integrator.i)}}" 
            r="5"
            class="neuron integrator"
            data-index="{{integrator.i}}"
            data-serial="{{integrator.serial}}"
            stroke-width="{{integrator.activity * 5}}"
            >
        </circle>


        <circle 
            data-ng-repeat="summer in ctrl.summers"
            cx="{{positionCalculator.summerX(summer.i)}}" 
            cy="{{positionCalculator.summerY(summer.i)}}" 
            r="5"
            class="neuron summer"
            data-index="{{summer.i}}"
            data-serial="{{summer.serial}}"
            stroke-width="{{summer.activity * 5}}"
            >
        </circle>


        <circle 
            data-ng-repeat="output in ctrl.outputs"
            cx="{{positionCalculator.outputX(output.i)}}" 
            cy="{{positionCalculator.outputY(output.i)}}" 
            r="5"
            class="neuron output"
            data-index="{{output.i}}"
            data-serial="{{output.serial}}"
            stroke-width="{{output.activity * 5}}"
            >
        </circle>
        <text
            data-ng-repeat="output in ctrl.outputs"
            x="{{positionCalculator.outputX(output.i) - 16}}" 
            y="{{positionCalculator.outputY(output.i) + 16}}" 
            class="outputtext"
            >
          {{output.activity|number:4}}
        </text>
        
      </svg>
    </article>
  </body>
</html>
    