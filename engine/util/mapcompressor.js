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
     * @param {number} level The compression level. The acceptable values are:
     *        <ul>
     *            <li><code>0</code> - no compression. Useful for
     *                debugging.</li>
     *            <li><code>1</code> - simple compression.</li>
     *        </ul>
     * @return {string} The compressed map.
     */
    this.compress = function (map, level) {
        switch (level) {
            case 0:
                return JSON.stringify(map.exportData());
                break;
            case 1:
                return JSON.stringify(map.toPackedJson());
                break;
            default:
                throw new Error("Unsupported compression level: " + level);
        }
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
        if (data instanceof Array) {
            return Map.fromPackedJson(data);
        }
        map = new Map();
        map.importData(data);
        return map;
    };
};
