"use strict";
var ResourceManagerPlugin;

ResourceManagerPlugin = function () {
    var playerId, resources, updateUI, resourceContainers, initContainers;

    updateUI = function () {
        var playerResources, i;
        playerResources = resources[playerId];
        for (i = playerResources.length; i--;) {

            resourceContainers[i].innerHTML = playerResources[i];
        }
    };

    initContainers = function () {
        var i;
        resourceContainers = [];
        for (i = 0; i < resources[0].length; i++) {
            resourceContainers[i] = document.querySelector('#resource-' + i);
        }
    };

    this.onResourceRequest = function (request) {
        var dispatch, i, amount, playerResources, satisfiable;
        dispatch = {
            target: request.target,
            player: request.player,
            resources: []
        };
        satisfiable = true;
        playerResources = resources[request.player];
        for (i = request.resources.length; i--;) {
            if (playerResources[i] < request.resources[i]) {
                dispatch = {
                    target: request.target,
                    player: request.player,
                    resources: false // indicates refused request
                }
                break;
            }
            playerResources[i] -= request.resources[i];
            dispatch.resources[i] = request.resources[i];
        }
        this.sendEvent('resourceDispatch', dispatch);
        updateUI();
    };

    this.onResourcesGained = function (gainInfo) {
        var playerResources, i;
        playerResources = resources[gainInfo.player];
        for (i = gainInfo.resources.length; i--;) {
            playerResources[i] += gainInfo.resources[i];
        }
        updateUI();
    };

    this.onPlayerResourcesInitialization = function (resourceStats) {
        resources = resourceStats;
        if (playerId !== undefined) {
            initContainers();
            updateUI();
        }
    };

    this.onPlayerInitialization = function (player) {
        playerId = player.id;
        if (resources) {
            initContainers();
            updateUI();
        }
    };
};
ResourceManagerPlugin.prototype = new AdvancedEventDrivenPlugin();
