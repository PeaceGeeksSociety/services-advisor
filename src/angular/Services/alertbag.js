var services = angular.module('services');

services.factory('AlertBag', [function AlertBag() {
    let messages = [];

    return {
        getMessages: () => messages,
        flashMessage: (type, body) => {
            messages.push({
                type,
                body
            });
        },
        clearMessages: () => {
            messages = [];
        }
    };
}]);
