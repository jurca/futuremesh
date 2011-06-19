"use strict";
var Map;
require('tile');

/**
 * Map container and utility. Contains raw map data and utility methods for
 * manipulating the map and extracting useful information.
 */
Map = function () {
    var map;

    map = [];

    /**
     * Sets raw map data.
     *
     * @param {Array} newMap The two-dimensional array of map tiles
     *        representing the map.
     */
    this.setMap = function (newMap) {
        map = newMap;
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
                row.push(new Tile(0))
            }
            map.push(row);
        }
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
        var i, j, data, mapRow, dataRow;
        data = [];
        for (i = map.length; i--;) {
            mapRow = map[i];
            dataRow = [];
            for (j = mapRow.length; j--;) {
                dataRow.unshift(mapRow[j].exportData());
            }
            data.unshift(dataRow);
        }
        return {
            tiles: data
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
    };
};
