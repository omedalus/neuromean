/* global _ */
/* global $ */
/* global angular */
/* global Neuron */
/* global GlobalNeuron */
/* global SensorNeuron */
/* global OutputNeuron */

var app = angular.module("playgroundApp", []); 



app.controller("playgroundCtrl", function($scope, $timeout) {
  var ctrl = this;
  ctrl.isNetworkReady = false;

  ctrl.networkStructure = {
    numSensors: 50,
    numIntegrators: 0,
    numOutputs: 20
  };

  var createNetwork = function() {
    ctrl.sensors = SensorNeuron.createLayer(ctrl.networkStructure.numSensors);
    ctrl.summers = GlobalNeuron.createLayer('summer');

    let lovnAxons = OutputNeuron.createLayer('lovn', ctrl.networkStructure.numOutputs);
    let tnAxons = OutputNeuron.createLayer('tn', ctrl.networkStructure.numOutputs);
    ctrl.outputs = _.union(lovnAxons, tnAxons);
    
    Neuron.projectLayerToLayer(ctrl.sensors, lovnAxons, .2, 1, false);
    Neuron.projectLayerToLayer(ctrl.sensors, tnAxons, .2, 1, false);

    Neuron.projectLayerToLayer(ctrl.sensors, ctrl.summers, .2, null, false);
    Neuron.projectLayerToLayer(ctrl.summers, ctrl.outputs, -5, null, false);


    ctrl.neurons = _.indexBy(_.union(ctrl.sensors, ctrl.summers, ctrl.outputs), 'serial');
    ctrl.isNetworkReady = true;
  };
  
  
  ctrl.doTimeStep = function(newTime) {
    // Receive primary sensory stimulation.
    _.each(ctrl.sensors, function(sensor) {
      if (sensor.isBeingTouched) {
        sensor.receiveStimulus(1);
      }
    });
    
    // Propagate activity.
    _.each(ctrl.neurons, function(neuron) {
      neuron.propagateActivity();
    });
    
    // Advance next activity to current activity level.
    _.each(ctrl.neurons, function(neuron) {
      neuron.doTimeStep(newTime);
    });
  };


  $scope.positionCalculator = {

    
    integratorX: function(i) {
      var xStart = 80;
      var xEnd = 760;
      return ((xEnd - xStart) * i / ctrl.networkStructure.numIntegrators) + xStart;
    },
    
    integratorY: function(i) {
      return 200;
    },


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
    animation_ms: 20, // Real ms per animation step.
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

