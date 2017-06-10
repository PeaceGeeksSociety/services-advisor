var directives = angular.module('directives');

directives.directive('languageDirectionClass', ['Language', function(Language) {
    return {
        restrict: 'AC',
        link: function(scope, element, attrs) {
            var dirClass = 'lang-' + Language.getDirection();
            element.addClass(dirClass.toLowerCase());
        }
    };
}]);
