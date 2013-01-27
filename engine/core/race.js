"use strict";
var Race;

/**
 * A Race is a basic designation of each player. Each race may have its own
 * buildings and units with varying costs, speeds, attack abilities, etc.
 * A game Race may represent "real life" race, nation, species, political
 * faction, etc.
 * 
 * <p>The Race of the current player may be used in any reasonable way: from
 * telling the user which side is they fighting for to customizing the
 * look&feel of the game interface.</p>
 * 
 * <p>Each Race has a unique ID, unique name and (optionally but recommended)
 * unique signature color.</p>
 * 
 * @param {Number} id ID of the Race to create. Has to be unique for the game
 *        engine to work properly. The ID is used internally by the game
 *        engine. The ID should be generated from 0 in the ascending order.
 * @param {String} name Race's name. Should be unique (for obvious reasons).
 *        The name is used in the UI.
 * @param {String} signatureColor A W3C-compatible color specification. The
 *        color should visually identify the race and is used in the UI.
 */
Race = function (id, name, signatureColor) {
    /**
     * Unique numerical identifier of the Race. This field is used to identify
     * the race internally by the game engine.
     * 
     * @type Number
     */
    this.id = id;
    
    /**
     * Unique name of the race. The name is used in the UI.
     * 
     * @type String
     */
    this.name = name;
    
    /**
     * (Prefferably) unique color specific for the race. The color is specified
     * as a W3C compatible string and is used in the UI.
     * 
     * @type String
     */
    this.signatureColor = signatureColor;
};
