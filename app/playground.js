/* global _ */
/* global $ */
/* global angular */
/* global Neuron */

var app = angular.module("playgroundApp", []); 



app.controller("playgroundCtrl", function($scope, $timeout) {
  var ctrl = this;
  ctrl.isNetworkReady = false;

  ctrl.networkStructure = {
    numSensors: 30,
    numIntegrators: 10,
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
    });

    ctrl.outputs = new Array(ctrl.networkStructure.numOutputs);
    _.each(ctrl.outputs, function(output, iOutput) {
      ctrl.outputs[iOutput] = new Neuron('output', iOutput, ctrl.networkStructure.numOutputs);
      ctrl.outputs[iOutput].activityDissipationRate = 1 / 1000;
    });
    
    let outputLOVN = ctrl.outputs[0];
    let outputTN = ctrl.outputs[1];    
    
    // Sensors project proportionally to TN
    _.each(ctrl.sensors, function(sensor) {
      sensor.projectToNeuron(outputTN, sensor.layerPosition.fraction);
    });
    
    ctrl.neurons = _.indexBy(_.union(ctrl.sensors, ctrl.integrators, ctrl.outputs), 'serial');
    ctrl.isNetworkReady = true;
  };
  
  
  ctrl.doTimeStep = function(newTime) {
    let outputLOVN = ctrl.outputs[0];
    let outputTN = ctrl.outputs[1];

    // Dissipate previously accumulated activity, and update neuron's
    // internal chronometer.
    _.each(ctrl.neurons, function(neuron) {
      neuron.doTimeStep(newTime);
    });
    
    // Receive primary sensory stimulation.
    _.each(ctrl.neurons, function(neuron) {
      if (neuron.isBeingTouched) {
        let stimAmountPerMs = neuron.activityDissipationRate + .1;
        neuron.receiveStimulus(stimAmountPerMs * ctrl.timer.step_ms);
      }
    });
    
    // Fire neurons that need firing.
    let neuronsToFire = _.filter(ctrl.neurons, function(neuron) { return neuron.shouldFire(); });
    _.each(neuronsToFire, function(neuron) {
      neuron.fire();
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
        $scope.$apply();
      });

  createNetwork();
  
  ctrl.timer = {
    animation_ms: 5, // Ms per animation step.
    step_ms: 1, // How many milliseconds of sim time pass in one step of real time.
    time_ms: 0, // Current simulation time, in milliseconds.
    step: function() {
      this.time_ms += this.step_ms;
      return this.time_ms;
    }
  };

  
  var animate = function() {
    ctrl.doTimeStep(ctrl.timer.step());
    $timeout(animate, ctrl.timer.animation_ms);
  };
  animate();
});

