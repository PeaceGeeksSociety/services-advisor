var services = angular.module('services');

services.factory('Markers', ['$rootScope', '$compile', '$location', 'PopupBuilder', function ($rootScope, $compile, $location, PopupBuilder) {
    var service = {
        markers: [],
        addMarker: function (feature) {
            var marker = L.marker(
                feature.location.geometry.coordinates.reverse(),
                {icon: feature.category.sector.icon}
            );

            // Compile new DOM element (the popup) and link it.
            var popupLinkFunc = $compile(angular.element('<div ng-controller="ServicePopupCtrl"><ng-include src="\'/src/angular/Views/service-popup.html\'"></ng-include></div>'));
            var popupScope = $rootScope.$new(true);
            popupScope.feature = feature;
            var popup = popupLinkFunc(popupScope)[0];
            marker.bindPopup(popup);

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
