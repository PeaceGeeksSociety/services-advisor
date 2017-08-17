var services = angular.module('services');

/**
 * Provides the list of services (compiled.json)
 */
services.factory('ServicesList', ['$http', '$translate', 'Language', 'SiteSpecificConfig', '_', 'SectorList', 'Markers', function ($http, $translate, Language, SiteSpecificConfig, _, SectorList, Markers) {
    var servicesById = null;

    // doing this here because we need it right before we load the data
    var language = Language.getLanguageKey() || alert("ERROR: site-specific-config.js doesn't have any keys in it!");

    $translate.use(language);
    $('body').addClass('lang-' + language);

    if (!_.has(SiteSpecificConfig.languages[language], "servicesUrl")) {
        alert("ERROR: No servicesUrl key set for language " + language);
    }

    var servicesList = SiteSpecificConfig.languages[language].servicesUrl;

    var services = SectorList.getRootSectors(function (rootSectors) {

        return $http.get(servicesList, {cache: true}).then(function (data) {
            data = data.data.filter(function (feature) {
                // We want to remove features that are past the endDate.
                var featureEndDate = new Date(feature.endDate);
                var featureEndDateUTC = new Date(featureEndDate.getUTCFullYear(), featureEndDate.getUTCMonth(), featureEndDate.getUTCDate());

                var today = new Date();
                var todayUTC = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
                return featureEndDateUTC > todayUTC;
            });

            angular.forEach(data, function (feature) {
                var categoryId = feature.servicesProvided[0];
                var sector = _.find(rootSectors, function(v) {
                    return v.model.id == categoryId;
                });
                feature.category.sector = sector.model;
                Markers.addMarker(feature);
            });

            return data;
        });

    });

    return {
        get: function (successCb) {
            return services.then(successCb);
        },
        findById: function (id) {
            return services.then(function(services) {
                if (servicesById === null) {
                    servicesById = {};
                    angular.forEach(services, function (service) {
                        servicesById[service.id] = service;
                    });
                }
                return servicesById[id];
            });
        }
    };
}]);
