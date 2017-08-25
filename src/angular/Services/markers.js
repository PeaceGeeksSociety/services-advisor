var services = angular.module('services');

services.factory('Markers', ['$rootScope', '$compile', '$location', '$templateRequest', '$timeout', function ($rootScope, $compile, $location, $templateRequest, $timeout) {
    // Eagerly fetching service-popup template as we'll need it and it will be
    // (in theory) cached.
    $templateRequest('views/service-popup.html');

    var service = {
        markers: [],
        addMarker: function (feature) {
            var marker = L.marker(
                feature.location.geometry.coordinates.reverse(),
                {icon: feature.sector.icon}
            );

            marker.on('click', function (e) {
                $location.search('showOthers', true);
                $location.path("/services/" + feature.id);
                $rootScope.$apply();

                var marker = e.target;
                if (!marker.getPopup()) {
                    var popupScope = $rootScope.$new(true);
                    popupScope.service = feature;
                    renderTemplate('views/service-popup.html', popupScope, function ($el) {
                        marker.bindPopup($el.prop('outerHTML'));
                        marker.togglePopup();
                    });
                }
            });

            feature.marker = marker;
            service.markers.push(marker);
            $rootScope.$broadcast('markers.add', marker);
        }
    };

    return service;

    function renderTemplate(templatePath, templateScope, cb) {
        $templateRequest(templatePath)
            .then(function (template) {
                var out = $compile(template)(templateScope);
                $timeout(function () {
                    cb(out);
                });
            });
    }
}]);

