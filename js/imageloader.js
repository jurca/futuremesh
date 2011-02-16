var ImageLoader;
require('settings', '../data/settings');

ImageLoader = function () {
    var loadBuildingImages, notifyObservers, buildingsIndex, observers,
            unitsIndex, loadUnitImages, tilesIndex, loadTilesImages,
            transformTileImage, pathPrefix, transformBuildingImage;

    observers = [];
    pathPrefix = '';

    this.load = function (buildings, units, tiles) {
        loadBuildingImages(buildings);
        loadUnitImages(units);
        loadTilesImages(tiles);
    };

    this.addObserver = function (observer) {
        observers.push(observer);
    };

    this.setPathPrefix = function (prefix) {
        pathPrefix = prefix;
    };

    loadTilesImages = function (tiles) {
        var tile, currentType;
        tilesIndex = [];
        currentType = 0;
        tile = tiles.getType(currentType);
        while (tile) {
            tilesIndex.push(false);
            (function () {
                var image, type, tileDefinition;
                tileDefinition = tile;
                type = currentType;
                image = new Image();
                image.onload = function () {
                    tilesIndex[type] = true;
                    tileDefinition.imageData = Settings.tileImagesTransformed ?
                            image : transformTileImage(image);
                    notifyObservers();
                };
                image.src = pathPrefix + tile.image;
            }());
            tile = tiles.getType(++currentType);
        }
    };

    loadUnitImages = function (units) {
        var unit, currentType;
        unitsIndex = [];
        currentType = 0;
        unit = units.getType(currentType);
        while (unit) {
            unitsIndex.push(false);
            (function () {
                var images, image, type, i, loadedImages, unitDefinition;
                unitDefinition = unit;
                type = currentType;
                images = [];
                loadedImages = [];
                for (i = 8; i--;) {
                    loadedImages[i] = false;
                    image = new Image();
                    (function () {
                        var index;
                        index = i;
                        image.onload = function () {
                            var i;
                            loadedImages[index] = true;
                            for (i = 8; i--;) {
                                if (!loadedImages[i]) {
                                    return;
                                }
                            }
                            if (!Settings.unitImagesTransformed) {
                                for (i = 8; i--;) {
                                    images[i] = transformTileImage(images[i]);
                                }
                            }
                            unitsIndex[type] = true;
                            unitDefinition.imageData = images;
                            notifyObservers();
                        };
                    }());
                    images[i] = image;
                }
                for (i = 8; i--;) {
                    images[i].src = pathPrefix + unit.image.replace('?', i);
                }
            }());
            unit = units.getType(++currentType);
        }
    };

    loadBuildingImages = function (buildings) {
        var building, currentType;
        buildingsIndex = [];
        currentType = 0;
        building = buildings.getType(currentType);
        while (building) {
            buildingsIndex.push(false);
            (function () {
                var image, type, buildingDefinition;
                buildingDefinition = building;
                type = currentType;
                image = new Image();
                image.onload = function () {
                    buildingsIndex[type] = true;
                    buildingDefinition.imageData =
                            Settings.buildingImagesTransformed ?
                            image : transformBuildingImage(image);
                    notifyObservers();
                };
                image.src = pathPrefix + building.image;
            }());
            building = buildings.getType(++currentType);
        }
    };

    notifyObservers = function () {
        var i, done;
        done = 0;
        for (i = buildingsIndex.length; i--;) {
            if (buildingsIndex[i]) {
                done++;
            }
        }
        for (i = unitsIndex.length; i--;) {
            if (unitsIndex[i]) {
                done++;
            }
        }
        for (i = tilesIndex.length; i--;) {
            if (tilesIndex[i]) {
                done++;
            }
        }
        done /= buildingsIndex.length + unitsIndex.length + tilesIndex.length;
        for (i = observers.length; i--;) {
            observers[i](done);
        }
    };

    transformBuildingImage = function (source) {
        throw new Error('not yet implemented');
    };

    transformTileImage = function (source) {
        var canvas, context, data;
        canvas = document.createElement('canvas');
        canvas.width = 7 + Math.ceil(Settings.tileWidth * 2);
        canvas.height = 22 + Math.ceil(Settings.tileHeight * 2);
        context = canvas.getContext('2d');
        context.scale(1, Settings.heightScale);
        context.rotate(45 * Math.PI / 180);
        context.drawImage(source, 30, 0);
        data = context.getImageData(7, 20 * Settings.heightScale,
                Settings.tileWidth, Settings.tileHeight);
        canvas = document.createElement('canvas');
        canvas.width = data.width;
        canvas.height = data.height;
        context = canvas.getContext('2d');
        context.putImageData(data, 0, 0);
        data = new Image();
        data.src = canvas.toDataURL();
        return data;
    };
};