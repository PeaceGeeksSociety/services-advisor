var services = angular.module('services');

/**
 * Provides the list of services (compiled.json)
 */
services.factory('ServicesList', ['$http', '$translate', 'PopupBuilder', 'Cookies', function ($http, $translate, PopupBuilder, Cookies) {
    var services = null;
    var servicesById = null;

    return {
        get: function (successCb) {
            if (services) {
                successCb(services);
            } else {
                // doing this here because we need it right before we load the data
                var language = Cookies.getCookie('LANGUAGE') || 'AR';
                $translate.use(language);
                $('body').addClass('lang-' + language);

                var servicesList = $translate.use() === 'AR' ? 'src/compiled_AR.json' : 'src/compiled.json';
                $http.get(servicesList, {cache: true})
                    .success(function (data) {
                        data = data.filter(function(feature) {
                            // We want to remove features that are past the endDate.
                            var featureEndDate = new Date(feature.properties.endDate);
                            var featureEndDateUTC = new Date(featureEndDate.getUTCFullYear(), featureEndDate.getUTCMonth(), featureEndDate.getUTCDate());

                            var today = new Date();
                            var todayUTC = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
                            return featureEndDateUTC > todayUTC;
                        });
                        angular.forEach(data, function (feature) {

                            // TODO: adding markers to the map here is a hack. Should be done somewhere it makes sense
                            var serviceMarker = L.marker(feature.geometry.coordinates.reverse(),
                                {icon: iconObjects[feature.properties.activityCategory]});
                            serviceMarker.addTo(clusterLayer);

                            // Make the popup, and bind it to the marker.  Add the service's unique ID
                            // as a classname; we'll use it later for the "Show details" action.
                            //serviceMarker.bindPopup(renderServiceText(feature, "marker"), {className:feature.id});
                            serviceMarker.bindPopup(PopupBuilder.buildPopup(feature));

                            // Add the marker to the feature object, so we can re-use the same marker during render().
                            feature.properties.marker = serviceMarker;
                            // TODO: end TODO

                        });

                        services = data;
                        successCb(services)
                    });
            }
        },
        findById: function (id) {
            // TODO: this is a hack since we don't know if services has been initialized yet
            if (servicesById === null) {
                servicesById = {};
                angular.forEach(services, function (service) {
                    servicesById[service.id] = service;
                })
            }
            return servicesById[id];
        }
    }
}]);
