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
            data-ng-repeat="neuron in ctrl.neurons"
            cx="{{neuron.drawPosition().x}}" 
            cy="{{neuron.drawPosition().y}}" 
            r="{{5 + neuron.activity * 2}}"
            class="neuron {{neuron.layer}}"
            data-index="{{neuron.layerPosition.index}}"
            data-serial="{{neuron.serial}}"
            data-ng-class="{isbeingtouched: neuron.isBeingTouched}"
            stroke-width="{{neuron.activity * 5}}"
            >
        </circle>

        <text
            x="104" 
            y="186" 
            class="outputtext"
            >
          {{ctrl.getTotalOutputNerveActivity('lovn')|number:2}}
        </text>

        <text
            x="704" 
            y="186" 
            class="outputtext"
            >
          {{ctrl.getTotalOutputNerveActivity('tn')|number:2}}
        </text>


      </svg>
    </article>
  </body>
</html>
    