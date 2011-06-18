"use strict";
var Tile;
require('../data/tilesdefinition');

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
     * Sets the with of the light beam emitting from this tile. Can be set to 0
     * to disable the light beam effect.
     *
     * @type Number
     */
    this.lightSfx = 0;
};