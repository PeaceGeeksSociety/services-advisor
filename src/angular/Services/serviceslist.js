var services = angular.module('services');

/**
 * Provides the list of services (compiled.json)
 */
services.factory('ServicesList', ['$http', '$translate', '$location', 'PopupBuilder', 'Cookies', 'SiteSpecificConfig', "_", function ($http, $translate, $location, PopupBuilder, Cookies, SiteSpecificConfig, _) {
    var servicesById = null;

    // doing this here because we need it right before we load the data
    var language = Cookies.getCookie('LANGUAGE') || _.keys(SiteSpecificConfig)[0] || alert("ERROR: site-specific-config.js doesn't have any keys in it!");
    $translate.use(language);
    $('body').addClass('lang-' + language);

    if (!_.has(SiteSpecificConfig[language], "servicesUrl")) {
        alert("ERROR: No servicesUrl key set for language " + language);
    }
    var servicesList = SiteSpecificConfig[language].servicesUrl;

    var services = $http.get(servicesList, {cache: true}).then(function (data) {
            data = data.data.filter(function (feature) {
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
                    {icon: iconObjects[feature.category.name]});
                serviceMarker.addTo(clusterLayer);

                // Make the popup, and bind it to the marker.  Add the service's unique ID
                // as a classname; we'll use it later for the "Show details" action.
                //serviceMarker.bindPopup(renderServiceText(feature, "marker"), {className:feature.id});
                serviceMarker.bindPopup(PopupBuilder.buildPopup(feature));

                // when a user clicks on a map marker, show the service in the sidebar
                serviceMarker.on('click', function () {

                    // can't use $location here since it doesn't update the location (out of the digest cycle or something)
                    // so we're using window.location but we need to parse the current query string
                    var parameters = $location.search();
                    parameters.hideOthers = false;
                    var serialize = function(obj) {
                        var str = [];
                        for(var p in obj)
                            if (obj.hasOwnProperty(p)) {
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            }
                        return str.join("&");
                    };

                    window.location = "/#/services/" + feature.id + "?" + serialize(parameters);
                });

                // Add the marker to the feature object, so we can re-use the same marker during render().
                feature.properties.marker = serviceMarker;
                // TODO: end TODO
            });

            return data;
        });

    return {
        get: function (successCb) {
            services.then(successCb);
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
            })
        }
    }
}]);
