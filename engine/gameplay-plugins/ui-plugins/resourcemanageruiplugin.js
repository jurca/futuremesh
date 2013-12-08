"use strict";
var ResourceManagerUIPlugin;

/**
 * The Resource Manager UI Plugin udpates the UI using the data sent by the
 * resource manager plugin. The plugin is used to inform the user about their
 * current resource stats.
 */
ResourceManagerUIPlugin = function () {
    /**
     * ID of the current player.
     *
     * @type Number
     */
    var playerId,

    /**
     * Current resources of the player represented as an array of integers.
     *
     * @type Array
     */
    resources,

    /**
     * HTML nodes containing the resource stats. The order of the containers
     * matches the order of the resources.
     *
     * @type Array
     */
    resourceContainers,

    /**
     * <code>true</code> if the UI should be updated (the resource stats have
     * changed).
     *
     * @type Boolean
     */
    shouldUpdateUI;

    /**
     * Constructor.
     */
    (function () {
        shouldUpdateUI = false;
    }.call(this));

    // override
    this.renderFrame = function () {
        var i;
        if (shouldUpdateUI) {
            for (i = resources.length; i--;) {
                resourceContainers[i].innerHTML = resources[i];
            }
            shouldUpdateUI = false;
        }
    };

    /**
     * The event <code>resourceDispatch</code> is sent by the resource manager
     * plugin whenever it receives and processes a request for player's
     * resources usually for unit construction. The handler updates the
     * player's resources and prepares UI update.
     *
     * @param {Object} dispatch Details about the dispatched resources.
     */
    this.onResourceDispatch = function (dispatch) {
        var dispatchedResources, i;
        if (dispatch.player !== playerId) {
            return;
        }
        dispatchedResources = dispatch.resources;
        if (!dispatchedResources) {
            return;
        }
        for (i = dispatchedResources.length; i--;) {
            resources[i] -= dispatchedResources[i];
        }
        shouldUpdateUI = true;
    };

    /**
     * The event <code>resourcesGained</code> occures a player gains resources.
     *
     * @param {Object} gainInfo The object containing information about
     *        resource gain. The object has the <code>player</code> property
     *        specifying ID of the player who gained the resources and the
     *        <code>resources</code> property containing array of gained
     *        resources.
     */
    this.onResourcesGained = function (gainInfo) {
        var gainedResources, i;
        if (gainInfo.player !== playerId) {
            return;
        }
        gainedResources = gainInfo.resources;
        for (i = gainedResources.length; i--;) {
            resources[i] += gainedResources[i];
        }
        shouldUpdateUI = true;
    };

    /**
     * The event <code>playerResourcesInitialization</code> is sent by the
     * GameLoader during gameplay initialization. The event contains
     * information about all players' resources as data.
     *
     * @param {Array} resourceStats Information about all players' resources.
     *        The array index is player ID, the item is an array of resource
     *        amounts for each resource type in the game.
     */
    this.onPlayerResourcesInitialization = function (resourceStats) {
        resources = resourceStats;
        if (playerId !== undefined) {
            resources = resources[playerId].slice(0); // copy the array
            initContainers();
            shouldUpdateUI = true;
        }
    };

    /**
     * The event <code>playerInitialization</code> is sent by the GameLoader
     * during gameplay initialization. The event contains as data the current
     * player information.
     *
     * @param {Player} player The current player.
     */
    this.onPlayerInitialization = function (player) {
        playerId = player.id;
        if (resources) {
            resources = resources[playerId].slice(0); // copy the array
            initContainers();
            shouldUpdateUI = true;
        }
    };

    /**
     * Initializes DOM elements used to display the resource stats of the
     * current player.
     */
    function initContainers() {
        var i;
        resourceContainers = [];
        for (i = 0; i < resources.length; i++) {
            resourceContainers[i] = document.querySelector('#resource-' + i);
        }
    }
};
ResourceManagerUIPlugin.prototype = new AdvancedUIPlugin();
