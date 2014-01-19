"use strict";
var UnitControl;

/**
 *
 * @constructor
 */
UnitControl = function () {
    /**
     * The ID of the current player.
     *
     * @type Number
     */
    var playerId,

    /**
     * The current map.
     *
     * @type Map
     */
    map,

    /**
     * Map's navigation index.
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
     * The current SFX renderer.
     *
     * @type SFX
     */
    sfx,

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
        var atTile, buildingType, i;
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Unit) {
            if (atTile.player === playerId) {
                sfx.setSelectedUnits([atTile]);
                selectedUnits = [atTile];
            } else {
                this.sendEvent("issueAttackUnitOrder", {
                    units: selectedUnits,
                    target: atTile
                });
            }
        } else if (atTile instanceof Building) {
            buildingType = BuildingsDefinition.getType(atTile.type);
            if (buildingType.resource === null) {
                if (atTile.player === playerId) {
                    sfx.setSelectedUnits([]);
                    selectedUnits = [];
                } else {
                    this.sendEvent("issueAttackBuildingOrder", {
                        units: selectedUnits,
                        target: atTile
                    });
                }
            } else if (selectedUnits.length) {
                this.sendEvent("issueHarvestOrder", {
                    units: selectedUnits,
                    x: data.x,
                    y: data.y,
                    target: atTile,
                    type: buildingType
                });
            }
        } else if (navigationIndex[data.y][data.x]) {
            for (i = selectedUnits.length; i--;) {
                selectedUnits[i].harvest = null;
            }
            this.sendEvent("issueMoveOrder", {
                units: selectedUnits,
                x: data.x,
                y: data.y
            });
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
        selectedUnits = [];
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
        map = gameMap;
        navigationIndex = map.getNavigationIndex();
    };
};
UnitControl.prototype = new AdvancedEventDrivenPlugin();
