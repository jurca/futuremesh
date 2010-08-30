var MiniMap;

MiniMap = function () {
    var map, container, buildingsLayer, unitsLayer, buildingsList,
            buildingsAsoc, unitsList, unitsAsoc, width, height, mapWidth,
            mapHeight, buildingsLayerCtx, unitsLayerCtx, xRatio, yRatio,
            tileWidth, tileHeight, changedTerain, changedBuildings,
            changedUnits;

    map = [];
    buildingsLayer = document.createElement('canvas');
    buildingsLayerCtx = buildingsLayer.getContext('2d');
    buildingsList = [];
    buildingsAsoc = [];
    unitsLayer = document.createElement('canvas');
    unitsLayerCtx = unitsLayer.getContext('2d');
    unitsList = [];
    unitsAsoc = [];
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
        buildingsAsoc = this.createAsocIndex();
        unitsAsoc = this.createAsocIndex();
        if (container) {
            this.initRenderer();
            this.renderMap();
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
            this.renderMap();
        }
    };

    this.createAsocIndex = function () {
        var i, index;
        index = new Array(mapHeight);
        for (i = mapHeight; i--;) {
            index[i] = new Array(mapWidth);
        }
        return index;
    };

    this.initRenderer = function () {
        xRatio = width / mapWidth;
        yRatio = height / mapHeight;
        tileWidth = Math.ceil(xRatio);
        tileHeight = Math.ceil(yRatio);
        changedTerain = true;
        changedBuildings = true;
        changedUnits = true;
    };

    this.renderMap = function () {
        changedTerain && this.renderTerainLayer();
    };

    this.renderUnitsLayer = function () {
        // TODO
    };

    this.renderBuildingsLayer = function () {
        // TODO
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