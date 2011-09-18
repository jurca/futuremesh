"use strict";
require('mapeditor.mapeditorview');

var MapEditorViewUI;

/**
 * Class handling UI interaction with the map view.
 */
MapEditorViewUI = function (mouse) {
    var $, viewX, viewY, view, layerSize, currentMap;
    
    $ = function (selector) {
        return document.getElementById(selector);
    };
    
    view = new MapEditorView();
    view.setCanvases($('terrain'), $('buildings'), $('units'), $('sfx'));
    
    $('v-scroll').addEventListener('change', function () {
        if (layerSize) {
            viewY = this.value * (layerSize.height - $('terrain').height);
            view.display(viewX, viewY);
            mouse.setMapOffset(viewX, viewY);
        }
    }, false);
    
    $('h-scroll').addEventListener('change', function () {
        if (layerSize) {
            viewX = this.value * (layerSize.width - $('terrain').width);
            view.display(viewX, viewY);
            mouse.setMapOffset(viewX, viewY);
        }
    }, false);
    
    $('viewmap').addEventListener('mousewheel', function (e) {
        var distance, scrollbar;
        e.preventDefault();
        distance = -e.wheelDelta * Settings.mouseWheelSpeed;
        if (e.wheelDeltaX) {
            distance = distance / (layerSize.width - $('terrain').width);
            scrollbar = $('h-scroll');
            scrollbar.value = Math.min(1, Math.max(0,
                    parseFloat(scrollbar.value) + distance));
            viewX = scrollbar.value * (layerSize.width - $('terrain').width);
        } else {
            distance = distance / (layerSize.height - $('terrain').height);
            scrollbar = $('v-scroll');
            scrollbar.value = Math.min(1, Math.max(0,
                    parseFloat(scrollbar.value) + distance));
            viewY = scrollbar.value * (layerSize.height - $('terrain').height);
        }
        view.display(viewX, viewY);
        mouse.setMapOffset(viewX, viewY);
    }, false);
    
    $('terrain-toggle').addEventListener('change', function () {
        view.toggleTerrain();
        view.display(viewX, viewY);
    }, false);
    
    $('buildings-toggle').addEventListener('change', function () {
        view.toggleBuildings();
        view.display(viewX, viewY);
    }, false);
    
    $('units-toggle').addEventListener('change', function () {
        view.toggleUnits();
        view.display(viewX, viewY);
    }, false);
    
    $('sfx-toggle').addEventListener('change', function () {
        view.toggleSFX();
        view.display(viewX, viewY);
    }, false);
    
    $('buildable-toggle').addEventListener('change', function () {
        view.toggleBuildable();
        view.display(viewX, viewY);
    }, false);
    
    $('passable-toggle').addEventListener('change', function () {
        view.toggleNavigationIndex();
        view.display(viewX, viewY);
    }, false);
    
    /**
     * Sets map to be displayed.
     * 
     * @param {Map} map Map to be displayed by the UI.
     */
    this.setMap = function (map) {
        currentMap = map;
        view.setMap(map);
        viewX = 0;
        viewY = 0;
        $('v-scroll').value = 0;
        $('h-scroll').value = 0;
        layerSize = view.getLayersDimensions();
        view.display(viewX, viewY);
        mouse.setMapOffset(viewX, viewY);
    };
    
    /**
     * Updates the terrain layer's tile display at the provided coordinates.
     * 
     * @param {Number} x The x-coordinate of the updated tile.
     * @param {Number} y THe y-coordinate of the updated tile.
     */
    this.updateTerrain = function (x, y) {
        view.updateTerrain(x, y);
        view.display(viewX, viewY);
    };
    
    /**
     * Updates the buildings layer with the provided building.
     *
     * @param {Building} building The building that was updated.
     */
    this.updateBuilding = function (building) {
        view.updateBuilding(building);
        view.display(viewX, viewY);
    };
    
    this.updateUnit = function (unit) {
        view.onUnitChange(unit);
        view.display(viewX, viewY);
    };

    /**
     * Returns instance of Map class that is currently being displayed in the
     * UI.
     *
     * @return {Map} The Map instance currently displayed.
     */
    this.getMap = function () {
        return currentMap;
    };
};
