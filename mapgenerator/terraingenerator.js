"use strict";
var TerrainGenerator;
require('map');

/**
 * Utility used by the Map Generator to generate the terrain of the map.
 */
TerrainGenerator = function () {
    /**
     * Generates the player areas in the map in the specified locations.
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Array} positions The array of objects specifying the positions
     * of the player bases.
     */
    this.generatePlayerAreas = function (map, data, positions) {
        var radius, diameter, i, x, y, offsetX, offsetY, mapData, tileType,
                distanceX, distanceY, distance;
        radius = data.baseAreaRadius;
        diameter = radius * 2;
        mapData = map.getMap();
        tileType = data.baseAccessibleTile;
        for (i = positions.length; i--;) {
            offsetX = positions[i].x - radius;
            offsetY = positions[i].y - radius;
            for (y = diameter; y--;) {
                for (x = diameter; x--;) {
                    distanceX = radius - x;
                    distanceY = radius - y;
                    distance = Math.sqrt(distanceX * distanceX +
                            distanceY * distanceY);
                    if (distance <= radius) {
                        mapData[y + offsetY][x + offsetX] = new Tile(tileType);
                    }
                }
            }
        }
    };
    
    /**
     * Generates the positions where the players' bases should be located on
     * the map.
     * 
     * @param {Map} map The generated empty map.
     * @param {Object} data obtained from the form.
     * @param {Number} count Number of players on the map.
     * @return {Array} Array of bases' positions specified as objects with
     * properties x and y.
     */
    this.generatePlayerSpots = function (map, data, count) {
        var positions, borders, baseArea, mapWidth, mapHeight;
        borders = data.minDistanceFromBorders;
        baseArea = data.baseAreaRadius;
        mapWidth = map.getMap()[0].length;
        mapHeight = map.getMap().length;
        switch (count) {
            case 2:
                positions = [
                    { // top left corner
                        x: borders + baseArea,
                        y: borders + baseArea
                    },
                    { // bottom right corner
                        x: mapWidth - borders - baseArea,
                        y: mapHeight - borders - baseArea
                    }
                ];
                break;
            case 3:
                positions = [
                    { // top middle
                        x: Math.round(mapWidth / 2),
                        y: borders + baseArea
                    },
                    { // bottom left corner
                        x: borders + baseArea,
                        y: mapHeight - borders - baseArea
                    },
                    { // bottom right corner
                        x: mapWidth - borders - baseArea,
                        y: mapHeight - borders - baseArea
                    }
                ];
                break;
            case 4:
                // top left and bottom right corners
                positions = this.generatePlayerSpots(map, data, 2);
                positions.push({ // top right corner
                    x: mapWidth - borders - baseArea,
                    y: borders + baseArea
                },
                { // bottom left corner
                    x: borders + baseArea,
                    y: mapHeight - borders - baseArea
                });
                break;
            case 5:
                // all corners
                positions = this.generatePlayerSpots(map, data, 4);
                positions.push({ // center of the map
                    x: Math.round(mapWidth / 2),
                    y: Math.round(mapHeight / 2)
                });
                break;
            case 6:
                // all corners
                positions = this.generatePlayerSpots(map, data, 4);
                positions.push({ // middle left
                    x: borders + baseArea,
                    y: Math.round(mapHeight / 2)
                },
                {
                    x: mapWidth - borders - baseArea,
                    y: Math.round(mapHeight / 2)
                });
                break;
            case 7:
                // corners and sides
                positions = this.generatePlayerSpots(map, data, 6);
                positions.push({ // top middle
                    x: Math.round(mapWidth / 2),
                    y: borders + baseArea
                });
                break;
            case 8:
                // corners, sides and top middle
                positions = this.generatePlayerSpots(map, data, 7);
                positions.push({
                    x: Math.round(mapWidth / 2),
                    y: mapHeight - borders - baseArea
                });
                break;
        }
        return positions;
    };
    
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
