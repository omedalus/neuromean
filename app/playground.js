/* global angular */
/* global _ */
/* global $ */

var app = angular.module("playgroundApp", []); 

app.controller("playgroundCtrl", function($scope, $timeout) {
  var ctrl = this;
  $scope.ctrl = ctrl;
  
  ctrl.networkStructure = {
    numSensors: 100,
    numIntegrators: 30,
    numOutputs: 2,
    sensorAxonSpread: .1,
    integratorLateralSpread: .1
  };
  
  ctrl.connectionStrength = function(iSensor, iIntegrator) {
    var xSensor = iSensor / (ctrl.networkStructure.numSensors - 1);
    var xIntegrator = iIntegrator / (ctrl.networkStructure.numIntegrators - 1);
    var distance = Math.abs(xSensor - xIntegrator);
    var retval = 1.0 - distance / ctrl.networkStructure.sensorAxonSpread;
    retval = Math.max(retval, 0);
    return retval;
  };

  ctrl.totalStrengthToIntegrator = function(iIntegrator) {
    var retval = 0;
    _.each(ctrl.sensors, function(sensor) {
      retval += ctrl.connectionStrength(sensor.i, iIntegrator);
    });
    return retval;
  };


  ctrl.outputStrength = function(iIntegrator, iOutput) {
    var xIntegrator = iIntegrator / (ctrl.networkStructure.numIntegrators - 1);
    var xOutput = iOutput / (ctrl.networkStructure.numOutputs - 1);
    var distance = Math.abs(xOutput - xIntegrator);
    var retval = 1.0 - distance;
    return retval;
  };

  ctrl.integratorLateralStrength = function(iIntegrator, iNeighbor) {
    var xIntegrator = iIntegrator / (ctrl.networkStructure.numIntegrators - 1);
    var xNeighbor = iIntegrator / (ctrl.networkStructure.numIntegrators - 1);
    var distance = Math.abs(xNeighbor - xIntegrator);
    var retval = 1.0 - distance / ctrl.networkStructure.integratorLateralSpread;
    retval = Math.max(retval, 0);
    return retval;
  };


  
  $scope.positionCalculator = {
    sensorX: function(i) {
      var xStart = 40;
      var xEnd = 900;
      return ((xEnd - xStart) * i / ctrl.networkStructure.numSensors) + xStart;
    },
    
    sensorY: function(i) {
      var yBottom = 120;
      var rise = 60;
      var xnorm = (2.0 * i / ctrl.networkStructure.numSensors) - 1;
      return yBottom - rise * xnorm * xnorm;
    },
    
    integratorX: function(i) {
      var xStart = 80;
      var xEnd = 760;
      return ((xEnd - xStart) * i / ctrl.networkStructure.numIntegrators) + xStart;
    },
    
    integratorY: function(i) {
      return 240;
    },

    outputX: function(i) {
      var xStart = 120;
      var xEnd = 720;
      return ((xEnd - xStart) * i / (ctrl.networkStructure.numOutputs - 1)) + xStart;
    },
    
    outputY: function(i) {
      return 400;
    }
  };

  var createNetwork = function() {
    ctrl.sensors = new Array(ctrl.networkStructure.numSensors);
    _.each(ctrl.sensors, function(sensor, iSensor) {
      sensor = {};
      ctrl.sensors[iSensor] = sensor;
      sensor.i = iSensor;
      sensor.activity = 0;
      sensor.activityNext = 0;
    });
    
    ctrl.integrators = new Array(ctrl.networkStructure.numIntegrators);
    _.each(ctrl.integrators, function(integrator, iIntegrator) {
      integrator = {};
      ctrl.integrators[iIntegrator] = integrator;
      integrator.i = iIntegrator;
      integrator.activity = 0;
      integrator.activityNext = 0;
    });
    
    ctrl.outputs = new Array(ctrl.networkStructure.numOutputs);
    _.each(ctrl.outputs, function(output, iOutput) {
      output = {};
      ctrl.outputs[iOutput] = output;
      output.i = iOutput;
      output.activity = 0;
      output.activityNext = 0;
    });
  }; 
  

  var setNextActivityLevels = function(neuronArray) {
    _.each(neuronArray, function(neuron) {
      // Add a random perturbation to prevent ties.
      //neuron.activityNext += (Math.random() * .1) - 0.05;
      
      if (neuron.activityNext < 0) {
        neuron.activityNext = 0;
      }
      if (neuron.activityNext > 1) {
        neuron.activityNext = 1;
      }

      // Activity level gets pulled toward activityNext.
      var activityDelta = neuron.activityNext - neuron.activity;
      neuron.activity += activityDelta * .1;
      if (neuron.activity < 0.0001) {
        neuron.activity = 0;
      }

      neuron.activityNext = neuron.activity;
    });
  };
  
  ctrl.doTimeStep = function() {
    // Integrators and outouts need their activity actively maintained,
    // or else they drop off quickly.
    _.each(ctrl.integrators, function(integrator) {
      integrator.activityNext = 0;
    });
    _.each(ctrl.outputs, function(output) {
      output.activityNext = 0;
    });

    // Sensors are off by default, and turn on when touched.
    _.each(ctrl.sensors, function(sensor) {
      if (sensor.isBeingTouched) {
        sensor.activityNext = 1;
      } else {
        sensor.activityNext = 0;
      }
    });
      
    // Sensors stimulate integrators.
    _.each(ctrl.sensors, function(sensor) {
      _.each(ctrl.integrators, function(integrator) {
        var connStrength = ctrl.connectionStrength(sensor.i, integrator.i);
        
        var sensorStimulationFactor = 1;
        connStrength *= sensorStimulationFactor; 
        integrator.activityNext += sensor.activity * connStrength;
      });
    });
    
    // Integrators reinforce each other.
    _.each(ctrl.integrators, function(integrator) {
      _.each(ctrl.integrators, function(neighbor) {
        if (neighbor.i == integrator.i) {
          return;
        }
        
        var latStrength = ctrl.integratorLateralStrength(integrator.i, neighbor.i);
        var neighborStimulusFactor = .4; 
        integrator.activityNext += neighbor.activity * neighborStimulusFactor * latStrength;
      });
    });

    /*
    // Integrators feed back to sensors.
    _.each(ctrl.sensors, function(sensor) {
      _.each(ctrl.integrators, function(integrator) {
        var connStrength = ctrl.connectionStrength(sensor.i, integrator.i);
        
        var integratorFeedbackFactor = .2;
        connStrength *= integratorFeedbackFactor; 
        sensor.activityNext += integrator.activity * connStrength;
      });
    });
    */
    
    // Integrators have an activation threshold.
    _.each(ctrl.integrators, function(integrator) {
      integrator.activityNext -= 0.5;
    });

    // Integrators drive output.
    _.each(ctrl.integrators, function(integrator) {
      _.each(ctrl.outputs, function(output) {
        var connStrength = ctrl.outputStrength(integrator.i, output.i);
        
        var outputStrengthFactor = 0.5; 
        connStrength *= outputStrengthFactor; 
        output.activityNext += integrator.activity * connStrength;
      });
    });

    // Output suppresses distal integrators.
    _.each(ctrl.integrators, function(integrator) {
      _.each(ctrl.outputs, function(output) {
        var suppressionStrength = 1 - ctrl.outputStrength(integrator.i, output.i);
        
        // Suppression strength is nonlinear.
        // Nearby is (almost) no suppression, far away is strong suppression... 
        // but middle is still very low suppression.
        suppressionStrength = Math.pow(suppressionStrength, 2);
        suppressionStrength += 2;
        
        var outputSuppressionFactor = 0; 
        suppressionStrength *= outputSuppressionFactor; 
        integrator.activityNext -= output.activity * suppressionStrength;
      });
    });

    setNextActivityLevels(ctrl.sensors);
    setNextActivityLevels(ctrl.integrators);    
    setNextActivityLevels(ctrl.outputs);
  };

  
  $('#mainview').
      on('mouseenter', 'circle.sensor', function() {
        var iSensor = parseInt($(this).attr('data-index'), 10);
        $scope.sensorHovering = iSensor;
        $scope.$apply();
      }).
      on('mouseleave', 'circle.sensor', function() {
        $scope.sensorHovering = null;
        $scope.$apply();
      }).
      on('click', 'circle.sensor', function() {
        var iSensor = parseInt($(this).attr('data-index'), 10);
        ctrl.sensors[iSensor].isBeingTouched = !ctrl.sensors[iSensor].isBeingTouched;
        $scope.$apply();
      });

  createNetwork();
  
  var animate = function() {
    ctrl.doTimeStep();

    var lastIntegrators = _.last(ctrl.integrators, 4);
    console.log(_.pluck(lastIntegrators, 'activity'))

    $timeout(animate, 100);
  };
  animate();
});

