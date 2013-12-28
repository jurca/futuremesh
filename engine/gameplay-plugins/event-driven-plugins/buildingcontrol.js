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
    playerId;
    
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
        var atTile;
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Building) {
            sfx.setMouseoverBuilding(atTile);
        } else {
            sfx.setMouseoverBuilding(null);
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
        var atTile;
        atTile = map.getObjectAt(data.x, data.y);
        if (atTile instanceof Building) {
            if (atTile.player === playerId) {
                sfx.setSelectedBuilding(atTile);
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
        sfx.setSelectedBuilding(null);
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
        sfx = newView.getSfx();
    };
};
BuildingControl.prototype = new AdvancedEventDrivenPlugin();
