/* global app */
/* global $ */
/* global _ */

(function() {

let fiberPath = function(fiber) {
  let gap = fiber.index * 10;
  let reachlen = 200 + fiber.reach * 700;
  reachlen = Math.min(reachlen, 850);
  reachlen -= gap;
  
  let path = `M${10 + gap},340 
             l0,${-230 + gap} 
             s0,-50 50,-50
             l${reachlen},0 
             l-20,5
             l${-reachlen+10},0
             s-25,0 -35,35
             l0,${230 - gap}
             Z`;

  return path;
};

let neuromeanVizDirective = function($interval) {
  let link = function(scope, element, attrs) {
    scope.resetPapillae = function() {
      let oldTouchings = _.map(scope.papillae, function(papilla) {
        return {
          fraction: papilla.fraction,
          isBeingTouched: papilla.isBeingTouched
        };
      });
      
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
        
        // Restore approximation of old touchings.
        _.each(scope.papillae, function(papilla) {
          let lowestDiff = null;
          _.each(oldTouchings, function(oldTouching) {
            let thisDiff = Math.abs(oldTouching.fraction - papilla.fraction);
            if (_.isNull(lowestDiff) || thisDiff < lowestDiff) {
              lowestDiff = thisDiff;
              papilla.isBeingTouched = oldTouching.isBeingTouched;
            }
          });
        });
  
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
        let lateralInhibitionStrength = (scope.lateralInhibitionStrengthPct || 100) / 100;

        fiber.reach = Math.min(1, (1 - fiber.fraction) + baseReach);
        fiber.sensitivity = Math.min(1, baseSensitivity + (sensitivityIncrement * (1 - fiber.reach)));
        
        fiber.suppressivePower = lateralInhibitionStrength * (1 - fiber.sensitivity);
        
        fiber.graphics = {
          path: fiberPath(fiber),
          y: 62 + (fiber.index * 10),
          r: 2 + 10*fiber.sensitivity,
          opacity: function() { return 2 * Math.sqrt(fiber.activity); }
        };
        
        fiber.canReachPapilla = function(papilla) {
          let can = fiber.reach >= papilla.fraction;
          return can;
        };

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
    scope.baseSensitivityPct = 31;
    scope.sensitivityIncrementPct = 51;
    scope.lateralInhibitionStrengthPct = 201;


    scope.simulationSpeed = 0.2;
    scope.timestepMs = 100;

    
    
    scope.getTotalOutputNerveActivity = function() {
      let total = _.reduce(scope.nerveFibers, function(memo, fiber) {
        return memo + fiber.activity;
      }, 0);
      return total;
    };



    let eegPaperOffset = 0;
    let eegActivityHistory = [0];

    let addEEGdata = function() {
      let eegDiv = $('.neuromean-viz-eeg', element);
      eegDiv.css('background-position-x', `${-eegPaperOffset}px`);
      eegPaperOffset += 1;
      eegPaperOffset %= 1000000;
      
      let totalNerveActivity = scope.getTotalOutputNerveActivity() + 0.01;
      let currentEEGlevel = (.5 + .5*Math.random()) * totalNerveActivity;
      currentEEGlevel *= 20;
      if (eegActivityHistory[0] > 0) {
        currentEEGlevel *= -1;
      }

      eegActivityHistory.unshift(currentEEGlevel);
      while (eegActivityHistory.length > 1000) {
        eegActivityHistory.pop();
      }
      
      let needle = $('img', eegDiv);
      let needlePct = 50 + currentEEGlevel;
      needle.css({
        top: `calc(${needlePct}% - 5px)`
      });
    };
    
    scope.getEEGPolylinePoints = function() {
      let pointstr = '';
      _.each(eegActivityHistory, function(activityLevel, pointIndex) {
        let thisPoint = ` ${pointIndex},${activityLevel} `;
        pointstr += thisPoint;
      });
      return pointstr;
    };


    let timestep = function() {
      addEEGdata();

      // Get input from papillae.
      let nerveActivities = _.map(scope.nerveFibers, function(fiber) {
        let activity = _.reduce(scope.papillae, function(memo, papilla) {
          if (!papilla.isBeingTouched || !fiber.canReachPapilla(papilla)) {
            return memo;
          }
          let activityContribution = memo + fiber.sensitivity;
          return activityContribution;
        }, 0);
        return activity;
      });
      
      // Compute lateral inhibition.
      _.each(scope.nerveFibers, function(fiber) {
        let suppression = fiber.activity * fiber.suppressivePower;
        _.each(nerveActivities, function(targetActivity, iTarget) {
          if (iTarget === fiber.index) {
            return;
          }
          nerveActivities[iTarget] -= suppression;
        });
      });
      
      // Update nerve objects with new activity levels.
      _.each(scope.nerveFibers, function(fiber, iFiber) {
        let newActivity = nerveActivities[iFiber];
        //newActivity = Math.min(newActivity, 1);
        newActivity = Math.max(newActivity, 0);
        
        fiber.activity = 
            ((1 - scope.simulationSpeed) * fiber.activity) +
            (scope.simulationSpeed * newActivity);
      });
    };
    scope.animationIntervalHandle = $interval(timestep, scope.timestepMs);
  };

  return {
    templateUrl: 'app/presentation/neuromean-viz.html',
    link: link
  };
};

app.directive('neuromeanViz', ['$interval', 
  neuromeanVizDirective
]);

}());

