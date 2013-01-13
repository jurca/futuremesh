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
     * Sets the color of the SFX 3D light beams. Should be a CSS color
     * definition.
     * 
     * @type String
     */
    sfx3DLightColor: undefined,
    
    /**
     * Sets the color of the building overlay rendered by the SFX renderer over
     * the tiles that are occupied by buildings. Should be a CSS color
     * definition.
     * 
     * @type String
     */
    sfxBuildLayerColor: undefined,
    
    /**
     * Sets the color used to paint the tiles accessible to units when
     * displaying of the navigation index is enabled. Should be a CSS color
     * definition.
     */
    sfxAccessibleTileColor: undefined,
    
    /**
     * Sets the color used to paint the tiles inaccessible to units when
     * displaying of the navigation index is enabled. Should be a CSS color
     * definition.
     */
    sfxInaccessibleTileColor: undefined,
    
    /**
     * Sets the speed how fast the map can be scrolled using the mouse wheel.
     * Recommended value is 0.4.
     * 
     * @type Number
     */
    mouseWheelSpeed: undefined,
    
    /**
     * Audio files (MP3 or OGG) containing music played during the game loading
     * screen.
     *
     * @type Array
     */
    loadingMusic: [],
    
    /**
     * The volume of the music played during the game loading screen. The value
     * must be between 0 and 1 inclusive.
     * 
     * @type Number
     */
    loadingMusicVolume: 1,
    
    /**
     * Length of the music played during the game loading screen. The value is
     * in seconds with milliseconds as fraction.
     * 
     * @type Number
     */
    loadingMusicLength: undefined,
    
    /**
     * Configuration of the GameMusic daemon.
     *
     * @type Object
     */
    gameMusic: {
        /**
         * Song playlists for the music daemon. Each entry name is a gameplay
         * intensity index, a number from range [0, 1].
         * 
         * <p>A playlist is an array of objects, where each objects contains
         * information about a single song. The object has to have the
         * following properties:</p>
         * 
         * <ul>
         *     <li><code>src</code> - array of strings. Each string is a URL
         *         to the music sound file. Each file is the same song but a
         *         differenf file format - this is used to provide alternatives
         *         to the browser which may in turn choose the best supported
         *         alternative.</li>
         *     <li><code>duration</code> - duration of the song in seconds.
         *         Milliseconds of the duration are specified as the floating
         *         point part.</li>
         * </ul>
         * 
         * @type Object
         */
        playlists: {
            0: []
        },
        
        /**
         * The duration of the song cross-fade effect in milliseconds.
         *
         * @type Number
         */
        fadeDuration: 3500,
        
        /**
         * Volume of the music played by the game music daemon. The volume is
         * specified as a number within the range [0, 1].
         *
         * @type Number
         */
        volume: 0.7
    },

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
     *          <li>sfx3DLightColor - Sets the color of the 3D light
     *              beams.</li>
     *          <li>sfxBuildLayerColor - Sets the color of the building
     *              overlay.</li>
     *          <li>mouseWheelSpeed - Sets the speed how fast the map can be
     *              scrolled using the mouse wheel. Recommended value is
     *              0.4.</li>
     *          <li>loadingMusic - Sets the music played during the loading
     *              screen. The value must be an array containing links to an
     *              MP3 and OGG file.</li>
     *          <li>loadingMusicVolume - Sets the volume of the music played
     *              during the loading screen. The value must be a number
     *              between 0 and 1 inclusive.</li>
     *          <li>loadingMusicLength - Sets the duration of the music played
     *              during the loading screen.</li>
     *          <li>gameMusic - Configuration of the GameMusic daemon.</li>
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
        this.sfx3DLightColor = settings.sfx3DLightColor;
        this.sfxBuildLayerColor = settings.sfxBuildLayerColor;
        this.sfxAccessibleTileColor = settings.sfxAccessibleTileColor;
        this.sfxInaccessibleTileColor = settings.sfxInaccessibleTileColor;
        this.mouseWheelSpeed = settings.mouseWheelSpeed;
        this.loadingMusic = settings.loadingMusic;
        this.loadingMusicVolume = settings.loadingMusicVolume;
        this.loadingMusicLength = settings.loadingMusicLength;
        this.gameMusic = settings.gameMusic;
    }
};
