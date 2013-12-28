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
    view,

    /**
     * Selected unit production buildings of the players. The indexes are
     * player IDs, the values are Building instances.
     *
     * @type Array
     */
    productionBuildings,
       
    /**
     * SFX renderer.
     * 
     * @type SFX
     */
    sfx,
            
    /**
     * ID of the current human player.
     * 
     * @type Number
     */
    playerId,
            
    /**
     * The currently selected units.
     * 
     * @type Array
     */
    selectedUnits;
    
    /**
     * Constructor.
     */
    (function () {
        selectedUnits = [];
    }.call(this));

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
                case 6: // unit is turning
                    turnUnit(unit);
                    break;
            }
        }
    };

    /**
     * Event handler for the <code>playerInitialization</code>. The event is
     * sent by the GameLoader utility.
     *
     * @param {Player} player The current human player controlling the UI
     *        repesented as a Player instance.
     */
    this.onPlayerInitialization = function (player) {
        playerId = player.id;
    };
    
    /**
     * Handles the event <code>mouseTileMove</code> sent when the user moves
     * the mouse cursor to another tile. The handler checks if the mouse is
     * hovering over a unit and notifies the SFX renderer accordingly.
     * 
     * @param {Object} data Details of the event.
     */
    this.onMouseTileMove = function (data) {
        var atTile;
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Unit) {
            sfx.setMouseoverUnit(atTile);
        } else {
            sfx.setMouseoverUnit(null);
        }
    };
    
    /**
     * Handles the <code>leftMouseButtonClick</code> event produced when the
     * user clicks on a tile using the left mouse button. The handler checks
     * whether the tile does contain a unit and notifies the SFX renderer if
     * neccessary.
     * 
     * <p>The handler selects the unit if the unit is owned by the player. The
     * handler issues a move order if the tile is empty and at least one unit
     * is currently selected by the player. The handler issues an attack order
     * if the tile contains an enemy unit or building and at least one unit is
     * selected.</p>
     * 
     * @param {Object} data Event details.
     */
    this.onLeftMouseButtonClick = function (data) {
        var atTile, unit;
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Unit) {
            if (atTile.player === playerId) {
                sfx.setSelectedUnits([atTile]);
                selectedUnits = [atTile];
            } else {
                // TODO: attack the enemy
            }
        } else if (atTile instanceof Building) {
            if (atTile.player === playerId) {
                sfx.setSelectedUnits([]);
                selectedUnits = [];
            } else {
                // TODO: attack the enemy
            }
        } else if (navigationIndex[data.y][data.x]) {
            if (selectedUnits.length === 1) {
                unit = selectedUnits[0];
                if (unit.waypoints.length) {
                    if (unit.waypoints.length > 1) {
                        unit.waypoints.splice(1, unit.waypoints.length);
                    }
                    unit.waypoints[0].x = unit.x;
                    unit.waypoints[0].y = unit.y;
                    unit.moveTargetX = unit.x;
                    unit.moveTargetY = unit.y;
                }
                unit.waypoints.push({
                    x: data.x,
                    y: data.y
                });
            } else if (selectedUnits.length) {
                // TODO: move the group
            }
        }
    };
    
    /**
     * Handles the <code>leftMouseButtonBoxSelect</code> received when the user
     * attempts to select a group of units using drag&drop-creating a select
     * box. The handler will select all units in the selection area that are
     * owned by the player.
     * 
     * @param {Object} data Event details.
     */
    this.onLeftMouseButtonBoxSelect = function (data) {
        var offsetLeft, offsetTop, x, y, newSelectedUnits, atTile;
        offsetLeft = Math.min(data.startX, data.endX);
        offsetTop = Math.min(data.startY, data.endY);
        newSelectedUnits = [];
        for (y = Math.abs(data.startY - data.endY) + 1; y--;) {
            for (x = Math.abs(data.startX - data.endX) + 1; x--;) {
                atTile = map.getObjectAt(x + offsetLeft, y + offsetTop);
                if (atTile instanceof Unit) {
                    if (atTile.player === playerId) {
                        newSelectedUnits.push(atTile);
                    }
                }
            }
        }
        if (newSelectedUnits.length) {
            sfx.setSelectedUnits(newSelectedUnits);
            sfx.setSelectedBuilding(null);
            selectedUnits = newSelectedUnits;
        }
    };
    
    /**
     * Handles the <code>rightMouseButtonClick</code> event sent when the user
     * right-click on any tile. The handler deselects any selected units.
     * 
     * @param {Object} data The details of the event.
     */
    this.onRightMouseButtonClick = function (data) {
        sfx.setSelectedUnits([]);
    };

    /**
     * Handles the <code>unitConstructionProgress</code> event. The handler
     * adds a new unit to the map if the unit's construction has been
     * completed.
     *
     * @param {Object} data Event data.
     */
    this.onUnitConstructionProgress = function (data) {
        var player, unitType, direction, unit, productionBuilding, position;
        if (data.progress < 1000) {
            return;
        }
        player = data.player;
        unitType = data.unit;
        direction = Math.floor(Math.random() * 8);
        productionBuilding = getProductionBuilding(player);
        if (!productionBuilding) {
            // Production is not possible, all central buildings have been
            // destroyed.
            return;
        }
        position = findNearestFreeTile(productionBuilding);
        unit = new Unit(position.x, position.y, direction, unitType, player);
        map.updateUnit(unit);
        view.onUnitChange(unit);
    };

    /**
     * Event handler for the <code>viewReady</vode> event. The handler sets the
     * internal view reference.
     *
     * @param {View} newView The initialized view renderer.
     */
    this.onViewReady = function (newView) {
        view = newView;
        sfx = view.getSfx();
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
        productionBuildings = [];
        map = gameMap;
        navigationIndex = map.getNavigationIndex();
    };

    /**
     * Perform turning of the provided unit on spot (provided that the unit is
     * actually turning).
     *
     * @param {Unit} unit The unit turning on spot right now.
     */
    function turnUnit(unit) {
        var progress;
        if (!unit.turningAzimuth) {
            unit.action = 4; // standing still
            return;
        }
        progress = Math.min(1000, unit.turningProgress + unit.turnSpeed);
        unit.turningProgress = progress;
        if (progress < 1000) {
            return;
        }
        if (unit.turningAzimuth > 0) {
            unit.direction = (unit.direction + 1) % 8;
            unit.turningAzimuth--;
        } else {
            unit.direction--;
            if (unit.direction === -1) {
                unit.direction = 7;
            }
            unit.turningAzimuth++;
        }
        unit.turningProgress = 0;
    }

    /**
     * Attempts to find the nearest free (unoccupied by a building or a unit)
     * tile that is accessible. The method searches the tiles in an
     * increasingly larger and larger radius around the specified building. The
     * results returned by this method are rough, but good enough in practice.
     * The positions returned by this method do not guarantee a dense
     * occupation of tiles.
     *
     * @param {Building} building The building around which the tiles should be
     *        searched.
     * @return {Object} Location of the nearest tile. The location is specified
     *         as an object with the following fields: <code>x: Number</code>
     *         specifying the X-coordinate and <code>y: Number</code>
     *         specifying the Y-coordinate.
     */
    function findNearestFreeTile(building) {
        var centralX, centralY, radius, circumference, angleStep, angle, x, y, a;
        centralX = building.x + Math.floor(building.width / 2);
        centralY = building.y + Math.floor(building.height / 2);
        radius = Math.floor((building.width + building.height) / 2) - 1;
        while (true) {
            circumference = Math.floor(2 * radius * Math.PI);
            for (angleStep = circumference; angleStep--;) {
                angle = 2 * Math.PI / circumference * angleStep;
                x = centralX + Math.floor(Math.cos(angle) * radius);
                y = centralY + Math.floor(Math.sin(angle) * radius);
                a = map.getObjectAt(x, y);
                if (!map.getObjectAt(x, y) && navigationIndex[y][x]) {
                    return {
                        x: x,
                        y: y
                    };
                }
            }
            radius++;
        }
    }

    /**
     * Returns the currently selected unit production building of the specified
     * player. The method attemps to find such building if none is known. The
     * method returns <code>null</code> if now such building exists.
     *
     * @param {Number} playerID The ID of the player owning the building.
     * @return {Building} The currently selected unit production building owned
     *         by the specified player.
     */
    function getProductionBuilding(playerID) {
        var i, building, buildings, centralBuildings;
        if (productionBuildings[playerID] instanceof Building) {
            return productionBuildings[playerID];
        }
        buildings = map.getBuildings();
        centralBuildings = [];
        for (i = buildings.length; i--;) {
            building = buildings[i];
            if ((building.player === playerID) && building.isCentral) {
                if (building.isSelectedUnitProductionBuilding) {
                    productionBuildings[playerID] = building;
                    return building;
                }
                centralBuildings.push(building);
            }
        }
        if (centralBuildings.length) {
            building = centralBuildings.shift();
            building.isSelectedUnitProductionBuilding = true;
            productionBuildings[playerID] = building;
            return building;
        }
        return null;
    }

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
        startMovingUnitToNextTile(unit);
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
        startMovingUnitToNextTile(unit);
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
        while ((unit.x === unit.moveTargetX) &&
                (unit.y === unit.moveTargetY)) {
            unit.waypoints.shift();
            if (unit.waypoints.length) {
                waypoint = unit.waypoints[0];
                unit.moveTargetX = waypoint.x;
                unit.moveTargetY = waypoint.y;
            } else {
                unit.action = 4; // stand still
                unit.moveTargetX = null;
                unit.moveTargetY = null;
                return;
            }
        }
        startMovingUnitToNextTile(unit);
    }

    /**
     * Starts the process of moving the unit to the next tile on its path. The
     * method first checks whether the unit is facing a reasonable direction
     * for achieving its destination target (facing towards the destination and
     * an empty tile or a tile occupied by unit already moving away). The
     * method sets the unit to turning mode if the direction is wrong.
     *
     * <p>If the unit is facing the right direction, the method checks whether
     * there isn't a unit ahead that is moving away from this unit. If there
     * is, the provided unit is switched to the waiting mode - the unit waits
     * for the tile ahead to be freed.</p>
     *
     * <p>Finally, if the tile ahead is empty, the unit registers the tile as
     * its new location, frees up its current tile and starts moving to the new
     * tile.</p>
     *
     * @param {Unit} unit The traveling unit.
     */
    function startMovingUnitToNextTile(unit) {
        var targetDirection, azimuth;
        // check direction - should we turn ?
        targetDirection = getReasonableDirection(unit, unit.moveTargetX,
                unit.moveTargetY);
        if (targetDirection !== unit.direction) {
            azimuth = unit.direction - targetDirection;
            if (azimuth < -4) {
                azimuth = 8 + azimuth;
            }
            if (azimuth > 4) {
                azimuth = -(8 - azimuth);
            }
            unit.turningAzimuth = -azimuth;
            unit.turningProgress = 0;
            unit.action = 6; // turning
            return;
        }
        // is the unit in front of us moving - should we wait?
        if (checkAheadMovingUnit(unit) === 2) {
            unit.action = 5; // wait
            return;
        }
        // start movement to other tile
        unit.move(1); // sets unit.action = 2
        map.updateUnit(unit);
        view.onUnitChange(unit);
        unit.action = 3;
    }

    /**
     * Returns the direction that is the best option for the provided unit to
     * take in order to reach the specified target location.
     *
     * @param {Unit} unit The traveling unit.
     * @param {type} targetX The X-coordinate of the unit's destination.
     * @param {type} targetY The Y-coordinate of the unit's destination.
     * @returns {Number} The direction the unit should be facing to reach its
     *          goal.
     */
    function getReasonableDirection(unit, targetX, targetY) {
        var headDirection, oldDirection, reasonableDirectionAzimuth,
                reasonableDirection;
        headDirection = getPreferredDirection(unit, targetX, targetY);
        oldDirection = unit.direction;
        unit.direction = headDirection;
        reasonableDirectionAzimuth = findFreeDirection(unit, oldDirection);
        unit.direction = oldDirection;
        reasonableDirection = headDirection + reasonableDirectionAzimuth;
        if (reasonableDirection < 0) {
            reasonableDirection += 8;
        } else if (reasonableDirection > 7) {
            reasonableDirection %= 8;
        }
        return reasonableDirection;
    }

    /**
     * Returns the preferred direction for the provided unit if the unit is to
     * move to the specified location. The method assumes that the direct path
     * to the specified destination is (mostly) clear, so no or minimal
     * deviations would be required during the transporation.
     *
     * @param {Unit} unit The unit that is about to move to the specified
     *        location.
     * @param {Number} targetX The X-coordinate of the unit's destination.
     * @param {Number} targetY The Y-coordinate of the unit's destination.
     */
    function getPreferredDirection(unit, targetX, targetY) {
        var deltaX, deltaY, sourceOffset, destinationOffset;
        deltaX = targetX - unit.x;
        deltaY = targetY - unit.y;
        sourceOffset = unit.y % 2;
        destinationOffset = targetY % 2;
        deltaX += destinationOffset - sourceOffset;
        if (deltaX === 0) {
            if (deltaY > 0) {
                return 4; // south
            }
            return 0; // north
        }
        if (deltaY === 0) {
            if (deltaX > 0) {
                return 2; // east
            }
            return 6; // west
        }
        if (deltaY < 0) {
            if (deltaX > 0) {
                return 1; // north-east
            }
            return 7; // north-west
        }
        if (deltaX > 0) {
            return 3; // south-east
        }
        return 5; // south-west
    }

    /**
     * Returns the azimuth direction the unit should turn in order to face an
     * empty accessible tile. The azimuth direction id a unit turning offset,
     * for example: -2 means the unit should turn counter-clockwise twice, 1
     * means the unit should turn once clockwise.
     *
     * @param {Unit} unit The unit that is about to move to the next tile.
     * @param {Number} preferedDirection The unit's last prefered direction to
     *        move. This is used to find the direction with least amount of
     *        turning neccessary.
     * @returns {Number} The azimuth direction the unit should turn to so it
     *          could move to a free tile. The direction is always within the
     *          [-4, 4] interval.
     */
    function findFreeDirection(unit, preferedDirection) {
        var direction;
        if (isFreeDirection(unit, 0)) {
            return 0;
        }
        if (preferedDirection > unit.direction) {
            for (direction = 1; direction < 5; direction++) {
                if (isFreeDirection(unit, direction)) {
                    return direction;
                }
            }
            for (direction = 1; direction < 4; direction++) {
                if (isFreeDirection(unit, -direction)) {
                    return -direction;
                }
            }
        } else {
            for (direction = 1; direction < 5; direction++) {
                if (isFreeDirection(unit, -direction)) {
                    return -direction;
                }
            }
            for (direction = 1; direction < 4; direction++) {
                if (isFreeDirection(unit, direction)) {
                    return direction;
                }
            }
        }
        return null;
    }

    /**
     * Checks whether the specified direction is free for the provided unit to
     * move to.
     *
     * @param {Unit} unit The unit that is about to move.
     * @param {Number} direction The direction to test.
     * @return {Boolean} <code>true</code> if the specified direction is free
     *         for the unit to move to.
     */
    function isFreeDirection(unit, direction) {
        var coordinates, item;
        coordinates = unit.getCoordinatesAtDirection(direction);
        item = map.getObjectAt(coordinates.x, coordinates.y);
        if (item) {
            if ((item instanceof Unit) && (item.action === 3)) {
                if (((unit.direction + 8 - item.direction) % 8) !== 4) {
                    return true; // units are not facing each other
                }
            }
        }
        return navigationIndex[coordinates.y][coordinates.x];
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
