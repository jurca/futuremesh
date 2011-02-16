var UnitsLayer;
require('settings', '../data/settings', '../data/unitsdefinition',
        '../data/tilesdefinition');

UnitsLayer = function () {
    var canvas, canvasWidth, canvasHeight, canvasContext, tileWidth,
            tileHeight, grid, addUnit, removeUnit, gridWidth, gridHeight,
            horizonzalTilesOnDisplay, verticalTilesOnDisplay, index,
            horizonzalIndexTilesOnDisplay, verticalIndexTilesOnDisplay,
            indexGranularity, displayIndexCell;

    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        canvasContext = canvas.getContext('2d');
    };

    this.setMap = function (map) {
        var i, j, row;
        if (!canvas) {
            throw new Error('The canvas has to be set before map');
        }
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
        horizonzalTilesOnDisplay = Math.ceil(canvasWidth / tileWidth) + 2;
        verticalTilesOnDisplay = Math.ceil(canvasHeight / tileHeight) + 2;
        grid = [];
        for (i = map.length; i--;) {
            row = [];
            for (j = map[0].length; j--;) {
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
    };

    this.getLayerDimensions = function () {
        return {
            width: gridWidth * tileWidth + tileWidth / 2,
            height: gridHeight * tileHeight + tileHeight
        };
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
        gridX = Math.max(0, Math.floor(x / tileWidth) - 1);
        gridY = Math.max(0, Math.floor(y / tileHeight) - 1);
        y -= 2;
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

    addUnit = function (unit) {
        grid[unit.y][unit.x] = unit;
        index[Math.floor(unit.y / indexGranularity)][Math.floor(unit.x /
                indexGranularity)]++;
    };

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