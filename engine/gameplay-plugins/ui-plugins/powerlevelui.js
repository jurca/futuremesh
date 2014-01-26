"use strict";
var PowerLevelUI;

/**
 * The Power Level UI plugin is used to display the current power levels of the
 * current player in the UI.
 * 
 * @constructor
 */
PowerLevelUI = function () {
    /**
     * The ID of the current player.
     * 
     * @type Number
     */
    var playerId,
            
    /**
     * The updated power level of the current player. The variable is set to
     * <code>null</code> when there is no change.
     * 
     * @type Object
     */
    uiUpdate,
          
    /**
     * Maximum height of the production and consumption bars combined in
     * pixels.
     * 
     * @type Number
     */
    maxHeight,
    
    /**
     * HTML element representing the excess energy production.
     * 
     * @type HTMLElement
     */
    productionBar,
    
    /**
     * HTML element representing he energy consumption.
     * 
     * @type HTMLElement
     */
    consumptionBar,
            
    /**
     * Factor used to divide the production and consumption when calculating
     * total height of the energy level bars.
     * 
     * @type Number
     */
    heightFactor;
    
    /**
     * Constructor.
     */
    (function () {
        var configuration;
        configuration = Settings.pluginConfiguration.PowerLevelUI;
        heightFactor = configuration.heightFactor;
    }.call(this));
    
    // override
    this.renderFrame = function () {
        var wrapper, marker, totalHeight, sum, height;
        if (!maxHeight) {
            wrapper = document.getElementById("power-level-wrapper");
            marker = document.getElementById("power-level-marker");
            maxHeight = wrapper.offsetHeight + marker.offsetHeight;
            if (!maxHeight) {
                return; // don't reset the uiUpdate, if any
            }
        }
        if (!uiUpdate) {
            return;
        }
        sum = Math.max(0, uiUpdate.level) + uiUpdate.consumption;
        totalHeight = sum / heightFactor;
        totalHeight = Math.min(totalHeight, maxHeight);
        sum = sum || 1; // turn 0 into 1 because of division
        height = uiUpdate.consumption / sum * totalHeight;
        consumptionBar.style.height = height + "px";
        height = Math.max(0, uiUpdate.level) / sum * totalHeight;
        productionBar.style.height = height + "px";
        uiUpdate = null;
    };
    
    /**
     * Event handler for the <code>energyLevelUpdate</code> event. The handler
     * sets the update as the UI update to be rendered.
     * 
     * @param {Object} update Event's details.
     */
    this.onEnergyLevelUpdate = function (update) {
        if (update.player === playerId) {
            uiUpdate = update;
        }
    };
    
    /**
     * Event handler for the <code>start</code> event. The handler performs
     * initialization of this plugin.
     */
    this.onStart = function () {
        productionBar = document.getElementById("power-level-production");
        consumptionBar = document.getElementById("power-level-consumption");
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
};
PowerLevelUI.prototype = new AdvancedUIPlugin();
