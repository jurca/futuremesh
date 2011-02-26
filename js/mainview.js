var MainView;
require('terrainlayer', 'buildingslayer', 'unitslayer', 'tile', 'building',
        'unit', 'map');

MainView = function () {
    var terrainLayer, buildingsLayer, unitsLayer;

    this.setCanvases = function (terrainCanvas, buildingsCanvas, unitsCanvas) {
        terrainLayer = new TerrainLayer();
        terrainLayer.setCanvas(terrainCanvas);
        buildingsLayer = new BuildingsLayer();
        buildingsLayer.setCanvas(buildingsCanvas);
        unitsLayer = new UnitsLayer();
        unitsLayer.setCanvas(unitsCanvas);
    };

    this.setMap = function (map) {
        if (!terrainLayer) {
            throw new Error('Cannot set map before canvas');
        }
        if (map instanceof Map) {
            map = map.getMap();
        }
        terrainLayer.setMap(map);
        buildingsLayer.setMap(map);
        unitsLayer.setMap(map);
        terrainLayer.init();
    };

    this.display = function (x, y) {
        terrainLayer.display(x, y);
        buildingsLayer.display(x, y);
        unitsLayer.display(x, y);
    };

    this.onBuildingChange = function (building) {
        if (building.type === false) {
            buildingsLayer.onBuildingRemoved(building);
        } else {
            buildingsLayer.onBuildingAdded(building);
        }
    };

    this.onUnitChange = function (unit) {
        unitsLayer.onUnitChange(unit);
    };

    this.getLayersDimensions = function () {
        if (!terrainLayer) {
            throw new Error('Layers has not been initialized yet');
        }
        return terrainLayer.getBufferDimensions();
    };
};