var ImageLoader;

ImageLoader = function () {
    var loadBuildingImages, notifyObservers, buildingsIndex, observers,
            unitsIndex, loadUnitImages, tilesIndex, loadTilesImages;

    observers = [];

    this.load = function (buildings, units, tiles) {
        loadBuildingImages(buildings);
        loadUnitImages(units);
        loadTilesImages(tiles);
    };

    this.addObserver = function (observer) {
        observers.push(observer);
    };

    loadTilesImages = function (tiles) {
        var tile, currentType;
        tilesIndex = [];
        currentType = 0;
        tile = tiles.getType(currentType);
        while (tile) {
            tiles.push(false);
            (function () {
                var image, type, tileDefinition;
                tileDefinition = tile;
                type = currentType;
                image = new Image();
                image.onload = function () {
                    tilesIndex[type] = true;
                    tileDefinition.imageData = image;
                    notifyObservers();
                };
                image.src = tile.image;
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
                var images, image, type, i, loadedImages;
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
                            unitsIndex[type] = true;
                            unit.imageData = images;
                            notifyObservers();
                        };
                    }());
                    images[i] = image;
                }
                for (i = 8; i--;) {
                    images[i].src = unit.image.replace('?', i);
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
                    buildingDefinition.imageData = image;
                    notifyObservers();
                };
                image.src = building.image;
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
        done /= buildingsIndex.length + unitsIndex.length;
        for (i = observers.length; i--;) {
            observers[i](done);
        }
    };
};