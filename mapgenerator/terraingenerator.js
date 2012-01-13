"use strict";
var TerrainGenerator;
require('map');

/**
 * Utility used by the Map Generator to generate the terrain of the map.
 */
TerrainGenerator = function () {
    /**
     * Generates an empty map of random dimensions within the bounds specified
     * in the form data. All tiles of the map will of the type specified in the
     * form.
     * 
     * @param {Object} data The data obtained from the form.
     */
    this.generateEmptyMap = function (data) {
        var width, height, map, tiles, row, i, j;
        width = data.minWidth +
                Math.round(Math.random() * (data.maxWidth - data.minWidth));
        height = data.minHeight +
                Math.round(Math.random() * (data.maxHeight - data.minHeight));
        map = new Map();
        
        tiles = [];
        for (j = height; j--;) {
            row = [];
            for (i = width; i--;) {
                row.push(new Tile(data.baseTile));
            }
            tiles.push(row);
        }
        map.setMap(tiles);
        
        return map;
    };
};
