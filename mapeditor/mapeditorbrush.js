"use strict";
var MapEditorBrush;

MapEditorBrush = function (mapEditor, mouse, canvas) {
    var map, brush, mouseDown;
    map = mapEditor.getMap();
    mouseDown = false;
    
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
    
    canvas.addEventListener('mousedown', function () {
        mouseDown = true;
    }, false);
    
    addEventListener('mouseup', function () {
        mouseDown = false;
    }, false);
    
    canvas.addEventListener('mousemove', function () {
        var x, y, mapData;
        if (!mouseDown || (brush.layer != 'terrain')) {
            return;
        }
        mapData = map.getMap();
        x = mouse.getX();
        y = mouse.getY();
        if (mapData[y] && mapData[y][x] &&
                (mapData[y][x].type != brush.type)) {
            mapData[y][x] = new Tile(brush.type);
            mapEditor.updateTerrain(x, y);
        }
    }, false);
};
