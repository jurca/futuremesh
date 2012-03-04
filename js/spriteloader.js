"use strict";
var SpriteLoader;

require('data.tilesdefinition', 'data.buildingsdefinition',
        'data.unitsdefinition', 'settings', 'colorifier');

SpriteLoader = function () {
    var observers, notifyObservers, loadSprite, indexes, getBaseURL, canvas,
            context, baseUrl, extractTiles, tileWidth, tileHeight,
            extractImage, extractUnits, extractBuildings, colorifier;
    
    observers = [];
    colorifier = new Colorifier();
    
    this.addObserver = function (observer) {
        if (observer instanceof Function) {
            observers.push(observer);
        }
    };
    
    this.load = function () {
        var xhr;
        tileWidth = Math.ceil(Settings.tileWidth);
        tileHeight = Math.ceil(Settings.tileHeight);
        baseUrl = baseUrl || getBaseURL();
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    notifyObservers(0.2);
                    try {
                        indexes = JSON.parse(xhr.responseText);
                        loadSprite();
                    } catch (e) {
                        notifyObservers(-1);
                    }
                } else {
                    notifyObservers(-1);
                }
            }
        };
        xhr.open('GET', baseUrl + 'data/sprite.json', true);
        xhr.send(null);
    };
    
    loadSprite = function () {
        var image;
        image = new Image();
        image.onload = function () {
            canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            notifyObservers(0.7);
            setTimeout(extractTiles, 0);
        };
        image.onabort = function () {
            notifyObservers(-1);
        };
        image.onerror = function () {
            notifyObservers(-1);
        };
        image.onstalled = function () {
            notifyObservers(-1);
        }
        image.onsuspend = function () {
            notifyObservers(-1);
        }
        image.src = baseUrl + 'data/images.png';
    };
    
    extractTiles = function () {
        var i, tile;
        for (i = 0; tile = TilesDefinition.getType(i); i++) {
            tile.imageData = extractImage(tileWidth * i, 0, tileWidth,
                    tileHeight);
        }
        notifyObservers(0.8);
        setTimeout(extractUnits, 0);
    };
    
    extractUnits = function () {
        var i, j, unit, start;
        start = indexes.unitsStart;
        for (i = 0; unit = UnitsDefinition.getType(i); i++) {
            unit.imageData = [];
            unit.playerImages = []
            for (j = 0; j < 8; j++) {
                unit.imageData.push(extractImage(j * tileWidth,
                        start + i * tileHeight, tileWidth, tileHeight));
                unit.playerImages.push(colorifier.colorifyForPlayers(
                        unit.imageData[j], unit.colorify,
                        unit.colorifyDistance));
            }
        }
        notifyObservers(0.9);
        setTimeout(extractBuildings, 0);
    };
    
    extractBuildings = function () {
        var i, building, starts, heights, startY;
        starts = indexes.buildings.ends;
        starts.unshift(0);
        heights = indexes.buildings.heights;
        startY = indexes.buildings.start;
        for (i = 0; building = BuildingsDefinition.getType(i); i++) {
            building.imageData = extractImage(starts[i], startY,
                    starts[i + 1], heights[i]);
            building.playerImages = colorifier.colorifyForPlayers(
                    building.imageData, building.colorify,
                    building.colorifyDistance);
        }
        notifyObservers(1);
    };
    
    extractImage = function (x, y, width, height) {
        var imageCanvas, image;
        imageCanvas = document.createElement('canvas');
        imageCanvas.width = width;
        imageCanvas.height = height;
        imageCanvas.getContext('2d').putImageData(
                context.getImageData(x, y, width, height), 0, 0);
        image = new Image();
        image.src = imageCanvas.toDataURL();
        return image;
    };
    
    getBaseURL = function () {
        var scripts, i, url;
        scripts = document.getElementsByTagName('script');
        for (i = scripts.length; i--;) {
            if (scripts[i].src.match(/^.*spriteloader[.]js/)) {
                url = scripts[i].src;
                url = url.substring(0, url.indexOf('spriteloader.js'));
                url = url.replace(/js\/$/, '');
                return url;
            }
        }
        return '';
    };
    
    notifyObservers = function (progress) {
        var i;
        for (i = observers.length; i--;) {
            observers[i](progress);
        }
    };
};
