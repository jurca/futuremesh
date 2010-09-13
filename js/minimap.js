var MiniMap;

MiniMap = function () {
    var map, container, buildingsLayer, unitsLayer, width, height, mapWidth,
            mapHeight, buildingsLayerCtx, unitsLayerCtx, xRatio, yRatio,
            tileWidth, tileHeight, changedTerain, changedBuildings,
            changedUnits;

    map = [];
    buildingsLayer = document.createElement('canvas');
    buildingsLayerCtx = buildingsLayer.getContext('2d');
    unitsLayer = document.createElement('canvas');
    unitsLayerCtx = unitsLayer.getContext('2d');
    changedTerain = false;
    changedBuildings = false;
    changedUnits = false;

    this.setMap = function (newMap) {
        if (!(newMap instanceof Array) || !newMap[0] ||
                !(newMap[0] instanceof Array)) {
            throw new Error("invalid format of map");
        }
        map = newMap;
        mapHeight = map.length;
        mapWidth = map[0].length;
        if (container) {
            this.initRenderer();
        }
    };

    this.setContainer = function (newContainer) {
        if (!(newContainer instanceof HTMLElement)) {
            throw new Error("container must be an HTML element");
        }
        container = newContainer;
        width = container.offsetWidth;
        height = container.offsetHeight;
        buildingsLayer.width = unitsLayer.width = width;
        buildingsLayer.height = unitsLayer.height = height;
        unitsLayer.style.marginTop = -height + 'px';
        container.appendChild(buildingsLayer);
        container.appendChild(unitsLayer);
        if (mapWidth) {
            this.initRenderer();
        }
    };

    this.initRenderer = function () {
        xRatio = width / mapWidth;
        yRatio = height / mapHeight;
        tileWidth = Math.ceil(xRatio);
        tileHeight = Math.ceil(yRatio);
        changedTerain = true;
        changedBuildings = [];
        changedUnits = [];
    };

    this.onBuildingAdded = function (building) {
        changedBuildings.push(building);
    };

    this.onBuildingRemoved = function (building) {
        changedBuildings.push(building);
    };

    this.render = function () {
        changedTerain && this.renderTerainLayer();
        changedBuildings.length && this.renderBuildingsLayer();
        changedUnits.length && this.renderUnitsLayer();
    };

    this.renderUnitsLayer = function () {
        // TODO
        changedUnits = false;
    };

    this.renderBuildingsLayer = function () {
        var i, building, x, y, width, offset, top, middle, totalHeight;
        for (i = changedBuildings.length; i--;) {
            building = changedBuildings[i];
            buildingsLayerCtx.fillStyle = building.color;
            if (building.height < (building.width / 2)) {
                top = building.height;
                middle = Math.floor(building.width / 2);
            } else {
                top = Math.floor(building.width / 2);
                middle = building.height;
            }
            totalHeight = Math.floor(building.height + building.width / 2);
            for (y = totalHeight; y--;) {
                if (y >= middle) {
                    buildingsLayerCtx.fillStyle = '#f00';
                    width = Math.floor((totalHeight - y) / (totalHeight - middle) * building.width);
                } else if (y >= top) {
                    buildingsLayerCtx.fillStyle = '#0f0';
                    width = building.width;
                } else {
                    buildingsLayerCtx.fillStyle = '#00f';
                    width = Math.floor(y / (top - 1) * building.width);
                }
                if (y >= building.height) {
                    if (building.height < (building.width / 2)) {
                        offset = building.x - Math.floor(building.height / 2) +
                                Math.floor(building.width * (y -
                                building.height) / (totalHeight -
                                building.height - 1));
                    } else {
                        offset = building.x + Math.floor(building.width *
                                (y - totalHeight) / (totalHeight -
                                Math.floor(building.width / 2))) +
                                Math.floor((y - totalHeight) / 2) +
                                Math.floor(building.width / 4) + 1;
                    }
                } else {
                    offset = building.x - Math.floor(y / 2);
                }
                buildingsLayerCtx.fillRect(xRatio * offset, yRatio *
                        (building.y + y), tileWidth * width, tileHeight);
            }
        }
        changedBuildings = [];
    };

    this.renderTerainLayer = function () {
        var i, j, row;
        for (i = map.length; i--;) {
            row = map[i];
            for (j = row.length; j--;) {
                buildingsLayerCtx.fillStyle = row[j].minimap;
                buildingsLayerCtx.fillRect(xRatio * j, yRatio * i,
                        tileWidth, tileHeight);
            }
        }
        container.style.backgroundImage = 'url(' + buildingsLayer.toDataURL() +
                ')';
        buildingsLayerCtx.clearRect(0, 0, width, height);
        changedTerain = false;
    };
};