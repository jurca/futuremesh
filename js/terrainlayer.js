var TerrainLayer;
require('../data/tilesdefinition');

TerrainLayer = function () {
    var buffer, canvas, canvasContext, map, bufferWidth, bufferHeight,
            rawBuffer;

    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasContext = canvas.getContext('2d');
    };

    this.getBufferDimensions = function () {
        return {
            width: bufferWidth,
            height: bufferHeight
        };
    };

    this.setMap = function (newMap) {
        if (!(newMap instanceof Array)) {
            throw new TypeError('map has to be an array');
        }
        map = newMap;
    };

    this.display = function (x, y) {
        canvasContext.putImageData(rawBuffer, -x, -y);
    };

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
        buffer = document.createElement('canvas');
        tileWidth = TilesDefinition.getType(0).imageData.width;
        tileHeight = TilesDefinition.getType(0).imageData.height;
        context = buffer.getContext('2d');
        tileHeight /= 2;
        tileWidth -= 1;
        tileHeight -= 1;
        buffer.width = map[0].length * tileWidth + tileWidth / 2;
        buffer.height = map.length * tileHeight + tileHeight;
        for (i = map.length; i--;) {
            row = map[i];
            xOffset = (i % 2) * (tileWidth / 2);
            for (j = row.length; j--;) {
                context.drawImage(TilesDefinition.getType(row[j].type).
                        imageData, xOffset + j * tileWidth, i * tileHeight);
            }
        }
        bufferWidth = buffer.width;
        bufferHeight = buffer.height;
        buffer = context;
        rawBuffer = context.getImageData(0, 0, bufferWidth, bufferHeight);
    };
};