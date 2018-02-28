var services = angular.module('services');
const ServicesMap = require('../ServicesMap');

require('mapbox.js');

services.factory('Map', [
    '$location', '$translate', '_', 'SiteSpecificConfig',
    ($location, $translate, _, SiteSpecificConfig) => {

    L.mapbox.accessToken = SiteSpecificConfig.mapboxAccessToken;
    const servicesMap = new ServicesMap(SiteSpecificConfig);
    const map = servicesMap.map;

    initGlobals(servicesMap);

    // When user clicks on a cluster, zoom directly to its bounds.  If we don't do this,
    // they have to click repeatedly to zoom in enough for the cluster to spiderfy.
    servicesMap.servicesLayer.on('clusterclick', onClusterClick);

    map.locate()
        .on('locationfound', onLocationFound)
        .on('locationerror', onLocationError);

    function onLocationFound(e) {
        var myIcon = L.divIcon({ className: 'you-are-here' });
        myIcon.options.iconSize = [15, 35];
        var locationMarker = L.marker(e.latlng, { icon: myIcon }).addTo(map);
        $translate('YOU_ARE_HERE').then(function (text) {
            var myIconPopup = L.popup({ offset: [0, -20] })
                .setContent(text);
            locationMarker.bindPopup(myIconPopup);
        });
    }

    function onLocationError(e) {
        console.info(e.message);
    }

    function onClusterClick(a) {
        // Close any popups that are open already. This helps if we came via "show on map" link,
        // which spawns an unbound popup.
        map.closePopup();
        // If the markers in this cluster are all in the same place, spiderfy on click.
        var bounds = a.layer.getBounds();
        if (bounds._northEast.equals(bounds._southWest)) {
            a.layer.spiderfy();
        } else {
            // If the markers in this cluster are NOT all in the same place, zoom in on them.
            a.layer.zoomToBounds();
        }
    }

    function initGlobals(servicesMap) {
        // Check map visibility immediately.
        checkMapVisibility();
        // Recheck on window resize (this also happens on tablet/mobile
        // portrait to landscape rotation).
        $(window).resize(_.throttle(checkMapVisibility, 10));

        // Doing some stuff for the results views here because this controller is active
        // for the whole application
        var mc = $('#mapContainer');
        // if the user is on mobile and has the map only partly showing, when they start to scroll
        // we want to hide the map and show the whole results container since it's too small to try to user
        // when the map is showing
        $("#serviceList").scroll(_.throttle(() => {
            if (!mc.hasClass('map-hide')) {
                window.toggleMap();
            }
        }, 10));

        // HACK: using a global here so we can use an onclick="toggleMap()"
        window.toggleMap = () => {
            servicesMap.toggleVisible();
            mc.toggleClass('map-hide');
            servicesMap.map.invalidateSize();
        };

        function checkMapVisibility() {
            if (window.innerWidth > 768) {
                servicesMap.show();
            } else {
                servicesMap.hide();
            }
        }
    }

    return servicesMap;
}]);