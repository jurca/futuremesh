"use strict";
var ImgBuilder;

ImgBuilder = function () {
    var $, canvas, context, code, addTiles, addBuildings, addUnits,
            buildSprite, tiles, buildings, units, indexes, buildingOffsets,
            buildingHeights, buildingsStart;

    $ = function (selector) {
        return document.querySelectorAll(selector);
    };

    canvas = $('canvas')[0];
    context = canvas.getContext('2d');
    code = $('textarea')[0];
    indexes = $('#indexes')[0];

    $('button')[0].addEventListener('click', function (e) {
        var loader;
        e.preventDefault();
        $('button')[0].disabled = true;
        $('button')[0].innerHTML = 'Generating...';
        loader = new ImageLoader();
        code.value += 'Loading images... ';
        loader.addObserver(function (percent) {
            code.value += Math.round(percent * 100) + '% ';
            if (percent == 1) {
                code.value += 'Done\n';
                setTimeout(addTiles, 10);
            }
        });
        loader.setPathPrefix('../');
        loader.load(BuildingsDefinition, UnitsDefinition, TilesDefinition);
    }, false);

    addTiles = function () {
        var i, tile;
        code.value += 'Exporting tiles... ';
        canvas.height = Math.ceil(Settings.tileHeight);
        for (i = 0; tile = TilesDefinition.getType(i); i++) {}
        canvas.width = Math.ceil(Settings.tileWidth) * i;
        context = canvas.getContext('2d');
        for (i = 0; tile = TilesDefinition.getType(i); i++) {
            context.drawImage(tile.imageData,
                    i * Math.ceil(Settings.tileWidth), 0);
        }
        tiles = context.getImageData(0, 0, canvas.width, canvas.height);
        code.value += 'Done\n';
        setTimeout(addBuildings, 10);
    };

    addBuildings = function () {
        var i, building, height, width, x;
        code.value += 'Exporting buildings... ';
        height = 0;
        width = 0;
        buildingOffsets = [];
        buildingHeights = [];
        for (i = 0; building = BuildingsDefinition.getType(i); i++) {
            height = Math.max(height, Math.ceil(building.imageData.height));
            width += Math.ceil(building.imageData.width);
            buildingOffsets.push(Math.ceil(building.imageData.width));
            buildingHeights.push(Math.ceil(building.imageData.height));
        }
        canvas.width = width;
        canvas.height = height;
        x = 0;
        for (i = 0; building = BuildingsDefinition.getType(i); i++) {
            context.drawImage(building.imageData, x, 0);
            x += building.imageData.width;
        }
        buildings = context.getImageData(0, 0, canvas.width, canvas.height);
        code.value += 'Done\n';
        setTimeout(addUnits, 10);
    };

    addUnits = function () {
        var i, j, unit, unitCount;
        code.value += 'Exporting units... ';
        for (i = 0; UnitsDefinition.getType(i); i++);
        canvas.width = Math.ceil(Settings.tileWidth) * 8;
        canvas.height = Math.ceil(Settings.tileHeight) * i;
        for (i = 0; unit = UnitsDefinition.getType(i); i++) {
            for (j = 0; j < 8; j++) {
                context.drawImage(unit.imageData[j],
                        Math.ceil(Settings.tileWidth) * j,
                        Math.ceil(Settings.tileHeight) * i);
            }
        }
        units = context.getImageData(0, 0, canvas.width, canvas.height);
        code.value += 'Done\n';
        setTimeout(buildSprite, 10);
    };

    buildSprite = function () {
        var width, height, img;
        code.value += 'Building sprite... ';
        width = Math.max(tiles.width, Math.max(units.width, buildings.width));
        height = tiles.height + buildings.height + units.height;
        canvas.width = width;
        canvas.height = height;
        context.putImageData(tiles, 0, 0);
        context.putImageData(units, 0, tiles.height);
        buildingsStart = tiles.height + units.height;
        context.putImageData(buildings, 0, buildingsStart);
        img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.style.border = '1px solid black';
        canvas.parentNode.replaceChild(img, canvas);
        indexes.value = JSON.stringify({
            unitsStart: tiles.height,
            buildings: {
                start: buildingsStart,
                ends: buildingOffsets,
                heights: buildingHeights
            }
        }, undefined, 4);
        code.value += 'Done';
    };

    code.value += 'Ready.\n';
};

addEventListener('DOMContentLoaded', function () {
    new ImgBuilder();
}, false);
