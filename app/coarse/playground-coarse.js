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
    numOutputs: 10
  };

  var createNetwork = function() {
    ctrl.sensors = SensorNeuron.createLayer(ctrl.networkStructure.numSensors);

    let lovnAxons = OutputNeuron.createLayer('lovn', ctrl.networkStructure.numOutputs);
    ctrl.outputs = _.union(lovnAxons);
    
    let baseReach = 0;
    let baseSensitivity = .3;
    let sensitivityIncrement = .1;
    _.each(lovnAxons, function(lovnAxon) {

      let reach = baseReach + (1 - lovnAxon.layerPosition.fraction);
      let lovnAxonSensitivity = baseSensitivity + sensitivityIncrement * lovnAxon.layerPosition.fraction;
      
      _.each(ctrl.sensors, function(sensor) {
        if (sensor.layerPosition.fraction > reach) {
          return;
        }
        sensor.projectToNeuron(lovnAxon, lovnAxonSensitivity);
      });
    });
    
    let baseInhibition = -1;
    _.each([lovnAxons[0]], function(lovnAxonFrom) {
      let suppressivePower = (1 - lovnAxonFrom.layerPosition.fraction);
      _.each(lovnAxons, function(lovnAxonTo) {
        //let portionCoverage = lovnAxonTo.proportionOfSpanCoveredBy(lovnAxonFrom, true);
        lovnAxonFrom.projectToNeuron(lovnAxonTo, baseInhibition * suppressivePower);
      });
    });

    ctrl.neurons = _.indexBy(_.union(ctrl.sensors, ctrl.outputs), 'serial');
    ctrl.isNetworkReady = true;
  };
  
  ctrl.getTotalOutputNerveActivity = function(nerveName) {
    let sum = ctrl.outputs.reduce(function(runningSum, neuron) {
      if (neuron.nerve === nerveName) {
        return runningSum + neuron.activity;
      } else {
        return runningSum;
      }
    }, 0);
    return sum;
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

