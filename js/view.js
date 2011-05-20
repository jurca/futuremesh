"use strict";
var View;
require('mainview', 'minimap');

View = function () {
    var mainview, minimap;

    this.setCanvases = function (terrainCanvas, buildingsCanvas, unitsCanvas) {
        mainview = new MainView();
        mainview.setCanvases(terrainCanvas, buildingsCanvas, unitsCanvas);
    };

    this.setMinimapContainer = function (container) {
        minimap = new MiniMap();
        minimap.setContainer(container);
    };

    this.setMap = function (map) {
        if (!mainview || !minimap) {
            throw new Error('Cannot set map befor canvases and minimap ' +
                    'container');
        }
        if (map instanceof Map) {
            map = map.getMap();
        }
        mainview.setMap(map);
        minimap.setMap(map);
    };

    this.onBuildingChange = function (building) {
        mainview.onBuildingChange(building);
        minimap.onBuildingChange(building);
    };

    this.onUnitChange = function (unit) {
        mainview.onUnitChange(unit);
        minimap.onUnitChange(unit);
    };

    this.display = function (x, y) {
        mainview.display(x, y);
        minimap.render();
    };

    this.getMainViewLayersDimensions = function () {
        return mainview.getLayersDimensions();
    };
};