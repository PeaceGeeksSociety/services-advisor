// Registering the modules in the angular applications along
// with their dependencies

/*** Routes ***/
angular
.module(
    'servicesAdvisorApp',
    ['ngRoute', 'controllers', 'directives', 'services', 'pascalprecht.translate', 'ngPrint']
)
.run([
    '$rootScope', '$location', '$window', '$translate', 'SiteSpecificConfig', 'Language', 'RegionList', 'SectorList', 'ServicesList', 'Map',
    ($rootScope, $location, $window, $translate, SiteSpecificConfig, Language, RegionList, SectorList, ServicesList, Map) => {
        var language = Language.getLanguageKey() || alert("ERROR: site-specific-config.js doesn't have any keys in it!");
        $translate.use(language);

        if (SiteSpecificConfig.analyticsId) {
            // initialise google analytics
            $window.ga('create', SiteSpecificConfig.analyticsId, 'auto');

            // track pageview on state change
            $rootScope.$on('$routeChangeSuccess', () => {
                $window.ga('send', 'pageview', $location.url());
            });
        }

        // Start fetching data ASAP, this will ensure that it's available sooner.
        var awaitData = Promise.all([
            RegionList.all(),
            SectorList.all(),
            ServicesList.all()
        ]);
        // Get a handle on our spinner.
        const spinner = document.getElementById('spinner-modal');
        awaitData
            .then((data) => {
                console.log('Data pre-load complete!', data);
                spinner.style.display = 'none';
            })
            .catch((e) => {
                console.error(`Error during pre-load: ${e.message}`, e);
                spinner.style.display = 'none';
            });

        // TODO temporarily removed.
        if (SiteSpecificConfig.includePolygons) {
            jQuery.getJSON("polygons.json", (polygonData) => Map.polygonLayer().addData(polygonData));
        }

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

