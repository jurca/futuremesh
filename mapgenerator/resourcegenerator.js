"use strict";
var ResourceGenerator;
require('map');

/**
 * Utility used by the Map Generator for generating resources in players'
 * bases.
 */
ResourceGenerator = function () {
    /**
     * Generates tiles representing the basic (energy) resource in each base.
     * 
     * @param {Map} map The map object to manipulate.
     * @param {Object} data Form data.
     * @param {Array} areas Array of location of players' bases.
     */
    this.generateTileResources = function (map, data, areas) {
        var type, tiles, width, height, distX, distY, dist, i, degree, j,
                radius, currentDegree, x, y, k;
        for (type = 0; TilesDefinition.getType(type); type++) {
            if (TilesDefinition.getType(type).resource !== null) {
                break;
            }
        }
        if (!TilesDefinition.getType(type)) {
            return;
        }
        tiles = map.getTiles();
        width = tiles[0].length;
        height = tiles.length;
        
        for (i = areas.length; i--;) {
            // compute the degree of the player's base towards the map's center
            distX = areas[i].x - Math.floor(width / 2);
            distY = areas[i].y - Math.floor(height / 2);
            dist = Math.sqrt(distX * distX + distY * distY);
            degree = -Math.acos(distX / dist); // WTF?!
            if (distY > 0) { // 3. and 4. quadrant
                degree = 2 * Math.PI - degree;
            }
            // the resource tiles will be at the same degree as the base, e.g.
            // on the far side from the center, the size will "abundace"
            // degrees
            degree -= (Math.PI / 180) *
                    Math.floor(data.resourcesAbundance / 2);
            if (degree < 0) {
                degree += 2 * Math.PI;
            }
            radius = data.baseAreaRadius - 2;
            for (j = data.resourcesAbundance; j--;) {
                currentDegree = degree + (Math.PI / 180) * j;
                for (k = Math.round(data.resourcesAbundance / 10); k--;) {
                    x = Math.round(Math.cos(currentDegree) * (radius - k)) +
                        areas[i].x;
                    y = Math.round(Math.sin(currentDegree) * (radius - k)) +
                        areas[i].y;
                    tiles[y][x] = new Tile(type);
                }
            }
        }
    };
};
