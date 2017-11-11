/* global _ */
/* global $ */
/* global app */

(function() {
  app.directive("thumbclick", [function() {
    let link = function(scope, element, attrs) {
      console.log(scope.thumbclick)
    };
    
    
    return {
      templateUrl: 'app/presentation/thumbclick.html',
      link: link,
      scope: {
        thumbclick: '='
      }
    }; 
  }]);
}());


