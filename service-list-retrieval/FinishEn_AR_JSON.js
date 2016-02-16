/**
 * Translates services_EN.json and outputs services_AR.json. Uses the translations in data.csv
 */
var fs = require('fs'),
    _ = require('underscore');

/**
 * Get translations in object form
 * @param cb callback will be called with the translations in the form:
 * [
 *  {
 *      english: "this is english",
 *      arabic: "this is the arabic translation for 'this is english'"
 *  },
 *  ...
 *  ]
 */
var getTranslations = function (cb) {
    fs.readFile('data.csv', 'utf8', function (err, data) {
        var output = [];
        _.each(data.split("\n"), function (line) {
            var partStr = line.split(",");
            if (partStr.length == 2) {
                var fromStr = partStr[0].trim();
                var toStr = partStr[1].trim();

                output.push({
                    english: fromStr,
                    arabic: toStr
                });
            }
        });
        cb(output);
    });
};

getTranslations(function (translations) {

    /**
     * Translate string
     * @param toTranslate
     * @returns string
     */
    var translate = function (toTranslate) {
        _.each(translations, function (translation) {
            var regex = new RegExp(translation.english, 'gi');
            toTranslate = toTranslate.replace(regex, translation.arabic);
        });
        return toTranslate;
    };

    /**
     * Recursively translate keys and values of obj
     * @param obj can be any JS type: string, array, null, obj, etc.
     */
    var translateKeysAndValues = function (obj) {
        if (typeof(obj) === "string") {
            return translate(obj);
        }
        else if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                obj[i] = translateKeysAndValues(obj[i])
            }
            return obj;
        } else if (obj === null) {
            return obj;
        } else if (typeof(obj) === "object") {
            Object.keys(obj).forEach(function (key) {
                var oldValue = obj[key];
                var newValue = translateKeysAndValues(oldValue);

                // now delete the old key and add the translated one
                delete obj[key];
                var newKey = translate(key);
                obj[newKey] = newValue;
            });

            return obj;
        } else {
            return obj;
        }
    };

    fs.readFile('../js/services_EN.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var json = JSON.parse(data);
            var newJson = [];
            json.forEach(function (service) {
                newJson.push(translateKeysAndValues(service));
            });

            fs.writeFile('../js/services_AR.json', JSON.stringify(newJson), 'utf8', function (err) {
                if (err) return console.log(err);
            });
        }
    })
});

