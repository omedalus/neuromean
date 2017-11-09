/* global app */
/* global $ */
/* global _ */

(function() {

let fiberPath = function(fiber) {
  let gap = fiber.index * 10;
  let reachlen = 200 + fiber.reach * 700 - gap;
  
  let path = `M${10 + gap},360 
             l0,${-200 + gap} 
             s0,-50 50,-50
             l${reachlen},0 
             l-20,5
             l${-reachlen+10},0
             s-25,0 -35,35
             l0,${200 - gap}
             Z`;

  return path;
};
  


let link = function(scope, element, attrs) {
  scope.resetPapillae = function() {
    scope.papillae = [];
    _.times(scope.numPapillae, function(iPapilla) {
      let papilla = {
        index: iPapilla,
        fraction: iPapilla / scope.numPapillae,
        isBeingTouched: false
      };
      
      papilla.graphics = {
        x: 200 + (papilla.index) * (700 / (scope.numPapillae+1)),
        filter: function() {
          return papilla.isBeingTouched ? 'url(#papillatouched)' : '';
        }
      };

      scope.papillae.push(papilla);
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
      
      let baseReach = (scope.baseReachPct || 0) / 100;
      let baseSensitivity = (scope.baseSensitivityPct || 0) / 100;
      let sensitivityIncrement = (scope.sensitivityIncrementPct || 100) / 100;
      
      fiber.reach = Math.min(1, (1 - fiber.fraction) + baseReach);
      fiber.sensitivity = baseSensitivity + (sensitivityIncrement * (1 - fiber.reach));
      
      fiber.graphics = {
        path: fiberPath(fiber),
        y: 112 + (fiber.index * 10),
        r: 3 + 5*fiber.sensitivity
      };
      
      fiber.canReachPapilla = function(papilla) {
        let can = fiber.reach >= papilla.fraction;
        return can;
      };
      
      
      // DEV ONLY
      fiber.activity = fiber.fraction;
      
      scope.nerveFibers.push(fiber);
    });
  };

  let reset = function() {
    scope.resetPapillae();
    scope.resetNerveFibers();
  };
  
  scope.$watchGroup([
      'numPapillae', 'numNerveFibers', 'baseReachPct', 'baseSensitivityPct', 'sensitivityIncrementPct'
      ], 
      function(newval) {
    reset();
  });
  
  
  scope.numPapillae = 20;
  scope.numNerveFibers = 10;
  scope.baseReachPct = 0;
  scope.baseSensitivityPct = 0;
  scope.sensitivityIncrementPct = 100;
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

