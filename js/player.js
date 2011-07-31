"use strict";
require('data.playersdefinition');
var Player;

(function () {
    var id, players;

    /**
     * Static autoincrementing counter used for generating of IDs for
     * instances of Player class.
     *
     * @type Number
     */
    id = 0;
    /**
     * Array of all created instances of the Player class.
     *
     * @type Array
     */
    players = [];

    /**
     * The player details class.
     *
     * @param {Number} type The player generic type for pre-filling the
     *        optional properties with default values.
     * @param {Boolean} isHuman True if the instance represents a human player.
     *        Non-human players' units and buildings shall be controlled by the
     *        AI.
     * @param {String} name Name of player. Could be user's name, name of the
     *        race, fraction, or anything else. This is used in the UI.
     * @param {Array} resources List of amounts of resources the player
     *        posseses. The indexes of the array should correspond to the IDs
     *        of the resources. See the Resource class for more details.
     * @param {String} color Optional CSS-like declaration of player's color.
     *        This color will be used to colorify all of the player's buildings
     *        and units.
     * @param {Number} race The player's race ID. See Race class for more
     *        details.
     */
    Player = function (type, isHuman, name, resources, color, race) {
        type = PlayersDefinition.getType(type);
        
        /**
         * ID of the player. This property is unique to all instances.
         *
         * @type Number
         */
        this.id = id++;
        /**
         * The color used to colorify all of the player's buildings and units.
         *
         * @type String
         */
        this.color = color || type.color;
        /**
         * True if the player's units and buildings are controllered by a
         * human. If set to false, these units and buildings shall be
         * controlled by AI.
         *
         * @type Boolean
         */
        this.isHuman = isHuman;
        /**
         * Name of the player. Used only in the UI, can be set to anything.
         *
         * @type String
         */
        this.name = name;
        /**
         * List of amounts of resources the player posseses. The indexes of the
         * array should correspond to the IDs of the resources. See the
         * Resource class for more details.
         *
         * @type Array
         */
        this.resources = resources;
        /**
         * The player's race ID. See Race class for more details.
         *
         * @type Number
         */
        this.race = race || type.race;
        players.push(this);
    };

    /**
     * Returns requested player's instance identified by the provided ID
     * number.
     *
     * @param {Number} id The ID of the instance.
     * @return {Player} The requested player's instance.
     */
    Player.getPlayer = function (id) {
        return players[id];
    };
    
    /**
     * Creates generic instances of Player class exactly matching the
     * PlayersDefinition specifications. All players will be tagged as human,
     * their names will be set to "Player {number}" and they will have no
     * resources.
     */
    Player.createGenericPlayers = function () {
        var i;
        for (i = 0; PlayersDefinition.getType(i); i++) {
            new Player(i, true, 'Player ' + (i + 1), [], undefined, undefined);
        }
    };
}());