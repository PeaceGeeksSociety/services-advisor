var controllers = angular.module('controllers');

controllers.controller('MapCtrl', ['$scope', '$rootScope', 'Search', function ($scope, $rootScope, Search) {
    // Mapbox doesn't need its own var - it automatically attaches to Leaflet's L.
    require('mapbox.js');
    // Use Awesome Markers lib to produce font-icon map markers
    require('../../../src/leaflet.awesome-markers.js');
    // Marker clustering
    require('../../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js');

    // Initialize the map, using Affinity Bridge's mapbox account.
    var map = L.mapbox.map('map', 'affinitybridge.ia7h38nj');

    // TODO: re-enable when UserLocation service is added
    // Object that holds user location - adds a layer with user's location marker
    //    var myLocation = new UserLocation(map);
    //
    //    map.on('load', function () {
    //        // Try to add user location marker
    //        getUserLocation();
    //    });

    // Initialize the empty layer for the markers, and add it to the map.
    // TODO: don't use global var here
    clusterLayer = new L.MarkerClusterGroup({
        zoomToBoundsOnClick: false,
        spiderfyDistanceMultiplier: 2,
        showCoverageOnHover: false
    }).addTo(map);
    // When user clicks on a cluster, zoom directly to its bounds.  If we don't do this,
    // they have to click repeatedly to zoom in enough for the cluster to spiderfy.
    clusterLayer.on('clusterclick', function (a) {
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
    });

    var polygonLayer = L.geoJson();
    map.addLayer(polygonLayer);

    // Match possible Activity Categories to Humanitarian Font icons.
    var iconGlyphs = {
        'CASH': {glyph: 'ocha-sector-cash', markerColor: '#a48658' },
        'EDUCATION': {glyph: 'ocha-sector-education', markerColor: '#c00000' },
        'FOOD': {glyph: 'ocha-sector-foodsecurity', markerColor: '#006600' },
        'HEALTH': {glyph: 'ocha-sector-health', markerColor: '#08a1d9' },
        'NFI': {glyph: 'ocha-item-reliefgood', markerColor: '#f96a1b' },
        'PROTECTION': {glyph: 'ocha-sector-protection', markerColor: '#1f497d' },
        'SHELTER': {glyph: 'ocha-sector-shelter', markerColor: '#989aac' },
        'WASH': {glyph: 'ocha-sector-wash', markerColor: '#7030a0' }
    };

    // TODO: remove global
    iconObjects = {};

    // Create the icon objects. We'll reuse the same icon for all markers in the same category.
    for (var category in iconGlyphs) {
        iconObjects[category] = L.AwesomeMarkers.icon({
            icon: iconGlyphs[category].glyph,
            prefix: 'icon', // necessary because Humanitarian Fonts prefixes its icon names with "icon"
            iconColor: iconGlyphs[category].markerColor,
            markerColor: "white",
            extraClasses: category
        });
    }


    var onChange = function(event) {
        var results = Search.currResults();

        // Clear all the map markers.
        clusterLayer.clearLayers();

        // Initialize the list-view output.
        //var listOutput = '<h3 class="hide">Services</h3>';

        // Initialize a list where we'll store the current markers for easy reference when
        // building the "show on map" functionality.  TODO: can we streamline this out?
        var markers = {};

        // Loop through the filtered results, adding the markers back to the map.
        results.forEach( function (feature) {
            // Add the filtered markers back to the map's data layer
            clusterLayer.addLayer(feature.properties.marker);
            // Store the marker for easy reference.
            markers[feature.id] = feature.properties.marker;
            // Build the output for the filtered list view
            //listOutput += renderServiceText(feature, "list");
        } );

        // Replace the contents of the list div with this new, filtered output.
        //$('#list').html(listOutput);

        // According functionality for the list - expand item when its header is clicked
        //$(".serviceText > header").click(function(event) {
        //    event.preventDefault();
        //    $(this).parent().toggleClass('expand');
        //    // Toggle the text of the "Show details" / "Hide details" link
        //    if ($(this).find('.show-details').html() === "Show details") {
        //        $(this).find('.show-details').html("Hide details");
        //    } else {
        //        $(this).find('.show-details').html("Show details");
        //    }
        //});

        // Bind "show on map" behavior.  Do this here because now the list exists.
        //$(".show-on-map").click(function(e) {
        //    // Get the unique ID of this service.
        //    var id = e.target.id;
        //    // Close any popups that are open already.
        //    map.closePopup();
        //    // Fire the map/list toggler click event, to switch to viewing the map.
        //    $("#map-list-toggler").click();
        //    // Pan and zoom the map.
        //    map.panTo(markers[id]._latlng);
        //    if (map.getZoom() < 12) { map.setZoom(12); }
        //    // Clone the popup for this marker.  We'll show it at the correct lat-long, but
        //    // unbound from the marker.  We do this in case the marker is in a cluster.
        //    var unboundPopup = markers[id].getPopup();
        //    // Send the service's unique ID as the className of the popup, so that the "Show
        //    // details" binding will work as usual when the popupopen event fires; also, offset
        //    // the Y position so the popup is a little bit above the marker or cluster.
        //    map.openPopup(L.popup({className:id, offset: new L.Point(0,-25)})
        //        .setLatLng(markers[id]._latlng)
        //        .setContent(markers[id].getPopup()._content));
        //});
    };

    $rootScope.$on('FILTER_CHANGED', onChange);
}]);
