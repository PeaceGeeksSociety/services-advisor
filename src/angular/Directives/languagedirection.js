var directives = angular.module('directives');

directives.directive('languageDirection', ['$compile', 'Language', function($compile, Language) {
    return {
        restrict: 'AC',
        link: function(scope, element, attrs) {
            var dirClass = 'lang-' + Language.getDirection();
            element.addClass(dirClass.toLowerCase());
        }
    };
}]);
