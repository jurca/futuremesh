var MiniMap;
require('map', 'tile', 'building', 'unit');

/**
 * The minimap renderer. Uses passive rendering - renderes only changes from
 * the previous renderered state.
 */
MiniMap = function () {
    var map, container, buildingsLayer, unitsLayer, width, height, mapWidth,
            mapHeight, buildingsLayerCtx, unitsLayerCtx, xRatio, yRatio,
            tileWidth, tileHeight, changedTerrain, changedBuildings,
            changedUnits, drawTileLine, fill, buildingsLayerIndex, createIndex,
            xRatioC, yRatioC, initRenderer, renderUnitsLayer,
            renderBuildingsLayer, renderTerrainLayer, terrainLayer,
            terrainLayerCtx;

    map = [];
    terrainLayer = document.createElement('canvas');
    terrainLayerCtx = terrainLayer.getContext('2d');
    buildingsLayer = document.createElement('canvas');
    buildingsLayerCtx = buildingsLayer.getContext('2d');
    unitsLayer = document.createElement('canvas');
    unitsLayerCtx = unitsLayer.getContext('2d');
    changedTerrain = false;
    changedBuildings = false;
    changedUnits = false;

    /**
     * Sets the raw map data and initializes the renderer.
     *
     * @param {Array} newMap The raw map data.
     */
    this.setMap = function (newMap) {
        if (!(newMap instanceof Array) || !newMap[0] ||
                !(newMap[0] instanceof Array)) {
            throw new Error("invalid format of map");
        }
        map = newMap;
        mapHeight = map.length;
        mapWidth = map[0].length;
        if (container) {
            initRenderer();
        }
    };

    /**
     * Sets the container in which the minimap should be rendered. The renderer
     * will place additional canvases into the container that will be used to
     * render the separate layers of the minimap. Then the renderer is
     * intialized.
     *
     * @param {HTMLElement} newContainer The container which shall be used to
     *        render the minimap.
     */
    this.setContainer = function (newContainer) {
        if (!(newContainer instanceof HTMLElement)) {
            throw new Error("container must be an HTML element");
        }
        container = newContainer;
        width = container.offsetWidth;
        height = container.offsetHeight;
        terrainLayer.width = buildingsLayer.width = unitsLayer.width = width;
        terrainLayer.height = buildingsLayer.height = unitsLayer.height =
                height;
        newContainer = document.createElement('div');
        newContainer.style.height = '0px';
        newContainer.appendChild(terrainLayer);
        container.appendChild(newContainer);
        newContainer = document.createElement('div');
        newContainer.style.height = '0px';
        newContainer.appendChild(buildingsLayer);
        container.appendChild(newContainer);
        container.appendChild(unitsLayer);
        if (mapWidth) {
            initRenderer();
        }
    };

    /**
     * Event handler of change of building (creation or destruction).
     *
     * @param {Building} building The building which status has changed.
     */
    this.onBuildingChange = function (building) {
        changedBuildings.push(building);
    };

    /**
     * Event handler of change of unit (creation, destruction or movement).
     *
     * @param {Unit} unit The unit which status has changed.
     */
    this.onUnitChange = function (unit) {
        changedUnits.push(unit);
    };

    /**
     * Renders the registered changes of buildings and units. If the terrain
     * has not been rendered so far, it is rendered too.
     */
    this.render = function () {
        changedTerrain && renderTerrainLayer();
        changedBuildings.length && renderBuildingsLayer();
        changedUnits.length && renderUnitsLayer();
    };

    /**
     * Renders changes in the unit's layer.
     */
    renderUnitsLayer = function () {
        var i, unit;
        for (i = changedUnits.length; i--;) {
            unit = changedUnits[i];
            unitsLayerCtx.fillStyle = unit.color;
            switch (unit.action) {
                case 2:
                    unitsLayerCtx.globalCompositeOperation = 'destination-out';
                    unitsLayerCtx.fillRect(unit.lastX * xRatio,
                            unit.lastY * yRatio, xRatioC, yRatioC);
                case 0:
                    unitsLayerCtx.globalCompositeOperation = 'source-over';
                    unitsLayerCtx.fillRect(unit.x * xRatio, unit.y * yRatio,
                            xRatioC, yRatioC);
                    break;
                case 1:
                    unitsLayerCtx.globalCompositeOperation = 'destination-out';
                    unitsLayerCtx.fillRect(unit.x * xRatio, unit.y * yRatio,
                            xRatioC, yRatioC);
                    break;
            }
        }
        changedUnits = [];
    };

    /**
     * Renders the changes in the buildings layer.
     */
    renderBuildingsLayer = function () {
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

    /**
     * Renders the terrain layer.
     */
    renderTerrainLayer = function () {
        var i, j, row;
        for (i = map.length; i--;) {
            row = map[i];
            for (j = row.length; j--;) {
                terrainLayerCtx.fillStyle = row[j].minimap;
                terrainLayerCtx.fillRect(xRatio * j, yRatio * i,
                        tileWidth, tileHeight);
            }
        }
        changedTerrain = false;
    };

    /**
     * Creates index used by the renderer for storing positions of units or
     * buildings.
     *
     * @return {Array} The two-dimensional array index.
     */
    createIndex = function () {
        var index, i, j;
        index = new Array(mapWidth);
        for (i = mapWidth; i--;) {
            index[i] = new Array(mapHeight);
            for (j = mapHeight; j--;) {
                index[i][j] = false;
            }
        }
        return index;
    };

    /**
     * Fills the area of tiles on the minimap. The area is defined by the tiles
     * of the same color.
     *
     * @param {Number} x The X coordinate of the tile position where the
     *        filling should be performed.
     * @param {Number} y The Y coordinate of the tile position where the
     *        filling should be performed.
     * @param {CanvasRenderingContext2D} ctx The 2D context of the canvas for
     *        rendering.
     * @param {fillColor} fillColor The color that should be used to color the
     *        area.
     */
    fill = function (x, y, ctx, fillColor) {
        var thisColor;
        if ((x >= mapWidth) || (x < 0) || (y >= mapHeight) || (y < 0)) {
            return;
        }
        thisColor = buildingsLayerIndex[x][y];
        if (fillColor === undefined) {
            fillColor = thisColor;
        }
        if (thisColor == fillColor) {
            ctx.fillRect(x * xRatio, y * yRatio, xRatioC, yRatioC);
            buildingsLayerIndex[x][y] = !buildingsLayerIndex[x][y];
            fill(x - 1, y, ctx, fillColor);
            fill(x + 1, y, ctx, fillColor);
            fill(x, y - 1, ctx, fillColor);
            fill(x, y + 1, ctx, fillColor);
        }
    };

    /**
     * Draw a line of tiles onto the canvas.
     *
     * @param {Number} x1 The starting X coordinate.
     * @param {Number} y1 The starting Y coordinate.
     * @param {Number} x2 The ending X coordinate.
     * @param {Number} y2 The ending Y coordinate.
     * @param {CanvasRenderingContext2D} ctx The 2D context of the canvas to be
     *        used for rendering.
     */
    drawTileLine = function (x1, y1, x2, y2, ctx) {
        var len, vx, vy, rx, ry;
        vx = x2 - x1;
        vy = y2 - y1;
        len = Math.sqrt(vx * vx + vy * vy);
        vx /= len;
        vy /= len;
        ctx.fillRect(xRatio * Math.round(x1), yRatio * Math.round(y1),
                xRatioC, yRatioC);
        do {
            x1 += vx;
            y1 += vy;
            rx = Math.round(x1);
            ry = Math.round(y1);
            if (buildingsLayerIndex[rx] &&
                    (buildingsLayerIndex[rx][ry] !== undefined)) {
                buildingsLayerIndex[rx][ry] = true;
                ctx.fillRect(xRatio * rx, yRatio * ry, xRatioC, yRatioC);
            }
        } while ((Math.round(x1) != x2) && (Math.round(y1) != y2))
    };

    /**
     * Initalizes the renderer - scaling, tile sizes and private properties.
     */
    initRenderer = function () {
        xRatio = width / mapWidth;
        yRatio = height / mapHeight;
        xRatioC = Math.ceil(xRatio);
        yRatioC = Math.ceil(yRatio);
        tileWidth = Math.ceil(xRatio);
        tileHeight = Math.ceil(yRatio);
        changedTerrain = true;
        changedBuildings = [];
        changedUnits = [];
        buildingsLayerIndex = createIndex();
    };
};