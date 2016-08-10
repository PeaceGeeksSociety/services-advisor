var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', '$location', '$rootScope', 'ServicesList', 'Search', '_', 'Cookies', function ($scope, $http, $location, $rootScope, ServicesList, Search, _, Cookies) {

    var renderView = function(services) {

        // get total counts
        if ($scope.serviceCounts == null){
          $scope.serviceCounts = {};
          angular.forEach($rootScope.allServices, function (service) {
              var category = service.category.name;
              if (category) {
                  if ($scope.serviceCounts[category] == null) {
                      $scope.serviceCounts[category] = {total: 0};
                  }
                  $scope.serviceCounts[category].total++;
              }
          });
        }

        $scope.selectedLanguage = Cookies.getCookie('LANGUAGE') || 'AR';
        var sectors = $scope.selectedLanguage == 'EN' ? require('../../../js/sectors_EN.json') : require('../../../js/sectors_AR.json');

        var categories = {};

        angular.forEach(sectors, function (sector) {
          categories[sector.sector.name] = {activities:{}, count: 0, total: $scope.serviceCounts[sector.sector.name].total};
        });


        // Here we're going to extract the list of categories and display them in a simple template
        // use an object to collect service information since object keys won't allow
        // for duplicates (this basically acts as a set)
        angular.forEach(services, function (service) {
            // add activity and its category to list, and increment counter of this category's available services
            var category = service.category.name;
            if (category) {
                if (categories[category] == null) {
                    categories[category] = {glyph: iconGlyphs[category].glyph, color: iconGlyphs[category].markerColor, activities:{}, count: 0};
                }
                categories[category].count++;

                var activity = service.category.subCategory.name;
                if (activity) {
                    if (categories[category].activities[activity] == null) {
                        categories[category].activities[activity] = {name: activity, count: 0};
                    }
                    categories[category].activities[activity].count++;
                }
            }
        });

        // now to get an array of categories we just map over the keys of the object
        var unsortedCategories = $.map(categories, function (value, index) {
            return {name: index, glyph: value.glyph, color: value.color, count: value.count, total: value.total, activities: value.activities};
        });

        $scope.categories = unsortedCategories.sort(function (categoryA, categoryB) {
            return categoryA.name.localeCompare(categoryB.name);
        });
        // use object here so we don't get duplicate keys
        var regions = {};
        polygonLayer.getLayers().forEach(function(f) {
            regions[f.feature.properties.adm1_name] = true;
        });
        var unsortedRegions = [];
        $.each(regions, function(k) { unsortedRegions.push(k) });

        $scope.regions = unsortedRegions.sort(function (regionA, regionB) {
            return regionA.localeCompare(regionB);
        });
        var parameters = $location.search();

        if (_.has(parameters, 'sector')) {
          $scope.activeCategory = parameters.sector;
        }
    };

    // Had to put renderView() in a function callback otherwise Watch won't make changes
    $rootScope.$on('FILTER_CHANGED',function(){
        renderView(Search.currResults());
    });

    if ($scope.categories){
        // // Set up the watch function to watches for changes in $scope.categories
        $scope.$watch($scope.categories);
    }

    ServicesList.get(function (data) {
        // TODO: right now we don't even use the 'data' result, we just use the current search results.
        // this is because if there are filters applied we want to only show data within those filters
        renderView(Search.currResults());
    });

    $scope.toggleCategory = function(categoryId) {
        $( '#' + categoryId + ' .activities').toggleClass('hidden');
        $( '#' + categoryId + ' .list-group-item').toggleClass('active');

        var classes = $( '#' + categoryId + ' > a > .glyphicon').attr('class').split(/\s+/);
        if($.inArray('glyphicon-chevron-down', classes) > -1) {
            $( '#' + categoryId + ' > a > .glyphicon').addClass('glyphicon-chevron-right');
            $( '#' + categoryId + ' > a > .glyphicon').removeClass('glyphicon-chevron-down');
        } else if($.inArray('glyphicon-chevron-right', classes) > -1) {
            $( '#' + categoryId + ' > a > .glyphicon').addClass('glyphicon-chevron-down');
            $( '#' + categoryId + ' > a > .glyphicon').removeClass('glyphicon-chevron-right');
        }
    }

    $scope.toCssClass = function (str) {
        return str.replace(/[^a-z0-9]/g, function(s) {
            var c = s.charCodeAt(0);
            if (c == 32) return '-';
            if (c >= 65 && c <= 90) return s.toLowerCase();
            return s;
        });
    }

    $scope.showCategoryResults = function(category_name) {
        var parameters = $location.search();
        parameters.category = category_name;
        $location.path('results').search(parameters);
        Search.filterByUrlParameters();
    }
    $scope.showSectorResults = function(sector_name) {
        var parameters = $location.search();
        parameters.sector = sector_name;
        $location.path('').search(parameters);
        Search.filterByUrlParameters();
    }

    $scope.showRegionResults = function(regionName) {
        var parameters = $location.search();
        parameters.region = regionName;
        $location.path('results').search(parameters);
        Search.filterByUrlParameters();
    }
}]);
