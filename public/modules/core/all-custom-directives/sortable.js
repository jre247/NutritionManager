/**
 * Created by jason on 9/7/14.
 */

angular.module('core').directive('sortable', ['$parse', '$compile', function($parse, $compile) {
    return {
        scope: {
            start: '@',
            startcallback: '=',
            update: '@',
            disableallelementsbydefault: '=',
            updatecallback: '=',
            rootsortableelement:'@'
        },

        link: function (scope, element, attrs, ctrl) {
            scope.updateEvent = function(e, ui){
                scope.$apply(scope.updatecallback(e, ui));
            };

            scope.startEvent = function(e, ui){
                scope.$apply(scope.startcallback(e, ui));
            };

            var sortableElement = jQuery(element).find(scope.rootsortableelement);

//            jQuery(document).loaded(function(){
//                if(scope.disableallelementsbydefault === true){
//                    jQuery('.ui-sortable').find('.panel-default').addClass('disabled');
//                }
//            });


            jQuery(sortableElement).sortable({
                start: scope.startEvent,
                update: scope.updateEvent,
                cancel:".disabled"
            });

        }
    }

}]);


