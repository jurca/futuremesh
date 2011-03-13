var BuildingsLayer;
require('../data/tilesdefinition', '../data/buildingsdefinition');

BuildingsLayer = function () {
    var buffer, canvas, canvasWidth, canvasHeight, canvasContext, bufferWidth,
            bufferHeight, tileWidth, tileHeight, rawBuffer;

    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        canvasContext = canvas.getContext('2d');
    };

    this.getBufferDimensions = function () {
        return {
            width: bufferWidth,
            height: bufferHeight
        };
    };

    this.setMap = function (map) {
        tileWidth = TilesDefinition.getType(0).imageData.width;
        tileHeight = TilesDefinition.getType(0).imageData.height;
        tileHeight /= 2;
        tileWidth -= 1;
        tileHeight -= 1;
        bufferWidth = map[0].length * tileWidth + tileWidth / 2;
        bufferHeight = map.length * tileHeight + tileHeight;
        buffer = document.createElement('canvas');
        buffer.width = bufferWidth;
        buffer.height = bufferHeight;
        buffer = buffer.getContext('2d');
        rawBuffer = buffer.getImageData(0, 0, bufferWidth, bufferHeight);
    };

    this.onBuildingAdded = function (building) {
        var type, x, y;
        type = BuildingsDefinition.getType(building.type);
        x = (tileWidth / 2) * (building.y % 2) + tileWidth * building.x;
        y = tileHeight * building.y;
        buffer.globalCompositeOperation = 'source-over';
        buffer.drawImage(type.imageData, x, y);
        rawBuffer = buffer.getImageData(0, 0, bufferWidth, bufferHeight);
    };

    this.onBuildingRemoved = function (building) {
        var type, x, y;
        type = BuildingsDefinition.getType(building.type);
        x = (tileWidth / 2) * (building.y % 2) + tileWidth * building.x;
        y = tileHeight * building.y;
        buffer.globalCompositeOperation = 'destination-out';
        buffer.drawImage(type.imageData, x, y);
        rawBuffer = buffer.getImageData(0, 0, bufferWidth, bufferHeight);
    };

    this.display = function (x, y) {
        canvasContext.putImageData(rawBuffer, -x, -y);
    };
};