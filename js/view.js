"use strict";
var View;
require('mainview', 'minimap');

/**
 * Unifying class encapsulating both minimap and view renderers.
 */
View = function () {
    var mainview, minimap;

    /**
     * Sets canvases for rendering of the terrain, buildings and units. These
     * canvases has to be distinct - it is not possible to use one canvas to
     * render all.
     * 
     * @param {HTMLCanvasElement} terrainCanvas Canvas that should be used to
     *        render the terrain
     * @param {HTMLCanvasElement} buildingsCanvas Canvas that should be used to
     *        render the buildings
     * @param {HTMLCanvasElement} unitsCanvas Canvas that should be used to
     *        render the units
     * @param {HTMLCanvasElement} sfxCanvas Canvas that should be used to
     *        render sfx
     */
    this.setCanvases = function (terrainCanvas, buildingsCanvas, unitsCanvas,
            sfxCanvas) {
        mainview = new MainView();
        mainview.setCanvases(terrainCanvas, buildingsCanvas, unitsCanvas,
                sfxCanvas);
    };

    /**
     * Sets the container into which minimap render will be placed.
     * 
     * @param {HTMLElement} container The container that will be used by
     *        minimap renderer to render minimap.
     */
    this.setMinimapContainer = function (container) {
        minimap = new MiniMap();
        minimap.setContainer(container);
    };

    /**
     * Sets th map to be rendered. This cannot be done before view canvases and
     * minimap container has been set.
     * 
     * @param {Map} map Instance of the Map class containing raw map data.
     */
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

    /**
     * Event handler for changes about buildings - adding or removing of a
     * building.
     *
     * @param {Building} building Building which status has changed.
     */
    this.onBuildingChange = function (building) {
        mainview.onBuildingChange(building);
        minimap.onBuildingChange(building);
    };

    /**
     * Event handler for changes about units - adding, removing or unit
     * movements.
     *
     * @param {Unit} unit The unit which status has changed.
     */
    this.onUnitChange = function (unit) {
        mainview.onUnitChange(unit);
        minimap.onUnitChange(unit);
    };

    /**
     * Displays the view and minimap using all renderers.
     *
     * @param {Number} x The X-coordinate offset for renderers.
     * @param {Number} y The Y-coordinate offset for renderers.
     */
    this.display = function (x, y) {
        mainview.display(x, y);
        minimap.render();
    };

    /**
     * Returns dimensions of the layers' inner buffer in pixels.
     *
     * @return {Object} Object with properties width and height containing
     *         dimensions of inner buffers in pixels.
     */
    this.getMainViewLayersDimensions = function () {
        return mainview.getLayersDimensions();
    };
};