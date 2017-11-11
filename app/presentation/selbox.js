/* global _ */
/* global $ */
/* global app */

(function() {
  let theSelectedBox = null;
  
  
  app.directive("selbox", ['$http', '$compile', 
      function($http, $compile) {
    let link = function(scope, element, attrs) {
      let onclick = function() {
        if (theSelectedBox) {
          theSelectedBox.removeClass('selected');
        }
        theSelectedBox = element;
        theSelectedBox.addClass('selected');
        
        let targetDiv = $(scope.selboxTarget);

        $http.get(scope.selboxSource).then(function(response) {
          let responseElem = $('<div/>').html(response.data);
          targetDiv.empty().append($compile(responseElem)(scope));
        });        
      };
      
      element.click(onclick);
      
      if (scope.selboxAuto) {
        onclick();
      }
    };
    
    
    return {
      link: link,
      scope: {
        selbox: '=',
        selboxTarget: '=',
        selboxSource: '=',
        selboxAuto: '='
      }
    }; 
  }]);
}());


