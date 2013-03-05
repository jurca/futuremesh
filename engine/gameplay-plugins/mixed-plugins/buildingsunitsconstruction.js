"use strict";
var BuildingsUnitsConctruction;

BuildingsUnitsConctruction = function () {
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
    var buildingQueues = {};

    this.handleTick = function () {
        var playerId, buildingsTasks, buildingType;
        for (playerId in buildingQueues) {
            if (!buildingQueues.hasOwnProperty(playerId)) {
                continue;
            }
            buildingsTasks = buildingQueues[playerId].buildings;
            for (buildingType in buildingsTasks) {
                if (!buildingsTasks.hasOwnProperty(buildingType)) {
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
                    resources: buildingsTasks.definition.resourceCost
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
                if (!buildingQueues[eventData.player]) {
                    buildingQueues[eventData.player] = {
                        buildings: {},
                        units: {}
                    };
                }
                buildings = buildingQueues[eventData.player].buildings;
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
        }
    };

    this.getObservedEvents = function () {
        return [
            'start',
            'stop',
            'enqueueBuildingConstruction'
        ];
    };
};
BuildingsUnitsConctruction.prototype = new MixedPlugin();