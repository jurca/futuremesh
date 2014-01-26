"use strict";
var PowerManagement;

/**
 * The Power Management plugin calculates the current energy consumption and
 * production of all players and notifies other plugins about energy level
 * fluctiuations among players.
 * 
 * @constructor
 */
PowerManagement = function () {
    /**
     * The current energy levels of all players. Each energy level is
     * represented by an object with the following fields:
     * 
     * <ul>
     *     <li><code>player: Number</code> - ID of the player.</li>
     *     <li><code>production: Number</code> - energy production of the
     *         player.</li>
     *     <li><code>consumption: Number</code> - energy consumption of the
     *         player.</li>
     *     <li><code>level: Number</code> - energy level calculated as
     *         <code>production - consumption</code>.</li>
     * </ul>
     * 
     * @type Array
     */
    var energyLevels;
    
    /**
     * Constructor.
     */
    (function () {
        energyLevels = [];
    }.call(this));
    
    this.onUnitDestroyed = function (data) {
        var unit, energyLevel, definition;
        unit = data.unit;
        energyLevel = getEnergyLevel(unit.player);
        definition = UnitsDefinition.getType(unit.type);
        if (definition.powerRequirement > 0) {
            energyLevel.consumption -= definition.powerRequirement;
            energyLevel.level += definition.powerRequirement;
        } else {
            energyLevel.production += definition.powerRequirement;
            energyLevel.level += definition.powerRequirement;
        }
        this.sendEvent("energyLevelUpdate", energyLevel);
    };
    
    this.onUnitCreated = function (data) {
        var unit, energyLevel, definition;
        unit = data.unit;
        energyLevel = getEnergyLevel(unit.player);
        definition = UnitsDefinition.getType(unit.type);
        if (definition.powerRequirement > 0) {
            energyLevel.consumption += definition.powerRequirement;
            energyLevel.level -= definition.powerRequirement;
        } else {
            energyLevel.production -= definition.powerRequirement;
            energyLevel.level -= definition.powerRequirement;
        }
        this.sendEvent("energyLevelUpdate", energyLevel);
    };
    
    /**
     * Event handler for the <code>buildingDestroyed</code> event. The handler
     * updates the energy level for the related player.
     * 
     * @param {Object} data Event's details.
     */
    this.onBuildingDestroyed = function (data) {
        var building, energyLevel, definition;
        building = data.building;
        energyLevel = getEnergyLevel(building.player);
        definition = BuildingsDefinition.getType(building.type);
        if (definition.powerRequirement > 0) {
            energyLevel.consumption -= definition.powerRequirement;
            energyLevel.level += definition.powerRequirement;
        } else {
            energyLevel.production += definition.powerRequirement;
            energyLevel.level += definition.powerRequirement;
        }
        this.sendEvent("energyLevelUpdate", energyLevel);
    };
    
    /**
     * Event handler for the <code>buildingPlaced</code> event. The handler
     * updates the energy level for the related player.
     * 
     * @param {Object} data Event's details.
     */
    this.onBuildingPlaced = function (data) {
        var building, energyLevel, definition;
        building = data.building;
        energyLevel = getEnergyLevel(building.player);
        definition = BuildingsDefinition.getType(building.type);
        if (definition.powerRequirement > 0) {
            energyLevel.consumption += definition.powerRequirement;
            energyLevel.level -= definition.powerRequirement;
        } else {
            energyLevel.production -= definition.powerRequirement;
            energyLevel.level -= definition.powerRequirement;
        }
        this.sendEvent("energyLevelUpdate", energyLevel);
    };
    
    /**
     * Handler for the <code>gameMapInitialization</code> event. The handler
     * sets the map reference.
     *
     * @param {Map} gameMap The current game map.
     */
    this.onGameMapInitialization = function (gameMap) {
        var buildings, i, building, energyLevel, units, unit, definition;
        buildings = gameMap.getBuildings();
        for (i = buildings.length; i--;) {
            building = buildings[i];
            energyLevel = getEnergyLevel(building.player);
            definition = BuildingsDefinition.getType(building.type);
            if (definition.powerRequirement > 0) {
                energyLevel.consumption += definition.powerRequirement;
                energyLevel.level -= definition.powerRequirement;
            } else {
                energyLevel.production -= definition.powerRequirement;
                energyLevel.level -= definition.powerRequirement;
            }
        }
        units = gameMap.getUnits();
        for (i = units.length; i--;) {
            unit = units[i];
            energyLevel = getEnergyLevel(unit.player);
            definition = UnitsDefinition.getType(unit.type);
            if (definition.powerRequirement > 0) {
                energyLevel.consumption += definition.powerRequirement;
                energyLevel.level -= definition.powerRequirement;
            } else {
                energyLevel.production -= definition.powerRequirement;
                energyLevel.level -= definition.powerRequirement;
            }
        }
        for (i = energyLevels.length; i--;) {
            this.sendEvent("energyLevelUpdate", energyLevels[i]);
        }
    };
    
    /**
     * Returns the energy level description object for the specified player.
     * The object is created if not already exists.
     * 
     * @param {Number} player The ID of the player.
     * @return {Object} The energy level description object for the specified
     *         player.
     */
    function getEnergyLevel(player) {
        var i, energyLevel;
        for (i = energyLevels.length; i--;) {
            if (energyLevels[i].player === player) {
                energyLevel = energyLevels[i];
                break;
            }
        }
        if (!energyLevel) {
            energyLevel = {
                player: player,
                production: 0,
                consumption: 0,
                level: 0
            };
            energyLevels.push(energyLevel);
        }
        return energyLevel;
    }
};
PowerManagement.prototype = new AdvancedEventDrivenPlugin();
