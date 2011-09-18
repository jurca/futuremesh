"use strict";
var SFX;
require('settings', 'data.settings', 'map');

/**
 * Renderer of simple SFX on the map.
 */
SFX = function () {
    var canvas, map, canvasWidth, canvasHeight, tileWidth, tileHeight, context,
            canvasTileWidth, canvasTileHeight, depthFactor, canvasCenterX,
            canvasCenterY, buildingsIndex, displayLightSFX,
            displayBuildableTiles, displayTileOverlay, enableBuildOverlay;
    
    depthFactor = Settings.sfx3DLightFactor;
    enableBuildOverlay = false;
    
    /**
     * Sets the output canvas for rendering.
     * 
     * @param {HTMLCavansElement} newCanvas New output canvas for rendering.
     */
    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        context = canvas.getContext('2d');
        context.globalAlpha = 0.3;
        context.strokeStyle = 'white';
        context.fillStyle = '#ff0000';
        context.lineCap = 'round';
        canvasCenterX = canvasWidth / 2;
        canvasCenterY = canvasHeight / 2;
    };
    
    /**
     * Sets the current map of which SFX should be renderer.
     * 
     * @param {Map} newMap The map for rendering. The method also accepts raw
     *        map data.
     */
    this.setMap = function (newMap) {
        if (!canvas) {
            throw new Error("cannot set map for SFX before canvas!");
        }
        map = newMap.getMap();
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
        canvasTileWidth = Math.ceil(canvasWidth / tileWidth);
        canvasTileHeight = Math.ceil(canvasHeight / tileHeight);
        buildingsIndex = newMap.getBuildingsIndex();
    };
    
    this.setDisplayBuildableOverlay = function (displayBuildableOverlay) {
        enableBuildOverlay = displayBuildableOverlay;
    };

    /**
     * Displays the SFX of the map on the chosen offset on the provided
     * canvas.
     * 
     * @param {Number} x X offset for rendering.
     * @param {Number} y Y offset for rendering.
     */
    this.display = function (x, y) {
        displayLightSFX(x, y);
        enableBuildOverlay && displayBuildableTiles(x, y);
    };
    
    displayLightSFX = function (x, y) {
        var mapOffsetX, mapOffsetY, i, j, offsetX, offsetY, shiftX, endX, endY,
                mapRow, mapTile;
        y -= tileHeight;
        x -= tileWidth / 2;
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        mapOffsetX = Math.floor(x / tileWidth);
        mapOffsetY = Math.floor(y / tileHeight);
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = map[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                if (!mapTile || !mapTile.lightSfx) {
                   continue;
                }
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                endX = offsetX + (offsetX - canvasCenterX) / depthFactor;
                endY = offsetY + (offsetY - canvasCenterY) / depthFactor;
                context.lineWidth = mapTile.lightSfx;
                context.beginPath();
                context.moveTo(offsetX, offsetY);
                context.lineTo(endX, endY);
                context.stroke();
            }
        }
    };
    
    displayBuildableTiles = function (x, y) {
        var mapOffsetX, mapOffsetY, i, j, mapRow, offsetY, shiftX, mapTile,
                offsetX;
        mapOffsetX = Math.floor(x / tileWidth) - 1;
        mapOffsetY = Math.floor(y / tileHeight) - 1;
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = buildingsIndex[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                if (!mapTile) {
                    continue;
                }
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                displayTileOverlay(offsetX, offsetY);
            }
        }
    };
    
    displayTileOverlay = function (x, y) {
        context.beginPath();
        context.moveTo(x + (tileWidth / 2), y);
        context.lineTo(x + tileWidth, y + tileHeight);
        context.lineTo(x + (tileWidth / 2), y + (tileHeight * 2));
        context.lineTo(x, y + tileHeight);
        context.fill();
    };
};
