"use strict";
var MapGeneratorScrollbars;

/**
 * Provides scrollbar functionality for Map Generator's map view.
 *
 * @param {MainView} view
 */
MapGeneratorScrollbars = function (view) {
    var hScroll, vScroll, x, y, viewCanvas;
    
    hScroll = document.getElementById('h-scroll');
    vScroll = document.getElementById('v-scroll');
    viewCanvas = document.getElementById('sfx');
    x = 0;
    y = 0;
    
    hScroll.addEventListener('change', function () {
        var width;
        width = view.getLayersDimensions().width;
        x = Math.floor(this.value * width);
        view.display(x, y);
    }, false);
    
    vScroll.addEventListener('change', function () {
        var height;
        height = view.getLayersDimensions().height;
        y = Math.floor(this.value * height);
        view.display(x, y);
    }, false);
    
    viewCanvas.addEventListener('mousewheel', function (e) {
        var distance, layerSize;
        e.preventDefault();
        distance = -e.wheelDelta * Settings.mouseWheelSpeed;
        layerSize = view.getLayersDimensions();
        if (e.wheelDeltaX) {
            distance = distance / (layerSize.width - viewCanvas.width);
            hScroll.value = Math.min(1, Math.max(0,
                    parseFloat(hScroll.value) + distance));
            x = hScroll.value * (layerSize.width - viewCanvas.width);
        } else {
            distance = distance / (layerSize.height - viewCanvas.height);
            vScroll.value = Math.min(1, Math.max(0,
                    parseFloat(vScroll.value) + distance));
            y = vScroll.value * (layerSize.height - viewCanvas.height);
        }
        view.display(x, y);
    }, false);
};
