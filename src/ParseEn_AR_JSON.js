var lazy = require("lazy"),
    fs = require('fs');

var result;

// Read Service Advisor JSON File 
fs.readFile('compileTruncated.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    // Read Arabic Translation Template in CSV
    new lazy(fs.createReadStream('data.csv'))
        .lines
        .forEach(function (line) {

            var partofStr = line.toString();
            var partStr = partofStr.split(",");
        // Replace English to Arabic based on the Template

            var fromStr = partStr[0].trim();
            var re = new RegExp(fromStr, 'gi');
            result = data.replace(re, partStr[1].trim());
            data = result;

            fs.writeFile('compiled_AR.json', result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });
    }
);
