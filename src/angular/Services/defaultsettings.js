/**
 *  "Language Key" : {
 *      "languageDirection": "rtl or ltr" // for example english is left to right but arabic is right to left
 *      "servicesUrl": // where we pull the services data from. This can be a local (ex. js/a.json) or an external url (ex. http://my-website/a.json)
 *      "languageName": // The language as it will be displayed to the user.
 *      "languageCode": // The two letter code that is used internally, i.e. 'EN', 'AR', 'KU'
 *      "amani": true or false // whether this source is from amani. If it is, we convert their json schema into ours otherwise we expect it will be our format
 *      "logo": // URL to logo image.
 *  }
 */
var services = angular.module('services');
services.factory('DefaultSettings', [function () {
    return {
        defaultLanguage: "EN",
        mapTileAPI: null,
        includePolygons: false,
        defaultLogo: "images/logo.png",
        analyticsId: false,
        languages: {},
        fields: {}
    };
}
]);
