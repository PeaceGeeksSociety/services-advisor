var services = angular.module('services');

/**
 * Provides the list of services (compiled.json)
 */
services.factory('PopupBuilder', ['$translate', function ($translate) {
    return {
        buildPopup: function(feature) {
            // TODO: incredible hack here, just pasting in what's from the old app so we can render the popup

            var partnerName = feature.properties.partnerName;
            var logoUrl = './src/images/partner/' + partnerName.toLowerCase().replace(' ', '') + '.jpg';

            // we add an onerror callback so that if the image 404's we just set it to display:none
            var logo = '<img src="' + logoUrl + '" alt="' + partnerName + '" onError="this.onerror=null;this.style.display=\'none\'" />';

            // Prepare the office hours output.
            var hours = '<strong>' + $translate.instant('HOURS') + ':</strong> ';
            var hourOpen = '';
            var hourClosed = '';
            for (var hoItem in feature.properties[$translate.instant('OFFICE_OPEN_AT')]) {
                if (feature.properties[$translate.instant('OFFICE_OPEN_AT')][hoItem] === true) {
                    hourOpen = hoItem;
                }
            }
            for (var hcItem in feature.properties[$translate.instant('OFFICE_CLOSE_AT')]) {
                if (feature.properties[$translate.instant('OFFICE_CLOSE_AT')][hcItem] === true) {
                    hourClosed = hcItem;
                }
            }
            // If we have hours, show them as compact as possible.
            if (hourOpen) {
                // TODO: translate
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
            var fields = {
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
            var toggleLinks = '<a id="show-details-' + feature.id + '" href="#/services/' + feature.id + '?hideOthers=false">Show details</a>';

            // Assemble the article header.
            var header = '<header>' + logo + '<h3>' + glyph + feature.properties.locationName + ': ' + feature.properties.activityName + '</h3>' + toggleLinks + '<p class="hours">' + hours + '</p>' + headerOutput + '</header>';

            return '<article class="serviceText"' + articleIDattribute + '>' + header + '</article>';
        }
    }
}]);
