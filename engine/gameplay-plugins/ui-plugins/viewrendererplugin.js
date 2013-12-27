"use strict";
var ViewRendererPlugin;

/**
 * The view renderer plug-in is used to render the main view and minimap. The
 * plug-in sends the <code>viewReady</code> event with the current
 * <code>View</code> instance once the view has been initialized.
 */
ViewRendererPlugin = function () {
    var view, map, x, y, borderOffset, viewWidth, viewHeight, viewLayerSize,
            minX, minY, maxX, maxY, sfx;

    /**
     * Constructor.
     *
     * @param {Object} pluginSettings Configuration of this plug-in.
     */
    (function (pluginSettings) {
        borderOffset = pluginSettings.borderOffset;
        x = borderOffset;
        y = borderOffset;
        minX = borderOffset;
        minY = borderOffset;
    }(Settings.pluginConfiguration.ViewRendererPlugin));

    // override
    this.renderFrame = function () {
        view.display(x, y);
    };
    
    this.onLeftMouseButtonBoxSelectProgress = function (data) {
        sfx.setSelectionBox(data.startX, data.startY, data.endX, data.endY);
    };
    
    this.onLeftMouseButtonBoxSelect = function (data) {
        sfx.setSelectionBox(0, 0, 0, 0); // hides the selection box
    };

    /**
     * Event listener for the <code>scrollMapView</code> event. The listener
     * will move the camera according to the specified scroll vector.
     *
     * @param {Object} vector 2D vector specifying how the map view should be
     *        scrolled. The object has the following properties:
     *        <ul>
     *            <li><code>x</code> - the horizontal scrolling speed.</li>
     *            <li><code>y</code> - the vertical scrolling speed.</li>
     *        </ul>
     */
    this.onScrollMapView = function (vector) {
        x = Math.min(maxX, Math.max(x + vector.x, minX));
        y = Math.min(maxY, Math.max(y + vector.y, minY));
        this.sendEvent("viewOffsetUpdate", {
            offsetLeft: x,
            offsetTop: y
        });
    };

    /**
     * Event listener for the <code>viewSetByMinimap</code> event. The view
     * will be shifter according to the data received from the minimap: a
     * position of the user's click on the minimap scaled to the interval 0.0
     * to 1.0.
     *
     * @param {Object} data Event data, an object with the <code>x</code> and
     *        <code>y</code> fields representing the position of the user's
     *        click on the minimap.
     */
    this.onViewSetByMinimap = function (data) {
        x = Math.floor(viewLayerSize.width * data.x - viewWidth / 2);
        y = Math.floor(viewLayerSize.height * data.y - viewHeight / 2);
        x = Math.min(maxX, Math.max(x, minX));
        y = Math.min(maxY, Math.max(y, minY));
        this.sendEvent("viewOffsetUpdate", {
            offsetLeft: x,
            offsetTop: y
        });
    };

    /**
     * Event listener for the <code>gameMapInitialization</code> event. The map
     * is not set to the view until the <code>viewInitialization</code> is
     * received.
     *
     * @param {Map} data The game map.
     */
    this.onGameMapInitialization = function (data) {
        map = data;
        if (view) {
            view.setMap(map);
            sfx = view.getSfx();
        }
    };

    /**
     * Event listener for the <code>viewInitialization</code> event. The
     * listener initializes the view renderers, but does not render anything.
     *
     * @param {Object} data Event data - an object containing the main view
     *        canvas and the minimap container.
     */
    this.onViewInitialization = function (data) {
        var minimapSize, viewWidthInTiles, viewHeightInTiles;
        view = new View();
        view.setCanvas(data.view);
        view.setMinimapContainer(data.minimap);
        minimapSize = Settings.pluginConfiguration.ViewRendererPlugin.minimap;
        view.setMinimapSize(minimapSize.width, minimapSize.height);
        if (map) {
            view.setMap(map);
            sfx = view.getSfx();
        }
        viewWidth = data.view.width;
        viewHeight = data.view.height;
        viewWidthInTiles = Math.round(viewWidth / Settings.tileWidth);
        viewHeightInTiles = Math.round(viewHeight / Settings.tileHeight);
        view.setMainViewSize(viewWidthInTiles, viewHeightInTiles);
        viewLayerSize = view.getMainViewLayersDimensions();
        maxX = viewLayerSize.width - viewWidth - borderOffset;
        maxY = viewLayerSize.height - viewHeight - borderOffset;
        this.sendEvent('viewReady', view);
        this.sendEvent("viewOffsetUpdate", {
            offsetLeft: x,
            offsetTop: y
        });
    };
    
    this.onStart = function () {
        addEventListener("selectstart", textSelectionPreventer, false);
    };
    
    this.onStop = function () {
        removeEventListener("selectstart", textSelectionPreventer);
    };
    
    function textSelectionPreventer(event) {
        event.preventDefault();
    }
};
ViewRendererPlugin.prototype = new AdvancedUIPlugin();
