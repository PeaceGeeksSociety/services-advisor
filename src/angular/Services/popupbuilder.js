var services = angular.module('services');

/**
 * Provides the list of services (compiled.json)
 */
services.factory('PopupBuilder', ['$translate', function ($translate) {
    var getLogoHtml = function(service) {
        var partnerName = service.organization.name;
        var logoUrl = './src/images/partner/' + partnerName.toLowerCase().replace(' ', '') + '.jpg';

        // we add an onerror callback so that if the image 404's we just set it to display:none
        var logo = '<img src="' + logoUrl + '" alt="' + partnerName + '" onError="this.onerror=null;this.style.display=\'none\'" />';
        return logo;

    }

    var getIconHtml = function(service) {
        // Get the activity-category icon.
        activityCategory = service.category.name; // eg "CASH"
        var glyph = '<i class="glyphicon icon-' + iconGlyphs[activityCategory].glyph + '"></i>';
        return glyph;
    }

    var getHoursHtml = function(service) {
        // Prepare the office hours output.
        var hours = '<strong>' + $translate.instant('HOURS') + ':</strong> ';
        var hourOpen = '';
        var hourClosed = '';
        var serviceHours = service.hours;
        if (serviceHours.hasOwnProperty('openAt')){
            hourOpen = serviceHours.openAt;
        }
        if (serviceHours.hasOwnProperty('closedAt')){
            hourClosed = serviceHours.closedAt;
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
            hours = hourClosed ? hours += hourClosed : hours + $translate.instant('UNKNOWN');
        }

        return hours;
    }

    return {

        buildPopup: function(service) {
            // TODO: incredible hack here, just pasting in what's from the old app so we can render the popup

            // Loop through our list of fields, preparing output for display.
            var headerOutput = '';

            var activityDetails = service.servicesProvided.join(', ');
            if (activityDetails === '') { activityDetails = $translate.instant('UNKNOWN'); }
            var activityDetailsHtml = '<p><strong>' + $translate.instant("Activity Details") + ':</strong> ' + activityDetails + '</p>';
            headerOutput += activityDetailsHtml;

            var referralInfo = service.referral.type;
            if (referralInfo === '') { referralInfo = $translate.instant('UNKNOWN'); }
            var referralHtml = '<p><strong>' + $translate.instant("Referral Method") + ':</strong> ' + referralInfo + '</p>';
            headerOutput += referralHtml;

            var glyph = getIconHtml(service);
            var logo = getLogoHtml(service);
            var hours = getHoursHtml(service);

            // Assemble the article header.
            var header = '<header>' + logo + '<h3>' + glyph + service.region + ': ' + service.category.subCategory.name + '</h3>' + '<p class="hours">' + hours + '</p>' + headerOutput + '</header>';

            return '<article class="serviceText">' + header + '</article>';
        }
    }
}]);
