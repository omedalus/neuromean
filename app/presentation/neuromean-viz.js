/* global app */
/* global $ */
/* global _ */

(function() {

let link = function(scope, element, attrs) {
  scope.resetPapillae = function() {
    scope.papillae = [];
    _.times(scope.numPapillae, function(iPapilla) {
      scope.papillae.push({
        index: iPapilla,
        isBeingTouched: false
      });
    });
  };
  
  scope.$watch('numPapillae', function(newval) {
    scope.resetPapillae();
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

