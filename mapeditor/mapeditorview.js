"use strict";
var MapEditorView;
require('terrainlayer', 'buildingslayer', 'unitslayer', 'tile', 'building',
        'unit', 'map', 'sfx');

/**
 * Unifying class handling the rendering of terrain, buildings and units
 * layers. Unline the MainView class, this view can be used to enable or
 * disable each renderer without disrupting any other.
 */
MapEditorView = function () {
    var terrainLayer, buildingsLayer, unitsLayer, sfxLayer, enableTerrain,
            enableBuildings, enableUnits, enableSFX, terrainLayerCanvas,
            buildingsLayerCanvas, unitsLayerCanvas, sfxLayerCanvas,
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
     * Sets rendering canvases for terrain layer, buildings layer and units
     * layer. These canvases has to be distinct.
     *
     * @param {HTMLCanvasElement} terrainCanvas The canvas for the terrain
     *        layer renderer.
     * @param {HTMLCanvasElement} buildingsCanvas The canvas for the buildings
     *        layer renderer.
     * @param {HTMLCanvasElement} unitsCanvas The canvas for the units layer
     *        renderer.
     * @param {HTMLCanvasElement} sfxCanvas The canvas for the sfx layer
     *        renderer.
     */
    this.setCanvases = function (terrainCanvas, buildingsCanvas, unitsCanvas,
            sfxCanvas) {
        terrainLayer = new TerrainLayer();
        terrainLayer.setCanvas(terrainCanvas);
        buildingsLayer = new BuildingsLayer();
        buildingsLayer.setCanvas(buildingsCanvas);
        unitsLayer = new UnitsLayer();
        unitsLayer.setCanvas(unitsCanvas);
        sfxLayer = new SFX();
        sfxLayer.setCanvas(sfxCanvas);
        terrainLayerCanvas = terrainCanvas;
        buildingsLayerCanvas = buildingsCanvas;
        unitsLayerCanvas = unitsCanvas;
        sfxLayerCanvas = sfxCanvas;
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
        terrainLayerCanvas.getContext('2d').clearRect(0, 0,
                terrainLayerCanvas.width, terrainLayerCanvas.height);
        enableTerrain && terrainLayer.display(x, y);
        buildingsLayerCanvas.getContext('2d').clearRect(0, 0,
                buildingsLayerCanvas.width, buildingsLayerCanvas.height);
        enableBuildings && buildingsLayer.display(x, y);
        unitsLayerCanvas.getContext('2d').clearRect(0, 0,
                unitsLayerCanvas.width, unitsLayerCanvas.height);
        enableUnits && unitsLayer.display(x, y);
        sfxLayerCanvas.getContext('2d').clearRect(0, 0,
                sfxLayerCanvas.width, sfxLayerCanvas.height);
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
