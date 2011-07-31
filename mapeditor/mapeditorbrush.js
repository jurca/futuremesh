"use strict";
require('mapeditor.modal', 'player', 'building');
var MapEditorBrush;

MapEditorBrush = function (mapEditor, mouse, canvas) {
    var map, brush, mouseDown, displayBuildingForm;
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
    
    displayBuildingForm = function (x, y, type) {
        var modal, form, select, button, option, i, player;
        modal = new Modal('Add building', true);
        form = document.createElement('form');
        select = document.createElement('select');
        for (i = 0; player = Player.getPlayer(i); i++) {
            option = document.createElement('option');
            option.style.color = player.color;
            option.value = i;
            option.appendChild(document.createTextNode(player.name));
            select.appendChild(option);
        }
        form.appendChild(select);
        button = document.createElement('input');
        button.type = 'submit';
        button.value = 'OK';
        form.appendChild(button);
        modal.appendChild(form);
        form.addEventListener('submit', function (e) {
            var building;
            e.preventDefault();
            modal.close();
            building = new Building(x, y, type, select.value);
            mapEditor.updateBuilding(building);
        }, false);
        modal.center();
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
            case 'buildings':
                if (mapData[y] && mapData[y][x]) {
                    displayBuildingForm(x, y, brush.type);
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
