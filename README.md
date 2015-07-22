# Building

This build uses npm, gulp, and browserify to manage dependencies.

To install gulp:

- run `npm install -g gulp`

To build the js/css:

- run `npm install` to download the 3rd party libs in `package.json`
- during development:
    - run `gulp` in the background, i.e. run `gulp` in a terminal and leave it running. It will automatically recompile
      `js/app.js` and `css.main.css` files as you edit the src files.
- when preparing for production:
    - run `gulp dist` to create minified `js.app.js` and `css/main.css` files.

To run the project:
- run `npm install -g http-server`
- run `http-server`
- go to `http://localhost:8080`
- in the future, since you've already installed http-server you can just run `http-server`

Files:

- LICENSE.txt - the MIT license
- README.md - this help file
- crossdomain.xml
- css/
  - images/ - contains the marker image files for AwesomeMarkers
  - leaflet.awesome-markers.css - CSS for AwesomeMarkers Leaflet plugin
  - normalize.css - cross-browser CSS, derived from HTML5 Boilerplate
  - main.css - the single CSS file that the browser uses, compiled from the SASS files in scss/
- gulpfile.js - the gulp file.  This file tells gulp how to compile app.js from the various libraries and src files.
- humanfont/ - HumanitarianFont, the font we use for the markers.
- humans.txt - the credits.  Add yourself!
- index.html - the sole HTML file that serves to convey all of this JS
- js/app.js - the single minified JS file that the browser uses, compiled from the other JS files and libraries.
- node-modules/ - the libraries that are installed by npm.  If the build has run successfully, this folder should contain:
   - crossfilter
   - gulp
   - gulp-sas
   - gulp-util
   - jquery
   - leaflet
   - leaflet.markercluster
   - mapbox.js
   - split
   - vinyl-source-stream
   - watchify

# How Services Data Is Loaded and Translated

- `cd src`
- `cat sources.txt | getJSON.js`
  - this will call all the urls in `sources.txt` and then concatenate all the json responses into `compiled.json`
- `node LoadJSON.js`
  - this takes the json from `compiled.json` and removes all the `comments` fields (which aren't translated) to output `compileTruncated.json`
- `node ParseEn_AR_JSON.js`
  - uses `data.csv` to regex replace the English strings in `compileTruncated.json` with their Arabic translations. This outputs `compiled_AR.json`.

## Arabic Site (http://data.unhcr.org/jordan/services-advisor/index_AR.html)

- uses a modified `index.html` with Arabic translations
- this in turn requires `app_AR.js` instead of `app.js`
- `app_AR.js` loads `compiled_AR.json`
