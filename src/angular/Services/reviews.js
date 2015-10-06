var services = angular.module('services');

services.factory('Reviews', function() {
    var factory = {};
    var reviews = [
        {
            id: 1,
            rating: 4,
            comment: 'This place rocks!!',
            serviceId: 949606869,
        },
        {
            id: 2,
            rating: 1,
            comment: 'This place sucks!!',
            serviceId: 213577289,
        },
        {
            id: 3,
            rating: 5,
            comment: 'This place rocks!!',
            serviceId: 949606869,
        },
        {
            id: 4,
            rating: 2,
            comment: 'This place sucks!!',
            serviceId: 213577289,
        },
    ];


    /**
     * Returns a review given its id.
     * GET /reviews/:reviewId
     */
    factory.getReview = function(reviewId) {
        var review = _.find(reviews, function(review) {
            return review.id === reviewId;
        });
        return review;
    };

    /**
     * Returns a list of reviews of a service
     * GET /services/:serviceId/reviews
     */
    factory.getReviewsByServiceId = function(serviceId) {
        var reviews = _.filter(reviews, function(review) {
            return review.serviceId === serviceId;
        });

        return reviews;
    };

    /**
     * Returns the average rating of a service.
     */
    factory.getAverageRatingByServiceId = function(serviceId) {
        var returns = [1, 2, 3, 4, 5];
        var returnVal = _.sample(returns);

        return returnVal; //change to get data rather then a random
    };

    /**
     * Adds a review for a service.
     * POST /services/:serviceId
     */
    factory.addReview = function(serviceId, rating, comment) {
        var review = {
            id: 5,
            rating: rating,
            comment: comment,
            serviceId: serviceId,
        };

        reviews.push(review);

        return review;
    };

    return factory;
});
