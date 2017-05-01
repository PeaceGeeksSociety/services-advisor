var services = angular.module('services');

services.factory('Markers', ['$rootScope', '$location', 'PopupBuilder', function ($rootScope, $location, PopupBuilder) {
    var service = {
        markers: [],
        addMarker: function (feature) {
            var marker = L.marker(
                feature.location.geometry.coordinates.reverse(),
                {icon: feature.category.sector.icon}
            );

            // Make the popup, and bind it to the marker.  Add the service's unique ID
            // as a classname; we'll use it later for the "Show details" action.
            //serviceMarker.bindPopup(renderServiceText(feature, "marker"), {className:feature.id});
            marker.bindPopup(PopupBuilder.buildPopup(feature));

            // when a user clicks on a map marker, show the service in the sidebar
            marker.on('click', function () {

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

            feature.marker = marker;
            service.markers.push(marker);
            $rootScope.$broadcast('markers.update', marker);
        }
    };

    return service;
}]);
