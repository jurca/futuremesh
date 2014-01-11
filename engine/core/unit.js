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
         * Unit's turning speed in turning offset units per tick (1000 is 1
         * direction step per tick).
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
         *     <li>4 - unit is standing still</li>
         *     <li>5 - unit is waiting for the tile ahead to be freed up</li>
         *     <li>6 - unit is turning to a new direction</li>
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
         * The actual number of hitpoints left. The hitpoints represent the
         * amount of damage the unit can take from other units before it is
         * destroyed.
         *
         * @type Number
         */
        this.hitpoints = definition.hitpoints;

        /**
         * The maximum number of hitpoints this unit may have. See the
         * <code>hitpoints</code> field for more details on how hitpoints are
         * interpreted and used.
         *
         * @type Number
         */
        this.maxHitpoints = definition.hitpoints;

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
         * The turning azimuth represents the numbers of turning steps the unit
         * is making, along with their direction: a negative value represents
         * turning anti-clockwise and a positive value represents turning
         * clockwise. For example: if the unit's direction is 2 and the turning
         * azimuth is -3, the unit will eventually turn to directions 1, 0, 7
         * in that order.
         *
         * <p>The absolut value of this field is decreased every time the
         * turning progress reaches 1000. The absolute value of this field is
         * never greater than 4. The unit stops turning once the value reaches
         * 0.</p>
         *
         * @type Number
         */
        this.turningAzimuth = 0;

        /**
         * Current progress of turning the unit to new direction. The progress
         * is related to a single turning step, for example changing to unit's
         * direction from 4 to 5 or from 4 to 3.
         *
         * <p>The progress is represented by an integral number from the range
         * [0, 1000], where 0 represents the start of the turning and 1000
         * represents the finishing of the turning.</p>
         *
         * @type Number
         */
        this.turningProgress = 0;

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
        this.moveTargetX = null;

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
         * Returns the coordinates of the tile next to this unit at the
         * direction relative to the unit's current direction.
         *
         * @param {Number} azimut The azimut represents the direction diference
         *        from the unit's current direction. The azimut must be an
         *        integral number within the range (-8, 8), where -8 represents
         *        360° turn left (counter-clockwise) and 8 represents 360° turn
         *        right (clockwise).
         * @returns {Object} The coordinates of the tile next to the current
         *          unit's location at the specified relative direction.
         */
        this.getCoordinatesAtDirection = function (azimut) {
            var originalDirection, coordinates;
            if (azimut < 0) {
                azimut %= 8;
                azimut += 8;
            }
            originalDirection = this.direction;
            this.direction = (this.direction + azimut) % 8;
            coordinates = this.getAheadCoordinates();
            this.direction = originalDirection;
            return coordinates;
        };

        /**
         * Returns the coordinates of the tile directly ahead of this unit. The
         * coordinates are represented by an object with the following fields:
         *
         * <ul>
         *     <li><code>x: Number</code> - X coordinate of the tile ahead of
         *         the unit.</li>
         *     <li><code>y: Number</code> - Y coordinate of the tile ahead of
         *         the unit.</li>
         * </ul>
         *
         * @returns {Object} The coordinates of the tile directily ahead of the
         *          unit.
         */
        this.getAheadCoordinates = function () {
            var coordinates;
            coordinates = {
                x: this.x,
                y: this.y
            };
            switch (this.direction) {
                case 0:
                    coordinates.y -= 2;
                    break;
                case 1:
                    coordinates.x += this.y % 2;
                    coordinates.y -= 1;
                    break;
                case 2:
                    coordinates.x += 1;
                    break;
                case 3:
                    coordinates.x += this.y % 2;
                    coordinates.y += 1;
                    break;
                case 4:
                    coordinates.y += 2;
                    break;
                case 5:
                    coordinates.x -= 1 - (this.y % 2);
                    coordinates.y += 1;
                    break;
                case 6:
                    coordinates.x -= 1;
                    break;
                case 7:
                    coordinates.x -= 1 - (this.y % 2);
                    coordinates.y -= 1;
                    break;
            }
            return coordinates;
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