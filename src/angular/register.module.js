// Registering the modules in the angular applications along
// with their dependencies

/*** Routes ***/
angular.module('servicesAdvisorApp', ['ngRoute', 'controllers', 'directives', 'services', 'pascalprecht.translate', 'ngPrint'])
    .run(['$rootScope', '$location', '$window', '$translate', 'SiteSpecificConfig', 'Language', function($rootScope, $location, $window, $translate, SiteSpecificConfig, Language) {

        var language = Language.getLanguageKey() || alert("ERROR: site-specific-config.js doesn't have any keys in it!");
        $translate.use(language);

        if (SiteSpecificConfig.analyticsId) {
            // initialise google analytics
            $window.ga('create', SiteSpecificConfig.analyticsId, 'auto');

            // track pageview on state change
            $rootScope.$on('$routeChangeSuccess', function (event) {
                $window.ga('send', 'pageview', $location.url());
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

