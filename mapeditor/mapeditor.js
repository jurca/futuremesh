"use strict";
var MapEditor;

/**
 * The main class of the MapEditor application. Initializes the application and
 * interconnects all parts.
 */
MapEditor = function () {
    var $, viewUI, defaultMapWidth, defaultMapHeight, map, currentBrush,
            mouse, brush, brushMode;

    defaultMapWidth = 170;
    defaultMapHeight = 400;
    brushMode = 0; // 0 = add, 1 = edit, 2 = delete

    $ = function (selector) {
        return document.getElementById(selector);
    };

    /**
     * Sets the current map edited by the map editor.
     *
     * @param {Map} map The new map.
     */
    this.setMap = function (map) {
        viewUI.setMap(map);
        brush.setMap(map);
    };

    /**
     * Returns the current map edited by the map editor.
     *
     * @return {Map} The current map.
     */
    this.getMap = function () {
        return viewUI.getMap();
    };

    /**
     * Sets the current map brush.
     *
     * @param {Object} newBrush The new brush.
     */
    this.setCurrentBrush = function (newBrush) {
        currentBrush = newBrush;
        brush.setBrush(newBrush);
    };

    /**
     * Returns the current brush.
     *
     * @return {Object} The current brush.
     */
    this.getCurrentBrush = function () {
        return currentBrush;
    };

    /**
     * Sets the new brush mode. Can be either 0 for adding new buildings or
     * units, 1 for editing and 2 for deleting.
     *
     * @param {Number} newBrushMode The new brush mode.
     */
    this.setBrushMode = function (newBrushMode) {
        brushMode = newBrushMode;
    };

    /**
     * Returns the current brush mode. Can be either 0 for adding new buildings
     * or units, 1 for editing and 2 for deleting.
     *
     * @return {Number} The current brush mode.
     */
    this.getBrushMode = function () {
        return brushMode;
    };

    /**
     * Updates the terran at the specified coordinates using the current brush.
     *
     * @param {Number} x The x-coordinate on the map.
     * @param {Number} y The y-coordinate on the map.
     */
    this.updateTerrain = function (x, y) {
        viewUI.updateTerrain(x, y);
    };

    /**
     * Updates (adds or edits) a building on the map.
     *
     * @param {Building} building The updated building.
     */
    this.updateBuilding = function (building) {
        this.getMap().updateBuilding(building);
        viewUI.updateBuilding(building);
    };

    /**
     * Deletes the building from the map.
     *
     * @param {Building} building The building to remove.
     */
    this.removeBuilding = function (building) {
        this.getMap().removeBuilding(building);
        viewUI.removeBuilding(building);
    };

    /**
     * Updates (adds, edits or removes) a unit on the map.
     *
     * @param {Unit} unit The updated unit.
     */
    this.updateUnit = function (unit) {
        this.getMap().updateUnit(unit);
        viewUI.updateUnit(unit);
    };

    map = new Map();
    map.emptyMap(defaultMapWidth, defaultMapHeight);
    mouse = new MapEditorMouse();
    viewUI = new MapEditorViewUI(mouse);
    viewUI.setMap(map);
    new MapEditorMainMenu(this, defaultMapWidth, defaultMapHeight);
    new MapEditorPallets(this);
    brush = new MapEditorBrush(this, mouse, $('view-canvas'));
    Player.createGenericPlayers();
};

window.onerror = function (message, url, line) {
    var modal, p;
    p = document.createElement('p');
    p.appendChild(document.createTextNode(message));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode("Try refreshing the page. If the " +
            "problem perserveres, please contact the aplication\'s author."));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode('Source of error: ' + url));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode('Line: ' + line));
    modal = new Modal('Error encountered!', true);
    modal.appendChild(p);
    modal.center();
};

addEventListener('load', function () {
    setTimeout(function () {
        var modal, imageLoader, progressbar;
        modal = new Modal('Loading images...');
        progressbar = new Progressbar(0);
        modal.appendChild(progressbar);
        modal.center();
        imageLoader = new SpriteLoader();
        imageLoader.addObserver(function (percent) {
            progressbar.setValue(percent * 100);
            if (percent === 1) {
                new MapEditor();
                modal.close();
            }
        });
        imageLoader.load();
    }, 100);
}, false);
