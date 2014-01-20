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
     * The currently selected units.
     *
     * @type Array
     */
    selectedUnits,

    /**
     * The current instance of this plugin.
     *
     * @type UnitAI
     */
    instance,

    /**
     * Maximum vision range of all units.
     *
     * @type Number
     */
    maximumVisionRange;

    /**
     * Constructor.
     */
    (function () {
        var configuration;
        selectedUnits = [];
        instance = this;
        configuration = Settings.pluginConfiguration.UnitAI;
        maximumVisionRange = configuration.maximumVisionRange;
    }.call(this));

    // override
    this.handleTick = function () {
        var i, units, unit;
        units = map.getUnits();
        for (i = units.length; i--;) {
            unit = units[i];
            if (unit.firingTimer < 1000) {
                unit.firingTimer = Math.min(1000,
                        unit.firingTimer + unit.firingSpeed);
            }
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
                    handleStandingStill(unit);
                    break;
                case 5: // unit is waiting for the tile ahead to be freed up
                    wait(unit);
                    break;
                case 6: // unit is turning
                    turnUnit(unit);
                    break;
                case 7:
                    attackTarget(unit);
                    break;
                default:
                    throw new Error("Unsupported unit action: " + unit.action);
            }
        }
    };

    /**
     * Event handler for the <code>issueAttackUnitOrder</code> event. The
     * handler issues the attack order to the specified units.
     *
     * @param {Object} data Event's data.
     */
    this.onIssueAttackUnitOrder = function (data) {
        selectedUnits = data.units;
        issueAttackUnitOrder(data.target);
    };

    /**
     * Event handler for the <code>issueAttackBuildingOrder</code> event. The
     * handler issues the attack order to the specified units.
     *
     * @param {Object} data Event's data.
     */
    this.onIssueAttackBuildingOrder = function (data) {
        selectedUnits = data.units;
        issueAttackBuildingOrder(data.target);
    };

    /**
     * Event handler for the <code>issueHarvestOrder</code> event. The handler
     * issues the harvest order to the specified units.
     *
     * @param {Object} data Event's data.
     */
    this.onIssueHarvestOrder = function (data) {
        selectedUnits = data.units;
        issueHarvestOrder(data.x, data.y, data.target, data.type);
    };

    /**
     * Event handler for the <code>issueMoveOrder</code> event. The handler
     * issues the move order to the specified units.
     *
     * @param {Object} data Event's data.
     */
    this.onIssueMoveOrder = function (data) {
        selectedUnits = data.units;
        issueMoveOrder(data.x, data.y);
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
     * Filters dead units from the provided array.
     *
     * @param {Array} units The units to filter.
     * @return {Array} Units that are not dead yet.
     */
    function filterDeadUnits(units) {
        var result, i, length;
        result = [];
        length = units.length;
        for (i = 0; i < length; i++) {
            if (units[i].hitpoints) {
                result.push(units[i]);
            }
        }
        return result;
    }

    /**
     * Issues an "attack unit" order to the currently selected units.
     *
     * @param {Unit} targetUnit The unit to target and attack.
     */
    function issueAttackUnitOrder(targetUnit) {
        var i, unit, moveToX, moveToY;
        moveToX = targetUnit.x;
        moveToY = targetUnit.y;
        selectedUnits = filterDeadUnits(selectedUnits);
        for (i = selectedUnits.length; i--;) {
            unit = selectedUnits[i];
            if (!unit.attackPower) {
                continue;
            }
            unit.target = targetUnit;
            unit.moveTargetX = moveToX;
            unit.moveTargetY = moveToY;
            unit.waypoints = [{
                x: moveToX,
                y: moveToY
            }];
        }
    }

    /**
     * Makes the provided unit attack its target.
     *
     * @param {Unit} unit The unit that should attack its target.
     */
    function attackTarget(unit) {
        var target, projectile, targetX, targetY, distance, unitType, offsets,
                offset, i, tile;
        if (unit.firingTimer < 1000) {
            return;
        }
        target = unit.target;
        if (!target.hitpoints) {
            if (!lookForAnotherTarget(unit)) {
                unit.target = null;
                unit.waypoints = [];
                unit.action = 4; // stand still
            }
            return;
        }
        if (target instanceof Building) {
            tile = getBuildingTargetTile(target);
            targetX = tile.x;
            targetY = tile.y;
        } else { // Unit
            targetX = target.x;
            targetY = target.y;
        }
        distance = getTargetDistance(unit);
        if (distance > unit.attackRange) { // target is too far, move closer
            unit.action = 3; // move
            return;
        }
        unitType = UnitsDefinition.getType(unit.type);
        offsets = unitType.projectileOffsets[unit.direction];
        for (i = offsets.length; i--;) {
            offset = offsets[i];
            projectile = new Projectile(unitType.projectileType,
                    PlayersDefinition.getType(unit.player),
                    unit.x, unit.y, targetX, targetY, offset.x, offset.y, 0.5,
                    0.5, unitType.projectileDuration, unit, unit.attackPower);
            map.addProjectile(projectile);
        }
        unit.firingTimer = 0;
    };

    /**
     * Returns the coordinates of the tile that should be attacked by a unit
     * attacking the provided building.
     *
     * @param {Building} building The building to be attacked.
     */
    function getBuildingTargetTile(building) {
        return {
            x: building.x + building.width - Math.ceil(building.height / 2),
            y: building.y + Math.ceil(building.height / 2)
        };
    }

    /**
     * Looks around the provided unit for the nearest suitable target to attack
     * within the unit's vision range. The method issues an attack order if
     * such target is found.
     *
     * @param {Unit} unit The unit looking for another target.
     * @return {Boolean} <code>true</code> if a target has been found.
     */
    function lookForAnotherTarget(unit) {
        var radius, circumference, angle, x, y, atTile, buildingType, selected,
                i, unitType;
        unitType = UnitsDefinition.getType(unit.type);
        for (radius = 1; radius < unitType.visionRange; radius++) {
            circumference = Math.floor(Math.PI * 2 * radius);
            for (i = circumference; i--;) {
                angle = Math.PI * 2 / circumference * i;
                x = unit.x + Math.floor(Math.cos(angle) * radius);
                y = unit.y + Math.floor(Math.sin(angle) * radius);
                atTile = map.getObjectAt(x, y);
                if (!atTile) {
                    continue;
                }
                if (atTile instanceof Building) {
                    if (atTile.player === unit.player) {
                        continue;
                    }
                    buildingType = BuildingsDefinition.getType(atTile.type);
                    if (buildingType.resource !== null) {
                        continue;
                    }
                    selected = selectedUnits;
                    selectedUnits = [unit];
                    unit.action = 4; // standing still
                    issueAttackBuildingOrder(atTile);
                    selectedUnits = selected;
                    return true;
                } else { // Unit
                    if (atTile.player === unit.player) {
                        continue;
                    }
                    selected = selectedUnits;
                    selectedUnits = [unit];
                    unit.action = 4; // standing still
                    issueAttackUnitOrder(atTile);
                    selectedUnits = selected;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Handles the unit's "stand still" action. The method checks whether the
     * unit should not be performing some other action and modifies the unit's
     * properties acordingly.
     *
     * @param {Unit} unit The unit standing still.
     */
    function handleStandingStill(unit) {
        if (unit.harvest) {
            if (unit.harvest.type === false) {
                unit.harvest = null;
            } else if ((unit.x !== unit.harvest.x) ||
                    (unit.y !== unit.harvest.y)) {
                unit.waypoints.push({
                    x: unit.harvest.x,
                    y: unit.harvest.y
                });
            } else {
                harvestResource(unit);
            }
        }
        if (unit.waypoints.length) {
            startMovingUnit(unit);
        }
    }

    /**
     * Issues an attack order to the selected units to attack the specified
     * building.
     *
     * @param {Building} building The building to attack.
     */
    function issueAttackBuildingOrder(building) {
        var i, unit, moveToX, moveToY, tile;
        tile = getBuildingTargetTile(building);
        moveToX = tile.x;
        moveToY = tile.y;
        selectedUnits = filterDeadUnits(selectedUnits);
        for (i = selectedUnits.length; i--;) {
            unit = selectedUnits[i];
            if (!unit.attackPower) {
                continue;
            }
            unit.target = building;
            unit.moveTargetX = moveToX;
            unit.moveTargetY = moveToY;
            unit.waypoints = [{
                x: moveToX,
                y: moveToY
            }];
        }
    }

    /**
     * Handles resource harvesting by the provided unit.
     *
     * @param {Unit} unit The unit harvesting the resource.
     */
    function harvestResource(unit) {
        var unitType, maxHarvest, harvestAmount, resourceGain, resourcesGain,
                i, radius, circumference, angle, x, y, atTile, buildingType;
        unitType = UnitsDefinition.getType(unit.type);
        maxHarvest = unitType.harvestSpeed;
        harvestAmount = Math.min(unit.harvest.hitpoints, maxHarvest);
        unit.harvest.hitpoints -= harvestAmount;
        resourceGain = harvestAmount * unitType.harvestEfficiency;
        resourcesGain = new Array(unitType.resource);
        for (i = resourcesGain.length; i--;) {
            resourcesGain[i] = 0;
        }
        resourcesGain[unitType.resource] = resourceGain;
        instance.sendEvent("resourcesGained", {
            player: unit.player,
            resources: resourcesGain
        });
        if (!unit.harvest.hitpoints) {
            view.onBuildingChange(unit.harvest);
            map.removeBuilding(unit.harvest);
            unit.harvest = null;
            for (radius = 1; radius < 10; radius++) {
                circumference = Math.floor(Math.PI * 2 * radius);
                for (i = circumference; i--;) {
                    angle = Math.PI * 2 / circumference * i;
                    x = unit.x + Math.floor(Math.cos(angle) * radius);
                    y = unit.y + Math.floor(Math.sin(angle) * radius);
                    atTile = map.getObjectAt(x, y);
                    if (!(atTile instanceof Building)) {
                        continue;
                    }
                    buildingType = BuildingsDefinition.getType(atTile.type);
                    if (buildingType.resource !== unitType.resource) {
                        continue;
                    }
                    unit.harvest = atTile;
                    return;
                }
            }
        }
    }

    /**
     * Issues the harvest order to the currently selected units.
     *
     * @param {Number} x X-coordinate of the tile that was clicked.
     * @param {Number} y Y-coordinate of the tile that was clicked.
     * @param {Building} building The building representing the resource to
     *        harvest.
     * @param {Object} buildingType Definition of the building's type.
     */
    function issueHarvestOrder(x, y, building, buildingType) {
        var center, i, unit, unitType, realSelectedUnits, atTile, tileX, tileY,
                usedTiles, requiresAlternative, incompatibleUnits;
        selectedUnits = filterDeadUnits(selectedUnits);
        realSelectedUnits = selectedUnits;
        usedTiles = [];
        requiresAlternative = [];
        incompatibleUnits = [];
        center = getUnitGroupCenter(realSelectedUnits);
        for (i = realSelectedUnits.length; i--;) {
            unit = realSelectedUnits[i];
            unitType = UnitsDefinition.getType(unit.type);
            if (unitType.resource === buildingType.resource) {
                tileX = x + unit.x - center.x;
                tileY = y + unit.y - center.y;
                atTile = map.getObjectAt(tileX, tileY);
                if ((atTile instanceof Building) &&
                        (atTile.type === building.type)) {
                    unit.harvest = atTile;
                    selectedUnits = [unit];
                    issueMoveOrder(tileX, tileY);
                    usedTiles.push({
                        x: tileX,
                        y: tileY
                    });
                } else { // find some alternative
                    requiresAlternative.push(unit);
                }
            } else {
                incompatibleUnits.push(unit);
            }
        }
        issueHarvestOrderAlternatives(x, y, building, requiresAlternative,
                center, usedTiles);
        selectedUnits = incompatibleUnits;
        issueMoveOrder(x, y);
        selectedUnits = realSelectedUnits;
    }

    /**
     * Issues the harvest order to the remaining harverster units that could
     * not have been ordered to harvest the resource at the expected location.
     *
     * @param {Number} x X-coordinate of the tile that was clicked.
     * @param {Number} y Y-coordinate of the tile that was clicked.
     * @param {Building} building The building representing the resource to
     *        harvest.
     * @param {Array} requiresAlternative The units that require some other
     *        than expected tile containing a resource-building to harvest.
     * @param {Object} center Location of the center of the group of the units.
     * @param {Array} usedTiles Tiles to which other units will go to harvest
     *        resources.
     */
    function issueHarvestOrderAlternatives(x, y, building, requiresAlternative,
            center, usedTiles) {
        var unitCycle, i, unit, tileCenterX, tileCenterY, radius,
                circumference, j, walkCircle, angle, tileX, tileY, k, tile,
                atTile;
        unitCycle: for (i = requiresAlternative.length; i--;) {
            unit = requiresAlternative[i];
            tileCenterX = x + unit.x - center.x;
            tileCenterY = y + unit.y - center.y;
            for (radius = 1; radius < 5; radius++) {
                circumference = Math.floor(2 * radius * Math.PI);
                walkCircle: for (j = circumference; j--;) {
                    angle = Math.PI * 2 / circumference * j;
                    tileX = tileCenterX + Math.floor(Math.cos(angle) * radius);
                    tileY = tileCenterY + Math.floor(Math.sin(angle) * radius);
                    for (k = usedTiles.length; k--;) {
                        tile = usedTiles[k];
                        if ((tile.x === tileX) && (tile.y === tileY)) {
                            continue walkCircle;
                        }
                    }
                    atTile = map.getObjectAt(tileX, tileY);
                    if (!(atTile instanceof Building) ||
                            (atTile.type !== building.type)) {
                        continue;
                    }
                    unit.harvest = atTile;
                    selectedUnits = [unit];
                    issueMoveOrder(tileX, tileY);
                    usedTiles.push({
                        x: tileX,
                        y: tileY
                    });
                    continue unitCycle;
                }
            }
        }
    }

    /**
     * Returns the location in (tile coordinates) of the center of the
     * specified unit group.
     *
     * @param {Array} units The group of units.
     * @return {Object} Location of the group's center. The object has the
     *         following fields:
     *         <ul>
     *             <li><code>x: Number</code> - X-coordinate of the
     *                 center.</li>
     *             <li><code>Y: Number</code> - Y-coordinate of the
     *                 center.</li>
     *         </ul>
     */
    function getUnitGroupCenter(units) {
        var unit, minX, minY, maxX, maxY, i;
        unit = selectedUnits[selectedUnits.length - 1];
        minX = unit.x;
        minY = unit.y;
        maxX = unit.x;
        maxY = unit.y;
        for (i = units.length - 1; i--;) {
            unit = units[i];
            minX = Math.min(minX, unit.x);
            minY = Math.min(minY, unit.y);
            maxX = Math.max(maxX, unit.x);
            maxY = Math.max(maxY, unit.y);
        }
        return {
            x: Math.round((minX + maxX) / 2),
            y: Math.round((minY + maxY) / 2)
        };
    }

    /**
     * Issues a move order to the currently selected unit(s).
     *
     * @param {Number} x X-coordinate of the tile to which the selected unit(s)
     *        should move.
     * @param {Number} y Y-coordinate of the tile to which the selected unit(s)
     *        should move.
     */
    function issueMoveOrder(x, y) {
        var unit;
        selectedUnits = filterDeadUnits(selectedUnits);
        if (selectedUnits.length === 1) {
            unit = selectedUnits[0];
            trimUnitWaypoints(unit);
            unit.waypoints.push({
                x: x,
                y: y
            });
            if (unit.target) {
                unit.target = null;
                unit.action = 4; // stand still
            }
        } else if (selectedUnits.length) {
            issueGroupMoveOrder(x, y);
        }
    }

    /**
     * Issues the move order to a group of units. The order is issued to the
     * currently selected units, which must contain at least 2 units.
     *
     * @param {Number} x The X-coordinate of the tile to which the group should
     *        move.
     * @param {Number} y The Y-coordinate of the tile to which the group should
     *        move.
     */
    function issueGroupMoveOrder(x, y) {
        var minX, minY, maxX, maxY, i, unit, centerX, centerY;
        unit = selectedUnits[selectedUnits.length - 1];
        minX = unit.x;
        minY = unit.y;
        maxX = unit.x;
        maxY = unit.y;
        for (i = selectedUnits.length - 1; i--;) {
            unit = selectedUnits[i];
            minX = Math.min(minX, unit.x);
            minY = Math.min(minY, unit.y);
            maxX = Math.max(maxX, unit.x);
            maxY = Math.max(maxY, unit.y);
        }
        if ((x < minX) || (x > maxX) || (y < minY) || (y > maxY)) {
            centerX = Math.round((minX + maxX) / 2);
            centerY = Math.round((minY + maxY) / 2);
            for (i = selectedUnits.length; i--;) {
                unit = selectedUnits[i];
                trimUnitWaypoints(unit);
                unit.waypoints.push({
                    x: x + unit.x - centerX,
                    y: y + unit.y - centerY
                });
            }
        } else {
            for (i = selectedUnits.length; i--;) {
                unit = selectedUnits[i];
                trimUnitWaypoints(unit);
                unit.waypoints.push({
                    x: x,
                    y: y
                });
            }
        }
        for (i = selectedUnits.length; i--;) {
            unit = selectedUnits[i];
            if (unit.target) {
                unit.target = null;
                unit.action = 4; // stand still
            }
        }
    }

    /**
     * Trims the provided unit's waypoints (if any) to a single one that will
     * be updated to the unit's current location. This method should be used if
     * the unit is moving to some arbitrary location and a new move order
     * should be issued to the unit, canceling the current one.
     *
     * @param {Unit} unit The unit that should have its waypoints trimmed.
     */
    function trimUnitWaypoints(unit) {
        if (unit.waypoints.length) {
            if (unit.waypoints.length > 1) {
                unit.waypoints.splice(1, unit.waypoints.length);
            }
            unit.waypoints[0].x = unit.x;
            unit.waypoints[0].y = unit.y;
            unit.moveTargetX = unit.x;
            unit.moveTargetY = unit.y;
        }
    }

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
        var waypoint, targetDistance;
        unit.setMoveOffset(Math.min(1000, unit.moveOffset + unit.speed));
        if (unit.moveOffset < 1000) {
            return;
        }
        if (unit.target) {
            if (!unit.target.hitpoints) {
                if (!lookForAnotherTarget(unit)) {
                    unit.action = 4;
                    unit.waypoints = [];
                }
                return;
            }
            targetDistance = getTargetDistance(unit);
            if (targetDistance <= unit.attackRange) {
                handleTargetProximity(unit);
            } else if (unit.target instanceof Unit) {
                unit.moveTargetX = unit.target.x;
                unit.moveTargetY = unit.target.y;
                unit.waypoints = [{
                    x: unit.target.x,
                    y: unit.target.y
                }];
            }
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
                if (!unit.target && !lookForAnotherTarget(unit)) {
                    unit.action = 4; // stand still
                    unit.moveTargetX = null;
                    unit.moveTargetY = null;
                }
                return;
            }
        }
        startMovingUnitToNextTile(unit);
    }

    /**
     * This method should be executed when the unit is in proximity of its
     * target. The method makes the unit face its target or attack the target
     * if the unit is facing it already.
     *
     * @param {Unit} unit The unit that is in proximity of its target.
     */
    function handleTargetProximity(unit) {
        var target, direction, azimuth, targetX, targetY, tile;
        target = unit.target;
        if (target instanceof Building) {
            tile = getBuildingTargetTile(target);
            targetX = tile.x;
            targetY = tile.y;
        } else { // Unit
            targetX = target.x;
            targetY = target.y;
        }
        direction = getPreferredTargetDirection(unit, targetX, targetY);
        if (direction !== unit.direction) {
            azimuth = unit.direction - direction;
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
        unit.action = 7; // attacking
    }

    /**
     * Calculates the direction the unit should be heading when attacking a
     * target at the specified coordinates.
     *
     * @param {Unit} unit The attacking unit.
     * @param {Number} targetX X-coordinate of the target's location.
     * @param {Number} targetY Y-coordinate of the target's location.
     * @return {Number} The direction the unit should be facing.
     */
    function getPreferredTargetDirection(unit, targetX, targetY) {
        var deltaX, deltaY, distance, angle, normalized;
        deltaX = targetX - unit.x;
        deltaY = targetY - unit.y;
        if (unit.y % 2) {
            deltaX -= 0.5;
        }
        if (targetY % 2) {
            deltaY += 0.5;
        }
        deltaX /= 0.7;
        distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        deltaX /= distance;
        deltaY /= distance;
        angle = Math.acos(deltaX);
        if (deltaY > 0) {
            angle = Math.PI * 2 - angle;
        }
        normalized = Math.round(angle / (Math.PI * 2) * 8) % 8;
        return ((7 - normalized) + 3) % 8;
    }

    /**
     * Returns the adjusted distance of the unit's target.
     *
     * @param {Unit} unit The unit.
     * @return {Number} The distance of the unit's target.
     */
    function getTargetDistance(unit) {
        var centerX, centerY, distanceX, distanceY, tile;
        if (unit.target instanceof Building) {
            tile = getBuildingTargetTile(unit.target);
            centerX = tile.x;
            centerY = tile.y;
        } else if (unit.target instanceof Unit) {
            centerX = unit.target.x;
            centerY = unit.target.y;
        } else {
            return Number.POSITIVE_INFINITY;
        }
        distanceX = unit.x - centerX;
        distanceY = unit.y - centerY;
        return Math.sqrt(Math.pow(distanceY, 2) + Math.pow(distanceX, 2) * 4);
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
        var targetDirection, azimuth, targetDistance;
        if (unit.target) {
            // we might got here after turning to face the target
            targetDistance = getTargetDistance(unit);
            if (targetDistance <= unit.attackRange) {
                handleTargetProximity(unit);
                return;
            }
        }
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
        notifyNearUnitsAboutUnitMovement(unit);
    }

    /**
     * Notifies the units in proximity of the provided unit about the provided
     * unit's movement. This will make the notified units attack the
     * trespassing enemy unit.
     *
     * @param {Unit} movedUnit The unit that has just moved to another tile.
     */
    function notifyNearUnitsAboutUnitMovement(movedUnit) {
        var radius, circumference, i, angle, x, y, atTile, unitType;
        for (radius = 1; radius < maximumVisionRange; radius++) {
            circumference = Math.floor(Math.PI * 2 * radius);
            for (i = circumference; i--;) {
                angle = Math.PI * 2 / circumference * i;
                x = Math.round(Math.cos(angle) * radius) + movedUnit.x;
                y = Math.round(Math.sin(angle) * radius) + movedUnit.y;
                atTile = map.getObjectAt(x, y);
                if ((atTile instanceof Unit) && !atTile.target) {
                    if (atTile.player !== movedUnit.player) {
                        if (atTile.action === 4) { // standing still
                            unitType = UnitsDefinition.getType(atTile.type);
                            if (unitType.visionRange >= radius) {
                                selectedUnits = [atTile];
                                issueAttackUnitOrder(movedUnit);
                            }
                        }
                    }
                }
            }
        }
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
                if ((sourceOffset === 1) && (destinationOffset === 0)) {
                    return 3; // south-east
                }
                if ((sourceOffset === 0) && (destinationOffset === 1)) {
                    return 5; // south-west
                }
                return 4; // south
            }
            if ((sourceOffset === 0) && (destinationOffset === 1)) {
                return 7; // north-west
            }
            if ((sourceOffset === 1) && (destinationOffset === 0)) {
                return 1; // north-east
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
        if (navigationIndex[coordinates.y]) {
            return navigationIndex[coordinates.y][coordinates.x];
        }
        return false;
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
            if ((ahead instanceof Building) && (ahead.passable)) {
                if (navigationIndex[aheadCoordinates.y][aheadCoordinates.x]) {
                    return 0;
                }
            }
            return 1;
        }
        if (navigationIndex[aheadCoordinates.y][aheadCoordinates.x]) {
            return 0;
        }
        return 1;
    }

    /**
     * Handles unit's "wait" action. The method checks whether the tile ahead
     * of the unit is free and sets the unit's action back to "move" if it is.
     *
     * @param {Unit} unit
     */
    function wait(unit) {
        if (checkAheadMovingUnit(unit) === 0) {
            unit.action = 3;
        }
    }
};
UnitAI.prototype = new AdvancedMixedPlugin();
