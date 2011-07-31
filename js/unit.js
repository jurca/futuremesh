"use strict";
var Unit;
require('data.unitsdefinition', 'player');


(function () {
    var id, units;

    id = 0;
    units = [];

    /**
     * The Unit class representing any unit on the map. This class serves both
     * as a container of unit's properties and provider of basic API for moving
     * the unit, etc.
     *
     * @param {Number} x The horizontal position of the unit on the map
     * @param {Number} y The vertical position of the unit on the map
     * @param {Number} direction Direction of the unit represented as an
     *        integer from range [0,7]. The meaning of this value is:
     *        <ul>
     *            <li>0 - north</li>
     *            <li>1 - northeast</li>
     *            <li>2 - east</li>
     *            <li>3 - southeast</li>
     *            <li>4 - south</li>
     *            <li>5 - southwest</li>
     *            <li>6 - west</li>
     *            <li>7 - northwest</li>
     *        </ul>
     * @param {Number} type ID of the unit's type, this is used to load more
     *        details about the unit
     * @param {Number} player ID of the instance of the player that owns this
     *        unit
     * @param {String} color CSS-like declaration of the color to be used to
     *        colorize this unit. If not defined, the unit will use player's
     *        color (this is recomended).
     */
    Unit = function (x, y, direction, type, player, color) {
        var definition;
        definition = UnitsDefinition.getType(type);
        /**
         * ID number of the instance.
         *
         * @type Number
         */
        this.id = id++;
        /**
         * X coordinate of the unit's position on the map.
         *
         * @type Number
         */
        this.x = x;
        /**
         * Y coordinate of the unit's position on the map.
         *
         * @type Number
         */
        this.y = y;
        /**
         * X coordinate of the unit's previous position on the map.
         *
         * @type Number
         */
        this.lastX = x;
        /**
         * Y coordinate of the unit's previous position on the map.
         *
         * @type Number
         */
        this.lastY = y;
        /**
         * Unit's current direction represented as an integer from interval
         * [0,7]. The meaning of the value is:
         * <ul>
         *     <li>0 - north</li>
         *     <li>1 - northeast</li>
         *     <li>2 - east</li>
         *     <li>3 - southeast</li>
         *     <li>4 - south</li>
         *     <li>5 - southwest</li>
         *     <li>6 - west</li>
         *     <li>7 - northwest</li>
         * </ul>
         *
         * @type Number
         */
        this.direction = direction;
        /**
         * ID of the unit's type.
         *
         * @type Number
         */
        this.type = type;
        /**
         * Pattern of URLs to unit's graphical representation. Should contain
         * a ? mark - this will be replaced by the loader with direction number
         * to load image for the direction of the unit.
         *
         * @type String
         */
        this.image = definition.image;
        /**
         * Unit's speed of movement in tiles per second.
         *
         * @type Number
         */
        this.speed = definition.speed;
        /**
         * Unit's turning speed in direction changes per second. One change of
         * direction can always be only increment or decrement of the unit's
         * direction property modulo 8.
         *
         * @type Number
         */
        this.turnSpeed = definition.turnSpeed;
        /**
         * Current unit's action / status. The meaning is:
         * <ul>
         *     <li>0 - just created</li>
         *     <li>1 - destroyed</li>
         *     <li>2 - just moved to another tile</li>
         * </ul>
         *
         * @type Number
         */
        this.action = 0;
        /**
         * ID of the player owning this unit.
         *
         * @type Number
         */
        this.player = player;
        /**
         * Progress of the movement of the unit from one tile to another
         * represented by a number from interval [0,1]. When set to 0, the unit
         * is displayed on the movement source tile, when set to number greater
         * than 0 and lower than 1, the unit is displayed between the movement
         * source tile and movement destination tile and when set to 1, the
         * unit will be displayed on the movement destination tile.
         *
         * @type Number
         */
        this.moveOffset = 0;
        /**
         * Automatically calculated property representing moveOffset projected
         * to the horizontal axis. Used by renderer.
         *
         * @type Number
         */
        this.moveOffsetX = 0;
        /**
         * Automatically calculated property representing moveOffset projected
         * to the vertical axis. Used by renderer.
         *
         * @type Number
         */
        this.moveOffsetY = 0;
        /**
         * Color used to colorify the unit's graphical representation, defined
         * as a CSS-compatible color-definition string.
         *
         * @type String
         */
        this.color = color === undefined ?
                Player.getPlayer(player).color : color;

        /**
         * Moved the unit on the map by chosen amount of tiles.
         *
         * @param {Number} distance The distance the unit should be moved. It
         * is recommened to use 1 as a value.
         */
        this.move = function (distance) {
            var lastX, lastY;
            lastX = this.x;
            lastY = this.y;
            if (distance > 1) {
                this.move(distance - 1);
            }
            this.lastX = lastX;
            this.lastY = lastY;
            switch (this.direction) {
                case 0:
                    this.y -= 2;
                    break;
                case 1:
                    this.x += this.y % 2;
                    this.y -= 1;
                    break;
                case 2:
                    this.x += 1;
                    break;
                case 3:
                    this.x += this.y % 2;
                    this.y += 1;
                    break;
                case 4:
                    this.y += 2;
                    break;
                case 5:
                    this.x -= 1 - (this.y % 2);
                    this.y += 1;
                    break;
                case 6:
                    this.x -= 1;
                    break;
                case 7:
                    this.x -= 1 - (this.y % 2);
                    this.y -= 1;
                    break;
            }
            this.action = 2;
        };

        /**
         * Sets the moveOffset property of the unit and calculates moveOffsetX
         * and moveOffsetY properties valuse.
         *
         * @param {Number} offset Progress of the unit's movement from it's
         *        current position to the tile in front of it represented as
         *        a number from interval [0,1].
         */
        this.setMoveOffset = function (offset) {
            this.moveOffset = offset;
            if ((this.direction >= 1) && (this.direction <= 3)) {
                this.moveOffsetX = Settings.tileWidth * offset *
                        (this.direction == 2 ? 1 : 0.5);
            }
            if (this.direction >= 5) {
                this.moveOffsetX = -Settings.tileWidth * offset *
                        (this.direction == 6 ? 1 : 0.5);
            }
            if ((this.direction == 7) || (this.direction <= 1)) {
                this.moveOffsetY = -Settings.tileHeight * offset *
                        (this.direction == 0 ? 1 : 0.5);
            }
            if ((this.direction >= 3) && (this.direction <= 5)) {
                this.moveOffsetY = Settings.tileHeight * offset *
                        (this.direction == 4 ? 1 : 0.5);
            }
        };

        units.push(this);
    };

    /**
     * Returns Unit class' instance of the chosen ID.
     *
     * @param {Number} id ID of the created instance to retrieve
     * @return {Unit} The Unit class instance having the id property set to id.
     */
    Unit.getUnit = function (id) {
        return units[id];
    };
}());