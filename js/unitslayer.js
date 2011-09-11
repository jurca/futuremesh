"use strict";
var UnitsLayer;
require('settings', 'data.settings', 'data.unitsdefinition',
        'data.tilesdefinition');

/**
 * Renderer of the units layer in the UI main View.
 */
UnitsLayer = function () {
    var canvas, canvasWidth, canvasHeight, canvasContext, tileWidth,
            tileHeight, grid, addUnit, removeUnit, gridWidth, gridHeight,
            horizonzalTilesOnDisplay, verticalTilesOnDisplay, index,
            horizonzalIndexTilesOnDisplay, verticalIndexTilesOnDisplay,
            indexGranularity, displayIndexCell;

    /**
     * Sets the canvas that will be used for rendering. This has to be done
     * before map is set.
     *
     * @param {HTMLCanvasElement} newCanvas
     */
    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        canvasContext = canvas.getContext('2d');
    };

    /**
     * Sets the map for the renderer. This cannot be done before canvas has
     * been set. The map isn't actually used in any way - it is used only to
     * determine the dimensions of grid index used to optimize rendering of the
     * units layer. The granularity of the index may be set using Settings.
     * 
     * @param {Map} map A Map class instance.
     */
    this.setMap = function (map) {
        var i, j, row, mapData, units;
        if (!canvas) {
            throw new Error('The canvas has to be set before map');
        }
        mapData = map.getMap();
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
        horizonzalTilesOnDisplay = Math.ceil(canvasWidth / tileWidth) + 2;
        verticalTilesOnDisplay = Math.ceil(canvasHeight / tileHeight) + 2;
        grid = [];
        for (i = mapData.length; i--;) {
            row = [];
            for (j = mapData[0].length; j--;) {
                row.push(false);
            }
            grid.push(row);
        }
        gridWidth = grid[0].length;
        gridHeight = grid.length;
        index = [];
        indexGranularity = Settings.gridIndexGranularity;
        for (i = Math.ceil(gridHeight / indexGranularity); i--;) {
            row = [];
            for (j = Math.ceil(gridWidth) / indexGranularity; j--;) {
                row.push(0);
            }
            index.push(row);
        }
        horizonzalIndexTilesOnDisplay =
                Math.ceil(horizonzalTilesOnDisplay / indexGranularity);
        verticalIndexTilesOnDisplay =
                Math.ceil(verticalTilesOnDisplay / indexGranularity);
        units = map.getUnits();
        for (i = units.length; i--;) {
            this.onUnitChange(units[i]);
        }
    };

    /**
     * Return an object containing dimensions of the layer being rendered. This
     * renderer however doesn't use an inner buffer of which dimensions could
     * be returned. Because units usually move with each drawn frame, the
     * renderer uses only grid index to identify the section of the map of
     * which units should be rendered, so the values returned by this method
     * are dimensions of a hypothetical inner rendering buffer.
     * 
     * @return {Object} Objection containing information about layer dimensions
     *         in two properties:
     *         <ul>
     *             <li>width - width of the layer in pixels</li>
     *             <li>height - height of the layer in pixels</li>
     *         </ul>
     */
    this.getLayerDimensions = function () {
        return {
            width: gridWidth * tileWidth + tileWidth / 2,
            height: gridHeight * tileHeight + tileHeight
        };
    };

    /**
     * Event handler for change of any unit's state. If any unit is created,
     * destroyed or moved or has performed any action, the units layer render
     * can be notified of this change using this method.
     * 
     * @param {Unit} unit Unit of which state has changed.
     */
    this.onUnitChange = function (unit) {
        switch (unit.action) {
            case 2:
                removeUnit(unit);
            case 0:
                addUnit(unit);
                break;
            case 1:
                removeUnit(unit);
                break;
        }
    };

    /**
     * Display chosen part of the whole map view's units.
     * 
     * @param {Number} x The X offset of the view specified in pixels
     * @param {Number} y The Y offset of the view specified in pixels
     */
    this.display = function (x, y) {
        var gridX, gridY, indexX, indexY, i, j;
        canvasContext.globalCompositeOperation = 'destination-out';
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.globalCompositeOperation = 'source-over';
        gridX = Math.max(0, Math.floor(x / tileWidth) - 1);
        gridY = Math.max(0, Math.floor(y / tileHeight) - 1);
        indexX = Math.floor(gridX / indexGranularity);
        indexY = Math.floor(gridY / indexGranularity);
        for (i = verticalIndexTilesOnDisplay; i--;) {
            if (index[indexY + i]) {
                for (j = horizonzalIndexTilesOnDisplay; j--;) {
                    if (index[indexY + i][indexX + j]) {
                        displayIndexCell(indexX + j, indexY + i, x, y);
                    }
                }
            }
        }
    };

    /**
     * Display content of a grid index' cell - the units contained in this cell
     * - onto the renderer's canvas
     * 
     * @param {Number} x The X coordinate in the grid index indentifying the
     *        column of the grid index containing the cell
     * @param {Number} y The Y coordinate in the grid index indentifying the
     *        row of the grid index containing the cell
     * @param {Number} screenX The X offset of the view specified in pixels
     * @param {Number} screenY The Y offset of the view specified in pixels
     */
    displayIndexCell = function (x, y, screenX, screenY) {
        var i, j, unit, gridX, gridY, currentX, currentY, offsetX;
        gridX = x * indexGranularity;
        gridY = y * indexGranularity;
        for (i = indexGranularity; i--;) {
            currentY = gridY + i;
            offsetX = (currentY % 2) * tileWidth / 2;
            for (j = indexGranularity; j--;) {
                currentX = gridX + j;
                if (grid[currentY] && (unit = grid[currentY][currentX])) {
                    canvasContext.drawImage(UnitsDefinition.getType(unit.type).
                            imageData[unit.direction],
                            offsetX + currentX * tileWidth - screenX +
                            unit.moveOffsetX, currentY * tileHeight - screenY +
                            unit.moveOffsetY);
                }
            }
        }
    };

    /**
     * Adds a new unit to the index and grid index.
     * 
     * @param {Unit} unit Unit to be added to the index.
     */
    addUnit = function (unit) {
        grid[unit.y][unit.x] = unit;
        index[Math.floor(unit.y / indexGranularity)][Math.floor(unit.x /
                indexGranularity)]++;
    };

    /**
     * Removes a unit from the index and the grid index.
     * 
     * @param {Unit} unit Unit to be removed from the index.
     */
    removeUnit = function (unit) {
        if (unit.action == 1) {
            grid[unit.y][unit.x] = false;
            index[Math.floor(unit.y / indexGranularity)][Math.floor(unit.x /
                    indexGranularity)]--;
        } else {
            grid[unit.lastY][unit.lastX] = false;
            index[Math.floor(unit.lastY / indexGranularity)
                    ][Math.floor(unit.lastX / indexGranularity)]--;
        }
    };
};