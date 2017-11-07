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
    numOutputs: 20
  };

  var createNetwork = function() {
    ctrl.sensors = SensorNeuron.createLayer(ctrl.networkStructure.numSensors);

    let lovnAxons = OutputNeuron.createLayer('lovn', ctrl.networkStructure.numOutputs);
    let tnAxons = OutputNeuron.createLayer('tn', ctrl.networkStructure.numOutputs);
    ctrl.outputs = _.union(lovnAxons, tnAxons);
    
    OutputNeuron.innervateLayerFromLayer(lovnAxons, ctrl.sensors, 1, false);
    OutputNeuron.innervateLayerFromLayer(tnAxons, ctrl.sensors, 1, true);


    // Wiring the lateral inhibition gets slightly complicated.
    // We consider how much overlap each side gets.

    /*
    let baseInhibition = -.1;
    _.each(lovnAxons, function(lovnAxon) {
      _.each(tnAxons, function(tnAxon) {
        let tnPortionCoveredByLovn = tnAxon.proportionOfSpanCoveredBy(lovnAxon, false);
        let lovnPortionCoveredByTn = lovnAxon.proportionOfSpanCoveredBy(tnAxon, false);
        
        lovnAxon.projectToNeuron(tnAxon,
            baseInhibition * tnPortionCoveredByLovn);
        tnAxon.projectToNeuron(lovnAxon,
            baseInhibition * lovnPortionCoveredByTn);
      });
    });
    
    let localInhibitionMagnifier = .5;
    _.each(lovnAxons, function(lovnAxonFrom) {
      _.each(lovnAxons, function(lovnAxonTo) {
        lovnAxonFrom.projectToNeuron(lovnAxonTo, 
            baseInhibition * localInhibitionMagnifier * lovnAxonTo.proportionOfSpanCoveredBy(lovnAxonFrom, true));
      });
    });
    _.each(tnAxons, function(tnAxonFrom) {
      _.each(tnAxons, function(tnAxonTo) {
        tnAxonFrom.projectToNeuron(tnAxonTo, 
            baseInhibition * localInhibitionMagnifier * tnAxonTo.proportionOfSpanCoveredBy(tnAxonFrom, true));
      });
    });
    */
    
    
    let gabaNeuron = new GlobalNeuron('gaba', 400, 300);
    ctrl.globalNeurons = [gabaNeuron];
    
    Neuron.projectLayerToLayer(ctrl.sensors, [gabaNeuron], .1, null, false);
    Neuron.projectLayerToLayer([gabaNeuron], ctrl.outputs, -3.5, null, false);


    ctrl.neurons = _.indexBy(_.union(ctrl.sensors, ctrl.globalNeurons, ctrl.outputs), 'serial');
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
    animation_ms: 200, // Real ms per animation step.
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

