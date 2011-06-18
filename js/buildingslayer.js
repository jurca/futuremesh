"use strict";
var BuildingsLayer;
require('../data/tilesdefinition', '../data/buildingsdefinition');

/**
 * Renderer of buildings in the UI.
 */
BuildingsLayer = function () {
    var buffer, canvas, canvasWidth, canvasHeight, canvasContext, bufferWidth,
            bufferHeight, tileWidth, tileHeight, bufferCanvas;

    /**
     * Sets the canvas that will be used for rendering of the buildings layer.
     *
     * @param {HTMLCanvasElement} newCanvas The canvas that should be used for
     *        rendering.
     */
    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        canvasContext = canvas.getContext('2d');
    };

    /**
     * Returns the dimensions of the inner buffer in pixels as a object.
     *
     * @return {Object} The object containing properties width and height
     *         representing the dimensions of the inner buffer in pixels.
     */
    this.getBufferDimensions = function () {
        return {
            width: bufferWidth,
            height: bufferHeight
        };
    };

    /**
     * Sets the map that is to be rendered. The map itself is not rendered by
     * this layer, it is used only to set up some properties of the renderer.
     *
     * @param {Array} map Raw map data (two-dimensional array of tiles
     *        objects).
     */
    this.setMap = function (map) {
        tileWidth = TilesDefinition.getType(0).imageData.width;
        tileHeight = TilesDefinition.getType(0).imageData.height;
        tileHeight /= 2;
        tileWidth -= 1;
        tileHeight -= 1;
        bufferWidth = map[0].length * tileWidth + tileWidth / 2;
        bufferHeight = map.length * tileHeight + tileHeight;
        bufferCanvas = document.createElement('canvas');
        bufferCanvas.width = bufferWidth;
        bufferCanvas.height = bufferHeight;
        buffer = bufferCanvas.getContext('2d');
    };

    /**
     * Handler of the event when new building is created and added to the map.
     * This handler renders the building to the inner buffer so it can be
     * displayed in the UI.
     *
     * @param {Building} building The building that has been added to the map.
     */
    this.onBuildingAdded = function (building) {
        var type, x, y;
        type = BuildingsDefinition.getType(building.type);
        x = (tileWidth / 2) * (building.y % 2) + tileWidth * building.x;
        y = tileHeight * building.y;
        buffer.globalCompositeOperation = 'source-over';
        buffer.drawImage(type.imageData, x, y - 2);
    };

    /**
     * Handler of the event when a building is removed from the map (sold,
     * destroyed, etc...). This handler removes the building from the inner
     * buffer so that it will not be displayed in the UI anymore.
     *
     * @param {Building} building The building that has been removed.
     */
    this.onBuildingRemoved = function (building) {
        var type, x, y;
        type = BuildingsDefinition.getType(building.type);
        x = (tileWidth / 2) * (building.y % 2) + tileWidth * building.x;
        y = tileHeight * building.y;
        buffer.globalCompositeOperation = 'destination-out';
        buffer.drawImage(type.imageData, x, y);
    };

    /**
     * Displays the relevant part of the inner buffer in the UI using the
     * provided canvas element.
     *
     * @param {Number} x The X offset in pixels.
     * @param {Number} y The Y offset in pixels.
     */
    this.display = function (x, y) {
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.drawImage(bufferCanvas, -x, -y);
    };
};