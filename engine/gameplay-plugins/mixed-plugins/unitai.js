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
     * Current map's navigation index.
     *
     * @type Array
     */
    navigationIndex,

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
                case 0: // just created
                    unit.action = 4;
                    break;
                case 1: // destroyed
                    break;
                case 2: // released current tile and starts moving to new tile
                    startMovingUnitProgress(unit);
                    break;
                case 3: // moving
                    moveUnit(unit);
                    break;
                case 4: // standing still
                    if (unit.waypoints.length) {
                        startMovingUnit(unit);
                    }
                    break;
                case 5: // unit is waiting for the tile ahead to be freed up
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
        map.getUnits().forEach(function (unit) {
            if (unit.action === 0) { // just created
                unit.action = 4; // standing still
            }
        });
    };

    /**
     * Event handler for the <code>gameMapInitialization</code> event. The
     * handler sets the internal map reference.
     *
     * @param {Map} gameMap The current game map.
     */
    this.onGameMapInitialization = function (gameMap) {
        map = gameMap;
        navigationIndex = map.getNavigationIndex();
    };

    /**
     * The unit has waypoint(s) set to itself, but is standing still. The
     * method initiates the unit's movement. This method is executed if the
     * unit is standing still and its waypoints are not empty.
     *
     * @param {Unit} unit The unit that should start its movement.
     */
    function startMovingUnit(unit) {
        var waypoint;
        waypoint = unit.waypoints[0];
        while ((waypoint.x === unit.x) && (waypoint.y === unit.y)) {
            unit.waypoints.shift();
            waypoint = unit.waypoints[0];
            if (!waypoint) {
                return;
            }
        }
        unit.moveTargetX = waypoint.x;
        unit.moveTargetY = waypoint.y;
        switch (checkAheadMovingUnit(unit)) {
            case 0: // move ahead
                unit.move(1);
                map.updateUnit(unit);
                view.onUnitChange(unit);
                unit.action = 3; // will execute moveUnit()
                break;
            case 1: // bypass the obstacle ahead
                // TODO
                break;
            case 2: // wait
                unit.action = 5;
                return;
        }
    }

    /**
     * Handles a start of unit movement - this method is executed only when the
     * unit starts it movement from standing on spot. Executing this method in
     * another tick after executing the moveUnit method would lead to the unit
     * "jumping" on the screen between two tiles.
     *
     * @param {Unit} unit The unit that just started to move.
     */
    function startMovingUnitProgress(unit) {
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
        var waypoint;
        unit.setMoveOffset(Math.min(1000, unit.moveOffset + unit.speed));
        if (unit.moveOffset < 1000) {
            return;
        }
        // have we reached the waypoint?
        if ((unit.x === unit.moveTargetX) && (unit.y === unit.moveTargetY)) {
            unit.waypoints.shift();
            if (unit.waypoints.length) {
                waypoint = unit.waypoints[0];
                unit.moveTargetX = waypoint.x;
                unit.moveTargetY = waypoint.y;
            } else {
                unit.action = 4; // stand still
                unit.moveTargetX = null;
                unit.moveTargetY = null;
            }
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

    /**
     * Returns the azimuth direction the unit should turn in order to face an
     * empty accessible tile. The azimuth direction id a unit turning offset,
     * for example: -2 means the unit should turn counter-clockwise twice, 1
     * means the unit should turn once clockwise.
     *
     * @param {Unit} unit
     * @returns {Number} The azimuth direction the unit should turn to so it
     *          could move to a free tile. The direction is always within the
     *          [-4, 4] interval.
     */
    function findFreeDirection(unit) {
        var direction, coordinates, item;
        for (direction = 0; direction < 5; direction++) {
            coordinates = unit.getCoordinatesAtDirection(direction);
            item = map.getObjectAt(coordinates.x, coordinates.y);
            if (item) {
                if ((item instanceof Unit) && (item.action === 3)) {
                    if (((unit.direction + 8 - item.direction) % 8) !== 4) {
                        return direction; // units are not facing each other
                    }
                }
            }
            if (navigationIndex[coordinates.y][coordinates.x]) {
                return direction;
            }
            coordinates = unit.getCoordinatesAtDirection(-direction);
            item = map.getObjectAt(coordinates.x, coordinates.y);
            if (item) {
                if ((item instanceof Unit) && (item.action === 3)) {
                    if (((unit.direction + 8 - item.direction) % 8) !== 4) {
                        return -direction; // units are not facing each other
                    }
                }
            }
            if (navigationIndex[coordinates.y][coordinates.x]) {
                return -direction;
            }
        }
        return null;
    }

    /**
     * Checks the tile directly ahead of the provided unit and returns a number
     * representing the recomended action, provided that the unit is moving.
     * The returned value can be one of the following:
     *
     * <ul>
     *     <li>0 - the unit may move ahead freely, the tile ahead is free.</li>
     *     <li>1 - the tile ahead is occupied, the unit should try to move past
     *         the obstacle.</li>
     *     <li>2 - the tile ahead is occupied by a moving unit that is NOT
     *         heading towards the provided unit. The unit should wait, because
     *         the tile ahead will be free soon.</li>
     * </ul>
     *
     * @param {Unit} unit
     * @returns {Number}
     */
    function checkAheadMovingUnit(unit) {
        var aheadCoordinates, ahead;
        aheadCoordinates = unit.getAheadCoordinates();
        ahead = map.getObjectAt(aheadCoordinates.x, aheadCoordinates.y);
        if (ahead) {
            if ((ahead instanceof Unit) && (ahead.action === 3)) {
                if (((unit.direction + 8 - ahead.direction) % 8) === 4) {
                    return 1; // the units are facing each other
                }
                return 2;
            }
            return 1;
        }
        if (navigationIndex[aheadCoordinates.y][aheadCoordinates.x]) {
            return 0;
        }
        return 1;
    }
};
UnitAI.prototype = new AdvancedMixedPlugin();
