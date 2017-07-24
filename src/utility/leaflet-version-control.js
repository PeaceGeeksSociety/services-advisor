var VersionControl = L.Control.extend({
    version: '',
    options: {
        position: 'bottomright'
    },

    initialize: function(version, options) {
        this.version = version;
        L.Util.setOptions(this, options);
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'servicesadvisor-version');
        container.innerHTML = this.version;
        return container;
    }
});

module.exports = VersionControl;