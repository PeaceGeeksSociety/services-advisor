var services = angular.module('services');

/**
 * Provides the list of services (compiled.json)
 */
services.factory('PopupBuilder', ['$translate', function ($translate) {
    var getLogoHtml = function(service) {
        var partnerName = service.organization.name;

        // we add an onerror callback so that if the image 404's we just set it to display:none
        var logo = '<img src="' + service.logoUrl + '" alt="' + partnerName + '" onError="this.onerror=null;this.style.display=\'none\'" />';
        return logo;

    }

    var getIconHtml = function(service) {
        // Get the activity-category icon.
        var activityCategory = service.category.name ? service.category.name : 'default'; // eg "CASH"
        var glyph = '<i class="glyphicon icon-' + service.category.sector.glyph + '"></i>';
        return glyph;
    }

    var getHoursHtml = function(service) {
        // Prepare the office hours output.
        var hours = '<strong>' + $translate.instant('HOURS') + ':</strong>';
        hours += '<ul>';

        for (var i = 0; i < service.officeHours.length; i++) {
            hours += '<li>' + service.officeHours[i].name + ': ' + service.officeHours[i].time + '</li>';
        }

        hours += '</ul>';

        return hours;
    }

    var getInfoLinkHtml = function(service) {
        if (service.infoLink) {
            return '<div class="more-info"><a class="btn btn-primary btn-xs" href="' + service.infoLink + '" target="_blank" role="button">' + $translate.instant('INFO_LINK') + '</a></div>';
        }

        return '';
    };

    return {

        buildPopup: function(service) {
            // Loop through our list of fields, preparing output for display.
            var headerOutput = '';

            var activityDetails = service.servicesProvided.join(', ');
            if (activityDetails === '') { activityDetails = $translate.instant('UNKNOWN'); }
            var activityDetailsHtml = '<p><strong>' + $translate.instant("ACTIVITY_DETAILS") + ':</strong> ' + activityDetails + '</p>';
            headerOutput += activityDetailsHtml;

            var referralInfo = service.referral.type;
            if (referralInfo === '') { referralInfo = $translate.instant('UNKNOWN'); }
            var referralHtml = '<p><strong>' + $translate.instant("REFERRAL_METHOD") + ':</strong> ' + referralInfo + '</p>';
            headerOutput += referralHtml;

            var glyph = getIconHtml(service);
            var logo = getLogoHtml(service);
            var hours = getHoursHtml(service);
            var infoLink = getInfoLinkHtml(service);
            headerOutput += infoLink;

            // Assemble the article header.
            var header = '<header>' + logo + '<h3>' + glyph + service.region + ': ' + service.category.subCategory.name + '</h3>' + '<p class="hours">' + hours + '</p>' + headerOutput + '</header>';

            return '<article class="serviceText">' + header + '</article>';
        }
    }
}]);
