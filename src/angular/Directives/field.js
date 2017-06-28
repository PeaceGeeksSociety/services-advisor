var directives = angular.module('directives');

/**
 * Looks for fieldnames inside fields property on the site-specific-config
 * service. Keyed by fieldnames they can have boolean values deteremining
 * whether they are displayed or not.
 */
directives.directive('field', ['SiteSpecificConfig', '_', function(SiteSpecificConfig, _) {
    var fieldAccess = function(fieldname) {
        if (SiteSpecificConfig.fields && _.has(SiteSpecificConfig.fields, fieldname)) {
            return SiteSpecificConfig.fields[fieldname];
        }
        return true;
    };

    return {
        restrict: 'AEC',
        scope: {
            field: '='
        },
        link: function(scope, element, attrs) {
            if (!fieldAccess(attrs.field)) {
                element.remove();
            }
        }
    };
}]);
