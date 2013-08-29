"use strict";
var Building;

(function () {
    var id;

    id = 0;

    /**
     * The Building class representing a building within the game.
     *
     * @param {Number} x The X coordinate of the building's position on the
     *        map.
     * @param {Number} y The Y coordinate of the building's position on the
     *        map.
     * @param {Number} type The building's type (building's definition's ID).
     *        This parameter is used to set up default building's properties.
     * @param {Number} player The ID of the player owning this building.
     * @param {String} color The CSS color definition that should be used to
     *        colorify the building's images. If not set, it is loaded from
     *        owning player's specification - this is recommended usage.
     */
    Building = function (x, y, type, player, color) {
        var definition;
        definition = BuildingsDefinition.getType(type);

        /**
         * Building's instance ID. This ID is unique identifier of the
         * instance.
         *
         * @type Number
         */
        this.id = id++;

        /**
         * The X coordinate of the building's position on the map.
         *
         * @type Number
         */
        this.x = x;

        /**
         * The Y coordinate of the building's position on the map.
         *
         * @type Number
         */
        this.y = y;

        /**
         * The name of the building. The name is used in the UI.
         *
         * @type String
         */
        this.name = definition.name;

        /**
         * The path to the building's image.
         *
         * @type String
         */
        this.image = definition.image;

        /**
         * The width of the building's image in pixels.
         *
         * @type Number
         */
        this.imageWidth = definition.imageWidth;

        /**
         * The height of the building's image in pixels.
         *
         * @type Number
         */
        this.imageHeigth = definition.imageHeigth;

        /**
         * The width of the building in tiles.
         *
         * @type Number
         */
        this.width = definition.width;

        /**
         * The height of the building in tiles.
         *
         * @type Number
         */
        this.height = definition.height;

        /**
         * The color in the building's image that should be replaced by the
         * player's color. So far only hex format (#rrggbb or rrggbb is
         * supported).
         *
         * @type String
         */
        this.colorify = definition.colorify;

        /**
         * The maximum "distance" from the color specified in the colorify
         * property for the color in the building's image to be replaced by the
         * player's color. The distance from the colorify color will be
         * transformed to the distance from the player's color, so gradients
         * are kept intact. The distance is computed as distance in 3D
         * euclid space, where red, green and blue represent axis.
         *
         * @type Number
         */
        this.colorifyDistance = definition.colorifyDistance;

        /**
         * The building's type's ID. This ID is used to set default building's
         * properties.
         *
         * @type Number
         */
        this.type = type;

        /**
         * When set to true, units may pass through the building like through
         * empty space. However other buildings cannot be build upon this
         * building.
         *
         * @type Boolean
         */
        this.passable = definition.passable;

        /**
         * ID if the race this building belongs to. This information is
         * important especially for the game UI because the player should be
         * able to build only the buildings of their own race. This field may
         * be set to <code>null</code> if it doesn't belong to any race.
         *
         * @type Number
         */
        this.race = definition.race,

        /**
         * The ID of the player owning the building.
         *
         * @type Number
         */
        this.player = player;

        /**
         * CSS string representing the color used to colorify the building's
         * image in order to represent it's allegience to it's owner-player.
         *
         * @type String
         */
        this.color = color === undefined ?
                Player.getPlayer(player).color : color;

        /**
         * Exports the information about the building in form of a
         * JSON-serializable object so that the building can be recostructed
         * from this data later.
         *
         * @return {Object} object representing the information about the
         *         building required to restore it to it's current state. This
         *         object is JSON-serializable.
         */
        this.exportData = function () {
            return {
                x: this.x,
                y: this.y,
                type: this.type,
                player: this.player
            };
        };
    };

    /**
     * Creates new building from provided data. The data should be a result of
     * the exportData method.
     *
     * @param {Object} data The data from the exportData method.
     */
    Building.importData = function (data) {
        return new Building(data.x, data.y, data.type, data.player);
    };
}());
