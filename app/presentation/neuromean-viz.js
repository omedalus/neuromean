/* global app */
/* global $ */
/* global _ */

(function() {

let fiberPath = function(fiber) {
  let path = `M${10 + fiber.index * 10},360 
             l0,-200 
             s0,-50 50,-50
             l900,0 
             l-20,5
             l-890,0
             s-25,0 -35,35
             l0,200
             Z`;
  return path;
};
  


let link = function(scope, element, attrs) {
  scope.resetPapillae = function() {
    scope.papillae = [];
    _.times(scope.numPapillae, function(iPapilla) {
      scope.papillae.push({
        index: iPapilla,
        fraction: iPapilla / scope.numPapillae,
        isBeingTouched: false
      });
    });
  };
  
  scope.resetNerveFibers = function() {
    scope.nerveFibers = [];
    _.times(scope.numNerveFibers, function(iNerveFiber) {
      let fiber = {
        index: iNerveFiber,
        fraction: iNerveFiber / scope.numNerveFibers,
        activity: 0
      };
      
      let baseReach = scope.baseReach || 0;
      let baseSensitivity = scope.baseSensitivity || 0;
      let sensitivityIncrement = scope.sensitivityIncrement || 1;
      
      fiber.reach = fiber.fraction + baseReach;
      fiber.sensitivity = baseSensitivity + (sensitivityIncrement * fiber.fraction);
      
      fiber.graphics = {
        path: function() { return fiberPath(fiber); }
      };
      
      scope.nerveFibers.push(fiber);
    });
  };
  
  scope.$watch('numPapillae', function(newval) {
    scope.resetPapillae();
  });
  scope.$watch('numNerveFibers', function(newval) {
    scope.resetNerveFibers();
  });
};

let neuromeanVizDirective = function() {
  return {
    templateUrl: 'app/presentation/neuromean-viz.html',
    link: link
  };
};

app.directive('neuromeanViz', [
  neuromeanVizDirective
]);

}());

