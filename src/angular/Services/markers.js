var services = angular.module('services');

services.factory('Markers', ['$rootScope', '$compile', '$location', function ($rootScope, $compile, $location) {
    var service = {
        markers: [],
        addMarker: function (feature) {
            var marker = L.marker(
                feature.location.geometry.coordinates.reverse(),
                {icon: feature.category.sector.icon}
            );

            // Compile new DOM element (the popup) and link it.
            var popup = L.popup();

            var popupLinkFunc = $compile(angular.element('<div ng-controller="ServicePopupCtrl"><ng-include src="\'views/service-popup.html\'"></ng-include></div>'));
            var popupScope = $rootScope.$new(true);
            popupScope.feature = feature;
            popupScope.popup = popup;
            popup.setContent(popupLinkFunc(popupScope)[0]);
            marker.bindPopup(popup);

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
