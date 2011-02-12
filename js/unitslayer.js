var UnitsLayer;
require('settings', '../data/settings', '../data/unitsdefinition',
        '../data/tilesdefinition');

UnitsLayer = function () {
    var canvas, canvasWidth, canvasHeight, canvasContext, tileWidth,
            tileHeight, grid, addUnit, removeUnit, gridWidth, gridHeight,
            horizonzalTilesOnDisplay, verticalTilesOnDisplay;

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
        var gridX, gridY, i, j, unit;
        canvasContext.globalCompositeOperation = 'destination-out';
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.globalCompositeOperation = 'source-over';
        gridX = Math.max(0, Math.floor(x / tileWidth) - 1);
        gridY = Math.max(0, Math.floor(y / tileHeight) - 1);
        y -= 2;
        for (i = verticalTilesOnDisplay; i--;) {
            for (j = horizonzalTilesOnDisplay; j--;) {
                if (grid[gridY + i] && (unit = grid[gridY + i][gridX + j])) {
                    canvasContext.drawImage(UnitsDefinition.getType(unit.type).
                            imageData[unit.direction],
                            ((i + gridY) % 2) * tileWidth / 2 + (j + gridX) *
                            tileWidth - x + unit.moveOffsetX,
                            (i + gridY) * tileHeight - y + unit.moveOffsetY);
                }
            }
        }
    };

    addUnit = function (unit) {
        grid[unit.y][unit.x] = unit;
    };

    removeUnit = function (unit) {
        if (unit.action == 1) {
            grid[unit.y][unit.x] = false;
        } else {
            grid[unit.lastY][unit.lastX] = false;
        }
    };
};