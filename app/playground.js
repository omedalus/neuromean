/* global _ */
/* global $ */
/* global angular */
/* global Neuron */
/* global SensorNeuron */

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
    ctrl.integrators = Neuron.createLayer('integrator', ctrl.networkStructure.numIntegrators);
    ctrl.summer = new Neuron('summer', 0, 1);


    let lovnAxons = new Array(ctrl.networkStructure.numOutputs);
    let tnAxons = new Array(ctrl.networkStructure.numOutputs);
    _.times(ctrl.networkStructure.numOutputs, function(iOutput) {
      let lovnAxon = new Neuron('lovn', iOutput, ctrl.networkStructure.numOutputs);
      let tnAxon = new Neuron('tn', ctrl.networkStructure.numOutputs - iOutput - 1, ctrl.networkStructure.numOutputs);
      lovnAxon.threshold = .1 * iOutput;
      tnAxon.threshold = .1 * iOutput;
      lovnAxons[iOutput] = lovnAxon;
      tnAxons[iOutput] = tnAxon;
    });
    ctrl.outputs = _.union(lovnAxons, tnAxons);
    


    Neuron.projectLayerToLayer(ctrl.sensors, ctrl.outputs, 1, .9);
    //Neuron.projectLayerToLayer(ctrl.sensors, [ctrl.summer], .05, null);
    //Neuron.projectLayerToLayer([ctrl.summer], ctrl.outputs, -10, null);


    ctrl.neurons = _.indexBy(_.union(ctrl.sensors, ctrl.integrators, [ctrl.summer], ctrl.outputs), 'serial');
    ctrl.isNetworkReady = true;
  };
  
  
  ctrl.doTimeStep = function(newTime) {
    // Receive primary sensory stimulation.
    _.each(ctrl.neurons, function(neuron) {
      if (neuron.isBeingTouched) {
        neuron.receiveStimulus(1);
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

    outputX: function(neuron) {
      let neuronLayerX = {
        lovn: 120,
        tn: 720
      };
      return neuronLayerX[neuron.layer] || 470;
    },
    
    outputY: function(neuron) {
      return 200 + 100 * neuron.threshold;
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
    animation_ms: 100, // Ms per animation step.
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

