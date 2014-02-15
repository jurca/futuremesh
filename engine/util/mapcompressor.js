"use strict";
var MapCompressor;

/**
 * Map compression utility for compressing a Map instance into string in a
 * loss-less manner.
 */
MapCompressor = function () {
    /**
     * Compresses the provided map.
     *
     * @param {Map} map Map to compress.
     * @return {string} The compressed map.
     */
    this.compress = function (map) {
        var data;
        data = map.exportData();
        return JSON.stringify(data);
    };

    /**
     * Decompresses compressed map data to map data that can be imported by the
     * Map class. The specified compression level must match the one used for
     * compression, otherwise the decompression will fail.
     *
     * @param {String} mapData The compressed string representing the map data.
     * @return {Map} The decompressed map.
     */
    this.decompress = function (mapData) {
        var data, map;
        data = JSON.parse(mapData);
        map = new Map();
        map.importData(data);
        return map;
    };
};
