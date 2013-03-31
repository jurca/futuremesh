"use strict";
var MapEditorView;

/**
 * Unifying class handling the rendering of terrain, buildings and units
 * layers. Unline the MainView class, this view can be used to enable or
 * disable each renderer without disrupting any other.
 */
MapEditorView = function () {
    var terrainLayer, buildingsLayer, unitsLayer, sfxLayer, enableTerrain,
            enableBuildings, enableUnits, enableSFX, viewCanvas,
            enableBuildable, enableNavigationIndex;

    enableTerrain = true;
    enableBuildings = true;
    enableUnits = true;
    enableSFX = true;
    enableBuildable = false;
    enableNavigationIndex = false;

    /**
     * Updates the display of the tile at the provided coordinates.
     *
     * @param {Number} x The x coordinate of the changed tile.
     * @param {Number} y The y coordinate of the changed tile.
     */
    this.updateTerrain = function (x, y) {
        terrainLayer.updateTile(x, y);
    };

    /**
     * Updates the display of the buildings layer with the provided building.
     *
     * @param {Building} building The building that was updated.
     */
    this.updateBuilding = function (building) {
        buildingsLayer.onBuildingAdded(building);
    };

    /**
     * Removes the provided building from the buildings layer.
     *
     * @param {Building} building The building to remove.
     */
    this.removeBuilding = function (building) {
        buildingsLayer.onBuildingRemoved(building);
    };

    /**
     * Toggles displaying of the terrain layer.
     */
    this.toggleTerrain = function () {
        enableTerrain = !enableTerrain;
    };

    /**
     * Toggles displaying of the buildings layer.
     */
    this.toggleBuildings = function () {
        enableBuildings = !enableBuildings;
    };

    /**
     * Toggles displaying of the units layer.
     */
    this.toggleUnits = function () {
        enableUnits = !enableUnits;
    };

    /**
     * Toggles displaying of the SFX layer.
     */
    this.toggleSFX = function () {
        enableSFX = !enableSFX;
    };

    /**
     * Toggles displaying of the buildable tiles.
     */
    this.toggleBuildable = function () {
        enableBuildable = !enableBuildable;
        sfxLayer.setDisplayBuildableOverlay(enableBuildable);
    };

    /**
     * Toggles displaying of tiles accessible to units.
     */
    this.toggleNavigationIndex = function () {
        enableNavigationIndex = !enableNavigationIndex;
        sfxLayer.setDisplayNavigationIndex(enableNavigationIndex);
    };

    /**
     * Sets rendering canvas for terrain layer, buildings layer and units
     * layers.
     *
     * @param {HTMLCanvasElement} viewCanvas The canvas for the renderers.
     */
    this.setCanvas = function (newViewCanvas) {
        terrainLayer = new TerrainLayer();
        terrainLayer.setCanvas(newViewCanvas);
        buildingsLayer = new BuildingsLayer();
        buildingsLayer.setCanvas(newViewCanvas);
        unitsLayer = new UnitsLayer();
        unitsLayer.setCanvas(newViewCanvas);
        sfxLayer = new SFX();
        sfxLayer.setCanvas(newViewCanvas);
        viewCanvas = newViewCanvas;
    };

    /**
     * Sets the map for the renderer layers.
     *
     * @param {Map} map The map instance or raw map data.
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
        viewCanvas.getContext('2d').clearRect(0, 0,
                viewCanvas.width, viewCanvas.height);
        enableTerrain && terrainLayer.display(x, y);
        enableBuildings && buildingsLayer.display(x, y);
        enableUnits && unitsLayer.display(x, y);
        enableSFX && sfxLayer.display(x, y);
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
