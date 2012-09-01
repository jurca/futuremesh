"use strict";
var ResourceGenerator;

/**
 * Utility used by the Map Generator for generating resources in players'
 * bases.
 */
ResourceGenerator = function () {
    /**
     * Generates buildings representing the secondary resource (ore) for
     * creating new buildings and units. This resource is represented as
     * building because the units must appear above it.
     * 
     * @param {Map} map The map object to manipulate.
     * @param {Object} data Form data.
     * @param {Array} areas Array of location of players' bases.
     */
    this.generateBuildingResources = function (map, data, areas) {
        var type, tiles, width, height, distX, distY, dist, i, degree, centerX,
                centerY, size, x, y, building, shift, xPos, yPos;
        for (type = 0; BuildingsDefinition.getType(type); type++) {
            if (BuildingsDefinition.getType(type).resource !== null) {
                break;
            }
        }
        if (!BuildingsDefinition.getType(type)) {
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
            // the resources should be closer to the map's center
            degree -= Math.PI;
            if (degree < 0) {
                degree += 2 * Math.PI;
            }
            // compute center of the resource area
            dist = data.baseAreaRadius * 2 / 3;
            centerX = Math.round(Math.cos(degree) * dist) + areas[i].x;
            centerY = Math.round(Math.sin(degree) * dist) + areas[i].y;
            size = data.resourcesAbundance;
            shift = Math.floor(size / 2);
            for (y = size; y--;) {
                for (x = size; x--;) {
                    distX = x - shift;
                    distY = y - shift;
                    if (Math.sqrt(distX * distX + distY * distY) > shift) {
                        continue;
                    }
                    xPos = x - shift + centerX;
                    yPos = y - shift + centerY;
                    if (!tiles[yPos] || !tiles[yPos][xPos] ||
                            !tiles[yPos][xPos].accessible) {
                        continue;
                    }
                    building = new Building(x - shift + centerX,
                            y - shift + centerY, type, i);
                    map.updateBuilding(building);
                }
            }
        }
    };
    
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
