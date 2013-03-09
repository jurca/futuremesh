"use strict";
var BuildingsUnitsConstruction;

BuildingsUnitsConstruction = function () {
    /**
     * The buildingQueues object represents a map of player IDs to queues of
     * buildings and units to construct. The map value is an object with the
     * following structure:
     *
     * <pre>
     * {
     *     "buildings": {...}
     *     "units":     {...}
     * }
     * </pre>
     *
     * Both fields represent maps. Keys are unit/building type IDs. Each map
     * item is an object with the following structure:
     *
     * <pre>
     * {
     *     "type": building/unit type ID,
     *     "progress": construction progress represented as number from the
     *                 range [0, 1000],
     *     "definition:" building/unit definition,
     *     "waitingForResources": boolean, set to true if task is waiting for
     *                            resources from the resource manager,
     *     "stepTimeout": number of steps until the construction progresses,
     *     "enqueued": number of construction tasks for the same unit enqueued
     *                 after this construction task. This is used only for
     *                 units.
     * }
     * </pre>
     *
     * @type Object
     */
    var constructionQueues = {}, instance = this, onResourceDispatch;

    this.handleTick = function () {
        var playerId, buildingsTasks, buildingType;
        for (playerId in constructionQueues) {
            if (!constructionQueues.hasOwnProperty(playerId)) {
                continue;
            }
            buildingsTasks = constructionQueues[playerId].buildings;
            for (buildingType in buildingsTasks) {
                if (!buildingsTasks.hasOwnProperty(buildingType) ||
                        !buildingsTasks[buildingType]) {
                    continue;
                }
                if (buildingsTasks[buildingType].waitingForResources) {
                    continue; // we already sent request for resources
                }
                if (buildingsTasks[buildingType].stepTimeout) {
                    buildingsTasks[buildingType].stepTimeout--;
                    continue;
                }
                this.sendEvent('resourceRequest', {
                    target: buildingType,
                    player: playerId,
                    resources: buildingsTasks[buildingType].definition.
                            construction.step
                });
                buildingsTasks[buildingType].waitingForResources = true;
            }
        }
    };

    this.handleEvent = function (eventName, eventData) {
        var buildings, definition;
        switch (eventName) {
            case 'start':
                break;
            case 'stop':
                break;
            case 'enqueueBuildingConstruction':
                if (!constructionQueues[eventData.player]) {
                    constructionQueues[eventData.player] = {
                        buildings: {},
                        units: {}
                    };
                }
                buildings = constructionQueues[eventData.player].buildings;
                if (buildings[eventData.building]) {
                    return; // cannot enqueue building construction
                }
                definition = BuildingsDefinition.getType(eventData.building);
                buildings[eventData.building] = {
                    type: eventData.building,
                    progress: 0,
                    definition: definition,
                    waitingForResources: false,
                    stepTimer: 0
                };
                break;
            case 'resourceDispatch':
                onResourceDispatch(eventData);
                break;
        }
    };

    this.getObservedEvents = function () {
        return [
            'start',
            'stop',
            'enqueueBuildingConstruction',
            'resourceDispatch'
        ];
    };

    /**
     * Event handler for the <code>resourceDispatch</code> event. The event is
     * sent by the Resource Manager plug-in as a response to the
     * <code>resourceRequest</code> event.
     *
     * @param {Object} data The event data.
     */
    onResourceDispatch = function (data) {
        var playersBuildings, buildingTask;
        playersBuildings = constructionQueues[data.player].buildings;
        buildingTask = playersBuildings[data.target];
        if (data.resources) {
            buildingTask.progress +=
                    buildingTask.definition.construction.stepProgress;
            buildingTask.stepTimer =
                    buildingTask.definition.construction.stepDuration;
            instance.sendEvent('buildingConstrucionProgress', {
                player: data.player,
                building: data.target,
                progress: buildingTask.progress
            });
            if (buildingTask.progress >= 1000) {
                playersBuildings[data.target] = undefined; // finished
            }
        }
        buildingTask.waitingForResources = false;
    };
};
BuildingsUnitsConstruction.prototype = new MixedPlugin();