/*
 * This is the main file where we program the application JS. This code is then
 * processed through Browserify to protect namespace.
 */

// Require some libs.
var $ = require('jquery'),
    crossfilter = require('crossfilter'),
    console = require('console'),
    categoryFilter = require("./CategoryFilter"),
    proximityFilter = require("./ProximityFilter"),
    regionFilter = require("./RegionFilter"),
    UserLocation = require('./UserLocation');

// Mapbox doesn't need its own var - it automatically attaches to Leaflet's L.
require('mapbox.js');
// Use Awesome Markers lib to produce font-icon map markers
require('./leaflet.awesome-markers.js');
// Marker clustering
require('../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js');
// Select user location control
require('./SelectUserLocationControl');

// Angular app


// File system
var fs = require('fs');

// Initialize the map, using Affinity Bridge's mapbox account.
var map = L.mapbox.map('map', 'affinitybridge.ia7h38nj');

// Object that holds user location - adds a layer with user's location marker
var myLocation = new UserLocation(map);

map.on('load', function() {
    // Try to add user location marker
    getUserLocation();
});

// Initialize the empty layer for the markers, and add it to the map.
var clusterLayer = new L.MarkerClusterGroup({zoomToBoundsOnClick: false, spiderfyDistanceMultiplier: 2, showCoverageOnHover: false})
    .addTo(map);
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
var iconObjects = {};
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

// Define the filters
var cf = crossfilter();
var cf_activityName = categoryFilter({
    container: 'activityName',
    type: 'radio',
    key: 'activityName',
    all: true
}, cf);
var cf_referralRequired = categoryFilter({
    container: 'referralRequired',
    type: 'radio',
    key: 'Referral required'
}, cf);
var cf_proximity = proximityFilter({
    container: 'proximity',
    map: map,
    userLocation: myLocation
}, cf);
var cf_region = regionFilter({
    container: 'region',
    type: 'radio',
    all: true,
    map: map,
    key: 'region',
    nameProperty: 'adm1_name',
    regionsLayer: polygonLayer
}, cf);
var cf_partnerName = categoryFilter({
    container: 'partnerName',
    type: 'checkbox',
    key: 'partnerName'
}, cf);

// Read the polygon file.
// TODO: use these polygons as the basis for a filter/zoom tool
/* Commenting the polygons out for now because they aren't clickable yet */
jQuery.getJSON( "src/polygons.json", function( polygonData ) {
    // Create the polygon layer and add to the map.
    polygonLayer.addData(polygonData);
    cf_region.update();
});

// Special meta-dimension for our crossFilter dimensions, used to grab the final set
// of data with all other dimensions' filters applied.
var metaDimension = cf.dimension(function (f) { return f.properties.activityName; });

// Whenever the user changes their selection in the filters, run our update() method.
// (In other words, bind the update() method to the "update" event on the category filter.)
cf_activityName.on('update', update);
cf_referralRequired.on('update', update);
cf_proximity.on('update', update);
cf_region.on('update', update);
cf_partnerName.on('update', update);

// Show/hide search filters togglers
$("#search-map a").click(function(e) {
  var target = this.getAttribute('href');

  e.preventDefault();

  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    $(target).slideUp(function(e) {
      $(this).removeClass('active');
    });
  }
  else {
    $(this).addClass('active');
    $(target).slideDown(function(e) {
      $(this).addClass('active');
    });
  }
});

// Close filter containers by clicking outside
$(document).mouseup(function (e) {
  var container = $(".filter-contents.active");

  // if the target of the click isn't the container nor a descendant of the container
  if (container.length && !container.is(e.target) && container.has(e.target).length === 0) {
    var target = container.attr('id');
    // make sure w are not clicking on the actual trigger
    if ($('a[href="#' + target + '"]')[0] != $(e.target)[0]) {
      $('a[href="#' + target + '"]').removeClass('active');
      container.slideUp(function(e) {
        $(this).removeClass('active');
      });
    }
  }
});

// Show/hide organizations
$(".advanced-search > h4").click(function(e) {
  var $parent = $(this).parent();
      $filter = $parent.children('.filter');

  e.preventDefault();

  if ($parent.hasClass('active')) {
    $filter.slideUp(function(e) {
      $parent.removeClass('active');
    });
  }
  else {
    $filter.slideDown(function(e) {
      $parent.addClass('active');
    });
  }
});

// Map/list view toggler - make "map" active on initial page load.
$("#mapToggle").addClass("active");
// Bind click of toggler to swapping visibility of map and list.
$("#map-list-toggler").click(function(e) {
  e.preventDefault();
  $("#map").toggle();
  $("#list").toggle();
  $("#mapToggle").toggleClass("active");
  $("#listToggle").toggleClass("active");
});

// When a popup is opened, bind its "show details" link to switch to list view.
map.on('popupopen', function(e){
    // We already gave the popups the service's unique ID as their className attribute.
    var id = e.popup.options.className;
    $("#show-details-" + id).click(function() {
        // If "show details" is clicked, expand the corresponding item in the still-hidden list view.
        $("#article-" + id).addClass('expand');
        // Since the article is expanded, the details toggle link should say "Hide details".
        $("#article-" + id).find('.show-details').html("Hide details");
        // Switch to list view.
        $("#map-list-toggler").click();
        // Scroll to the item.
        $('html, body').animate({
            scrollTop: $("#article-" + id).offset().top
        }, 500);
    });
});

// If all npm modules have been installed and gulp has been run, we should have
// a pre-compiled single file containing the JSON from all our sources in sources.txt.
// Get that pre-compiled JSON, and loop through it creating the markers.
jQuery.getJSON( "src/compiled.json", function( data ) {
    $.each( data, function( key, feature ) {

        // Create marker and add it to the cluster layer.
        var serviceMarker = L.marker(feature.geometry.coordinates.reverse(),
                                     {icon: iconObjects[feature.properties.activityCategory]});
        serviceMarker.addTo(clusterLayer);

        // Make the popup, and bind it to the marker.  Add the service's unique ID
        // as a classname; we'll use it later for the "Show details" action.
        serviceMarker.bindPopup(renderServiceText(feature, "marker"), {className:feature.id});

        // Add the marker to the feature object, so we can re-use the same marker during render().
        feature.properties.marker = serviceMarker;
    });

    // Add the new data to the crossfilter.
    cf.add(data);

    // Add the markers to the map.
    update();
});

// Functions...

// Update the markers and filters based on the user's filter input.
function update() {
    // Update the filters.
    cf_activityName.update();
    cf_referralRequired.update();
    //cf_proximity.update();
    //cf_region.update();
    cf_partnerName.update();

    // Add the markers to the map.
    render();
}

// Try getting user's location using map.locate() function
// if gps is disabled or not available adds a map control
// for manual selection (+ bind user-location-selected event)
function getUserLocation() {
    map.on("locationfound", function(evt) {
        updateMyLocation(evt.latlng);
    });
    map.on("locationerror", function(evt) {
        L.control.selectUserLocation().addTo(map);
        map.on('user-location-selected', function(evt) {
            updateMyLocation(evt.latlng);
        });
    });
    map.locate();
}

// Set user's location with lat/lng coming from gps or manual selection
function updateMyLocation(l) {
    myLocation.setLocation(l);
}

// Clear the data and re-render.
function render() {
    // Clear all the map markers.
    clusterLayer.clearLayers();

    // Initialize the list-view output.
    var listOutput = '<h3 class="hide">Services</h3>';

    // Initialize a list where we'll store the current markers for easy reference when
    // building the "show on map" functionality.  TODO: can we streamline this out?
    var markers = {};

    // Loop through the filtered results, adding the markers back to the map.
    metaDimension.top(Infinity).forEach( function (feature) {
        // Add the filtered markers back to the map's data layer
        clusterLayer.addLayer(feature.properties.marker);
        // Store the marker for easy reference.
        markers[feature.id] = feature.properties.marker;
        // Build the output for the filtered list view
        listOutput += renderServiceText(feature, "list");
    } );

    // Replace the contents of the list div with this new, filtered output.
    $('#list').html(listOutput);

    // According functionality for the list - expand item when its header is clicked
    $(".serviceText > header").click(function(event) {
      event.preventDefault();
      $(this).parent().toggleClass('expand');
      // Toggle the text of the "Show details" / "Hide details" link
      if ($(this).find('.show-details').html() === "Show details") {
        $(this).find('.show-details').html("Hide details");
      } else {
        $(this).find('.show-details').html("Show details");  
      } 
    });

    // Bind "show on map" behavior.  Do this here because now the list exists.
    $(".show-on-map").click(function(e) {
        // Get the unique ID of this service.
        var id = e.target.id;
        // Close any popups that are open already.
        map.closePopup();
        // Fire the map/list toggler click event, to switch to viewing the map.
        $("#map-list-toggler").click();
        // Pan and zoom the map.
        map.panTo(markers[id]._latlng);
        if (map.getZoom() < 12) { map.setZoom(12); }
        // Clone the popup for this marker.  We'll show it at the correct lat-long, but
        // unbound from the marker.  We do this in case the marker is in a cluster.
        var unboundPopup = markers[id].getPopup();
        // Send the service's unique ID as the className of the popup, so that the "Show
        // details" binding will work as usual when the popupopen event fires; also, offset
        // the Y position so the popup is a little bit above the marker or cluster.
        map.openPopup(L.popup({className:id, offset: new L.Point(0,-25)})
            .setLatLng(markers[id]._latlng)
            .setContent(markers[id].getPopup()._content));
    });
}

// Prepare text output for a single service, to show in the map popups or the list view.
function renderServiceText(feature, style) {

    // Get the partner logo, if any.
    var partnerName = feature.properties.partnerName;
    var logoUrl = './src/images/partner/' + partnerName.toLowerCase().replace(' ', '') + '.jpg';

    // we add an onerror callback so that if the image 404's we just set it to display:none
    var logo = '<img src="' + logoUrl + '" alt="' + partnerName + '" onError="this.onerror=null;this.style.display=\'none\'" />';

    // Prepare the office hours output.
    var hours = '<strong>Hours:</strong> ';
    var hourOpen = '';
    var hourClosed = '';
    for (var hoItem in feature.properties["8. Office Open at"]) {
        if (feature.properties["8. Office Open at"][hoItem] === true) {
            hourOpen = hoItem;
        }
    }
    for (var hcItem in feature.properties["9. Office close at"]) {
        if (feature.properties["9. Office close at"][hcItem] === true) {
            hourClosed = hcItem;
        }
    }
    // If we have hours, show them as compact as possible.
    if (hourOpen) {
        // If we have open time but no close time, say "Open at X o'clock"; if we
        // have both, show "X o'clock to X o'clock".
        hours = hourClosed ?
            hours += hourOpen + ' - ' + hourClosed.replace('Close at', '') :
            hours + 'Open at ' + hourOpen;
    } else {
        // If we have no open time but yes close time, show close time only; if we have
        // neither, say "unknown".
        hours = hourClosed ? hours += hourClosed : hours + 'unknown';
    }

    // Create meta-field for better display of indicators.
    feature.properties["x. Activity Details"] = feature.properties.indicators;

    // Make a list of the fields we want to show - lots of fields for this list view,
    // not so many for the map-marker-popup view.
    var fields = (style == 'list') ? {
             "x. Activity Details": {'section': 'header'},
             "10. Referral Method": {'section': 'content'},
             "6. Availability": {'section': 'content'},
             "7. Availability Day": {'section': 'content'},
             "startDate": {'section': 'content', 'label': 'Start Date'},
             "endDate": {'section': 'content', 'label': 'End Date'},
             "1. Registration Type Requirement": {'section': 'content'},
             "2. Nationality": {'section': 'content'},
             "3. Intake Criteria": {'section': 'content'},
             "4. Accessibility": {'section': 'content'},
             "5. Coverage": {'section': 'content'},
             "14. Feedback delay": {'section': 'content'},
             "11. Immediate Next step  response after referal": {'section': 'content'},
             "12. Response delay after referrals": {'section': 'content'},
             "13. Feedback Mechanism": {'section': 'content'}
        }
        : {
             "x. Activity Details": {'section': 'header'},
             "10. Referral Method": {'section': 'header'}
        };

    // Loop through our list of fields, preparing output for display.
    var headerOutput = '';
    var contentOutput = '';
    for (var field in fields) {
        // Get the field items
        values = feature.properties[field];
        var fieldOutput = '';
        // Strip the leading numeral from the field name.
        var fieldName = field.substr(field.indexOf(" ") + 1);
        // Skip empty fields.
        if (values) {
            // Some fields have object values. These we must loop through.
            if (typeof values === 'object') {
                if (Object.getOwnPropertyNames(values).length) {
                    // Loop through items, and if value is TRUE, add label to the output.
                    for (var lineItem in values) {
                        // Checking if the line item value is TRUE
                        if (values[lineItem]) {
                            fieldOutput += lineItem + ' ';
                        }
                    }
                }
            // Other fields have a string for a value.
            } else if (typeof values === 'string') {
                fieldName = fields[field].label;
                fieldOutput = values;
            }
        }
        // Wrap the output with a label.  If no output, say unknown.
        if (fieldOutput === '') { fieldOutput = "unknown"; }
        fieldOutput = '<p><strong>' + fieldName + ':</strong> ' + fieldOutput + '</p>';
        // Add the field output to the appropriate section.
        if (fields[field].section == 'header') {
            headerOutput += fieldOutput;
        } else {
            contentOutput += fieldOutput;
        }
    }

    // Get the activity-category icon.
    activityCategory = feature.properties.activityCategory; // eg "CASH"
    var glyph = '<i class="glyphicon icon-' + iconGlyphs[activityCategory].glyph + '"></i>';

    // In the list view only, the articles must have unique IDs so that we can scroll directly to them
    // when someone clicks the "Show details" link in a map marker.
    var articleIDattribute = '';
    var toggleLinks = '<a id="show-details-' + feature.id + '" href="#">Show details</a>';
    // If this is for a marker popup, add a "Show details" link that will take us to the list view.
    if (style == 'list') {
        // Whereas if this if for list view, add a link to show this item on the map.
        toggleLinks = '<a class="show-on-map" id="' + feature.id + '" href="#">Show on map</a> ' +
                '<a class="show-details" id="show-details-' + feature.id + '" href="#">Show details</a> ';
        activityInfoLink = '<a class="show-activity-info" href="https://www.syrianrefugeeresponse.org/resources/sites/points?feature=' + feature.id + '">Show on ActivityInfo</a>';
        articleIDattribute = ' id="article-' + feature.id + '"';
    }

    // Assemble the article header.
    var header = '<header>' + logo + '<h3>' + glyph + feature.properties.locationName + ': ' + feature.properties.activityName + '</h3>' + toggleLinks + '<p class="hours">' + hours + '</p>' + headerOutput + '</header>';

    // Preserve the line breaks in the original comment, but strip extra breaks from beginning and end.
    var comments = feature.properties.comments ?
        feature.properties.comments.trim().replace(/\r\n|\n|\r/g, '<br />') : '';

    // Assemble the article content (for list view only).
    var content = (style == 'list') ? '<div class="content" id="details-' + feature.id + '">' + contentOutput + '<div class="comments">' + comments + '</div>' + activityInfoLink + '</div>' : '';

    return '<article class="serviceText"' + articleIDattribute + '>' + header + content + '</article>';
}

