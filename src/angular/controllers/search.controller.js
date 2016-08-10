var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', '$location', '$rootScope', 'ServicesList', 'Search', '_', function ($scope, $http, $location, $rootScope, ServicesList, Search, _) {

    var renderView = function(services) {

        // Here we're going to extract the list of categories and display them in a simple template
        // use an object to collect service information since object keys won't allow
        // for duplicates (this basically acts as a set)
        var categories = {};
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
            return {name: index, glyph: value.glyph, color: value.color, count: value.count, activities: value.activities};
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
        $location.path('results').search(parameters);
        // Search.filterByUrlParameters();
    }

    $scope.showRegionResults = function(regionName) {
        var parameters = $location.search();
        parameters.region = regionName;
        $location.path('results').search(parameters);
        Search.filterByUrlParameters();
    }
}]);
