/* global angular */
/* global _ */
/* global $ */

var app = angular.module("playgroundApp", []); 

var Neuron = null;

(function() {
  var neuronSerialNum = 1;
  
  Neuron = function(layerId, iInLayer, nInLayer) {
    var self = this;
    self.serial = neuronSerialNum;
    neuronSerialNum++;
    
    self.layer = layerId;
    self.i = iInLayer;
    self.p = iInLayer / (nInLayer - 1);

    self.activity = 0;
    self.activityNext = 0;
    self.threshold = 0;
  };
}());



app.controller("playgroundCtrl", function($scope, $timeout) {
  var ctrl = this;
  $scope.ctrl = ctrl;
  
  ctrl.networkStructure = {
    numSensors: 100,
    numIntegrators: 30,
    numOutputs: 2,
    sensorAxonSpread: .05,
    integratorLateralSpread: .1
  };

  var createNetwork = function() {
    ctrl.sensors = new Array(ctrl.networkStructure.numSensors);
    _.each(ctrl.sensors, function(sensor, iSensor) {
      ctrl.sensors[iSensor] = new Neuron('sensor', iSensor, ctrl.networkStructure.numSensors);
    });

    ctrl.integrators = new Array(ctrl.networkStructure.numIntegrators);
    _.each(ctrl.integrators, function(integrator, iIntegrator) {
      ctrl.integrators[iIntegrator] = new Neuron('integrator', iIntegrator, ctrl.networkStructure.numIntegrators);
      ctrl.integrators[iIntegrator].threshold = -1;
    });
    
    ctrl.outputs = new Array(ctrl.networkStructure.numOutputs);
    _.each(ctrl.outputs, function(output, iOutput) {
      ctrl.outputs[iOutput] = new Neuron('output', iOutput, ctrl.networkStructure.numOutputs);
    });
  }; 


  var setNextActivityLevels = function(neuronArray) {
    _.each(neuronArray, function(neuron) {
      // Add a random perturbation to prevent ties.
      //neuron.activityNext += (Math.random() * .1) - 0.05;
      
      // Activity level gets pulled toward activityNext.
      var activityDelta = neuron.activityNext - neuron.activity;
      neuron.activity += activityDelta * .4;
      if (neuron.activity < 0.0001) {
        neuron.activity = 0;
      }

      if (neuron.activity < 0) {
        neuron.activity = 0;
      }
      if (neuron.activity > 1) {
        neuron.activity = 1;
      }


      neuron.activityNext = neuron.activity;
    });
  };
  
  var computeStrength = function(deltap, spread) {
    deltap = Math.abs(deltap);
    var strength = Math.max(0, 1.0 - deltap/spread);
    return strength;
  };
  
  ctrl.doTimeStep = function() {
    _.each(ctrl.integrators, function(integrator) {
      integrator.activityNext = -integrator.threshold;
    });
    _.each(ctrl.outputs, function(output) {
      output.activityNext = -output.threshold;
    });


    // Sensors are off by default, and turn on when touched.
    _.each(ctrl.sensors, function(sensor) {
      if (sensor.isBeingTouched) {
        sensor.activityNext = 1;
      } else {
        sensor.activityNext = 0;
      }
    });


    // Sensors inhibit integrators.
    _.each(ctrl.sensors, function(sensor) {
      _.each(ctrl.integrators, function(integrator) {
        var sensorIntegratorFactor = 1;
        var strength = 
            computeStrength(
                sensor.p - integrator.p, 
                ctrl.networkStructure.sensorAxonSpread
            );
        integrator.activityNext -= 
            sensor.activity * strength * sensorIntegratorFactor;
      });
    });



    var outputActivityNext = _.pluck(ctrl.outputs, 'activityNext');
    console.log(outputActivityNext)


    setNextActivityLevels(ctrl.sensors);
    setNextActivityLevels(ctrl.integrators);    
    setNextActivityLevels(ctrl.outputs);
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
    $timeout(animate, 100);
  };
  animate();
});

