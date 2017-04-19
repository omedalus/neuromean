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
    sensorAxonSpread: 1.0
  };
  
  ctrl.connectionStrength = function(iSensor, iIntegrator) {
    var xSensor = iSensor / ctrl.networkStructure.numSensors;
    var xIntegrator = iIntegrator / ctrl.networkStructure.numIntegrators;
    var distance = Math.abs(xSensor - xIntegrator);
    var retval = 1.0 - distance * ctrl.networkStructure.sensorAxonSpread;
    retval = Math.max(retval, 0);
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
  }; 
  
  ctrl.computeIntegratorActivities = function() {
    _.each(ctrl.integrators, function(integrator) {
      integrator.activity = 0;
      _.each(ctrl.sensors, function(sensor) {
        var conn = ctrl.connectionStrength(sensor.i, integrator.i);
        integrator.activity += conn * sensor.activity;
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
        $scope.$apply();
      });

  createNetwork();
});

