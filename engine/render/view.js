"use strict";
var View;

/**
 * Unifying class encapsulating both minimap and view renderers.
 */
View = function () {
    var mainview, minimap;

    /**
     * Sets canvas for rendering of the terrain, buildings and units.
     *
     * @param {HTMLCanvasElement} viewCanvas Canvas that should be used by the
     *        renderers.
     */
    this.setCanvas = function (viewCanvas) {
        mainview = new MainView();
        mainview.setCanvas(viewCanvas);
        viewCanvas.addEventListener("selectstart", function (event) {
            event.preventDefault();
        }, false);
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
     * Sets the size of the minimal view.
     *
     * @param {Number} width Width of the minimap view.
     * @param {Number} height Height of the minimap view.
     */
    this.setMinimapSize = function (width, height) {
        minimap.setSize(width, height);
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
        mainview.setMap(map);
        minimap.setMap(map);
        minimap.setMainViewBufferSize(mainview.getLayersDimensions());
    };

    /**
     * Returns the SFX renderer used to render the special effects and various
     * UI-related overlays.
     *
     * @return {SFX} The used SFX renderer.
     */
    this.getSfx = function () {
        return mainview.getSfx();
    };

    /**
     * Event handler for changes about buildings - adding or removing of a
     * building.
     *
     * @param {Building} building Building which status has changed.
     */
    this.onBuildingChange = function (building) {
        if (building.hitpoints) {
            mainview.onBuildingAdded(building);
        } else {
            mainview.onBuildingRemoved(building);
        }
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
     * Sets the size of the main view in tiles (for displaying informational
     * rectangle informing the user about the current position of the camera
     * over the map)
     *
     * @param {Number} width Width of the main view in tiles.
     * @param {Number} height Height of the main view in tiles.
     */
    this.setMainViewSize = function (width, height) {
        minimap.setMainViewSize(width, height);
    };

    /**
     * Displays the view and minimap using all renderers.
     *
     * @param {Number} x The X-coordinate offset for renderers.
     * @param {Number} y The Y-coordinate offset for renderers.
     */
    this.display = function (x, y) {
        mainview.display(x, y);
        minimap.render(x, y);
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