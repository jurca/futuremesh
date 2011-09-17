"use strict";
require('mapeditor.modal', 'player', 'building');
var MapEditorBrush;

MapEditorBrush = function (mapEditor, mouse, canvas) {
    var map, brush, mouseDown, displayBuildingForm, displayUnitForm,
            displaySFXForm;

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
            building = new Building(x, y, type, parseInt(select.value, 10));
            mapEditor.updateBuilding(building);
        }, false);
        modal.center();
    };
    
    displayUnitForm = function (x, y, type) {
        var modal, form, player, option, playerType, direction, button, i,
                directions;
        modal = new Modal('Add unit', true);
        form = document.createElement('form');
        player = document.createElement('select');
        for (i = 0; playerType = Player.getPlayer(i); i++) {
            option = document.createElement('option');
            option.style.color = playerType.color;
            option.value = i;
            option.appendChild(document.createTextNode(playerType.name));
            player.appendChild(option);
        }
        form.appendChild(player);
        directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        direction = document.createElement('select');
        for (i = 0; i < directions.length; i++) {
            option = document.createElement('option');
            option.value = i;
            option.appendChild(document.createTextNode(directions[i]));
            direction.appendChild(option);
        }
        form.appendChild(direction);
        button = document.createElement('input');
        button.type = 'submit';
        button.value = 'OK';
        form.appendChild(button);
        modal.appendChild(form);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            modal.close();
            mapEditor.updateUnit(new Unit(x, y, parseInt(direction.value, 10),
                    type, parseInt(player.value, 10)));
        }, false);
        modal.center();
    };
    
    displaySFXForm = function (x, y) {
        var modal, form, select, i, option, button;
        modal = new Modal('Set SFX 3D light', true);
        form = document.createElement('form');
        select = document.createElement('select');
        for (i = 0; i < 6; i++) {
            option = document.createElement('option');
            option.value = i;
            option.appendChild(document.createTextNode(i));
            select.appendChild(option);
        }
        form.appendChild(select);
        button = document.createElement('input');
        button.type = 'submit';
        button.value = 'OK';
        form.appendChild(button);
        modal.appendChild(form);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            modal.close();
            map.getMap()[y][x].lightSfx = parseInt(select.value, 10);
            mapEditor.updateTerrain(x, y);
        }, false);
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
            case 'units':
                if (mapData[y] && mapData[y][x]) {
                    displayUnitForm(x, y, brush.type);
                }
                break
            case 'sfx':
                if (mapData[y] && mapData[y][x]) {
                    displaySFXForm(x, y);
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
