var UnitsLayer;
require('settings', '../data/settings', '../data/unitsdefinition',
        '../data/tilesdefinition');

UnitsLayer = function () {
    var canvas, canvasWidth, canvasHeight, canvasContext, tileWidth,
            tileHeight, gridIndex, grid, addUnit, removeUnit, granularity,
            canvasTileWidth, canvasTileHeight, canvasIndexWidth,
            canvasIndexHeight, initConstants, displayGridCell;

    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        canvasContext = canvas.getContext('2d');
    };

    this.setMap = function (map) {
        var i, j, row, cols, rows;
        if (!canvas) {
            throw new Error('The canvas has to be set before map');
        }
        initConstants();
        rows = Math.ceil(map.length / granularity);
        cols = Math.ceil(map[0].length / granularity);
        gridIndex = [];
        for (i = rows; i--;) {
            row = [];
            for (j = cols; j--;) {
                row.push(0);
            }
            gridIndex.push(row);
        }
        grid = [];
        rows = map.length;
        cols = map[0].length;
        for (i = rows; i--;) {
            row = [];
            for (j = cols; j--;) {
                row.push(false);
            }
            grid.push(row);
        }
    };

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

    this.display = function (x, y) {
        var gridX, gridY, indexX, indexY, i, j;
        canvasContext.globalCompositeOperation = 'destination-out';
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.globalCompositeOperation = 'source-over';
        gridX = Math.floor(x / tileWidth) - 1;
        gridY = Math.floor(y / tileHeight) - 1;
        gridX = Math.max(0, gridX);
        gridY = Math.max(0, gridY);
        indexX = Math.floor(gridX / granularity);
        indexY = Math.floor(gridY / granularity);
        for (i = canvasIndexHeight; i--;) {
            for (j = canvasIndexWidth; j--;) {
                if (gridIndex[j + indexY] &&
                        gridIndex[j + indexY][i + indexX]) {
                    displayGridCell(j + indexY, i + indexX, x, y);
                }
            }
        }
    };

    displayGridCell = function (x, y, screenX, screenY) {
        var i, j, type, unit;
        x *= granularity;
        y *= granularity;
        for (i = granularity; i--;) {
            for (j = granularity; j--;) {
                if (grid[y + i][x + j]) {
                    unit = grid[y + i][x + j];
                    type = UnitsDefinition.getType(unit.type);
                    screenX = (tileWidth / 2) * (unit.y % 2) + tileWidth *
                            unit.x - screenX;
                    screenY = (y + i) * unit.y - screenY;
                    canvasContext.drawImage(type.imageData[unit.direction],
                            screenX, screenY);
                }
            }
        }
    };

    addUnit = function (unit) {
        grid[unit.y][unit.y] = unit;
        gridIndex[Math.ceil(unit.y / granularity)][Math.ceil(unit.x /
                granularity)]++;
    };

    removeUnit = function (unit) {
        var x, y;
        if (unit.action == 1) {
            x = unit.x;
            y = unit.y;
        } else {
            x = unit.lastX;
            y = unit.lastY;
        }
        if (grid[y][x]) {
            grid[y][x] = false;
            gridIndex[Math.ceil(y / granularity)][Math.ceil(x /
                    granularity)]--;
        }
    };

    initConstants = function () {
        tileWidth = TilesDefinition.getType(0).imageData.width;
        tileHeight = TilesDefinition.getType(0).imageData.height;
        tileHeight /= 2;
        tileWidth -= 1;
        tileHeight -= 1;
        granularity = Settings.gridIndexGranularity;
        canvasTileWidth = Math.ceil(canvasWidth / tileWidth) + 2;
        canvasTileHeight = Math.ceil(canvasHeight / tileHeight) + 2;
        canvasIndexWidth = Math.ceil(canvasTileWidth / granularity);
        canvasIndexHeight = Math.ceil(canvasTileHeight / granularity);
    };
};