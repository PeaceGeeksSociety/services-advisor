var services = angular.module('services');


/**
 * Holds the state of the current search and the current results of that search
 */
services.factory('Search', ['ServicesList', '$rootScope', function (ServicesList, $rootScope) {
    // asynchronously initialize crossfilter
    ServicesList.get(function (allServices) {
        crossfilter.add(allServices);

        // trigger initial map load
        $rootScope.$emit('FILTER_CHANGED')
    });

    /** Crossfilter Setup **/
    var crossfilter = require('crossfilter')();

    // TODO: not sure why they do || undefined, but previously they had "|| option.empty" where empty was never defined
    var categoryDimension = crossfilter.dimension(function (f) {
        return f.properties['activityName'] || undefined;
    });
    var referralDimension = crossfilter.dimension(function (f) {
        return f.properties['Referral required'] || undefined;
    });
    var partnerDimension = crossfilter.dimension(function (f) {
        return f.properties['partnerName'] || undefined;
    });

    // TODO: not sure if we need this anymore
    var proximityDimension = crossfilter.dimension(function (f) {
        return f.geometry.coordinates[0] + "," + f.geometry.coordinates[1] || "";
    });

    var regionDimension = crossfilter.dimension(function (f) {
        return f.properties['locationName'] || undefined;
    });

    /** Used to get list of currently filtered services rather than re-using an existing dimension **/
    var metaDimension = crossfilter.dimension(function (f) { return f.properties.activityName; });

    /** End crossfilter setup **/

    var servicesById;

    return {
        selectCategory: function (category) {
            categoryDimension.filter(function(service) {
                return service == category;
            });
            $rootScope.$emit('FILTER_CHANGED');
        },
        selectRegion: function (region) {
            regionDimension.filter(function (service) {
                return service == region;
            });
            $rootScope.$emit('FILTER_CHANGED');
        },
        clearSelects: function() {
            categoryDimension.filter(null);
            regionDimension.filter(null);
            $rootScope.$emit('FILTER_CHANGED');
        },
        currResults: function () {
            return metaDimension.top(Infinity);
        }
    }
}]);
