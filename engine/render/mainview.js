"use strict";
var MainView;

/**
 * Unifying class handling the rendering of terrain, buildings and units
 * layers.
 */
MainView = function () {
    var terrainLayer, buildingsLayer, unitsLayer, sfxLayer;

    /**
     * Sets rendering canvas for terrain layer, buildings layer and units
     * layer.
     *
     * @param {HTMLCanvasElement} viewCanvas The canvas for the renderers.
     */
    this.setCanvas = function (viewCanvas) {
        terrainLayer = new TerrainLayer();
        terrainLayer.setCanvas(viewCanvas);
        buildingsLayer = new BuildingsLayer();
        buildingsLayer.setCanvas(viewCanvas);
        unitsLayer = new UnitsLayer();
        unitsLayer.setCanvas(viewCanvas);
        sfxLayer = new SFX();
        sfxLayer.setCanvas(viewCanvas);
    };

    /**
     * Sets the map for the renderer layers.
     *
     * @param {Map} map The map instance.
     */
    this.setMap = function (map) {
        if (!terrainLayer) {
            throw new Error('Cannot set map before canvas');
        }
        terrainLayer.setMap(map.getMap());
        buildingsLayer.setMap(map);
        unitsLayer.setMap(map);
        sfxLayer.setMap(map);
        terrainLayer.init();
    };

    /**
     * Displays the view using all renderers.
     *
     * @param {Number} x The X-coordinate offset for renderers.
     * @param {Number} y The Y-coordinate offset for renderers.
     */
    this.display = function (x, y) {
        terrainLayer.display(x, y);
        buildingsLayer.display(x, y);
        unitsLayer.display(x, y);
        sfxLayer.display(x, y);
    };

    /**
     * Event handler for changes about buildings - adding or removing of a
     * building.
     *
     * @param {Building} building Building which status has changed.
     */
    this.onBuildingChange = function (building) {
        if (building.type === false) {
            buildingsLayer.onBuildingRemoved(building);
        } else {
            buildingsLayer.onBuildingAdded(building);
        }
    };

    /**
     * Event handler for changes about units - adding, removing or unit
     * movements.
     *
     * @param {Unit} unit The unit which status has changed.
     */
    this.onUnitChange = function (unit) {
        unitsLayer.onUnitChange(unit);
    };

    /**
     * Returns dimensions of the layers' inner buffer in pixels.
     *
     * @return {Object} Object with properties width and height containing
     *         dimensions of inner buffers in pixels.
     */
    this.getLayersDimensions = function () {
        if (!terrainLayer) {
            throw new Error('Layers has not been initialized yet');
        }
        return terrainLayer.getBufferDimensions();
    };
};