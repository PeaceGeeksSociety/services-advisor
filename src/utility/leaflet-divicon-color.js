L.DivIcon.CustomColor = L.DivIcon.extend({
    initialize: function(options) {
        L.Util.setOptions(this, options);
    },

    createIcon: function(oldIcon) {
        var count = this.options.clusterCount || 0;
        var backgroundColor;
        var innerBackgroundColor;

        if (count < 10) {
            backgroundColor = this.options.clusterColors.small;
            innerBackgroundColor = this.options.clusterColors.smallInner;
        } else if (count < 100) {
            backgroundColor = this.options.clusterColors.medium;
            innerBackgroundColor = this.options.clusterColors.mediumInner;
        } else {
            backgroundColor = this.options.clusterColors.large;
            innerBackgroundColor = this.options.clusterColors.largeInner;
        }

        var icon = L.DivIcon.prototype.createIcon.call(this, oldIcon);
        var inner = icon.getElementsByTagName('div')[0];
        icon.style.color = this.options.clusterColors.text;
        icon.style.backgroundColor = backgroundColor;
        inner.style.backgroundColor = innerBackgroundColor;

        return icon;
    }
});