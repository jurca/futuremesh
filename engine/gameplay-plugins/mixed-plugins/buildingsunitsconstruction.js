"use strict";
var BuildingsUnitsConstruction;

/**
 * The Buildings Units Construction is a plug-in that manages buildings and
 * units construction/productions. Buildings and units construction tasks are
 * scheduled using events, the plug-in handles the production progress along
 * with resource reduction. The plug-in sends an event whenever a custruction
 * task finishes.
 *
 * @constructor
 */
BuildingsUnitsConstruction = function () {
    /**
     * The constructionQueues object represents a map of player IDs to queues
     * of buildings and units to construct. The map value is an object with the
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
    var constructionQueues = {},
            
    /**
     * The current instance of this plugin.
     * 
     * @type BuildingsUnitsConstruction
     */
    instance,
    
    /**
     * Maximum length of unit construction queue for each unit and player.
     * 
     * @type Number
     */        
    maxQueueLength,
            
    /**
     * Extra ticks to wait before each resource request when the player does
     * not have enough power.
     * 
     * @type Number
     */
    unpoweredConstructionDelay,
            
    /**
     * Map of player IDs to extraneous power production.
     * 
     * @type Object
     */
    powerLevels;

    /**
     * Constructor.
     */
    (function () {
        var configuration;
        instance = this;
        configuration = Settings.pluginConfiguration;
        configuration = configuration.BuildingsUnitsConstruction;
        maxQueueLength = configuration.maxQueueLength;
        unpoweredConstructionDelay = configuration.unpoweredConstructionDelay;
        powerLevels = {};
    }.call(this));

    // override
    this.handleTick = function () {
        var playerId, buildingsTasks, buildingType, unitsTasks, unitType,
                definition, powerRequirement;
        for (playerId in constructionQueues) {
            if (!constructionQueues.hasOwnProperty(playerId)) {
                continue;
            }
            playerId = parseInt(playerId, 10); // typecast from string to int
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
                this.sendEvent("resourceRequest", {
                    target: buildingType,
                    targetType: "building",
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
                unitType = parseInt(unitType, 10); // typecast from string
                if (unitsTasks[unitType].waitingForResources) {
                    continue; // we already sent request for resources
                }
                if (unitsTasks[unitType].stepTimeout) {
                    unitsTasks[unitType].stepTimeout--;
                    continue;
                }
                definition = UnitsDefinition.getType(unitType);
                powerRequirement = Math.max(0, definition.powerRequirement);
                if (powerRequirement > powerLevels[playerId]) {
                    continue; // not enough power to construct this unit
                }
                this.sendEvent("resourceRequest", {
                    target: unitType,
                    targetType: "unit",
                    player: playerId,
                    resources: unitsTasks[unitType].definition.construction.
                            step
                });
                unitsTasks[unitType].waitingForResources = true;
            }
        }
    };
    
    /**
     * Event handler for the <code>energyLevelUpdate</code> event. The handler
     * will update the powerLevels map.
     * 
     * @param {Object} data Event's data.
     */
    this.onEnergyLevelUpdate = function (data) {
        powerLevels[data.player] = data.level;
    };

    /**
     * Event handler for the <code>start</code> event.
     *
     * @param {Object} data Event data.
     */
    this.onStart = function (data) {
    };

    /**
     * Event handler for the <code>stop</code> event.
     *
     * @param {Object} data Event data.
     */
    this.onStop = function (data) {
    };

    /**
     * Event handler for the <code>enqueueBuildingConstruction</code>. The
     * handler enqueues construction of a new building of the specified
     * building is not already being constructed.
     *
     * @param {type} eventData
     */
    this.onEnqueueBuildingConstruction = function (eventData) {
        var buildings, definition;
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
    };

    /**
     * Handler for the <code>cancelBuildingConstruction</code> event. The
     * handler cancels construction of the specified building, returning all
     * consumed resources to the respective player.
     *
     * @param {Object} data Event data.
     */
    this.onCancelBuildingConstruction = function (data) {
        var buildingTasks, resources, i, constructionInfo;
        if (!constructionQueues[data.player]) {
            return;
        }
        buildingTasks = constructionQueues[data.player].buildings;
        if (!buildingTasks[data.building]) {
            return;
        }
        resources = [];
        constructionInfo = buildingTasks[data.building].definition.
                construction;
        for (i = constructionInfo.step.length; i--;) {
            resources[i] = constructionInfo.step[i] *
                    buildingTasks[data.building].progress /
                    constructionInfo.stepProgress;
        }
        instance.sendEvent('resourcesGained', {
            player: data.player,
            resources: resources
        });
        buildingTasks[data.building] = undefined;
    };

    /**
     * Handler for the <code>refundBuildingConstruction</code> event. The event
     * is sent if a building construction is completed, but the building is
     * canceled instead of placed. The handler refunds the player all the
     * resources that were consumed by the construction.
     *
     * @param {Object} data Event data.
     */
    this.onRefundBuildingConstruction = function (data) {
        var resources, buildingDefinition, constructionInfo, stepCount,
                stepProgress, i;
        buildingDefinition = BuildingsDefinition.getType(data.building);
        constructionInfo = buildingDefinition.construction;
        stepCount = 1000 / constructionInfo.stepProgress;
        stepProgress = constructionInfo.step;
        resources = new Array(stepProgress.length);
        for (i = stepProgress.length; i--;) {
            resources[i] = stepCount * stepProgress[i];
        }
        instance.sendEvent('resourcesGained', {
            player: data.player,
            resources: resources
        });
    };

    /**
     * Event handler for the <code>cancelUnitConstruction</code> event. The
     * event is sent by the Units Construction UI plug-in when the user cancels
     * a production of a unit. The handler cancels the production task and
     * performs a refund of all resources consumed by the unit production
     * process.
     *
     * @param {Object} data Event data.
     */
    this.onCancelUnitConstruction = function (data) {
        var unitTasks, resources, i, constructionInfo;
        if (!constructionQueues[data.player]) {
            return;
        }
        unitTasks = constructionQueues[data.player].units;
        if (!unitTasks[data.unit]) {
            return;
        }
        if (unitTasks[data.unit].enqueued) {
            unitTasks[data.unit].enqueued--;
        } else {
            resources = [];
            constructionInfo = unitTasks[data.unit].definition.construction;
            for (i = constructionInfo.step.length; i--;) {
                resources[i] = constructionInfo.step[i] *
                        unitTasks[data.unit].progress /
                        constructionInfo.stepProgress;
            }
            instance.sendEvent('resourcesGained', {
                player: data.player,
                resources: resources
            });
            unitTasks[data.unit] = undefined;
        }
    };

    /**
     * Event handler for the <code>enqueueUnitConstruction</code> event. The
     * event is sent by the UnitsConstructionUI plug-in when the user clicks on
     * a unit construction button.
     *
     * @param {Object} data Construction request details.
     */
    this.onEnqueueUnitConstruction = function (data) {
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
        instance.sendEvent('unitConstructionProgress', {
            player: data.player,
            unit: data.unit,
            progress: units[data.unit].progress,
            enqueued: units[data.unit].enqueued
        });
    };

    /**
     * Event handler for the <code>resourceDispatch</code> event. The event is
     * sent by the Resource Manager plug-in as a response to the
     * <code>resourceRequest</code> event.
     *
     * @param {Object} data The event data.
     */
    this.onResourceDispatch = function (data) {
        var playersBuildings, buildingTask, playerUnits, unitTask;
        if (data.targetType === 'unit') {
            playerUnits = constructionQueues[data.player].units;
            unitTask = playerUnits[data.target];
            if (data.resources) {
                if (!unitTask) {
                    // task has been canceled, return the resources
                    instance.sendEvent('resourcesGained', {
                        player: data.player,
                        resources: data.resources
                    });
                    return;
                }
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
                if (!buildingTask) {
                    // task has been canceled, return the resources
                    instance.sendEvent('resourcesGained', {
                        player: data.player,
                        resources: data.resources
                    });
                    return;
                }
                buildingTask.progress +=
                        buildingTask.definition.construction.stepProgress;
                buildingTask.stepTimeout =
                        buildingTask.definition.construction.stepDuration;
                if (powerLevels[data.player] < 0) {
                    buildingTask.stepTimeout += unpoweredConstructionDelay;
                }
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
BuildingsUnitsConstruction.prototype = new AdvancedMixedPlugin();