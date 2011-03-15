var ImageLoader;
require('settings', '../data/settings');

/**
 * Utility for loading images of tiles, buildings and units and providing info
 * about loading progress. If the tiles', buildings' or units' images are not
 * pre-rotated, this utility will auto-rotate them.
 */
ImageLoader = function () {
    var loadBuildingImages, notifyObservers, buildingsIndex, observers,
            unitsIndex, loadUnitImages, tilesIndex, loadTilesImages,
            transformTileImage, pathPrefix, transformBuildingImage;

    observers = [];
    pathPrefix = '';

    /**
     * Begins the loading procedure.
     *
     * @param {BuildingsDefinition} buildings The BuildingsDefinition class.
     * @param {UnitsDefinition} units The UnitsDefinition class.
     * @param {TilesDefinition} tiles The TilesDefinition class.
     */
    this.load = function (buildings, units, tiles) {
        loadBuildingImages(buildings);
        loadUnitImages(units);
        loadTilesImages(tiles);
    };

    /**
     * Rgisters an observer function that will be notified on each progress
     * of loading.
     *
     * @param {Function} observer The observer function that should be executed
     *        when the loading process progresses. This function receives
     *        single parameter - a Number from the [0,1] interval. The value
     *        will be 1 once the loading process is complete.
     */
    this.addObserver = function (observer) {
        observers.push(observer);
    };

    /**
     * Sets path prefix that will be used with paths to tiles', buildings' and
     * units' images.
     *
     * @param {String} prefix The prefix that should be prepended to all paths.
     */
    this.setPathPrefix = function (prefix) {
        pathPrefix = prefix;
    };

    /**
     * Starts loading of tiles' images.
     *
     * @param {TilesDefinition} tiles The TilesDefinition class.
     */
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

    /**
     * Starts loading units' images.
     *
     * @param {UnitsDefinition} units The UnitsDefinition class.
     */
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

    /**
     * Starts loading building's images.
     *
     * @param {BuildingsDefinition} buildings The BuildingsDefinition class.
     */
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
                            image : transformBuildingImage(image,
                            buildingDefinition.width,
                            buildingDefinition.height);
                    notifyObservers();
                };
                image.src = pathPrefix + building.image;
            }());
            building = buildings.getType(++currentType);
        }
    };

    /**
     * Executes all registered observers, passing them the current progress
     * through single parameter in form of a Number from range [0,1], where 1
     * means that all images has been loaded.
     */
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

    /**
     * Transforms raw building's image by rotating it by 25 degrees clockwise.
     *
     * @param {Image} source The raw image to transform.
     * @param {Number} width The width of the building in tiles.
     * @param {Number} height The height of the building in tiles.
     * @return {Image} A transformed image.
     */
    transformBuildingImage = function (source, width, height) {
        var canvas, context, data;
        canvas = document.createElement('canvas');
        canvas.width = 14 + Math.ceil(Settings.tileWidth * width);
        canvas.height = 50 + Math.ceil(Settings.tileHeight * height);
        context = canvas.getContext('2d');
        context.scale(1, Settings.heightScale);
        context.rotate(45 * Math.PI / 180);
        context.drawImage(source, 10 + Settings.tileSize * width, 0);
        data = context.getImageData(7, 48 * Settings.heightScale,
                Settings.tileWidth * width, Settings.tileHeight * height);
        canvas = document.createElement('canvas');
        canvas.width = data.width;
        canvas.height = data.height;
        context = canvas.getContext('2d');
        context.putImageData(data, 0, 0);
        data = new Image();
        data.src = canvas.toDataURL();
        return data;
    };

    /**
     * Transforms raw tiles's / unit's image by rotating it by 25 degrees
     * clockwise.
     *
     * @param {Image} source The raw image to transform.
     * @return {Image} A transformed image.
     */
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