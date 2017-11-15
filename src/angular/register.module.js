// Registering the modules in the angular applications along
// with their dependencies

/*** Routes ***/
angular
.module(
    'servicesAdvisorApp',
    ['ngRoute', 'controllers', 'directives', 'services', 'pascalprecht.translate', 'ngPrint']
).run([
    '$rootScope', '$location', '$window', '$translate', 'SiteSpecificConfig', 'Language', 'RegionList', 'SectorList', 'ServicesList',
    ($rootScope, $location, $window, $translate, SiteSpecificConfig, Language, RegionList, SectorList, ServicesList) => {
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

        // Start fetching data ASAP, this will ensure that it's available sooner.
        var awaitData = Promise.all([
            RegionList.all(),
            SectorList.all(),
            ServicesList.all()
        ]);
        awaitData
            .then((data) => console.log('Data pre-load complete!', data))
            .catch((e) => console.error(`Error during pre-load: ${e.message}`, e));
    }
]);

/*** Services ***/
angular.module('services', ['ngResource','underscore']);

angular.module('directives', []);

/*** controllers ***/
angular.module('controllers', ['underscore']);


/*** registering  underscore.js helper ***/ 

// Just inject into where you need it like a service 

// documentation: http://underscorejs.org/

angular.module('underscore', []);

