"use strict";
var TerrainLayer;
require('../data/tilesdefinition');

/**
 * Renderer of the terrain in the UI.
 */
TerrainLayer = function () {
    var buffer, canvas, canvasContext, map, bufferWidth, bufferHeight,
            bufferCanvas;

    /**
     * Sets the canvas to be used to render the terrain in the UI.
     *
     * @param {HTMLCanvasElement} newCanvas The canvas to be used to render the
     *        terrain in the UI.
     */
    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasContext = canvas.getContext('2d');
    };

    /**
     * Returns a single object containing the information about inner buffer
     * dimensions.
     *
     * @return {Object} The object containing the the information about inner
     *         buffer dimensions. It has two properties:
     *         <ul>
     *             <li>width - the width of the buffer in pixels</li>
     *             <li>height - the height of the buffer in pixels</li>
     *         </ul>
     */
    this.getBufferDimensions = function () {
        return {
            width: bufferWidth,
            height: bufferHeight
        };
    };

    /**
     * Sets the current map to be rendered.
     *
     * @param {Array} newMap The raw map content. Do not pass the Map class
     *        instance, it won't work.
     */
    this.setMap = function (newMap) {
        if (!(newMap instanceof Array)) {
            throw new TypeError('map has to be an array');
        }
        map = newMap;
    };

    /**
     * Displays the terrain on the set canvas. Cannot be used before the init
     * method.
     *
     * @param {Number} x The X offset of the terrain layer to be displayed.
     * @param {Number} y The Y offset of the terrain layer to be displayed.
     */
    this.display = function (x, y) {
        canvasContext.drawImage(buffer.canvas, -x, -y);
    };

    /**
     * Initializes the terrain renderer. The methods setMap and setCanvas must
     * be invoked before this method can be used, otherwise it will throw an
     * Error.
     * This methods creates it's own canvas, renders the map and then gets the
     * raw content of the used canvas. This content then becomes the inner
     * buffer that is used to display the terrain in the UI.
     */
    this.init = function () {
        var tileWidth, tileHeight, i, j, row, xOffset, context;
        if (buffer) {
            return;
        }
        if (!canvasContext) {
            throw new Error("Missing renderer's target canvas");
        }
        if (!map) {
            throw new Error('Cannot init terrain renderer without map data');
        }
        bufferCanvas = document.createElement('canvas');
        tileWidth = TilesDefinition.getType(0).imageData.width;
        tileHeight = TilesDefinition.getType(0).imageData.height;
        buffer = bufferCanvas.getContext('2d');
        tileHeight /= 2;
        tileWidth -= 1;
        tileHeight -= 1;
        bufferCanvas.width = map[0].length * tileWidth + tileWidth / 2;
        bufferCanvas.height = map.length * tileHeight + tileHeight;
        for (i = map.length; i--;) {
            row = map[i];
            xOffset = (i % 2) * (tileWidth / 2);
            for (j = row.length; j--;) {
                buffer.drawImage(TilesDefinition.getType(row[j].type).
                        imageData, xOffset + j * tileWidth, i * tileHeight);
            }
        }
        bufferWidth = bufferCanvas.width;
        bufferHeight = bufferCanvas.height;
    };
};