"use strict";
var Settings;

/**
 * The settings container.
 */
Settings = {
    /**
     * Size of the tile (unrotated and unskewed) in pixels.
     *
     * @type Number
     */
    tileSize: undefined,
    /**
     * Vertical scaling of the graphics in the battlefield view. Represented as
     * a number from interval [0,1]
     *
     * @type Number
     */
    heightScale: undefined,
    /**
     * Width of the rotated and skewed tile in pixels.
     *
     * @type Number
     */
    tileWidth: undefined,
    /**
     * Height of the rotated and skewed tile in pixels.
     *
     * @type Number
     */
    tileHeight: undefined,
    /**
     * Represents how many tiles horizontally and vertically should be
     * contained in one cell of a grid index. The cell size will be
     * gridIndexGranularity &times; gridIndexGranularity tiles.
     *
     * @type Number
     */
    gridIndexGranularity: undefined,
    /**
     * Set to true if the images of tiles has been already transformed. If set
     * to false the engine will rotate and skew the tile images.
     *
     * @type Boolean
     */
    tileImagesTransformed: false,
    /**
     * Set to true if the images of buildings has been already transformed. If
     * set to false the engine will rotate and skew the building images.
     *
     * @type Boolean
     */
    buildingImagesTransformed: false,
    /**
     * Set to true if the images of units has been already transformed. If set
     * to false the engine will rotate and skew the unit images.
     */
    unitImagesTransformed: false,

    /**
     * Sets the "depth" factor of the 3D sfx light beams from the terrain.
     * Should be a real number greater than 1.
     *
     * @type Number
     */
    sfx3DLightFactor: undefined,
    
    /**
     * Sets the speed how fast the map can be scrolled using the mouse wheel.
     * Recommended value is 0.4.
     * 
     * @type Number
     */
    mouseWheelSpeed: undefined,

    /**
     * Sets and loads the settings. Some properties will be calculated
     * automatically.
     *
     * @param {Object} settings The settings. This object should contain these
     *        properties:
     *        <ul>
     *          <li>tileSize - Number representing the size of the tile in
     *              pixels</li>
     *          <li>heightScale - Number representing the vertical skew ratio,
     *              represented as a number from the interval [0,1]</li>
     *          <li>gridIndexGranularity - Represents how many tiles
     *              horizontally and vertically should be contained in one cell
     *              of a grid index. The cell size will be
     *              gridIndexGranularity &times; gridIndexGranularity
     *              tiles.</li>
     *          <li>tileImagesTransformed - Set to true if the images of tiles
     *              has been already transformed. If set to false the engine
     *              will rotate and skew the tile images.</li>
     *          <li>buildingImagesTransformed - Set to true if the images of
     *              buildings has been already transformed. If set to false the
     *              engine will rotate and skew the building images.</li>
     *          <li>unitImagesTransformed - Set to true if the images of units
     *              has been already transformed. If set to false the engine
     *              will rotate and skew the unit images.</li>
     *          <li>sfx3DLightFactor - Sets the "depth" factor of the 3D light
     *              beams from the terrain. Should be a real number greater
     *              than 1.</li>
     *          <li>mouseWheelSpeed - Sets the speed how fast the map can be
     *              scrolled using the mouse wheel. Recommended value is
     *              0.4.</li>
     *        </ul>
     *        If any of these properties will be ommited, default value will be
     *        used (if exists).
     */
    load: function (settings) {
        this.tileSize = settings.tileSize;
        this.heightScale = settings.heightScale;
        this.tileWidth = this.tileSize * Math.cos(Math.PI / 4) * 2;
        this.tileHeight = this.tileSize * Math.sin(Math.PI / 4) * 2 *
                this.heightScale;
        this.gridIndexGranularity = settings.gridIndexGranularity;
        if (settings.tileImagesTransformed !== undefined) {
            this.tileImagesTransformed = settings.tileImagesTransformed;
        }
        if (settings.buildingImagesTransformed !== undefined) {
            this.buildingImagesTransformed =
                    settings.buildingImagesTransformed;
        }
        if (settings.unitImagesTransformed !== undefined) {
            this.unitImagesTransformed = settings.unitImagesTransformed;
        }
        this.sfx3DLightFactor = settings.sfx3DLightFactor;
        this.mouseWheelSpeed = settings.mouseWheelSpeed;
    }
};