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
    self.p = (nInLayer > 1) ? (iInLayer / (nInLayer - 1)) : .5;

    self.activity = 0;
    self.activityNext = 0;
    self.threshold = 0;
  };
  
  Neuron.prototype.setNextActivityLevel = function() {
    var neuron = this;

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
  };
  
  Neuron.prototype.strength = function(otherNeuron, spread) {
    var deltap = Math.abs(this.p - otherNeuron.p);
    var strength = Math.max(0, 1.0 - deltap/spread);
    return strength;
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
    
    ctrl.neurons = _.indexBy(_.union(ctrl.sensors, ctrl.integrators, ctrl.outputs), 'serial');
  };
  
  
  ctrl.doTimeStep = function() {
    var outputLOVN = ctrl.outputs[0];
    var outputTN = ctrl.outputs[1];

    // All neurons turn on when touched.
    _.each(ctrl.neurons, function(neuron) {
      neuron.activityNext = -neuron.threshold;
      if (neuron.isBeingTouched) {
        neuron.activityNext = 1;
      }
    });


    // Sensors stimulate outputs (for now).
    _.each(ctrl.sensors, function(sensor) {
      _.each(ctrl.outputs, function(output) {
        var strength = sensor.strength(output, 1);
        var sensorOutputFactor = 1;
        output.activityNext += 
            sensor.activity * strength * sensorOutputFactor;
      });
    });


    _.each(ctrl.neurons, function(neuron) {
      neuron.setNextActivityLevel();
    });
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
      return 200;
    },

    outputX: function(i) {
      var xStart = 120;
      var xEnd = 720;
      return ((xEnd - xStart) * i / (ctrl.networkStructure.numOutputs - 1)) + xStart;
    },
    
    outputY: function(i) {
      return 350;
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
      on('click', 'circle.neuron', function() {
        var iNeuronSerial = parseInt($(this).attr('data-serial'), 10);
        var neuron = ctrl.neurons[iNeuronSerial];
        neuron.isBeingTouched = !neuron.isBeingTouched;
        window.neuronLastClicked = neuron;
        $scope.$apply();
      });

  createNetwork();
  
  var animate = function() {
    ctrl.doTimeStep();
    $timeout(animate, 100);
  };
  animate();
});

