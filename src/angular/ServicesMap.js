const VersionControl = require('../utility/leaflet-version-control');

// Mapbox doesn't need its own var - it automatically attaches to Leaflet's L.
require('mapbox.js');
// Use Awesome Markers lib to produce font-icon map markers
require('drmonty-leaflet-awesome-markers');
// Marker clustering
require('leaflet.markercluster');
// Configurable cluster icon colors.
require('../utility/leaflet-divicon-color.js');

class ServicesMap {

    constructor(config) {
        this._config = config;
        this._clusterLayer = null;
        this._baseLayer = null;
        this._polygonLayer = null;
        this._visble = false;
        this._markers = [];
        this._bounds = null;
        this._bugFix = null;

        this.initialize();
    }

    initialize() {
        this._map = L.mapbox.map('mapContainer', null, { minZoom: 3 });
        this._map.addControl(new VersionControl(this._config.version));
        this._baseLayer = this._createBaseLayer(this._config);
        this._clusterLayer = this._createClusterLayer(this._config, ClusterLayerBugFix(this._map));
        this._polygonLayer = this._createPolygonLayer();
        this._lockBounds = false;
        this._map.addLayer(this._baseLayer);
        this._map.addLayer(this._clusterLayer);
        this._map.addLayer(this._polygonLayer);
    }

    toggleVisible() {
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this._visible = true;
        this.refresh();
    }

    hide() {
        this._visible = false;
    }

    get() {
        return this.map;
    }

    setServiceMarkers(markers) {
        this._markers = markers;
        this.refresh();
    }

    refresh() {
        // TODO: Because MarkerCluster.addLayers() is asynchronous, we can't
        //       calculate bounds until it's complete. Therefore we have to
        //       calculate the bounds ourselves.
        if (this._markers.length) {
            const bounds = L.featureGroup(this._markers).getBounds();
            this._fitBounds(bounds);
        }

        if (this._visible) {
            this._clear();
            this._clusterLayer.addLayers(this._markers);
        }
    }

    fitBounds(bounds) {
        this._fitBounds(bounds);
        this._lockBounds = true;
    }

    _fitBounds(bounds) {
        if (!this._lockBounds) {
            this._bounds = bounds;
            this._bugFix.fitBounds(bounds);
        } else {
            this._lockBounds = false;
        }
    }

    _clear() {
        this._clusterLayer.clearLayers();
    }

    _createBaseLayer(SiteSpecificConfig) {
        let baseLayer;
        if (SiteSpecificConfig.mapTileAPI === null || SiteSpecificConfig.mapTileAPI === undefined) {
            // TODO: AB Mapbox token should be in config.
            baseLayer = L.mapbox.tileLayer('affinitybridge.ia7h38nj');
        } else {
            baseLayer = L.tileLayer(SiteSpecificConfig.mapTileAPI);
        }
        return baseLayer;
    }

    _createClusterLayer(config, bugFix) {
        const clusterLayer = new L.MarkerClusterGroup(angular.extend(
            {
                zoomToBoundsOnClick: false,
                spiderfyDistanceMultiplier: 2,
                showCoverageOnHover: false,
                iconCreateFunction: this._createIcon.bind(null, config)
            },
            bugFix.clusterLayerOptions
        ));
        this._bugFix = bugFix;
        return clusterLayer;
    }

    _createPolygonLayer() {
        // TODO: don't make global but needed now for use in search controller
        return L.geoJson(null, {
            style() {
                return {opacity: 0.3};
            },
            onEachFeature(f) {
                L.DomEvent.addListener(f, 'mouseover', (e) => e.target.setStyle({
                    opacity: 0.5
                }));
                L.DomEvent.addListener(f, 'mouseout', (e) => e.target.setStyle({
                    opacity: 0.3
                }));
            }
        });
    }

    _createIcon(config, cluster) {
        var childCount = cluster.getChildCount();

        var c = ' marker-cluster-';
        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 100) {
            c += 'medium';
        } else {
            c += 'large';
        }

        return new L.DivIcon.CustomColor({
            html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40),
            clusterCount: childCount,
            clusterColors: config.clusterColors
        });
    }

    get isVisible() {
        return this._visible;
    }

    get map() {
        return this._map;
    }

    get servicesLayer() {
        return this._clusterLayer;
    }

    get polygonLayer() {
        return this._polygonLayer;
    }

}

// Fix to avoid inconsistent state bug during MarkerCluster.addLayers()
// Issue: https://github.com/Leaflet/Leaflet.markercluster/issues/743
function ClusterLayerBugFix(map, clusterLayerOptions = null, fitBoundsOptions = null) {
    let _map = map;
    let _chunkProgressCalled = false;
    let _bounds;
    let _fitBoundsOptions = fitBoundsOptions || { maxZoom: 13 };
    let _clusterLayerOptions = clusterLayerOptions || { chunkLoading: true, chunkInterval: 200, chunkDelay: 50 };
    _clusterLayerOptions.onClusterLayerChunkProgress = onClusterLayerChunkProgress;

    return {
        clusterLayerOptions: _clusterLayerOptions,
        fitBounds
    }

    // Wait until first chunkInterval duration as passed before trying to
    // call fitBounds().
    // If chunkProgress *has* been called then MarkerClusterLayer hasn't
    // finished adding markers to map and we'll instead perform the
    // fitBounds() in onClusterChunkProgress(), when it is complete.
    function fitBounds(bounds) {
        _chunkProgressCalled = false;
        _bounds = bounds;
        setTimeout(() => {
            if (!_chunkProgressCalled) {
                _fitBounds(_bounds);
            }
        }, _clusterLayerOptions.chunkInterval + 1);
    }

    // Keep track of cluster chunk progress to determine when to call
    // fitBounds().
    function onClusterLayerChunkProgress(progress, total) {
        _chunkProgressCalled = true;
        if (progress === total) {
            _fitBounds(_bounds);
        }
    }

    function _fitBounds(bounds) {
        _map.fitBounds(bounds, _fitBoundsOptions);
    }

}

module.exports = ServicesMap;