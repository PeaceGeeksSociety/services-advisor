var services = angular.module('services');
var gju = require('../../../node_modules/geojson-utils');
var Fuse = require('fuse.js');

/**
 * Holds the state of the current search and the current results of that search
 */
services.factory('Search', [
    '$q', '$rootScope', '$location', '_', 'LongTask', 'SiteSpecificConfig', 'RegionList', 'SectorList', 'ServicesList', 'Map',
    ($q, $rootScope, $location, _, LongTask, SiteSpecificConfig, RegionList, SectorList, ServicesList, Map) => {

    var crossfilter = require('crossfilter')();
    var fuse;

    var categoryDimension = crossfilter.dimension((f) => f.servicesProvided);
    var categoryGroup = categoryDimension.groupAll().reduce(reduceAdd('servicesProvided'), reduceRemove('servicesProvided'), reduceInitial);
    var regionDimension = crossfilter.dimension((f) => f.region);
    var regionGroup = regionDimension.groupAll().reduce(reduceAdd('region'), reduceRemove('region'), reduceInitial);
    var textDimension = crossfilter.dimension((f) => f.id || undefined);
    var partnerDimension = crossfilter.dimension((f) => f.organization.name || undefined);
    var nationalityDimension = crossfilter.dimension((f) => f.nationality.split(', ') || undefined);
    var locationDimension = crossfilter.dimension((f) => {
        var [lon, lat] = f.location.geometry.coordinates;
        return `${lon}, ${lat}` || "";
    });
    var idDimension = crossfilter.dimension((f) => f.id);
    var referralsDimension = crossfilter.dimension((f) => f.referral.required);
    /** Used to get list of currently filtered services rather than re-using an existing dimension **/
    var metaDimension = crossfilter.dimension(function (f) { return f.id; });
    var allDimensions = [
        categoryDimension, regionDimension, textDimension, partnerDimension,
        nationalityDimension, locationDimension, idDimension,
        referralsDimension
    ];

    // asynchronously initialize crossfilter
    fetchData()
        .then(indexServices)
        .then(() => $rootScope.$broadcast('FILTER_CHANGED', _getCurrResults()));

    return {
        selectId: withClearAndEmit(selectId),
        currResults: _getCurrResults,
        filterByUrlParameters: () => LongTask.run(withClearAndEmit(filterByUrlParameters)),
        getCategoryGroup: categoryGroup,
        getRegionGroup: regionGroup,
        // selectCategory: withClearAndEmit(selectCategory),
        // selectRegion: withClearAndEmit(selectRegion),
        // selectPartner: withClearAndEmit(selectPartner),
        // selectOrganizations: _selectOrganizations,
        // clearOrganizations: _clearOrganizations,
        // selectLocation: withClearAndEmit(selectLocation),
        // filterByProximity: withClearAndEmit(filterByProximity),
        // selectReferrals : _selectReferrals,
    };

    function fetchData() {
        return Promise.all([
            RegionList.get(),
            SectorList.get(),
            ServicesList.get()
        ]);
    }

    function reduceInitial() {
        return {};
    }

    function reduceAdd(property) {
        return (p, v) => {
            _.each(v[property], (value) => {
                if (p[value] === undefined) {
                    p[value] = 0;
                }

                p[value]++;
            });
            return p;
        }
    }

    function reduceRemove(property) {
        return (p, v) => {
            _.each(v[property], (value) => {
                p[value]--;
            });
            return p;
        }
    }

    function indexServices([regions, sectors, services]) {
        $rootScope.allServices = services;
        crossfilter.add(services);
        fuse = new Fuse(services, SiteSpecificConfig.search);
    }

    function _getCurrResults() {
        return metaDimension.top(Infinity);
    }

    function clearAll() {
        angular.forEach(allDimensions, (filter) => filter.filterAll());
    }

    // this function allows us to wrap another function with clearAll() and $emit to reduce boilerplate
    function withClearAndEmit(fn) {
        return function clearAndEmit() {
            clearAll();
            var results = fn.apply(this, arguments);
            $rootScope.$broadcast('FILTER_CHANGED', results);
            return results;
        };
    }

    function selectId(id) {
        idDimension.filter((serviceId) => serviceId == id);
        return _getCurrResults();
    }

    // function selectCategory(category) {
    //     _selectCategory([category]);

    //     return _getCurrResults();
    // }

    // function selectRegion(region) {
    //     _selectRegion([region]);

    //     return _getCurrResults();
    // }

    // function selectPartner(partner) {
    //     partnerDimension.filter(function(servicePartner) {
    //         return servicePartner == partner;
    //     });

    //     return _getCurrResults();
    // }

    // function selectLocation(region) {
    //     var activeRegionLayer = null;
    //     // TODO: Where is polygonLayer coming from??
    //     Map.polygonLayer().getLayers().forEach(function(f) {
    //         if (f.feature.properties.adm1_name == region) {
    //             activeRegionLayer = f;
    //         }
    //     });
    //     if (activeRegionLayer) {
    //         locationDimension.filter((servicePoint) => {
    //             var pp = servicePoint.split(',');
    //             var point = {
    //                 type: "Point",
    //                 coordinates: [parseFloat(pp[1]), parseFloat(pp[0])]
    //             };
    //             return gju.pointInPolygon(point, activeRegionLayer.toGeoJSON().geometry);
    //         });
    //     }
    // }

    // function filterByProximity(geoLocation){
    //     var requiredArgumentGiven =  _.has(geoLocation, 'latitude') &&
    //         _.has(geoLocation, 'longitude') && _.has(geoLocation, 'radius');

    //     if (requiredArgumentGiven) {
    //         var center = gju.rectangleCentroid({
    //             "type": "Polygon",
    //             "coordinates": [[ [geoLocation.latitude, geoLocation.longitude],
    //                             [geoLocation.latitude, geoLocation.longitude],
    //                             [geoLocation.latitude, geoLocation.longitude]
    //                         ]]
    //         });
    //         var radius = geoLocation.radius;
    //         locationDimension.filter((servicePoint) => {
    //             var pp = servicePoint.split(',');
    //             var point = {
    //                 type: "Point",
    //                 coordinates: [parseFloat(pp[1]), parseFloat(pp[0])]
    //             };
    //             return gju.geometryWithinRadius(point, center, radius);
    //         });
    //     } else {
    //         console.log(' Please provide the pass in object into filterByProximity method with the following keys: latitude, longitude, and radius');
    //     }
    // }

    // Crossfilter dimensions

    function _searchText(search) {
        var result = search.length > 0 ? fuse.search(search): [];
        textDimension.filter((serviceId) => {
            return _.contains(result, serviceId);
        });
    }

    // function _clearOrganizations() {
    //     partnerDimension.filterAll();
    // }

    function _selectOrganizations(organizations) {
        partnerDimension.filter((serviceOrganization) => {
            return organizations.indexOf(serviceOrganization) > -1;
        });
    }

    function _selectNationalities(nationalities) {
        nationalityDimension.filter((serviceNationalities) => {
            return _.intersection(nationalities, serviceNationalities).length > 0;
        });
    }

    function _selectReferrals(selection) {
        referralsDimension.filter(function(service_requires_referral) {
            // if they've selected all, then we return everything, otherwise we try to match
            if (selection == 'all'){
                return true;
            } else if (service_requires_referral && selection == 'referral-required'){
                return true;
            } else if (!service_requires_referral && selection == 'referral-not-required'){
                return true;
            } else {
                return false;
            }
        });
    }

    function _selectCategory(categories) {
        categoryDimension.filter((f) => {
            var intersection = _.intersection(f, categories);
            return _.isEqual(intersection, categories);
        });

        return _getCurrResults();
    }

    function _selectRegion(regions) {
        regionDimension.filter(function (f) {
            var intersection = _.intersection(f, regions);
            return _.isEqual(intersection, regions);
        });
    }

    function _selectLocation(location) {
        var activeLocationLayer = null;
        Map.polygonLayer().getLayers().forEach((f) => {
            if (f.feature.properties.adm1_name == location) {
                activeLocationLayer = f;
            }
        });

        if (activeLocationLayer) {
            locationDimension.filter((servicePoint) => {
                var pp = servicePoint.split(',');
                var point = {
                    type: "Point",
                    coordinates: [parseFloat(pp[1]), parseFloat(pp[0])]
                };
                return gju.pointInPolygon(point, activeLocationLayer.toGeoJSON().geometry);
            });
        }

        return _getCurrResults();
    }

    function filterByUrlParameters() {
        var parameters = $location.search();

        if (_.has(parameters, 'search')) {
            _searchText(parameters.search);
        }
        if (_.has(parameters, 'organization') && parameters.organization.length > 0) {
            _selectOrganizations(parameters.organization);
        }

        if (_.has(parameters, 'nationality') && parameters.nationality.length > 0) {
            _selectNationalities(parameters.nationality);
        }

        if (_.has(parameters, 'referrals')) {
            _selectReferrals(parameters.referrals);
        }

        if (_.has(parameters, 'category')) {
            _selectCategory(parameters.category);
        }

        if (_.has(parameters, 'region')) {
            _selectRegion(parameters.region);
        }
        if (_.has(parameters, 'location')) {
            _selectLocation(parameters.location);
        }

        return _getCurrResults();
    }
}]);
