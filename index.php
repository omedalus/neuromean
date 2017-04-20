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
    <header class="col-sm-12">
      <h1>Neuromean</h1>
      <p>
        A demonstration of how somatospatial 
        neurocircuits can be used
        to compute spatial averages.
      </p>
    </header>
    
    <div class="col-md-6 instructions">
      <p>
        Hover over a 
        <span class="sensortext">primary sensor neuron</span>
        to see its connection strengths to each of the 
        <span class="integratortext">spatial integrator neurons</span>.
      </p>
      <p>
        Click on a  
        <span class="sensortext">primary sensor neuron</span>
        to activate it. This simulates the animal being touched
        in the corresponding location of its anatomy. The more 
        sensors you activate, the more forceful the simulated
        contact. The 
        <span class="integratortext">spatial integrator neurons</span>
        will activate corresponding to their proximity to the 
        activated sensory neurons.
      </p>
      <p>
        Click the 
        <span class="lateralinhibitiontext">
          lateral inhibition button
        </span>
        to see the effects of lateral inhibition in the 
        spatial integration layer. This causes the 
        <span class="integratortext">spatial integrator neurons</span>
        to "fight" with one another over who gets to be active and
        who doesn't. In the end, only one can win: the one that is
        receiving the greatest amount of total stimulation from the 
        sensory layer. If this simulation is working properly, then the 
        "winning" spatial integrator will be the one that represents the 
        "center of mass" of the activated input neurons.
      </p>
      <p>
        Double-click the 
        <span class="lateralinhibitiontext">
          lateral inhibition button
        </span>
        to perform lateral inhibition automatically as you turn
        sensory neurons on and off.
        
        In reality, lateral inhibition is not a separate step; 
        it happens automatically as interneurons get stimulated.
        We merely have a button for it here for user interface purposes,
        so that you could see what the spatial integration layer's 
        activity <em>would</em> be if it was a simple summation of the 
        sensor contributions. 
      </p>
      <p>
        The
        <span class="outputtext">
          output neurons
        </span>
        project axons into nerves that head towards the central
        nervous system. They receive input from each spatial integrator 
        in simple linear proportion to their distance from that integrator.
      </p>
      <p>
        The key takeaways are as follows:
        <ul>
          <li>An isolated stimulus on the left strongly activates the nerve on the left.</li>
          <li>An isolated stimulus on the right strongly activates the nerve on the right.</li>
          <li>An isolated stimulus near the center produces middling activity in both nerves.</li>
          <li>A <em>dual</em> stimulus on both the left <em>and</em> the right produces 
          output that resembles an isolated stimulus in the center &mdash; that is,
          middling activity in both nerves.</li>
        </ul>
      </p>
      
    </div>
  
    <article data-ng-controller="neuromeanCtrl" class="col-md-6 noselect">
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
        
        <g id="lateralinhibition"
            data-ng-class="{autolateral: ctrl.autolateral}">
          <line
              data-ng-repeat="integrator in ctrl.integrators"
              x1="210"
              y1="150"
              x2="{{positionCalculator.integratorX(integrator.i)}}" 
              y2="{{positionCalculator.integratorY(integrator.i)}}" 
          />
          <rect 
              x="150" 
              y="140" 
              width="120" 
              height="20"
              rx="15"
              ry="15"/>
          <text x="160" y="155" fill="#888">Lateral Inhibition</text>
        </g>        
        
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
    