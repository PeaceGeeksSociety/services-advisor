var services = angular.module('services');

services.factory('Markers', ['$rootScope', '$compile', '$location', function ($rootScope, $compile, $location) {
    var service = {
        markers: [],
        addMarker: function (feature) {
            var marker = L.marker(
                feature.location.geometry.coordinates.reverse(),
                {icon: feature.sector.icon}
            );

            marker.bindPopup(function (marker) {
                var id = L.Util.stamp(marker);
                if (!popups[id]) {
                    popups[id] = createPopupContent();
                    // Because rendering with $compile is asynchronous we need to
                    // schedule popup layout update to occur after it has finished.
                    // A simple setTimeout() should do it but if it's not working
                    // on slower devices/networks then try increasing timeout.
                    setTimeout(function () { marker.getPopup().update(); }, 200);
                }
                return popups[id];
            });

            // when a user clicks on a map marker, show the service in the sidebar
            marker.on('click', function () {
                $location.search('showOthers', true);
                $location.path("/services/" + feature.id);
                $rootScope.$apply();
            });

            feature.marker = marker;
            service.markers.push(marker);
            $rootScope.$broadcast('markers.add', marker);
        }
    };

    return service;
}]);
