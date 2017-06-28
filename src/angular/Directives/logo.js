var directives = angular.module('directives');

directives.directive('logo', ['Language', 'SiteSpecificConfig', function(Language, SiteSpecificConfig) {
    var lang = Language.getLanguageKey();
    var logo = SiteSpecificConfig.languages[lang].logo || SiteSpecificConfig.defaultLogo;
    return {
        restrict: 'E',
        template: '<img class="logo" src="{{ logo }}"/>',
        link: function(scope, element, attrs) {
            scope.logo = logo;
        }
    };
}]);
