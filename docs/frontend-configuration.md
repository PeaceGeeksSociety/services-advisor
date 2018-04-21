# Configuration

## Build Frontend configuration
- Copy `src/site-specific-config.js.dist` to `src/site-specific-config.js` and specify your languages and the name of the JSON file data should be fetched from. There are examples provided in the dist file.
- Default settings can be viewed `src/angular/Services/defaultsetings.js` a description of each settings:

### version
A version number which will be shown in the bottom right corner of the SA map.

### defaultLanguage
Which language to use when there is none specified as a URL param. (Must be one of the configured languages).

### defaultLogo
Allows the configuration of a different logo.

### mapTileAPI
The mapbox api path. Example:
```
settings.mapTileAPI = "https://api.mapbox.com/styles/v1/example/lkjadsf893453kjjhfq1t50hb/tiles/256/{z}/{x}/{y}?access_token=someverylongtoken";
```

### includePolygons (Deprecated)
Used to render Jordan polygons onto the map but no longer does anything. These have since been removed and the settings needs to be extracted as well.

### analyicsId
The ID for a google analytics account.

### feedbackMail
The email for general inquiries which is added to the bottom of the search page in the sidebar.

### feedbackEndpoint
The full endpoint path which receives feedback data from the angular client. If you are using this JS client with the `servicesadvisor-3.0` codebase the endpoint should be `https://domain.com/feedback`

### fields
A JS object keyed by fieldname. Keys with a false value will stop that field from rendering. The default value is `true` with the exception of `allowFeedback`.
```
{
    allowFeedback: true,
    referralRequiredFilter: false,
    referralMethod: false,
    referralNextSteps: false,
    feedbackMechanism: false,
    feedbackDelay: false
}
```

### clusterColors
The default colors for the marker cluster library are not suitable as areas with more services show as red. This can be interpreted as a dangerous area. This setting exposes the cluster color for configuration.
```
settings.clusterColors.small = 'rgba(145, 205, 255, 0.6)';
settings.clusterColors.smallInner = 'rgba(108, 186, 252, 0.6)';
settings.clusterColors.medium = 'rgba(83, 159, 224, 0.6)';
settings.clusterColors.mediumInner = 'rgba(78, 150, 211, 0.6)';
settings.clusterColors.large = 'rgba(39, 139, 221, 0.6)';
settings.clusterColors.largeInner = 'rgba(35, 123, 196, 0.6)';
```

### search
A JS object which is directly passed as settings to the http://fusejs.io/ library.
