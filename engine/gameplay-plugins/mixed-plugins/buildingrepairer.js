"use strict";
var BuildingRepairer;

/**
 * The Buildings Repairer plugin handles repairing of buildings.
 *
 * @constructor
 */
BuildingRepairer = function () {
    /**
     * Buildings to repair. Each is represented as an object with the following
     * fields:
     *
     * <ul>
     *     <li><code>building: Building</code> - the building to repair.</li>
     *     <li><code>definition: Object</code> - definition of the
     *         building.</li>
     *     <li><code>waiting: Boolean</code> - <code>true</code> if the plugin
     *         is waiting for the resources to be dispatched.</li>
     * </ul>
     *
     * @type Array
     */
    var buildings;

    /**
     * Constructor.
     */
    (function () {
        buildings = [];
    }.call(this));

    // override
    this.handleTick = function () {
        var i, building;
        for (i = buildings.length; i--;) {
            building = buildings[i];
            if (!building.building.hitpoints) {
                buildings.splice(i, 1);
                continue;
            }
            if (building.waiting) {
                continue;
            }
            this.sendEvent('resourceRequest', {
                target: building,
                targetType: 'repair-building',
                player: building.building.player,
                resources: building.definition.repair.resources
            });
            building.waiting = true;
        }
    };

    /**
     * Event handler for the <code>resourceDispatch</code> event. The handler
     * proceeds with building repairs if the requested resources have been
     * dispatched.
     *
     * @param {Object} data The event's details.
     */
    this.onResourceDispatch = function (data) {
        var i, buildingInfo, building, repairInfo;
        for (i = buildings.length; i--;) {
            buildingInfo = buildings[i];
            if (data.target !== buildingInfo) {
                continue;
            }
            buildingInfo.waiting = false;
            building = buildingInfo.building;
            if (!building.hitpoints) {
                buildings.splice(i, 1);
                break;
            }
            if (!data.resources) {
                break;
            }
            repairInfo = buildingInfo.definition.repair;
            building.hitpoints = Math.min(
                    building.hitpoints + repairInfo.hitpoints,
                    buildingInfo.definition.hitpoints);
            if (building.hitpoints === buildingInfo.definition.hitpoints) {
                buildings.splice(i, 1);
            }
            break;
        }
    };

    /**
     * Event handler for the <code>repairBuilding</code> event. The handler
     * removes the specified building from the buildings to repair if present
     * in the list of buildins to repair; or adds it to the list if the
     * building is not in the list yet.
     *
     * @param {Object} data Event's details.
     */
    this.onRepairBuilding = function (data) {
        var i;
        for (i = buildings.length; i--;) {
            if (buildings[i].building === data.building) {
                buildings.splice(i, 1);
                return;
            }
        }
        buildings.push({
            building: data.building,
            definition: BuildingsDefinition.getType(data.building.type),
            waiting: false
        });
    };
};
BuildingRepairer.prototype = new AdvancedMixedPlugin();
