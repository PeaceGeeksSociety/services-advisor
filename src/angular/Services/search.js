var services = angular.module('services');
var gju = require('../../../node_modules/geojson-utils');
var Fuse = require('fuse.js');

/**
 * Holds the state of the current search and the current results of that search
 */
services.factory('Search', ['SiteSpecificConfig', '$location', 'ServicesList', '$rootScope', '_', function (SiteSpecificConfig, $location, ServicesList, $rootScope, _) {
    var crossfilter = require('crossfilter')();
    var fuse;

    // asynchronously initialize crossfilter
    ServicesList.get(function (allServices) {
        $rootScope.allServices = allServices;
        crossfilter.add(allServices);
        fuse = new Fuse(allServices, SiteSpecificConfig.search);
        // trigger initial map load
        $rootScope.$broadcast('FILTER_CHANGED', _getCurrResults());
    });

    // TODO: not sure why they do || undefined, but previously they had "|| option.empty" where empty was never defined
    var categoryDimension = crossfilter.dimension(function (f) {
        return f.servicesProvided;
    });

    var reduceAdd = function(property) {
        return function(p, v) {
            _.each(v[property], function (value, key, list) {
                if (p[value] === undefined) {
                    p[value] = 0;
                }

                p[value]++;
            });

            return p;
        }
    };

    var reduceRemove = function(property) {
        return function(p, v) {
            _.each(v[property], function (value, key, list) {
                p[value]--;
            });

            return p;
        }
    };

    var reduceInitial = function() {
      return {};  
    }

    var categoryGroup = categoryDimension.groupAll().reduce(reduceAdd('servicesProvided'), reduceRemove('servicesProvided'), reduceInitial);

    var regionDimension = crossfilter.dimension(function (f) {
        return f.region;
    });

    var regionGroup = regionDimension.groupAll().reduce(reduceAdd('region'), reduceRemove('region'), reduceInitial);

    var textDimension = crossfilter.dimension(function (f) {
        return f.id || undefined;
    });

    var partnerDimension = crossfilter.dimension(function (f) {
        return f.organization.name || undefined;
    });

    var nationalityDimension = crossfilter.dimension(function (f) {
        return f.nationality.split(', ') || undefined;
    });

    var locationDimension = crossfilter.dimension(function (f) {
        return f.location.geometry.coordinates[0] + "," + f.location.geometry.coordinates[1] || "";
    });

    var idDimension = crossfilter.dimension(function (f) {
        return f.id;
    });

    var referralsDimension = crossfilter.dimension(function (f) {
        return f.referral.required;
    });

    /** Used to get list of currently filtered services rather than re-using an existing dimension **/
    var metaDimension = crossfilter.dimension(function (f) { return f.id; });

<<<<<<< HEAD
    var allDimensions = [categoryDimension, regionDimension, partnerDimension, nationalityDimension, locationDimension, idDimension, referralsDimension];
=======
    var allDimensions = [categoryDimension, textDimension, partnerDimension, nationalityDimension, regionDimension, idDimension, referralsDimension];
>>>>>>> f-55-text-search

    var _getCurrResults = function() {
        var results = metaDimension.top(Infinity);

        return results;
    };

    var clearAll = function () {
        angular.forEach(allDimensions, function(filter) {
            filter.filterAll();
        });
    };

    /** End crossfilter setup **/

    // this function allows us to wrap another function with clearAll() and $emit to reduce boilerplate
    var withClearAndEmit = function(fn) {
        return function () {
            clearAll();
            var results = fn.apply(this, arguments);
            $rootScope.$broadcast('FILTER_CHANGED', results);
            return results;
        };
    };

    var _searchText = function(search) {
        var result = search.length > 0 ? fuse.search(search): [];
        textDimension.filter(function (serviceId) {
            return _.contains(result, serviceId);
        });
    }

    var _clearOrganizations = function() {
        partnerDimension.filterAll();
    };

    var _selectOrganizations = function(organizations) {
        partnerDimension.filter(function(serviceOrganization) {
            return organizations.indexOf(serviceOrganization) > -1;
        });
    };

    var _selectNationalities = function(nationalities) {
        nationalityDimension.filter(function(serviceNationalities) {
            return _.intersection(nationalities, serviceNationalities).length > 0;
        });
    };

    var _selectReferrals = function (selection) {
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
    };

    var _selectCategory = function(categories) {
        categoryDimension.filter(function(f) {
            var intersection = _.intersection(f, categories);
            return _.isEqual(intersection, categories);
        });

        return _getCurrResults();
    };

    var _selectRegion = function(regions) {
        regionDimension.filter(function (f) {
            var intersection = _.intersection(f, regions);
            return _.isEqual(intersection, regions);
        });
    };

    var _selectLocation = function (location) {
        var activeLocationLayer = null;
        polygonLayer.getLayers().forEach(function(f) {
            if (f.feature.properties.adm1_name == location) {
                activeLocationLayer = f;
            }
        });

        if (activeLocationLayer) {
            locationDimension.filter(function(servicePoint) {
                var pp = servicePoint.split(',');
                var point = {
                    type: "Point",
                    coordinates: [parseFloat(pp[1]), parseFloat(pp[0])]
                };
                return gju.pointInPolygon(point, activeLocationLayer.toGeoJSON().geometry);
            });
        }

        return _getCurrResults();
    };

    return {
        selectCategory: withClearAndEmit(function (category) {
            _selectCategory([category]);

            return _getCurrResults();
        }),
        selectRegion: withClearAndEmit(function (region) {
            _selectRegion([region]);

            return _getCurrResults();
        }),
        selectId: withClearAndEmit(function (id) {
            idDimension.filter(function(serviceId) {
                return serviceId == id;
            });

            return _getCurrResults();
        }),
        selectPartner: withClearAndEmit(function(partner) {
            partnerDimension.filter(function(servicePartner) {
                return servicePartner == partner;
            });

            return _getCurrResults();
        }),
        selectOrganizations: _selectOrganizations,
        clearOrganizations: _clearOrganizations,
        selectLocation: withClearAndEmit(function(region) {
            var activeRegionLayer = null;
            polygonLayer.getLayers().forEach(function(f) {
                if (f.feature.properties.adm1_name == region) {
                    activeRegionLayer = f;
                }
            });
            if (activeRegionLayer) {
                locationDimension.filter(function(servicePoint) {
                    var pp = servicePoint.split(',');
                    var point = {
                        type: "Point",
                        coordinates: [parseFloat(pp[1]), parseFloat(pp[0])]
                    };

                    return gju.pointInPolygon(point, activeRegionLayer.toGeoJSON().geometry);
                });
            }
        }),
        filterByProxmity: withClearAndEmit(function(geoLocation){

            var requiredArgumentGiven =  _.has(geoLocation, 'latitude') &&
                                        _.has(geoLocation, 'longitude') &&
                                        _.has(geoLocation, 'radius');
            if(requiredArgumentGiven){
                var center = gju.rectangleCentroid({
                  "type": "Polygon",
                  "coordinates": [[ [geoLocation.latitude, geoLocation.longitude],
                                    [geoLocation.latitude, geoLocation.longitude],
                                    [geoLocation.latitude, geoLocation.longitude]
                                ]]
                });
                var radius = geoLocation.radius;
                locationDimension.filter(function(servicePoint) {
                    var pp = servicePoint.split(',');
                    var point = {
                        type: "Point",
                        coordinates: [parseFloat(pp[1]), parseFloat(pp[0])]
                    };

                    return gju.geometryWithinRadius(point, center, radius);
                });
            }else {
                console.log(' Please provide the pass in object into filterByProxmity method with the following keys: latitude, longitude, and radius');
            }

        }),
        selectReferrals : _selectReferrals,
        clearAll: withClearAndEmit(function(){}),
        currResults: _getCurrResults,
        filterByUrlParameters: withClearAndEmit(function () {
            var parameters = $location.search();

            if (_.has(parameters, 'search')) {
                _searchText(parameters.search);
            }
            if (_.has(parameters, 'organization') && parameters.organization.length > 0){
                _selectOrganizations(parameters.organization);
            }

            if (_.has(parameters, 'nationality') && parameters.nationality.length > 0){
                _selectNationalities(parameters.nationality);
            }

            if (_.has(parameters, 'referrals')) {
                _selectReferrals(parameters.referrals);
            }

            if (_.has(parameters, 'category')) {
                _selectCategory(parameters.category);
            }

            if (_.has(parameters, 'region')){
                _selectRegion(parameters.region);
            }
            if (_.has(parameters, 'location')){
                _selectLocation(parameters.location);
            }

            return _getCurrResults();
        }),
        getCategoryGroup: categoryGroup,
        getRegionGroup: regionGroup,
    };
}]);
