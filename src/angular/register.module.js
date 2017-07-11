// Registering the modules in the angular applications along
// with their dependencies

/*** Routes ***/
angular.module('servicesAdvisorApp', ['ngRoute', 'controllers', 'directives', 'services', 'pascalprecht.translate', 'ngPrint'])
    .run(['$rootScope', '$location', '$window', 'SiteSpecificConfig', function($rootScope, $location, $window, SiteSpecificConfig) {

        if (SiteSpecificConfig.analyticsId) {
            // initialise google analytics
            $window.ga('create', SiteSpecificConfig.analyticsId, 'auto');

            // track pageview on state change
            $rootScope.$on('$stateChangeSuccess', function (event) {
                $window.ga('send', 'pageview', $location.path());
            });
        }
    }]);

/*** Services ***/
angular.module('services', ['ngResource','underscore']);

angular.module('directives', []);

/*** controllers ***/
angular.module('controllers', ['underscore']);


/*** registering  underscore.js helper ***/ 

// Just inject into where you need it like a service 

// documentation: http://underscorejs.org/

angular.module('underscore', []);

