"use strict";
var TerrainGenerator;

/**
 * Utility used by the Map Generator to generate the terrain of the map.
 */
TerrainGenerator = function () {
    var generatePath;
    
    /**
     * Generates paths between all generated areas so that all of them will be
     * accessible.
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Array} areas Array of objects containing positions of generated
     *         areas. The coordinates point to the centers of these areas.
     */
    this.generatePassages = function (map, data, areas) {
        var i, area, closest, j, tiles, dist1, dist2;
        if (!data.generatePassages) {
            return;
        }
        tiles = map.getTiles();
        for (i = areas.length; i--;) {
            area = areas[i];
            closest = { // a far far away point
                x: tiles[0].length * 3,
                y: tiles.length * 3
            };
            dist1 = Math.sqrt(Math.pow(area.x - closest.x, 2) +
                    Math.pow(area.y - closest.y, 2));
            // find the closest area
            for (j = areas.length; j--;) {
                if (j == i) {
                    continue;
                }
                dist2 = Math.sqrt(Math.pow(area.x - areas[j].x, 2) +
                        Math.pow(area.y - areas[j].y, 2));
                if (dist2 < dist1) {
                    closest = areas[j];
                    dist1 = dist2;
                }
            }
            // generate a path between the areas
            generatePath(map, data, area, closest);
            generatePath(map, data, { x: area.x + 1, y: area.y },
                    { x: closest.x + 1, y: closest.y });
            generatePath(map, data, { x: area.x - 1, y: area.y },
                    { x: closest.x - 1, y: closest.y });
            generatePath(map, data, { x: area.x, y: area.y + 1 },
                    { x: closest.x, y: closest.y + 1 });
            generatePath(map, data, { x: area.x, y: area.y - 1 },
                    { x: closest.x, y: closest.y - 1 });
        }
    };
    
    /**
     * Generates diamond-shaped passage areas.
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Array} areas Array of objects containing positions of generated
     *         areas. The coordinates point to the centers of these areas.
     */
    this.generateDiamondPassageAreas = function (map, data, areas) {
        var i, sizeX, sizeY, offsetX, offsetY, tiles, minDistance, tileType, x,
                y, rowWidth, rowOffset;
        tiles = map.getTiles();
        minDistance = data.minDistanceFromBorders;
        tileType = data.baseAccessibleTile;
        for (i = data.rectangularAreasCount; i--;) {
            sizeX = data.passageAreaMinSize + Math.floor(Math.random() *
                    (data.passageAreaMaxSize - data.passageAreaMinSize));
            sizeY = data.passageAreaMinSize + Math.floor(Math.random() *
                    (data.passageAreaMaxSize - data.passageAreaMinSize));
            minDistance += Math.max(sizeX, sizeY); // do not exceed the borders
            offsetX = Math.floor(Math.random() *
                    (tiles[0].length - minDistance * 2)) + minDistance;
            offsetY = Math.floor(Math.random() *
                    (tiles.length - minDistance * 2)) + minDistance;
            areas.push({
                x: offsetX + sizeX,
                y: offsetY + Math.floor(sizeY / 2)
            });
            for (y = sizeY; y--;) {
                rowWidth = Math.abs(y - Math.floor(sizeY / 2));
                rowWidth = Math.floor(sizeY / 2) - rowWidth;
                rowWidth = Math.floor(rowWidth / sizeY * sizeX); // scale
                rowOffset = sizeX - Math.floor(rowWidth / 2);
                for (x = rowWidth; x--;) {
                    tiles[offsetY + y][offsetX + rowOffset + x] =
                            new Tile(tileType);
                }
            }
            minDistance -= Math.max(sizeX, sizeY); // reset
        }
    };
    
    /**
     * Generates rectangular passage areas.
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Array} areas Array of objects containing positions of generated
     *         areas. The coordinates point to the centers of these areas.
     */
    this.generateRectangularPassageAreas = function (map, data, areas) {
        var i, sizeX, sizeY, offsetX, offsetY, tiles, minDistance, tileType, x,
                y;
        tiles = map.getTiles();
        minDistance = data.minDistanceFromBorders;
        tileType = data.baseAccessibleTile;
        for (i = data.rectangularAreasCount; i--;) {
            sizeX = data.passageAreaMinSize + Math.floor(Math.random() *
                    (data.passageAreaMaxSize - data.passageAreaMinSize));
            sizeY = data.passageAreaMinSize + Math.floor(Math.random() *
                    (data.passageAreaMaxSize - data.passageAreaMinSize));
            minDistance += Math.max(sizeX, sizeY); // do not exceed the borders
            offsetX = Math.floor(Math.random() *
                    (tiles[0].length - minDistance * 2)) + minDistance;
            offsetY = Math.floor(Math.random() *
                    (tiles.length - minDistance * 2)) + minDistance;
            areas.push({
                x: offsetX + Math.floor(sizeX / 2),
                y: offsetY + Math.floor(sizeY / 2)
            });
            for (y = sizeY; y--;) {
                for (x = sizeX; x--;) {
                    tiles[offsetY + y][offsetX + x] = new Tile(tileType);
                }
            }
            minDistance -= Math.max(sizeX, sizeY); // reset
        }
    };
    
    /**
     * Generates circular passage areas.
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Array} areas Array of objects containing positions of generated
     *         areas. The coordinates point to the centers of these areas.
     */
    this.generateCircularPassageAreas = function (map, data, areas) {
        var i, size, offsetX, offsetY, tiles, minDistance, tileType, x, y,
                distX, distY, distance;
        tiles = map.getTiles();
        minDistance = data.minDistanceFromBorders;
        tileType = data.baseAccessibleTile;
        for (i = data.circularAreasCount; i--;) {
            size = data.passageAreaMinSize + Math.floor(Math.random() *
                    (data.passageAreaMaxSize - data.passageAreaMinSize));
            minDistance += Math.floor(size / 2); // do not exceed the borders
            offsetX = Math.floor(Math.random() *
                    (tiles[0].length - minDistance * 2)) + minDistance;
            offsetY = Math.floor(Math.random() *
                    (tiles.length - minDistance * 2)) + minDistance;
            areas.push({
                x: offsetX + Math.floor(size / 2),
                y: offsetY + Math.floor(size / 2)
            });
            for (y = size; y--;) {
                for (x = size; x--;) {
                    distX = Math.floor(size / 2) - x;
                    distY = Math.floor(size / 2) - y;
                    distance = Math.sqrt(distX * distX + distY * distY);
                    if (distance <= Math.floor(size / 2)) {
                        tiles[offsetY + y][offsetX + x] = new Tile(tileType);
                    }
                }
            }
            minDistance -= Math.floor(size / 2); // reset
        }
    };
    
    /**
     * Generates a circular area in the center of the map (if enabled by the
     * user).
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Array} areas Array of objects containing positions of generated
     *         areas. The coordinates point to the centers of these areas.
     */
    this.generateCentralArea = function (map, data, areas) {
        var tiles, offsetX, offsetY, radius, diameter, x, y, distX, distY,
                distance, tileType;
        if (!data.createCentralArea) {
            return;
        }
        radius = data.centralAreaSize;
        diameter = radius * 2;
        tiles = map.getTiles();
        offsetX = Math.floor(tiles[0].length / 2) - radius;
        offsetY = Math.floor(tiles.length / 2) - radius;
        tileType = data.baseAccessibleTile;
        areas.push({
            x: offsetX + radius,
            y: offsetY + radius
        });
        for (y = diameter; y--;) {
            for (x = diameter; x--;) {
                distX = radius - x;
                distY = radius - y;
                distance = Math.sqrt(distX * distX + distY * distY);
                if (distance <= radius) {
                    tiles[offsetY + y][offsetX + x] = new Tile(tileType);
                }
            }
        }
    };
    
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
    
    /**
     * Generates a path in the provided map between the specified coordinates.
     * 
     * @param {Map} map The map to manipulate.
     * @param {Object} data The data obtained from the form.
     * @param {Object} from The object containing coordinates of the path's
     *        starting point.
     * @param {Object} to The object containing coordinates of the path's
     *        ending point.
     */
    generatePath = function (map, data, from, to) {
        var tiles, vector, distance, currentDistance, currentPoint, tileType;
        tiles = map.getTiles();
        tileType = data.baseAccessibleTile;
        vector = {
            x: to.x - from.x,
            y: to.y - from.y
        };
        distance = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        vector.x /= distance;
        vector.y /= distance;
        currentPoint = {
            x: from.x,
            y: from.y
        };
        currentDistance = 0;
        while (currentDistance < distance) {
            currentPoint.x += vector.x;
            currentPoint.y += vector.y;
            tiles[Math.floor(currentPoint.y)][Math.floor(currentPoint.x)] =
                    new Tile(tileType);
            currentDistance = Math.sqrt(Math.pow(from.x - currentPoint.x, 2) +
                    Math.pow(from.y - currentPoint.y, 2));
        }
    };
};
