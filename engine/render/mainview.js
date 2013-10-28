"use strict";
var MainView;

/**
 * Unifying class handling the rendering of terrain, buildings and units
 * layers.
 */
MainView = function () {
    var terrainBuildingsLayer, unitsLayer, sfxLayer;

    /**
     * Sets rendering canvas for terrain layer, buildings layer and units
     * layer.
     *
     * @param {HTMLCanvasElement} viewCanvas The canvas for the renderers.
     */
    this.setCanvas = function (viewCanvas) {
        terrainBuildingsLayer = new TerrainBuildingsLayer();
        terrainBuildingsLayer.setCanvas(viewCanvas);
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
        if (!terrainBuildingsLayer) {
            throw new Error('Cannot set map before canvas');
        }
        terrainBuildingsLayer.setMap(map);
        unitsLayer.setMap(map);
        sfxLayer.setMap(map);
        terrainBuildingsLayer.init();
    };

    /**
     * Displays the view using all renderers.
     *
     * @param {Number} x The X-coordinate offset for renderers.
     * @param {Number} y The Y-coordinate offset for renderers.
     */
    this.display = function (x, y) {
        terrainBuildingsLayer.display(x, y);
        unitsLayer.display(x, y);
        sfxLayer.display(x, y);
    };

    /**
     * Handles a creation of a new building on the map.
     *
     * @param {Building} building Building which was just added to the map.
     */
    this.onBuildingAdded = function (building) {
        terrainBuildingsLayer.onBuildingAdded(building);
    };

    /**
     * Handles a destruction of the provided building on the map.
     *
     * @param {Building} building Building which was just removed from the map.
     */
    this.onBuildingRemoved = function (building) {
        terrainBuildingsLayer.onBuildingRemoved(building);
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
        if (!terrainBuildingsLayer) {
            throw new Error("Layer renderers have not been initialized yet");
        }
        return terrainBuildingsLayer.getBufferDimensions();
    };
};