"use strict";
var Projectile;

/**
 * The Projectile represents a projectile fired by an armed unit or a building
 * at another unit or building. The projectile will fly towards its target,
 * cause damage upon impact and disappear.
 *
 * @param {Number} type The type of the projectile. The type may affect various
 *        effects and the visual representation of the projectile. The
 *        currently supported types are:
 *        <ul>
 *            <li><code>0</code> - laser projectile. A continuos beam of light
 *                that hits the target immediately and disappears almost
 *                immediately afterwards.</li>
 *            <li><code>1</code> - small bullet.</li>
 *        </ul>
 * @param {Player} player The player that owns the unit or building that has
 *        fired the projectile.
 * @param {Number} startTileX The X coordinate of the tile containing the
 *        projectile's starting location. The coordinate is an integral
 *        non-negative number.
 * @param {Number} startTileY The Y coordinate of the tile containing the
 *        projectile's starting location. The coordinate is an integral
 *        non-negative number.
 * @param {Number} targetTileX The X coordinate of the tile containing the
 *        projectile's target location. The coordinate is an integral
 *        non-negative number.
 * @param {Number} targetTileY The Y coordinate of the tile containing the
 *        projectile's target location. The coordinate is an integral
 *        non-negative number.
 * @param {Number} startOffsetX The horizontal offset of the proctile's
 *        starting location. The offset is specified as a tile width fragment -
 *        a floating point number within the range [0, 1]. The value 0.5
 *        represents the center.
 * @param {Number} startOffsetY The vertical offset of the proctile's starting
 *        location. The offset is specified as a tile height fragment - a
 *        floating point number within the range [0, 1]. The value 0.5
 *        represents the center.
 * @param {Number} targetOffsetX The horizontal offset of the proctile's target
 *        location. The offset is specified as a tile width fragment - a
 *        floating point number within the range [0, 1]. The value 0.5
 *        represents the center.
 * @param {Number} targetOffsetY The vertical offset of the proctile's target
 *        location. The offset is specified as a tile height fragment - a
 *        floating point number within the range [0, 1]. The value 0.5
 *        represents the center.
 * @param {Number} duration The duration of the projectile's presence on the
 *        map. The duration is specified as an integer in "game ticks" (see
 *        <code>Settings</code>).
 * @param {Unit} firedBy The unit that has fired the projectile.
 * @param {Number} damage The hitpoints amount that should be subtracted from
 *        the hitpoints of the unit or building that will be affected by the
 *        projectile.
 * @constructor
 */
Projectile = function (type, player, startTileX, startTileY, targetTileX,
        targetTileY, startOffsetX, startOffsetY, targetOffsetX, targetOffsetY,
        duration, firedBy, damage) {
    /**
     * The width of the tile as used by the main view renderers. The width is
     * specified as the number of pixels.
     *
     * @type Number
     */
    var tileWidth,

    /**
     * The "half" of the height of a tile as used by the main view renderers.
     * The height is specified as the number of pixels.
     *
     * @type Number
     */
    tileHeight;

    tileWidth = TilesDefinition.getType(0).imageData.width - 1;
    tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;

    /**
     * The type of the projectile. The type may affect various effects and the
     * visual representation of the projectile. The currently supported types
     * are:
     *
     * <ul>
     *     <li><code>0</code> - laser projectile. A continuos beam of light
     *         that hits the target immediately and disappears almost
     *         immediately afterwards.</li>
     * </ul>
     */
    this.type = type;

    /**
     * The player that owns the unit or building that has fired the projectile.
     *
     * @type Player
     */
    this.player = player;

    /**
     * The X coordinate of the tile containing the projectile's starting
     * location. The coordinate is an integral non-negative number.
     *
     * @type Number
     */
    this.startTileX = startTileX;

    /**
     * The Y coordinate of the tile containing the projectile's starting
     * location. The coordinate is an integral non-negative number.
     *
     * @type Number
     */
    this.startTileY = startTileY;

    /**
     * The horizontal offset of the proctile's starting location. The offset is
     * specified as a tile width fragment - a floating point number within the
     * range [0, 1]. The value 0.5 represents the center.
     *
     * @type Number
     */
    this.startOffsetX = startOffsetX;

    /**
     * The vertical offset of the proctile's starting location. The offset is
     * specified as a tile height fragment - a floating point number within the
     * range [0, 1]. The value 0.5 represents the center.
     *
     * @type Number
     */
    this.startOffsetY = startOffsetY;

    /**
     * The X coordinate of the tile containing the projectile's target
     * location. The coordinate is an integral non-negative number.
     */
    this.targetTileX = targetTileX;

    /**
     * The Y coordinate of the tile containing the projectile's target
     * location. The coordinate is an integral non-negative number.
     *
     * @type Number
     */
    this.targetTileY = targetTileY;

    /**
     * The horizontal offset of the proctile's target location. The offset is
     * specified as a tile width fragment - a floating point number within the
     * range [0, 1]. The value 0.5 represents the center.
     *
     * @type Number
     */
    this.targetOffsetX = targetOffsetX;

    /**
     * The vertical offset of the proctile's target location. The offset is
     * specified as a tile height fragment - a floating point number within the
     * range [0, 1]. The value 0.5 represents the center.
     *
     * @type Number
     */
    this.targetOffsetY = targetOffsetY;

    /**
     * The X-coordinate of the projectile's starting position (where the
     * projectile travels from).
     *
     * @type Number
     */
    this.startX = (startTileX + startOffsetX) * tileWidth +
            (tileWidth / 2) * (startTileY % 2);

    /**
     * The Y-coordinate of the projectile's starting position (where the
     * projectile travels from).
     *
     * @type Number
     */
    this.startY = (startTileY + startOffsetY * 2) * tileHeight;

    /**
     * The X-coordinate of the projectile's target position (where the
     * projectile travels to).
     *
     * @type Number
     */
    this.targetX = (targetTileX + targetOffsetX) * tileWidth +
            (tileWidth / 2) * (targetTileY % 2);

    /**
     * The Y-coordinate of the projectile's target position (where the
     * projectile travels to).
     *
     * @type Number
     */
    this.targetY = (targetTileY + targetOffsetY * 2) *  tileHeight;

    /**
     * The current progress of the projectile's existence - this includes the
     * projectile being fired, traveling to the target, exploding, etc. The
     * progress is specified as an integral number within the range
     * [0, duration].
     *
     * @type Number
     */
    this.progress = 0;

    /**
     * The duration of the projectile's presence on the map. The duration is
     * specified as an integer in "game ticks" (see <code>Settings</code>).
     *
     * @type Number
     */
    this.duration = duration;

    /**
     * The unit that has fired the projectile.
     *
     * @type Unit
     */
    this.firedBy = firedBy;

    /**
     * The hitpoints amount that should be subtracted from the hitpoints of the
     * unit or building that will be affected by the projectile.
     *
     * @type Number
     */
    this.damage = damage;

    /**
     * Serializes this projectile into a JSON-compatible object that can be
     * later used to reconstruct this projectile in the state this method was
     * invoked.
     *
     * @returns {Object} JSON-serializable representation of this projectile.
     */
    this.exportData = function () {
        return {
            type: this.type,
            player: this.player.id,
            start: {
                x: this.startTileX,
                y: this.startTileY,
                xOffset: this.startOffsetX,
                yOffset: this.startOffsetY
            },
            target: {
                x: this.targetTileX,
                y: this.targetTileY,
                xOffset: this.targetOffsetX,
                yOffset: this.targetOffsetY
            },
            progress: this.progress,
            duration: this.duration,
            firedBy: this.firedBy ? {
                x: this.firedBy.x,
                y: this.firedBy.y
            } : null,
            damage: this.damage
        };
    };
    
    /**
     * Returns a compact serialized JSON-compatible representation of this
     * projectile. The returned array contains unsigned 16-bit integers.
     * 
     * @return {Array} Compact serialized representation of this projectile.
     */
    this.toPackedJson = function () {
        return [
            this.type,
            this.player.id,
            this.startTileX,
            this.startTileY,
            Math.round(this.startOffsetX * 1000),
            Math.round(this.startOffsetY * 1000),
            this.targetTileX,
            this.targetTileY,
            Math.round(this.targetOffsetX * 1000),
            Math.round(this.targetOffsetY * 1000),
            this.progress,
            this.duration,
            Math.max(0, this.damage + 500),
            this.firedBy.x,
            this.firedBy.y
        ];
    };
};

/**
 * Imports a projectile from the provided data object. This method is inversion
 * method to the Projectile's <code>exportData()</code> method.
 *
 * @param {Object} data The data object containing the projectile's details.
 * @param {Map} map The map to which the projectile is being added. Tha map
 *        must already have all units added to it.
 * @return {Projectile} The imported projectile.
 */
Projectile.importData = function (data, map) {
    var projectile;
    projectile = new Projectile(data.type, Player.getPlayer(data.player),
            data.start.x, data.start.y, data.target.x, data.target.y,
            data.start.xOffset, data.start.yOffset, data.target.xOffset,
            data.target.yOffset, data.duration,
            map.getObjectAt(data.firedBy.x, data.firedBy.y), data.damage);
    projectile.progress = data.progress;
    return projectile;
};

/**
 * Creates new projectile from provided data. The data should be a result of
 * the exportData method.
 * 
 * @param {Array} data Serialized data to load.
 * @param {Map} map The map to which the projectile is being added. Tha map
 *        must already have all units added to it.
 * @return {Projectile}
 */
Projectile.fromPackedJson = function (data, map) {
    var projectile;
    projectile = new Projectile(data[0], Player.getPlayer(data[1]), data[2],
            data[3], data[6], data[7], data[4], data[5], data[8], data[9],
            data[11], map.getObjectAt(data[13], data[14]), data[12] - 500);
    projectile.progress = data[10];
    return projectile;
};
