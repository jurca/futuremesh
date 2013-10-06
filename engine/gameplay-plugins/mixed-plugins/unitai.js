"use strict";
var UnitAI;

/**
 * The Unit AI plug-in is a module that manages and performs execution of the
 * commands assigned to units.
 *
 * @constructor
 */
UnitAI = function () {
    /**
     * The current game map. The plug-in uses it to access all units
     *
     * @type Map
     */
    var map,

    /**
     * The current view renderer.
     *
     * @type View
     */
    view;

    // override
    this.handleTick = function () {
        var i, units, unit;
        units = map.getUnits();
        for (i = units.length; i--;) {
            unit = units[i];
            switch (unit.action) {
                case 2: // released current tile and starts moving to new tile
                    startMovingUnit(unit);
                case 3: // moving
                    moveUnit(unit);
                    break;
            }
        }
    };

    /**
     * Event handler for the <code>viewReady</vode> event. The handler sets the
     * internal view reference.
     *
     * @param {View} newView The initialized view renderer.
     */
    this.onViewReady = function (newView) {
        view = newView;
    };

    /**
     * Event handler for the <code>gameMapInitialization</code> event. The
     * handler sets the internal map reference.
     *
     * @param {Map} gameMap The current game map.
     */
    this.onGameMapInitialization = function (gameMap) {
        map = gameMap;
    };

    /**
     * Handles a start of unit movement - this method is executed only when the
     * unit starts it movement from standing on spot. Executing this method in
     * another tick after executing the moveUnit method would lead to the unit
     * "jumping" on the screen between two tiles.
     *
     * @param {Unit} unit The unit that just started to move.
     */
    function startMovingUnit(unit) {
        // TODO: check direction - should we turn?
            // TODO: is the unit in front of us moving - should we wait?
        // TODO: set rotation mode if necessary
        // "commit" the movement to other tile to map and view
        map.updateUnit(unit);
        view.onUnitChange(unit);
        unit.action = 3; // moveUnit(unit) will be executed next
    }

    /**
     * Handles movement of the provided unit by updating its location,
     * direction, action and all properties related to unit movement to make
     * the unit actually move across the map.
     *
     * @param {Unit} unit A currently moving unit to update.
     */
    function moveUnit(unit) {
        unit.setMoveOffset(Math.min(1000, unit.moveOffset + unit.speed));
        if (unit.moveOffset < 1000) {
            return;
        }
        // TODO: check direction - should we turn ?
            // TODO: is the unit in front of us moving - should we wait?
        // TODO: set rotation mode if necessary
        // start movement to other tile
        unit.move(1); // sets unit.action = 2
        map.updateUnit(unit);
        view.onUnitChange(unit);
        unit.action = 3;
    }
};
UnitAI.prototype = new AdvancedMixedPlugin();
