var _ = require('underscore');

function findSectorById (tree, id) {
    // Check for top level elements.
    var found = _.find(tree, function(v) {
        if (v.id === id) { return v; }
    });

    if (found) { return found; }
    // If no top level elements match start going through children.
    else {
        _.some(tree, function(v) {
            found = findSectorById(v.children, id);
            if (found) { return true; }
        });
    }

    return found || null;
}

function transformSectors(rawSectors) {
    var set = [];
    _.each(rawSectors, function(rawSector) {
        var sector = new Sector(rawSector);

        if (sector.depth > 1) {
            var parent = findSectorById(set, sector.parentId);
            if (parent) {
                sector.addParent(parent);
            }
        } else {
            set.push(sector);
        }
    });

    return set;
}

function Sector(source) {
    this.id       = source.id;
    this.parentId = source.parentId;
    this.depth    = source.depth;
    this.name     = source.name;
    this.count    = source.count = 0;
    this.weight   = source.weight;
    this.glyph    = source.glyph || null;
    this.markerColor = source.markerColor || null;
    this.children = [];
}

Sector.prototype.addParent = function(parent) {
    parent.children.push(this);

    if (!this.glyph) {
        this.glyph = parent.glyph;
    }

    if (!this.markerColor) {
        this.markerColor = parent.markerColor;
    }
};

module.exports = {
    transformSectors: transformSectors,
    findSectorById: findSectorById,
    Sector: Sector
}
