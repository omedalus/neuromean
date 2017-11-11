/* global _ */
/* global $ */
/* global app */

(function() {
  let theSelectedBox = null;
  
  
  app.directive("selbox", [function() {
    let link = function(scope, element, attrs) {
      element.click(function() {
        if (theSelectedBox) {
          theSelectedBox.removeClass('selected');
        }
        theSelectedBox = element;
        theSelectedBox.addClass('selected');
        
        console.log(scope.selboxTarget);
      });
    };
    
    
    return {
      link: link,
      scope: {
        selbox: '=',
        selboxTarget: '=',
        selboxSource: '='
      }
    }; 
  }]);
}());


