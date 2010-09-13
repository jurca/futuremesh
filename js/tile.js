var Tile;

Tile = function (type) {
    var definition;
    definition = TilesDefinition.getType(type);
    this.type = type;
    this.image = definition.image;
    this.accessible = definition.accessible;
    this.minimap = definition.minimap;
};