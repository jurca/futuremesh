"use strict";
var BuildingControl;

/**
 * The BuildingsControl handles responses user actions related to buildings.
 *
 * @constructor
 */
BuildingControl = function () {
    /**
     * SFX renderer.
     *
     * @type SFX
     */
    var sfx,

    /**
     * The current view renderer.
     *
     * @type View
     */
    view,

    /**
     * The current map.
     *
     * @type Map
     */
    map,

    /**
     * ID of the current human player.
     *
     * @type Number
     */
    playerId,

    /**
     * The building being placed on the map by the user.
     *
     * @type Building
     */
    buildingToPlace,

    /**
     * Whether or not the building to place may be placed at the current
     * location.
     *
     * @type Boolean
     */
    buildingPlacementAllowed,

    /**
     * The maximum distance at which new buildings may be constructed from each
     * other.
     *
     * @type Number
     */
    maxConstructionDistance,

    /**
     * Whether or not a sell mode is active.
     *
     * @type Boolean
     */
    sellActive,

    /**
     * Whether or not a repair mode is active.
     *
     * @type Boolean
     */
    repairActive,

    /**
     * Factor modifying the amount of resources refunded when a building is
     * sold. The construction resources are multiplied by this factor and then
     * refunded to the user.
     *
     * @type Number
     */
    sellRefundFactor,

    /**
     * The current instance of this plugin.
     *
     * @type BuildingControl
     */
    instance;

    /**
     * Constructor.
     */
    (function () {
        var pluginConfiguration;
        instance = this;
        pluginConfiguration = Settings.pluginConfiguration.BuildingControl;
        maxConstructionDistance = pluginConfiguration.maxConstructionDistance;
        sellActive = false;
        repairActive = false;
        sellRefundFactor = pluginConfiguration.sellRefundFactor;
    }.call(this));

    /**
     * Event handler for the <code>sellModeSwitch</code> event. The handler
     * updates the repair and sell flags and disables the building to place (if
     * set).
     */
    this.onSellModeSwitch = function () {
        if (sellActive) {
            sellActive = false;
        } else {
            sellActive = true;
            repairActive = false;
        }
        if (buildingToPlace) {
            sfx.setBuildingToPlace(null, false);
            buildingToPlace = null;
        }
    };

    /**
     * Event handler for the <code>repairModeSwitch</code> event. The handler
     * updates the repair and sell flags and disables the building to place (if
     * set).
     */
    this.onRepairModeSwitch = function () {
        if (repairActive) {
            repairActive = false;
        } else {
            repairActive = true;
            sellActive = false;
        }
        if (buildingToPlace) {
            sfx.setBuildingToPlace(null, false);
            buildingToPlace = null;
        }
    };

    /**
     * Event handler for the <code>startBuildingPlacing</code> event. The event
     * occurrs when the user is about to place a newly constructed building on
     * the map. The handler constructs the building-representing object and
     * sets it to the <code>buildingToPlace</code> field.
     *
     * @param {Object} details Event details.
     */
    this.onStartBuildingPlacing = function (details) {
        buildingToPlace = new Building(0, 0, details.building, playerId);
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
     * Handler for the <code>mouseTileMove</code> event that occurrs when the
     * user moves the mouse cursor to another tile. The handlers notifies the
     * SFX renderer what (if any) building is located under the mouse cursor.
     *
     * @param {Object} data Event's details.
     */
    this.onMouseTileMove = function (data) {
        var atTile, definition, allowed, i, buildings, centerX, centerY,
                building, distance;
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Building) {
            definition = BuildingsDefinition.getType(atTile.type);
            if (definition.resource === null) {
                sfx.setMouseoverBuilding(atTile);
            }
        } else {
            sfx.setMouseoverBuilding(null);
        }
        if (buildingToPlace) {
            buildingToPlace.x = data.x - Math.floor(buildingToPlace.width / 2);
            buildingToPlace.y = data.y - Math.ceil(buildingToPlace.height / 2);
            allowed = false;
            buildings = map.getBuildings();
            for (i = buildings.length; i--;) {
                building = buildings[i];
                if (building.player !== playerId) {
                    continue;
                }
                definition = BuildingsDefinition.getType(building.type);
                if (definition.resource !== null) {
                    continue;
                }
                centerX = building.x + Math.floor(building.width / 2) -
                        Math.floor(building.height / 2);
                centerY = building.y + Math.floor(building.height / 2);
                distance = Math.sqrt(Math.pow(centerY - buildingToPlace.y, 2) +
                        Math.pow(centerX - buildingToPlace.x, 2) * 4);
                if (distance < maxConstructionDistance) {
                    allowed = true;
                    break;
                }
            }
            buildingPlacementAllowed = allowed;
            sfx.setBuildingToPlace(buildingToPlace, allowed);
        }
    };

    /**
     * Handler for the <code>leftMouseButtonClick</code> event that occurrs
     * when the user clicks the left mouse button. The handler selects the
     * building located at the tile that was clicked.
     *
     * @param {Object} data Event's details.
     */
    this.onLeftMouseButtonClick = function (data) {
        var atTile, definition, tiles, i, tile, index;
        if (sellActive) {
            handleBuildingSell(data.x, data.y);
            return;
        }
        if (buildingToPlace) {
            if (!buildingPlacementAllowed) {
                return;
            }
            tiles = map.getTilesOccupiedByBuilding(buildingToPlace);
            index = map.getNavigationIndex();
            for (i = tiles.length; i--;) {
                tile = tiles[i];
                atTile = map.getObjectAt(tile.x, tile.y);
                if (atTile || !index[tile.y][tile.x]) {
                    return;
                }
            }
            map.updateBuilding(buildingToPlace);
            view.onBuildingChange(buildingToPlace);
            this.sendEvent("buildingPlaced", {
                building: buildingToPlace
            });
            sfx.setBuildingToPlace(null, false);
            buildingToPlace = null;
            return;
        }
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Building) {
            if (atTile.player === playerId) {
                definition = BuildingsDefinition.getType(atTile.type);
                if (definition.resource === null) {
                    sfx.setSelectedBuilding(atTile);
                }
            }
        } else if (atTile instanceof Unit) {
            if (atTile.player === playerId) {
                sfx.setSelectedBuilding(null);
            }
        }
    };

    /**
     * Handler for the <code>rightMouseButtonClick</code> event occurring when
     * the user click the right mouse button. The handler deselects the
     * currently selected building.
     *
     * @param {Object} data Event's details.
     */
    this.onRightMouseButtonClick = function (data) {
        if (sellActive) {
            this.sendEvent("sellModeSwitch");
        } else if (repairActive) {
            this.sendEvent("repairModeSwitch");
        } else if (buildingToPlace) {
            sfx.setBuildingToPlace(null, false);
            buildingToPlace = null;
        } else {
            sfx.setSelectedBuilding(null);
        }
    };

    /**
     * Handler for the <code>gameMapInitialization</code> event. The handler
     * sets the map reference.
     *
     * @param {type} gameMap
     */
    this.onGameMapInitialization = function (gameMap) {
        map = gameMap;
    };

    /**
     * Handler for the <code>viewReady</code> event. The handler sets the SFX
     * renderer reference.
     *
     * @param {View} newView The current view renderer.
     */
    this.onViewReady = function (newView) {
        view = newView;
        sfx = newView.getSfx();
    };

    /**
     * Handles a left mouse click in "sell building" mode.
     *
     * @param {Number} x The X-coordinate of the tile that was clicked.
     * @param {Number} y The Y-coordinate of the tile that was clicked.
     */
    function handleBuildingSell(x, y) {
        var atTile, definition, resources, construction, i, steps, resource;
        atTile = map.getObjectAt(x, y);
        if (!(atTile instanceof Building)) {
            return;
        }
        if (atTile.player !== playerId) {
            return;
        }
        definition = BuildingsDefinition.getType(atTile.type);
        if (definition.resource !== null) {
            return;
        }
        atTile.hitpoints = 0;
        view.onBuildingChange(atTile);
        map.removeBuilding(atTile);
        resources = [];
        construction = definition.construction;
        steps = Math.ceil(1000 / construction.stepProgress);
        for (i = construction.step.length; i--;) {
            resource = construction.step[i] * steps * sellRefundFactor;
            resources.unshift(resource);
        }
        instance.sendEvent('resourcesGained', {
            player: playerId,
            resources: resources
        });
    }
};
BuildingControl.prototype = new AdvancedEventDrivenPlugin();
