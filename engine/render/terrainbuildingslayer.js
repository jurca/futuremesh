"use strict";

/**
 * The Terrain-Buildings Layer is a rendered of both the terrain and buildings
 * in a single layer. Using this combined layer rendered instead of separate
 * terrain layer and buildings layer renderers improves the performance by
 * limiting the number of graphical composition operations that needs to be
 * done.
 *
 * <p>This renderer is based on both terrain and buildings renderers, but it
 * uses neither of them.</p>
 *
 * @constructor
 */
window.TerrainBuildingsLayer = function () {
    /**
     * Canvas containing the internal buffer containing the combined terrain
     * and buildings layers used for rendering.
     *
     * @type HTMLElement
     */
    var bufferCanvas,

    /**
     * Internal buffer containing the combined terrain and buildings layers
     * used for rendering.
     *
     * @type CanvasRenderingContext2D
     */
    bufferContext,

    /**
     * Width of the internal rendering buffer in pixels.
     *
     * @type Number
     */
    bufferWidth,

    /**
     * Height of the internal rendering buffer in pixels.
     *
     * @type Number
     */
    bufferHeight,

    /**
     * 2D rendering context of the canvas visible in the UI. The layer is
     * rendered into this canvas context from the internal buffer.
     *
     * @type CanvasRenderingContext2D
     */
    renderingView,

    /**
     * The internal reference to the current map's tiles. The tiles are
     * represented as a two-dimensional array, the first index being the row
     * (the Y-coordinate), the second index being the column (the
     * X-coordinate). Each tile is represented by a Tile instance.
     *
     * @type Array
     */
    tiles,

    /**
     * The current map.
     *
     * @type Map
     */
    map,

    /**
     * Width of the tile image in pixels.
     *
     * @type Number
     */
    tileWidth,

    /**
     * Half of the height of tile image in pixels. The height is already halved
     * because tile rows are zig-zagged to each other.
     *
     * @type Number
     */
    tileHeight;

    /**
     * Sets the canvas to which the the layer renderer should render the
     * content (terrain and buildings).
     *
     * @param {HTMLElement} canvas The canvas to which the render should render
     *        the terrain and buildings.
     */
    this.setCanvas = function (canvas) {
        renderingView = canvas.getContext("2d");
    };

    /**
     * Returns the dimensions of the internal buffer containig the terrain and
     * buildings of the whole map. The timensions are returned in a single
     * object.
     *
     * @return {Object} The object containing the the information about inner
     *         buffer's dimensions. It has the following fields:
     *         <ul>
     *             <li>width - the width of the buffer in pixels.</li>
     *             <li>height - the height of the buffer in pixels.</li>
     *         </ul>
     */
    this.getBufferDimensions = function () {
        return {
            width: bufferWidth,
            height: bufferHeight
        };
    };

    /**
     * Sets the map to be rendered.
     *
     * @param {Map} newMap The new map.
     */
    this.setMap = function (newMap) {
        if (!(newMap instanceof Map)) {
            throw new TypeError("The map has to be a Map instance");
        }
        map = newMap;
        tiles = newMap.getTiles();
    };

    /**
     * Renders the terrain and buildings visible at the specified camera's
     * offset.
     *
     * @param {Number} x The horizontal offset of the camera in pixels.
     * @param {Number} y The vertical offset of the camera in pixels.
     */
    this.display = function (x, y) {
        renderingView.drawImage(bufferCanvas, -x, -y);
    };

    /**
     * Re-renders the tile at the provided coordinates. This method has to be
     * executed for every modified tile of the map.
     *
     * @param {Number} x The x coordinate of the modified tile.
     * @param {Number} y The y coordinate of the modified tile.
     */
    this.updateTile = function (x, y) {
        var tileImage;
        tileImage = TilesDefinition.getType(tiles[y][x].type).imageData;
        x = ((y % 2) * (tileWidth / 2)) + x * tileWidth;
        bufferContext.drawImage(tileImage, x, y * tileHeight - 2);
    };

    /**
     * Handles addition of a new building to the map. The method pre-renders
     * the building to the internal buffer so it can be displayed in the UI.
     *
     * @param {Building} building The new building.
     */
    this.onBuildingAdded = function (building) {
        var type, x, y;
        type = BuildingsDefinition.getType(building.type);
        x = (tileWidth / 2) * (building.y % 2) + tileWidth * building.x - 1;
        y = tileHeight * building.y - 1;
        bufferContext.drawImage(type.playerImages[building.player], x, y);
    };

    /**
     * Handles destruction of the provided building by removing its graphics
     * from the internal graphical buffer. The building's graphics are removed
     * by re-rendering the underlying tiles over the building's position.
     *
     * @param {Building} building The removed building.
     */
    this.onBuildingRemoved = function (building) {
        var tileCoordinates, i;
        tileCoordinates = map.getTilesOccupiedByBuilding(building);
        for (i = tileCoordinates.length; i--;) {
            this.updateTile(tileCoordinates[i].x, tileCoordinates[i].y);
        }
    };

    /**
     * Initializes the terrain renderer. The methods setMap and setCanvas must
     * be invoked before this method can be executed, otherwise the method will
     * throw an Error.
     *
     * <p>This method initializes the terrain and buildings layer. The renderer
     * may be used for rendering once this method finishes.</p>
     */
    this.init = function () {
        var i, j, row, xOffset, tileImage, buildings;
        if (!renderingView) {
            throw new Error("The target canvas is not set yet - invoke " +
                    "setCanvas() first");
        }
        if (!tiles) {
            throw new Error("The map is not set set - invoke setMap() first");
        }
        bufferCanvas = document.createElement("canvas");
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = (TilesDefinition.getType(0).imageData.height / 2) - 1;
        bufferContext = bufferCanvas.getContext("2d");
        bufferCanvas.width = tiles[0].length * tileWidth + tileWidth / 2;
        bufferCanvas.height = tiles.length * tileHeight + tileHeight;
        for (i = tiles.length; i--;) {
            row = tiles[i];
            xOffset = (i % 2) * (tileWidth / 2);
            for (j = row.length; j--;) {
                tileImage = TilesDefinition.getType(row[j].type).imageData;
                bufferContext.drawImage(tileImage, xOffset + j * tileWidth,
                        i * tileHeight - 2);
            }
        }
        bufferWidth = bufferCanvas.width;
        bufferHeight = bufferCanvas.height;
        buildings = map.getBuildings();
        for (i = buildings.length; i--;) {
            this.onBuildingAdded(buildings[i]);
        }
    };
};
