/* global app */
/* global $ */
/* global _ */

(function() {

let link = function(scope, element, attrs) {
  
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

