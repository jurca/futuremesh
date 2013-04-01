"use strict";
var ViewRendererPlugin;

/**
 * The view renderer plug-in is used to render the main view and minimap.
 */
ViewRendererPlugin = function () {
    var view, map, x, y;

    // public API

    this.handleTick = function () {
        view.display(x, y);
    };

    this.ignoresExtraTicks = function () {
        return true;
    };

    this.handleEvent = function (name, data) {
        switch (name) {
            case 'viewInitialization':
                onViewInitialization(data);
                break;
            case 'gameMapInitialization':
                onGameMapInitialization(data);
                break;
        }
    };

    this.getObservedEvents = function () {
        return [
            'viewInitialization',
            'gameMapInitialization'
        ];
    };

    // private API

    /**
     * Event listener for the <code>gameMapInitialization</code> event. The map
     * is not set to the view until the <code>viewInitialization</code> is
     * received.
     *
     * @param {Map} data The game map.
     */
    function onGameMapInitialization(data) {
        map = data;
        if (view) {
            view.setMap(map);
        }
    }

    /**
     * Event listener for the <code>viewInitialization</code> event. The
     * listener initializes the view renderers, but does not render anything.
     *
     * @param {Object} data Event data - an object containing the main view
     *        canvas and the minimap container.
     */
    function onViewInitialization(data) {
        view = new View();
        view.setCanvas(data.view);
        view.setMinimapContainer(data.minimap);
        if (map) {
            view.setMap(map);
        }
    }

    // constructor code

    x = Settings.pluginConfiguration.ViewRendererPlugin.borderOffset;
    y = Settings.pluginConfiguration.ViewRendererPlugin.borderOffset;
};
ViewRendererPlugin.prototype = new MixedPlugin();
