"use strict";
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
    
    displayBuildingForm = function (x, y, type, building) {
        var modal, form, select, button, option, i, player;
        modal = new Modal(building ? 'Edit building' : 'Add building', true);
        form = document.createElement('form');
        select = document.createElement('select');
        for (i = 0; player = Player.getPlayer(i); i++) {
            option = document.createElement('option');
            option.style.color = player.color;
            option.value = i;
            option.appendChild(document.createTextNode(player.name));
            option.selected = building && (option.value == building.player);
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
            if (building) {
                mapEditor.removeBuilding(building); // just in case
                building.player = parseInt(select.value, 10);
                mapEditor.updateBuilding(building);
            } else {
                building = new Building(x, y, type,
                        parseInt(select.value, 10));
                mapEditor.updateBuilding(building);
            }
        }, false);
        modal.center();
    };
    
    displayUnitForm = function (x, y, type, unit) {
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
            option.selected = unit && (unit.player == i);
            player.appendChild(option);
        }
        form.appendChild(player);
        directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        direction = document.createElement('select');
        for (i = 0; i < directions.length; i++) {
            option = document.createElement('option');
            option.value = i;
            option.appendChild(document.createTextNode(directions[i]));
            option.selected = unit && (unit.direction == i);
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
            if (unit) {
                unit.player = parseInt(player.value, 10);
                unit.direction = parseInt(direction.value, 10);
                unit.action = 2;
                mapEditor.updateUnit(unit);
            } else {
                mapEditor.updateUnit(new Unit(x, y,
                        parseInt(direction.value, 10), type,
                        parseInt(player.value, 10)));
            }
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
        var x, y, mapData, building, unit;
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
                    switch (mapEditor.getBrushMode()) {
                        case 0:
                            displayBuildingForm(x, y, brush.type);
                            break;
                        case 1:
                            building = mapEditor.getMap().getObjectAt(x, y);
                            if (building) {
                                displayBuildingForm(x, y, brush.type,
                                        building);
                            }
                            break;
                        case 2:
                            building = mapEditor.getMap().getObjectAt(x, y);
                            if (building) {
                                mapEditor.removeBuilding(building);
                            }
                            break;
                    }
                }
                break;
            case 'units':
                if (mapData[y] && mapData[y][x]) {
                    switch (mapEditor.getBrushMode()) {
                        case 0:
                            displayUnitForm(x, y, brush.type);
                            break;
                        case 1:
                            unit = mapEditor.getMap().getObjectAt(x, y);
                            if (unit) {
                                displayUnitForm(x, y, brush.type, unit);
                            }
                            break;
                        case 2:
                            unit = mapEditor.getMap().getObjectAt(x, y);
                            if (unit) {
                                unit.action = 1;
                                mapEditor.updateUnit(unit);
                            }
                            break;
                    }
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
    
    // init brush mode buttons
    (function () {
        var buttons, i;
        buttons = document.getElementById('tool-modes').
                getElementsByTagName('span');
        for (i = buttons.length; i--;) {
            (function () {
                var index = i;
                buttons[i].addEventListener('click', function () {
                    buttons[mapEditor.getBrushMode()].className = '';
                    buttons[index].className = 'selected';
                    mapEditor.setBrushMode(index);
                }, false);
            }());
        }
    }());
};
