"use strict";
var Tile;
require('data.tilesdefinition');

/**
 * The Tile class representing a tile in the map. This class only holds details
 * of the tile and image data used for rendering.
 *
 * @param {Number} type ID of the tile's type
 */
Tile = function (type) {
    var definition;
    
    definition = TilesDefinition.getType(type);
    
    /**
     * ID number of the tile's inner type.
     *
     * @type Number
     */
    this.type = type;
    
    /**
     * Path to the image representing the tile in the game.
     *
     * @type String
     */
    this.image = definition.image;
    
    /**
     * True if the tile is accessible by land units and buildings can be placed
     * on it, otherwise false.
     *
     * @type Boolean
     */
    this.accessible = definition.accessible;
    
    /**
     * The representation of the tile in the minimap specified as a
     * CSS-compatible color definition.
     *
     * @type String
     */
    this.minimap = definition.minimap;

    /**
     * The ID of the resource this tile is used to generate. The tile can
     * generate this resource endlessly and the resource can be collected using
     * an appropriate collector building placed next to/atop of the tile. This
     * field is null if the tile does not generate any resource.
     * 
     * @type Number
     */
    this.resource = definition.resource;

    /**
     * Sets the with of the light beam emitting from this tile. Can be set to 0
     * to disable the light beam effect.
     *
     * @type Number
     */
    this.lightSfx = 0;

    /**
     * Exports the information about the tile in form of a JSON-serializable
     * object so that the tile can be recostructed from this data later.
     *
     * @return {Object} object representing the information about the tile
     *         required to restore it to it's current state. This object is
     *         JSON-serializable.
     */
    this.exportData = function () {
        return {
            type: this.type,
            lightSfx: this.lightSfx
        };
    };
};

/**
 * Creates new tile from provided data. The data should be a result of the
 * exportData method.
 *
 * @param {Object} data The data from the exportData method.
 */
Tile.importData = function (data) {
    var tile;
    tile = new Tile(data.type);
    tile.lightSfx = data.lightSfx;
    return tile;
};
