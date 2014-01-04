"use strict";
var Mouse;

Mouse = function () {
    var x, y, mapX, mapY, canvasLeftOffset, canvasTopOffset, tileWidth,
            tileHeight, tileWidthHalf, mapXOffset, mapYOffset;

    tileWidth = TilesDefinition.getType(0).imageData.width - 1;
    tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
    tileWidthHalf = tileWidth / 2;
    mapXOffset = 0;
    mapYOffset = 0;

    this.getX = function () {
        return x;
    };

    this.getY = function () {
        return y;
    };

    this.getMapX = function () {
        return mapX;
    };

    this.getMapY = function () {
        return mapY;
    };

    this.setCanvasOffset = function (left, top) {
        canvasLeftOffset = left;
        canvasTopOffset = top;
    };

    this.setMapOffset = function (x, y) {
        mapXOffset = x;
        mapYOffset = y;
    };

    addEventListener('mousemove', function (e) {
        var xShift, yShift;
        x = e.pageX - canvasLeftOffset + mapXOffset;
        y = e.pageY - canvasTopOffset + mapYOffset;
        mapX = Math.floor(x / tileWidth);
        mapY = Math.floor(y / tileHeight);
        xShift = x - mapX * tileWidth;
        yShift = y - mapY * tileHeight;
        if (mapY % 2) {
            if (xShift >= tileWidthHalf) {
                xShift -= tileWidthHalf;
                mapY -= (xShift + yShift < tileWidthHalf) ? 1 : 0;
            } else {
                if (tileWidthHalf - xShift + yShift < tileWidthHalf) {
                    mapY--;
                } else {
                    mapX--;
                }
            }
        } else {
            if (xShift >= tileWidthHalf) {
                xShift -= tileWidthHalf;
                mapY -= (tileWidthHalf - xShift + yShift < tileWidthHalf) ?
                        1 : 0;
            } else {
                if (xShift + yShift < tileWidthHalf) {
                    mapX--;
                    mapY--;
                }
            }
        }
    }, false);
};
