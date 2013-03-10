"use strict";
var ResourceManagerPlugin;

/**
 * The resource manager plug-in is used to manage resources of all players and
 * their distribution to the buildings and units construction plug-in.
 */
ResourceManagerPlugin = function () {
    var playerId, resources, updateUI, resourceContainers, initContainers;

    /**
     * Updates the UI with the current resource stats of the current player.
     */
    updateUI = function () {
        var playerResources, i;
        playerResources = resources[playerId];
        for (i = playerResources.length; i--;) {
            resourceContainers[i].innerHTML = playerResources[i];
        }
    };

    /**
     * Initializes DOM elements used to display the resource stats of the
     * current player.
     */
    initContainers = function () {
        var i;
        resourceContainers = [];
        for (i = 0; i < resources[0].length; i++) {
            resourceContainers[i] = document.querySelector('#resource-' + i);
        }
    };

    /**
     * The event <code>resourceRequest</code> is usually sent by the
     * BuildingsUnitsConstruction plug-in. The methods sends a
     * <code>resourceDispatch</code> event in response.
     *
     * @param {Object} request The resource request.
     */
    this.onResourceRequest = function (request) {
        var dispatch, i, playerResources, satisfiable;
        dispatch = {
            target: request.target,
            targetType: request.targetType,
            player: request.player,
            resources: []
        };
        satisfiable = true;
        playerResources = resources[request.player];
        for (i = request.resources.length; i--;) {
            if (playerResources[i] < request.resources[i]) {
                dispatch = {
                    target: request.target,
                    targetType: request.targetType,
                    player: request.player,
                    resources: false // indicates refused request
                };
                break;
            }
            playerResources[i] -= request.resources[i];
            dispatch.resources[i] = request.resources[i];
        }
        this.sendEvent('resourceDispatch', dispatch);
        updateUI();
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
        var playerResources, i;
        playerResources = resources[gainInfo.player];
        for (i = gainInfo.resources.length; i--;) {
            playerResources[i] += gainInfo.resources[i];
        }
        updateUI();
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
            initContainers();
            updateUI();
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
            initContainers();
            updateUI();
        }
    };
};
ResourceManagerPlugin.prototype = new AdvancedEventDrivenPlugin();
