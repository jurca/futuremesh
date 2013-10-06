"use strict";
var Unit;

(function () {
    var id;

    id = 0;

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
        var definition, tileWidth, tileHeight;
        definition = UnitsDefinition.getType(type);

        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = (TilesDefinition.getType(0).imageData.height / 2 - 1) * 2;

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
         * Unit's speed of movement in move offset units per tick (1000 is
         * 1 tile per tick).
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
         *     <li>3 - unit is currently travelling</li>
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
         * The ID of the race this units is related to. Can be
         * <code>null</code> if the unit is not related to any race.
         *
         * @type Number
         */
        this.race = definition.race;

        /**
         * Progress of the movement of the unit from one tile to another
         * represented by an integral number from interval [0, 1000]. When set
         * to 0, the unit is displayed on the movement source tile, when set to
         * number greater than 0 and lower than 1000, the unit is displayed
         * between the movement source tile and movement destination tile. When
         * set to 1000, the unit will be displayed on the movement destination
         * tile.
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
         * The X-coordinate of the target location of the current movement. The
         * value is the same as the X-coordinate of the first waypoint in the
         * waypoints queue.
         *
         * <p>This field is set to <code>null</code> if the unit is not
         * moving.</p>
         *
         * @type Number
         */
        this.moveTargetX = null;

        /**
         * The Y-coordinate of the target location of the current movement. The
         * value is the same as the Y-coordinate of the first waypoint in the
         * waypoints queue.
         *
         * <p>This fields is set to <code>null</code> if the unit is not
         * moving.</p>
         *
         * @type Number
         */
        this.moveTargetY = null;

        /**
         * The current waypoints queue. Each waypoint is represented as an
         * object with the following fields:
         *
         * <ul>
         *     <li><code>x</code> - the X-coordinate of the waypoint's
         *         location.</li>
         *     <li><code>y</code> - the Y-coordinate of the waypoint's
         *         location.</li>
         * </ul>
         *
         * <p>The first element of this array is the first waypoint, the last
         * element is the last waypoint to visit by this unit. The moveTargetX
         * and moveTargetY fields are always set to the coordinates of the
         * first waypoint. The unit is not moving if the queue is empty.</p>
         *
         * @type Array
         */
        this.waypoints = [];

        /**
         * Color used to colorify the unit's graphical representation, defined
         * as a CSS-compatible color-definition string.
         *
         * @type String
         */
        this.color = color === undefined ?
                Player.getPlayer(player).color : color;

        /**
         * Moves the unit on the map by the specified amount of tiles. This
         * method should be used at the beginning of each unit's movement to
         * release the unit's current position and register the unit's next
         * position.
         *
         * <p>This method also automatically invokes the setMoveOffset method
         * with 0 as parameter (the start of the movement), therefore the unit
         * will be still rendered at the same spot. The movement to the new
         * tile should then be animated & finished by repeated calling the
         * setMoveOffset method with an increasingly larger parameter until the
         * parameter is set to 1000.</p>
         *
         * <p>Note: This method also sets the action field to 2 (just moved) so
         * that the navigation indexes, view and minimap may be updated.</p>
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
            this.setMoveOffset(0);
            this.action = 2;
        };

        /**
         * Sets the moveOffset property of the unit and calculates moveOffsetX
         * and moveOffsetY properties valuse.
         *
         * @param {Number} offset Progress of the unit's movement from it's
         *        current position to the tile in front of it represented as
         *        a number from interval [0, 1000].
         */
        this.setMoveOffset = function (offset) {
            this.moveOffset = offset;
            // reverse and normalize to scale [0, 1]
            offset = (1000 - offset) / 1000;
            if ((this.direction >= 1) && (this.direction <= 3)) {
                this.moveOffsetX = tileWidth * offset *
                        (this.direction === 2 ? 1 : 0.5);
            }
            if (this.direction >= 5) {
                this.moveOffsetX = -tileWidth * offset *
                        (this.direction === 6 ? 1 : 0.5);
            }
            if ((this.direction === 7) || (this.direction <= 1)) {
                this.moveOffsetY = -tileHeight * offset *
                        (this.direction === 0 ? 1 : 0.5);
            }
            if ((this.direction >= 3) && (this.direction <= 5)) {
                this.moveOffsetY = tileHeight * offset *
                        (this.direction === 4 ? 1 : 0.5);
            }
        };

        /**
         * Exports the information about the unit in form of a JSON-serializable
         * object so that the unit can be recostructed from this data later.
         *
         * @return {Object} object representing the information about the unit
         *         required to restore it to it's current state. This object is
         *         JSON-serializable.
         */
        this.exportData = function () {
            return {
                x: this.x,
                y: this.y,
                direction: this.direction,
                type: this.type,
                player: this.player
            };
        };
    };

    /**
     * Creates new unit from provided data. The data should be a result of the
     * exportData method.
     *
     * @param {Object} data The data from the exportData method.
     */
    Unit.importData = function (data) {
        return new Unit(data.x, data.y, data.direction, data.type,
                data.player);
    };
}());