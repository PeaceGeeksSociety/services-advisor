#!/usr/bin/env bash

cd $( dirname "${BASH_SOURCE[0]}" )

#echo "Copying old versions of services_AR.json and services_EN.json to services_AR.json.bak and services_EN.json.bak"
#cp ../js/services_AR.json ../js/services_AR.json.bak
#cp ../js/services_EN.json ../js/services_EN.json.bak

node getSectors.js

echo "Getting latest service data and writing to services.json"
# node getJSONFromAmani.js
node getJSONServices.js

echo "Transforming JSON"
node transformJSONFromAmani.js

echo "Getting translations"
node getLocaleStrings.js

echo "Done!"
