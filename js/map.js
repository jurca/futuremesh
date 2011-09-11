"use strict";
var Map;
require('tile');

/**
 * Map container and utility. Contains raw map data and utility methods for
 * manipulating the map and extracting useful information.
 */
Map = function () {
    var map, buildings, buildingsList, createBuildingsIndex, units, unitsList,
            getBuildingPositions, createUnitsIndex;

    map = [];
    /**
     * Two-dimensional array matching the tiles of the map. Each item is a null
     * or a reference to the building occupying the tile. If a building is
     * uccupying several tiles at once, all occupied tiles hold reference to
     * the building.
     * The structure of the index is: [verical axis (y)][horizontal axis (x)]
     */
    buildings = [];
    /**
     * List of all buildings instances present on the map.
     */
    buildingsList = [];
    /**
     * Tow-dimensional array matching the tiles of the map. Each item is a null
     * or a reference to the unit occupying the tile. The structure of the index
     * is: [vertical axis(y)][horizontal axis (x)]
     */
    units = [];
    /**
     * List of all units instances present on the map.
     */
    unitsList = [];

    /**
     * Updates the building's status on the map (e.g. adding to the map).
     * 
     * @param {Building} building The building that has been updated on the map.
     */
    this.updateBuilding = function (building) {
        var positions, position, i;
        buildingsList.push(building);
        positions = getBuildingPositions(building);
        for (i = positions.length; i--;) {
            position = positions[i];
            buildings[position.y][position.x] = building;
        }
    };
    
    /**
     * Updates the unit's status on the map (e.g. adding to the map).
     * 
     * @param {Unit} unit The unit that has been updated on the map.
     */
    this.updateUnit = function (unit) {
        unitsList.push(unit);
        units[unit.y][unit.x] = unit;
    };

    /**
     * Sets raw map data.
     *
     * @param {Array} newMap The two-dimensional array of map tiles
     *        representing the map.
     */
    this.setMap = function (newMap) {
        map = newMap;
        createBuildingsIndex();
    };

    /**
     * Returns the raw map data in a form of a two-dimensional array of map
     * tiles.
     *
     * @return {Array} Raw map data.
     */
    this.getMap = function () {
        return map;
    }

    /**
     * Returns list of all buildings the map contains.
     * 
     * @return {Array} List of all buildings on the map.
     */
    this.getBuildings = function () {
        return buildingsList;
    };
    
    /**
     * Returns list of all units the map contains.
     * 
     * @return {Array} List of all units on the map.
     */
    this.getUnits = function () {
        return unitsList;
    };

    /**
     * Returns the chosen part of the raw map data. Originaly meant for the
     * DOM-based renderer of the main view. Currently has no known usage.
     *
     * @param {Number} x The X offset of the part to return
     * @param {Number} y The Y offset of the part to return
     * @param {Number} width The width of the part of the map data to return
     * @param {Number} height The height of the part of the map data to return
     * @return {Array} The two-dimensional array of map tiles extracted from
     *         the map.
     */
    this.getView = function (x, y, width, height) {
        var view, i;
        view = map.slice(y, y + height);
        width += x;
        for (i = height; i--;) {
            view[i] = view[i].slice(x, width);
        }
        return view;
    };

    /**
     * Generates a completely empty map consisting of only type 0 tiles.
     * 
     * @param {Number} width The width of the required map
     * @param {Number} height The height of the required map
     */
    this.emptyMap = function (width, height) {
        var i, j, row;
        map = [];
        for (i = height; i--;) {
            row = [];
            for (j = width; j--;) {
                row.push(new Tile(0));
            }
            map.push(row);
        }
        createBuildingsIndex();
        createUnitsIndex();
    };

    /**
     * Generates a completely random map - completely random without any mean
     * or semantic or usefulness. Useful for simple testing.
     *
     * @param {Number} width The width of the required random map
     * @param {Number} height The height of the required random map
     */
    this.randomMap = function (width, height) {
        var i, j, row, tile;
        map = [];
        for (i = height; i--;) {
            row = [];
            for (j = width; j--;) {
                tile = new Tile(Math.floor(Math.random() * 3));
                tile.lightSfx = !Math.floor(Math.random() * 20) ?
                        Math.floor(Math.random() * 5) : 0;
                row.push(tile);
            }
            map.push(row);
        }
        createBuildingsIndex();
        createUnitsIndex();
    };

    /**
     * Exports the information about the map in a form of a JSON-serializable
     * object so that the map could be reconstructed from this data later.
     *
     * @return {Object} object representing the information about the map
     *         required to restore it to it's current state. This object is
     *         JSON-serializable.
     */
    this.exportData = function () {
        var i, j, data, mapRow, dataRow, buildingData, unitsData;
        data = [];
        for (i = map.length; i--;) {
            mapRow = map[i];
            dataRow = [];
            for (j = mapRow.length; j--;) {
                dataRow.unshift(mapRow[j].exportData());
            }
            data.unshift(dataRow);
        }
        buildingData = [];
        for (i = buildingsList.length; i--;) {
            buildingData.push(buildingsList[i].exportData());
        }
        unitsData = [];
        for (i = unitsList.length; i--;) {
            unitsData.push(unitsList[i].exportData());
        }
        return {
            tiles: data,
            buildings: buildingData,
            units: unitsData
        };
    };

    /**
     * Creates map from provided data. The data should be a result of the
     * exportData method.
     *
     * @param {Object} data The data from the exportData method.
     */
    this.importData = function (data) {
        var i, j, mapRow, dataRow;
        map = [];
        for (i = data.tiles.length; i--;) {
            mapRow = [];
            dataRow = data.tiles[i];
            for (j = dataRow.length; j--;) {
                mapRow.unshift(Tile.importData(dataRow[j]));
            }
            map.unshift(mapRow);
        }
        buildingsList = [];
        createBuildingsIndex();
        for (i = data.buildings.length; i--;) {
            this.updateBuilding(Building.importData(data.buildings[i]));
        }
        unitsList = [];
        createUnitsIndex();
        for (i = data.units.length; i--;) {
            this.updateUnit(Unit.importData(data.units[i]));
        }
    };
    
    getBuildingPositions = function (building) {
        var positions, startX, startY, i, j, x, y;
        positions = [];
        startX = building.x + Math.floor((building.height - 1) / 2);
        startY = building.y;
        for (j = 0; j < building.height; j++) {
            x = startX - Math.ceil(j / 2);
            y = startY + j;
            for (i = 0; i < building.width; i++) {
                positions.push({
                    x: x,
                    y: y
                });
                if (y % 2) {
                    x++;
                    y++;
                } else {
                    y++;
                }
            }
        }
        return positions;
    };
    
    createBuildingsIndex = function () {
        var i, j, row;
        buildings = [];
        for (i = map.length; i--;) {
            row = [];
            for (j = map[0].length; j--;) {
                row.push(null);
            }
            buildings.push(row);
        }
    };
    
    createUnitsIndex = function () {
        var i, j, row;
        units = [];
        for (i = map.length; i--;) {
            row = [];
            for (j = map[0].length; j--;) {
                row.push(null);
            }
            units.push(row);
        }
    };
};
