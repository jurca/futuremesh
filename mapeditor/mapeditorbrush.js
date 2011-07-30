"use strict";
var MapEditorBrush;

MapEditorBrush = function (mapEditor, mouse, canvas) {
    var map, brush;
    map = mapEditor.getMap();
    
    this.setBrush = function (newBrush) {
        brush = newBrush;
    };
    
    this.setMap = function (newMap) {
        map = newMap;
    };
    
    this.getBrush = function () {
        return brush;
    };
    
    canvas.addEventListener('click', function () {
        var x, y, mapData;
        mapData = map.getMap();
        x = mouse.getX();
        y = mouse.getY();
        switch (brush.layer) {
            case 'terrain':
                if (mapData[y] && mapData[y][x]) {
                    mapData[y][x] = new Tile(brush.type);
                    mapEditor.updateTerrain(x, y);
                }
                break;
        }
    }, false);
};
