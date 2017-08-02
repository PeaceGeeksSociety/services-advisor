var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', '$location', '$rootScope', 'SiteSpecificConfig', 'ServicesList', 'SectorList', 'Search', '_', '$translate', 'Language', function ($scope, $http, $location, $rootScope, SiteSpecificConfig, ServicesList, SectorList, Search, _, $translate, Language) {

    SectorList.get(function (sectors) {
        $scope.categories = sectors.children;
    });
    // var renderView = function(services) {
    //     var categories = {};

    //     SectorList.getRootSectors(function (sectors) {
    //         angular.forEach(sectors, function (item) {
    //             var sector = item.model;
    //             categories[sector.name] = {activities:{}, count: 0, total: 0, glyph:sector.glyph, color: sector.markerColor};
    //         });

    //         angular.forEach($rootScope.allServices, function (service) {
    //             // add activity and its category to list, and increment counter of this category's available services
    //             var category = service.category.name;
    //             var activity = service.category.subCategory.name;

    //             if (category) {
    //                 categories[category].count++;

    //                 if (activity) {
    //                     if (categories[category].activities[activity] == null) {
    //                         categories[category].activities[activity] = {name: activity, count: 0};
    //                     }
    //                     categories[category].activities[activity].count++;
    //                 }
    //             }
    //         });

    //         // now to get an array of categories we just map over the keys of the object
    //         var unsortedCategories = $.map(categories, function (value, index) {
    //             return {name: index, glyph: value.glyph, color: value.color, count: value.count, total: value.total, activities: value.activities};
    //         });

    //         $scope.categories = unsortedCategories.sort(function (categoryA, categoryB) {
    //             return categoryA.name.localeCompare(categoryB.name);
    //         });
    //     });

    //     // use object here so we don't get duplicate keys
    //     var regions = {};

    //     if (SiteSpecificConfig.includePolygons) {
    //         polygonLayer.getLayers().forEach(function(f) {
    //             regions[f.feature.properties.adm1_name] = true;
    //         });
    //         var unsortedRegions = [];
    //         $.each(regions, function(k) { unsortedRegions.push(k) });

    //         $scope.regions = unsortedRegions.sort(function (regionA, regionB) {
    //             return regionA.localeCompare(regionB);
    //         });
    //     }

    //     var parameters = $location.search();

    //     if (_.has(parameters, 'sector')) {
    //       if ($scope.activeCategory != undefined){
    //         $scope.previousCategory == $scope.activeCategory;
    //       }
    //       $scope.activeCategory = parameters.sector;
    //     }
    // };

    // // Had to put renderView() in a function callback otherwise Watch won't make changes
    // $rootScope.$on('FILTER_CHANGED',function(){
    //     renderView(Search.currResults());
    // });

    // if ($scope.categories){
    //     // // Set up the watch function to watches for changes in $scope.categories
    //     $scope.$watch($scope.categories);
    // }

    // ServicesList.get(function (data) {
    //     // TODO: right now we don't even use the 'data' result, we just use the current search results.
    //     // this is because if there are filters applied we want to only show data within those filters
    //     renderView(Search.currResults());
    // });

    // $scope.toggleCategory = function(categoryId, categoryName) {
    //     $( '#' + categoryId + ' .activities').toggleClass('hidden');
    //     $( '#' + categoryId + ' .list-group-item').toggleClass('active');

    //     var classes = $( '#' + categoryId + ' > a > .glyphicon').attr('class').split(/\s+/);
    //     if($.inArray('glyphicon-chevron-down', classes) > -1) {
    //         $( '#' + categoryId + ' > a > .glyphicon').addClass('glyphicon-chevron-right');
    //         $( '#' + categoryId + ' > a > .glyphicon').removeClass('glyphicon-chevron-down');
    //     } else if($.inArray('glyphicon-chevron-right', classes) > -1) {
    //         $( '#' + categoryId + ' > a > .glyphicon').addClass('glyphicon-chevron-down');
    //         $( '#' + categoryId + ' > a > .glyphicon').removeClass('glyphicon-chevron-right');
    //     }
    // }

    // $scope.toCssClass = function (str) {
    //     return str.replace(/[^a-z0-9]/g, function(s) {
    //         var c = s.charCodeAt(0);
    //         if (c == 32) return '-';
    //         if (c >= 65 && c <= 90) return s.toLowerCase();
    //         return s;
    //     });
    // }

    // $scope.showCategoryResults = function(category_name) {
    //     var parameters = $location.search();
    //     parameters.category = category_name;
    //     $location.path('results').search(parameters);
    //     Search.filterByUrlParameters();
    // }
    // $scope.toggleSectorResults = function(sector_name) {
    //     var parameters = $location.search();

    //     if (parameters.sector != undefined && parameters.sector == sector_name){
    //         delete parameters.sector;
    //     } else {
    //       parameters.sector = sector_name;
    //     }

    //     $location.path('').search(parameters);
    //     Search.filterByUrlParameters();
    // }

    // $scope.showRegionResults = function(regionName) {
    //     var parameters = $location.search();
    //     parameters.region = regionName;
    //     $location.path('results').search(parameters);
    //     Search.filterByUrlParameters();
    // }
}]);
