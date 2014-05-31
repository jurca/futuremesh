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
     *            <li><code>2</code> - like compression 1 but serialized into a
     *                single linear array of 16-bit unsigned integers.</li>
     *        </ul>
     *        Please note that while higher compression levels provide better
     *        results, each level is more CPU-demanding than the previous one.
     *        This may become an issue when compressing/decompressing large
     *        maps.
     * @return {string} The compressed map.
     */
    this.compress = function (map, level) {
        var serialized, compressed, i, positionValue, high, low;
        switch (level) {
            case 0:
                return JSON.stringify(map.exportData());
                break;
            case 1:
                return JSON.stringify(map.toPackedJson());
                break;
            case 2:
                serialized = serializeMapData(map.toPackedJson());
                return "2" + JSON.stringify(serialized);
                break;
            case 3:
                serialized = serializeMapData(map.toPackedJson());
                compressed = "3";
                for (i = 0; i < serialized.length; i++) {
                    positionValue = serialized[i];
                    high = Math.floor(positionValue / 256);
                    low = positionValue % 256;
                    compressed += String.fromCharCode(high, low);
                }
                return compressed;
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
        var data, map, decodedMap, i, positionValue, nextInsertPosition;
        if (mapData.charAt(0) === "3") {
            decodedMap = new Array(Math.floor((mapData.length - 1) / 2));
            nextInsertPosition = 0;
            for (i = 1; i < mapData.length; i += 2) {
                positionValue = mapData.charCodeAt(i) * 256 +
                        mapData.charCodeAt(i + 1);
                decodedMap[nextInsertPosition++] = positionValue;
            }
            data = deserializeMapData(decodedMap);
        } else if (mapData.charAt(0) === "2") {
            data = deserializeMapData(JSON.parse(mapData.substring(1)));
        } else {
            data = JSON.parse(mapData);
        }
        if (data instanceof Array) {
            return Map.fromPackedJson(data);
        }
        map = new Map();
        map.importData(data);
        return map;
    };

    /**
     * Deserializes an array of arrays and 16-bit unsigned integers
     * representing map data from the provided serialized string form.
     * 
     * @param {Array} mapData Serialized map data.
     * @return {Array} Deserialized packed map data.
     */
    function deserializeMapData(mapData) {
        var deserialized, offset, width, height, i, index, size;
        deserialized = new Array(8);
        // version
        deserialized[0] = mapData[0];
        if (deserialized[0] < 90) {
            throw new Error("Cannot import map of version older than 0.9");
        }
        if (deserialized[0] > 90) {
            throw new Error("Cannot import map of version greater than 0.9");
        }
        // name
        deserialized[1] = mapData.slice(2, 2 + mapData[1]);
        offset = 2 + deserialized[1].length;
        // width
        width = mapData[offset++];
        deserialized[2] = width;
        // height
        height = mapData[offset++];
        deserialized[3] = height;
        // tiles
        deserialized[4] = new Array(width * height);
        for (i = 0; i < deserialized[4].length; i++) {
            index = offset + i * 2;
            deserialized[4][i] = mapData.slice(index, index + 2);
        }
        offset += width * height * 2;
        // buildings
        deserialized[5] = new Array(mapData[offset++]);
        for (i = 0; i < deserialized[5].length; i++) {
            index = offset + i * 6;
            deserialized[5][i] = mapData.slice(index, index + 6);
        }
        offset += deserialized[5].length * 6;
        // units
        deserialized[6] = new Array(mapData[offset++]);
        for (i = 0; i < deserialized[6].length; i++) {
            size = mapData[offset++];
            deserialized[6][i] = mapData.slice(offset, offset + size);
            offset += size;
        }
        // projectiles
        deserialized[7] = new Array(mapData[offset++]);
        for (i = 0; i < deserialized[7].length; i++) {
            index = offset + i * 15;
            deserialized[7][i] = mapData.slice(index, index + 15);
        }
        offset += deserialized[7].length * 15;
        if (offset !== mapData.length) {
            throw new Error("Invalid map data - expected length " + offset +
                    " actual length is " + mapData.length);
        }
        return deserialized;
    }
    
    /**
     * Deserializes an array of fixed length of unsigned 16-bit integers
     * located at the specified offset in the provided serialized array.
     * 
     * @param {string} data Serialized data.
     * @param {number} offset Offset at which the deserialization should start.
     * @param {number} length Length of the array to deserialize.
     * @return {Array} Deserialized array.
     */
    function deserializeFixedLengthArray(data, offset, length) {
        var deserialized, i;
        deserialized = new Array(length);
        for (i = length; i--;) {
            deserialized[i] = data.charCodeAt(offset + i);
        }
        return deserialized;
    }
    
    /**
     * Deserializes an array of arbitrary length of unsigned 16-bit integers
     * located at the specified offset in the provided serialized data.
     * 
     * @param {string} data Serialized data.
     * @param {number} offset Offset at which the deserialization should start.
     * @return {Array} Deserialized array.
     */
    function deserializeVariableLengthArray(data, offset) {
        var deserialized, length, i;
        length = data.charCodeAt(offset);
        deserialized = new Array(length);
        for (i = length; i--;) {
            deserialized[i] = data.charCodeAt(offset + 1 + i);
        }
        return deserialized;
    }
    
    /**
     * Serializes the provided map data consisting of arrays and 16-bit
     * unsigned integers.
     * 
     * @param {Array} map Packed JSON data export of a map.
     * @return {Array} Serialized map data.
     */
    function serializeMapData(map) {
        var serialized;
        // version
        serialized = map.slice(0, 1);
        // name
        serialized = serialized.concat(serializeVariableLengthArray(map[1]));
        // width, height
        serialized.push(map[2], map[3]);
        // tiles
        serialized = serialized.concat.apply(serialized, map[4]);
        // buildings
        serialized.push(map[5].length);
        serialized = serialized.concat.apply(serialized, map[5]);
        // units
        serialized.push(map[6].length);
        serialized = serialized.concat.apply(serialized,
                map[6].map(serializeVariableLengthArray));
        // projectiles
        serialized.push(map[7].length);
        serialized = serialized.concat.apply(serialized, map[7]);
        return serialized;
    }
    
    /**
     * Serializes an array representing data that are always guaranteed to be
     * represented by an array that may have various lengths.
     * 
     * @param {Array} data Array of 16-bit unsigned integers to serialize.
     * @return {Array} Serialized array.
     */
    function serializeVariableLengthArray(data) {
        var copy;
        if (!data.length) {
            return [0];
        }
        copy = data.slice(0);
        copy.unshift(data.length);
        return copy;
    }
};
