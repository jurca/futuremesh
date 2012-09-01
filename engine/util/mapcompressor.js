"use strict";
var MapCompressor;

/**
 * Map compression utility for compressing an object obtained as a result of
 * the Map.exportData method into string while preserving all the exported
 * data. The utility supports various levels of compression:
 * <ul>
 *     <li>0 - no compression</li>
 *     <li>1 - object property names are shortened, tiles are reorganized into
 *             single array</li>
 *     <li>2 - tile, building and unit data objects are replaced by arrays</li>
 *     <li>3 - all arrays and whole map is serialized into a single string</li>
 * </ul>
 */
MapCompressor = function () {
    var compressLevel1, compressLevel2, compressLevel1Buildings,
            compressLevel3, decompressLevel1, decompressLevel2,
            decompressLevel3, spliceTiles, decompressLevel1Tiles;
    
    /**
     * Compresses exported map data according to the given compression level.
     * 
     * @param {Object} map Exported map data.
     * @param {Number} level The compression level.
     */
    this.compress = function (map, level) {
        (level > 0) && (map = compressLevel1(map));
        (level > 1) && (map = compressLevel2(map));
        (level > 2) && (map = compressLevel3(map));
        return map;
    };
    
    /**
     * Decompresses compressed map data to map data that can be imported by the
     * Map class. The specified compression level must match the one used for
     * compression, otherwise the decompression will fail.
     * 
     * @param {String} map The compressed string representing the map data.
     * @param {Number} level The compression level used for data compression.
     */
    this.decompress = function (map, level) {
        (level > 2) && (map = decompressLevel3(map));
        (level > 1) && (map = decompressLevel2(map));
        (level > 0) && (map = decompressLevel1(map));
        return map;
    };
    
    decompressLevel1 = function (map) {
        var tiles, i, buildings, units;
        tiles = decompressLevel1Tiles(map);
        buildings = map.buildings;
        buildings.reverse();
        for (i = buildings.length; i--;) {
            buildings[i] = {
                x: buildings[i].x,
                y: buildings[i].y,
                type: buildings[i].t,
                player: buildings[i].p
            };
        }
        units = map.units;
        units.reverse();
        for (i = units.length; i--;) {
            units[i] = {
                x: units[i].x,
                y: units[i].y,
                direction: units[i].d,
                type: units[i].t,
                player: units[i].p
            };
        }
        return {
            tiles: tiles,
            buildings: buildings,
            units: units
        };
    };
    
    decompressLevel1Tiles = function (map) {
        var tiles, row, i, j;
        tiles = spliceTiles(map.tiles, map.width);
        for (i = tiles.length; i--;) {
            row = tiles[i];
            row.reverse();
            for (j = row.length; j--;) {
                row[j] = {
                    type: row[j].t,
                    lightSfx: row[j].l
                };
            }
        }
        return tiles;
    };
    
    spliceTiles = function (tiles, cols) {
        var rows;
        rows = [];
        while (tiles.length) {
            rows.push(tiles.splice(0, cols));
        }
        rows.reverse();
        return rows;
    };
    
    decompressLevel2 = function (map) {
        var i, tiles, mapTiles, buildings, mapBuildings, units, mapUnits;
        tiles = map.tiles;
        mapTiles = [];
        for (i = tiles.length; i--;) {
            mapTiles.push({
                t: parseInt(tiles[i][0], 10),
                l: parseInt(tiles[i][1], 10)
            });
        }
        buildings = map.buildings;
        mapBuildings = [];
        for (i = buildings.length; i--;) {
            mapBuildings.push({
                x: parseInt(buildings[i][0], 10),
                y: parseInt(buildings[i][1], 10),
                t: parseInt(buildings[i][2], 10),
                p: parseInt(buildings[i][3], 10)
            });
        }
        units = map.units;
        mapUnits = [];
        for (i = units.length; i--;) {
            mapUnits.push({
                x: parseInt(units[i][0], 10),
                y: parseInt(units[i][1], 10),
                d: parseInt(units[i][2], 10),
                t: parseInt(units[i][3], 10),
                p: parseInt(units[i][4], 10)
            });
        }
        return {
            width: map.width,
            height: map.height,
            tiles: mapTiles,
            buildings: mapBuildings,
            units: mapUnits
        };
    };
    
    decompressLevel3 = function (map) {
        var tiles, buildings, units, i;
        map = map.split('|');
        tiles = map[2].split('-');
        buildings = map[3] ? map[3].split('-') : [];
        units = map[4] ? map[4].split('-') : [];
        for (i = tiles.length; i--;) {
            tiles[i] = tiles[i].split(',');
        }
        for (i = buildings.length; i--;) {
            buildings[i] = buildings[i].split(',');
        }
        for (i = units.length; i--;) {
            units[i] = units[i].split(',');
        }
        return {
            width: parseInt(map[0], 10),
            height: parseInt(map[1], 10),
            tiles: tiles,
            buildings: buildings,
            units: units
        };
    };
    
    compressLevel3 = function (map) {
        var tiles, buildings, units, i;
        tiles = map.tiles;
        for (i = tiles.length; i--;) {
            tiles[i] = tiles[i].join(',');
        }
        buildings = map.buildings;
        for (i = buildings.length; i--;) {
            buildings[i] = buildings[i].join(',');
        }
        units = map.units;
        for (i = units.length; i--;) {
            units[i] = units[i].join(',');
        }
        return [
            map.width,
            map.height,
            tiles.join('-'),
            buildings.join('-'),
            units.join('-')
        ].join('|');
    };
    
    compressLevel2 = function (map) {
        var tiles, mapTiles, buildings, mapBuildings, units, mapUnits, i;
        tiles = [];
        mapTiles = map.tiles;
        for (i = mapTiles.length; i--;) {
            tiles.push([mapTiles[i].t, mapTiles[i].l]);
        }
        buildings = [];
        mapBuildings = map.buildings;
        for (i = mapBuildings.length; i--;) {
            buildings.push([mapBuildings[i].x, mapBuildings[i].y,
                    mapBuildings[i].t, mapBuildings[i].p]);
        }
        units = [];
        mapUnits = map.units;
        for (i = mapUnits.length; i--;) {
            units.push([mapUnits[i].x, mapUnits[i].y, mapUnits[i].d,
                    mapUnits[i].t, mapUnits[i].p]);
        }
        return {
            width: map.width,
            height: map.height,
            tiles: tiles,
            buildings: buildings,
            units: units
        };
    };
    
    compressLevel1 = function (map) {
        var rowCount, colCount, mapTiles, mapTilesRow, tiles, i, j, buildings,
                units, mapUnits;
        mapTiles = map.tiles;
        rowCount = mapTiles.length;
        colCount = mapTiles[0].length;
        tiles = [];
        for (j = rowCount; j--;) {
            mapTilesRow = mapTiles[j];
            for (i = colCount; i--;) {
                tiles.push({
                    t: mapTilesRow[i].type,
                    l: mapTilesRow[i].lightSfx
                });
            }
        }
        buildings = compressLevel1Buildings(map.buildings);
        mapUnits = map.units;
        units = [];
        for (i = mapUnits.length; i--;) {
            units.push({
                x: mapUnits[i].x,
                y: mapUnits[i].y,
                d: mapUnits[i].direction,
                t: mapUnits[i].type,
                p: mapUnits[i].player
            });
        }
        return {
            width: colCount,
            height: rowCount,
            tiles: tiles,
            buildings: buildings,
            units: units
        };
    };
    
    compressLevel1Buildings = function (mapBuildings) {
        var buildings, i;
        buildings = [];
        for (i = mapBuildings.length; i--;) {
            buildings.push({
                x: mapBuildings[i].x,
                y: mapBuildings[i].y,
                t: mapBuildings[i].type,
                p: mapBuildings[i].player
            });
        }
        return buildings;
    };
};
