var directives = angular.module('directives');

directives.directive('languageDirectionAttr', ['$compile', 'Language', function($compile, Language) {
    return {
        restrict: 'AC',
        link: function(scope, element, attrs) {
            element.attr('dir', Language.getDirection().toLowerCase());
        }
    };
}]);
