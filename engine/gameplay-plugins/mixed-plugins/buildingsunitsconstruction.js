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
    var constructionQueues = {}, instance = this, onResourceDispatch,
            onEnqueueUnitConstruction, maxQueueLength;

    maxQueueLength = Settings.pluginConfiguration.BuildingsUnitsConstruction.
            maxQueueLength;

    this.handleTick = function () {
        var playerId, buildingsTasks, buildingType, unitsTasks, unitType;
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
                    targetType: 'building',
                    player: playerId,
                    resources: buildingsTasks[buildingType].definition.
                            construction.step
                });
                buildingsTasks[buildingType].waitingForResources = true;
            }
            unitsTasks = constructionQueues[playerId].units;
            for (unitType in unitsTasks) {
                if (!unitsTasks.hasOwnProperty(unitType) ||
                        !unitsTasks[unitType]) {
                    continue;
                }
                if (unitsTasks[unitType].waitingForResources) {
                    continue; // we already sent request for resources
                }
                if (unitsTasks[unitType].stepTimeout) {
                    unitsTasks[unitType].stepTimeout--;
                    continue;
                }
                this.sendEvent('resourceRequest', {
                    target: unitType,
                    targetType: 'unit',
                    player: playerId,
                    resources: unitsTasks[unitType].definition.construction.
                            step
                });
                unitsTasks[unitType].waitingForResources = true;
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
                    stepTimeout: 0
                };
                break;
            case 'enqueueUnitConstruction':
                onEnqueueUnitConstruction(eventData);
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
            'enqueueUnitConstruction',
            'resourceDispatch'
        ];
    };

    /**
     * Event handler for the <code>enqueueUnitConstruction</code> event. The
     * event is sent by the UnitsConstructionUI plug-in when the user clicks on
     * a unit construction button.
     *
     * @param {Object} data Construction request details.
     */
    onEnqueueUnitConstruction = function (data) {
        var units, definition;
        if (!constructionQueues[data.player]) {
            constructionQueues[data.player] = {
                buildings: {},
                units: {}
            };
        }
        units = constructionQueues[data.player].units;
        if (units[data.unit]) {
            units[data.unit].enqueued =
                    Math.min(units[data.unit].enqueued + 1, maxQueueLength);
        } else {
            definition = UnitsDefinition.getType(data.unit);
            units[data.unit] = {
                type: data.unit,
                progress: 0,
                definition: definition,
                waitingForResources: false,
                stepTimeout: 0,
                enqueued: 0
            };
        }
    };

    /**
     * Event handler for the <code>resourceDispatch</code> event. The event is
     * sent by the Resource Manager plug-in as a response to the
     * <code>resourceRequest</code> event.
     *
     * @param {Object} data The event data.
     */
    onResourceDispatch = function (data) {
        var playersBuildings, buildingTask, playerUnits, unitTask;
        if (data.targetType === 'unit') {
            playerUnits = constructionQueues[data.player].units;
            unitTask = playerUnits[data.target];
            if (data.resources) {
                unitTask.progress +=
                        unitTask.definition.construction.stepProgress;
                unitTask.stepTimeout +=
                        unitTask.definition.construction.stepDuration;
                instance.sendEvent('unitConstructionProgress', {
                    player: data.player,
                    unit: data.target,
                    progress: unitTask.progress,
                    enqueued: unitTask.enqueued
                });
                if (unitTask.progress >= 1000) {
                    if (unitTask.enqueued) {
                        unitTask.enqueued--;
                        unitTask.progress = 0;
                    } else {
                        playerUnits[data.target] = undefined; // finished
                    }
                }
            }
            unitTask.waitingForResources = false;
        } else if (data.targetType === 'building') {
            playersBuildings = constructionQueues[data.player].buildings;
            buildingTask = playersBuildings[data.target];
            if (data.resources) {
                buildingTask.progress +=
                        buildingTask.definition.construction.stepProgress;
                buildingTask.stepTimeout =
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
        }
    };
};
BuildingsUnitsConstruction.prototype = new MixedPlugin();