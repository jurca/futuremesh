var MiniMap;

MiniMap = function () {
    var map, container, buildingsLayer, unitsLayer, width, height, mapWidth,
            mapHeight, buildingsLayerCtx, unitsLayerCtx, xRatio, yRatio,
            tileWidth, tileHeight, changedTerain, changedBuildings,
            changedUnits, drawTileLine, fill;

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
        var i, building, x1, y1, x2, y2, x3, y3, x4, y4;
        for (i = changedBuildings.length; i--;) {
            building = changedBuildings[i];
            buildingsLayerCtx.globalCompositeOperation = building.type ===
                    false ? 'destination-out' : 'source-over';
            x1 = building.x;
            y1 = building.y;
            x2 = x1 + building.width;
            y2 = y1 + Math.floor(building.width / 2);
            x3 = x1 - Math.floor(building.height / 2);
            y3 = y1 + building.height;
            x4 = x3 + building.width;
            y4 = y3 + Math.floor(building.width / 2);
            buildingsLayerCtx.fillStyle = building.color;
            drawTileLine(x1, y1, x2, y2, buildingsLayerCtx);
            drawTileLine(x1, y1, x3, y3, buildingsLayerCtx);
            drawTileLine(x2, y2, x4, y4, buildingsLayerCtx);
            drawTileLine(x3, y3, x4, y4, buildingsLayerCtx);
            fill(Math.round((x1 + x4) / 2), Math.round((y1 + y4) / 2),
                    buildingsLayerCtx);
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

    fill = function (x, y, ctx, fillColor) {
        var thisColor, random;
        if ((x >= mapWidth) || (x < 0) || (y >= mapHeight) || (y < 0)) {
            return;
        }
        thisColor = ctx.getImageData(x * xRatio + xRatio / 2,
                y * yRatio + yRatio / 2, 1, 1).data;
        thisColor = thisColor[0] + ',' + thisColor[1] + ',' + thisColor[2] +
                ',' + thisColor[3];
        if (fillColor === undefined) {
            fillColor = thisColor;
        }
        if (thisColor == fillColor) {
            random = Math.round(Math.random() * 155) + 50;
            ctx.fillRect(x * xRatio, y * yRatio, xRatio, yRatio);
            fill(x - 1, y, ctx, fillColor);
            fill(x + 1, y, ctx, fillColor);
            fill(x, y - 1, ctx, fillColor);
            fill(x, y + 1, ctx, fillColor);
        }
    };

    drawTileLine = function (x1, y1, x2, y2, ctx) {
        var len, vx, vy;
        vx = x2 - x1;
        vy = y2 - y1;
        len = Math.sqrt(vx * vx + vy * vy);
        vx /= len;
        vy /= len;
        ctx.fillRect(xRatio * Math.floor(x1), yRatio * Math.floor(y1),
                xRatio, yRatio);
        do {
            x1 += vx;
            y1 += vy;
            ctx.fillRect(xRatio * Math.round(x1), yRatio * Math.round(y1),
                    xRatio, yRatio);
        } while ((Math.round(x1) != x2) && (Math.round(y1) != y2))
    };
};