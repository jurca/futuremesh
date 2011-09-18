"use strict";
var TerrainGenerator;
require('map');

TerrainGenerator = function () {
    this.generate = function (data) {
        var width, height, map, tiles, row, i, j;
        width = data.minWidth +
                Math.round(Math.random() * (data.maxWidth - data.minWidth));
        height = data.minHeight +
                Math.round(Math.random() * (data.maxHeight - data.minHeight));
        map = new Map();
        
        tiles = [];
        for (j = height; j--;) {
            row = [];
            for (i = width; i--;) {
                row.push(new Tile(data.baseTile));
            }
            tiles.push(row);
        }
        map.setMap(tiles);
        
        return map;
    };
};
