/* global _ */
/* global $ */
/* global app */

(function() {
  app.directive("thumbclick", ['$document', function($document) {
    let link = function(scope, element, attrs) {
      let theLightbox = $('<div/>');
      theLightbox.css({
        background: 'rgba(0,0,0,.75)',
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
      });
      theLightbox.click(function() {
        this.parentNode.removeChild(this);
      });
      
      let theContent = $('<div/>');
      theContent.css({
        background: '#000',
        color: '#000',
        border: '3px solid #ffc',
        borderRadius: '20px',
        width: '60%',
        position: 'absolute',
        left: '20%',
        top: '20%',
        overflow: 'hidden'
      });
      theLightbox.append(theContent);
      
      element.find('[data-ng-transclude]').appendTo(theContent);

      let onclick = function() {
        $document.find('body').append(theLightbox);
      };
      
      element.click(onclick);
    };
    
    
    return {
      templateUrl: 'app/presentation/thumbclick.html',
      link: link,
      transclude: true,
      scope: {
        thumbclick: '=',
        thumbclickTitle: '='
      }
    }; 
  }]);
}());


