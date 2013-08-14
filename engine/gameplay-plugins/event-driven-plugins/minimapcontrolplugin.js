"use strict";
var MinimapControlPlugin;

/**
 * The Minimap Control Plug-in is used to intercept the user input to the
 * minimap and update the map view respectively.
 *
 * @constructor
 */
MinimapControlPlugin = function () {
    var mouseDown, width, height, instance;

    /**
     * Constructor.
     */
    (function () {
        mouseDown = false;
        instance = this;
    }.call(this));

    /**
     * Event handler for the "running" event. The event is sent by the GamePlay
     * class after the "start" event has been delivered.
     *
     * @param {Object} data Data of the "running" event - always a null.
     */
    this.onRunning = function (data) {
        var minimap;
        minimap = document.querySelector("#minimap > canvas");
        minimap.addEventListener("mousedown", function (event) {
            mouseDown = true;
            handlePositionSelection(event.offsetX, event.offsetY);
            event.preventDefault();
        }, false);
        window.addEventListener("mouseup", function () {
            mouseDown = false;
        }, false);
        minimap.addEventListener("mousemove", function (event) {
            if (mouseDown) {
                handlePositionSelection(event.offsetX, event.offsetY);
            }
            event.preventDefault();
        }, false);
        width = minimap.width;
        height = minimap.height;
    };

    /**
     * Handles the mouse being clicked or dragged accross the minimap display.
     * The method sends an event to notify the renderer plug-in to update the
     * portion of the map being displayed.
     *
     * @param {Number} x Relative X offset of the mouse cursor over the minimap
     *        display.
     * @param {Number} y Relative Y offset of the mouse cursor over the minimap
     *        display.
     */
    function handlePositionSelection(x, y) {
        instance.sendEvent("viewSetByMinimap", {
            x: x / width,
            y: y / height
        });
    }
};
MinimapControlPlugin.prototype = new AdvancedEventDrivenPlugin();
