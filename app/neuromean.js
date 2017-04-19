/* global angular */
/* global _ */
/* global $ */

var app = angular.module("neuromeanApp", []); 

app.controller("neuromeanCtrl", function($scope) {
  var ctrl = this;
  $scope.ctrl = ctrl;
  
  ctrl.networkStructure = {
    numSensors: 30,
    numIntegrators: 8,
    numOutputs: 2,
    sensorAxonSpread: 1
  };
  
  ctrl.connectionStrength = function(iSensor, iIntegrator) {
    var xSensor = iSensor / (ctrl.networkStructure.numSensors - 1);
    var xIntegrator = iIntegrator / (ctrl.networkStructure.numIntegrators - 1);
    var distance = Math.pow(xSensor - xIntegrator, 2);
    var retval = 1.0 - distance / ctrl.networkStructure.sensorAxonSpread;
    retval = Math.max(retval, 0);
    return retval;
  };

  ctrl.outputStrength = function(iIntegrator, iOutput) {
    var xIntegrator = iIntegrator / (ctrl.networkStructure.numIntegrators - 1);
    var xOutput = iOutput / (ctrl.networkStructure.numOutputs - 1);
    var distance = Math.abs(xOutput - xIntegrator);
    var retval = 1.0 - distance;
    return retval;
  };

  
  $scope.positionCalculator = {
    sensorX: function(i) {
      var xStart = 40;
      var xEnd = 400;
      return ((xEnd - xStart) * i / ctrl.networkStructure.numSensors) + xStart;
    },
    
    sensorY: function(i) {
      var yBottom = 80;
      var rise = 20;
      var xnorm = (2.0 * i / ctrl.networkStructure.numSensors) - 1;
      return yBottom - rise * xnorm * xnorm;
    },
    
    integratorX: function(i) {
      var xStart = 80;
      var xEnd = 360;
      return ((xEnd - xStart) * i / ctrl.networkStructure.numIntegrators) + xStart;
    },
    
    integratorY: function(i) {
      return 120;
    },

    outputX: function(i) {
      var xStart = 120;
      var xEnd = 320;
      return ((xEnd - xStart) * i / (ctrl.networkStructure.numOutputs - 1)) + xStart;
    },
    
    outputY: function(i) {
      return 200;
    }
  };

  var createNetwork = function() {
    ctrl.sensors = new Array(ctrl.networkStructure.numSensors);
    _.each(ctrl.sensors, function(sensor, iSensor) {
      sensor = {};
      ctrl.sensors[iSensor] = sensor;
      sensor.i = iSensor;
      sensor.activity = 0;
    });
    
    ctrl.integrators = new Array(ctrl.networkStructure.numIntegrators);
    _.each(ctrl.integrators, function(integrator, iIntegrator) {
      integrator = {};
      ctrl.integrators[iIntegrator] = integrator;
      integrator.i = iIntegrator;
      integrator.activity = 0;
    });
    
    ctrl.outputs = new Array(ctrl.networkStructure.numOutputs);
    _.each(ctrl.outputs, function(output, iOutput) {
      output = {};
      ctrl.outputs[iOutput] = output;
      output.i = iOutput;
      output.activity = 0;
    });
  }; 
  
  $scope.outputLabels = ['LOVN', 'TN'];
  
  ctrl.computeIntegratorActivities = function() {
    _.each(ctrl.integrators, function(integrator) {
      integrator.activity = 0;
      _.each(ctrl.sensors, function(sensor) {
        var conn = ctrl.connectionStrength(sensor.i, integrator.i);
        integrator.activity += conn * sensor.activity;
      });
    });
  };

  ctrl.computeLateralInhibition = function() {
    var maxIntegrator = _.max(ctrl.integrators, function(integrator) { 
      return integrator.activity; 
    });
    var maxActivity = maxIntegrator.activity;
    _.each(ctrl.integrators, function(integrator) {
      integrator.activity = 0;
    });
    if (maxActivity > 0) {
      maxIntegrator.activity = 1;
    }
  };

  ctrl.computeOutputActivities = function() {
    _.each(ctrl.outputs, function(output) {
      output.activity = 0;
      _.each(ctrl.integrators, function(integrator) {
        var conn = ctrl.outputStrength(integrator.i, output.i);
        output.activity += conn * integrator.activity;
      });
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
      on('click', 'circle.sensor', function() {
        var iSensor = parseInt($(this).attr('data-index'), 10);
        ctrl.sensors[iSensor].activity = !ctrl.sensors[iSensor].activity;
        ctrl.computeIntegratorActivities();
        ctrl.computeOutputActivities();
        $scope.$apply();
      }).
      on('click', '#lateralinhibition', function() {
        ctrl.computeLateralInhibition();
        ctrl.computeOutputActivities();
        console.log(ctrl.outputs)
        $scope.$apply();
      });

  createNetwork();
});

