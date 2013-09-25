"use strict";
var KeyboardMapScroller;

/**
 * The Keyboard Map Scroller plug-in scans for keyboard input and scrolls the
 * main map view accordingly. The plug-in accepts both the arrow keys and the
 * WSAD keys.
 *
 * @constructor
 */
KeyboardMapScroller = function () {
    /**
     * The current scrolling vector. The vector object has 2 fields:
     *
     * <ul>
     *     <li><code>x</code> - the horizontal scrolling speed.</li>
     *     <li><code>y</code> - the vertical scrolling speed.</li>
     * </ul>
     *
     * @type Object
     */
    var vector,

    /**
     * The map view scrolling speed in pixels per tick.
     *
     * @type Number
     */
    speed;

    /**
     * Constructor.
     */
    (function () {
        vector = {
            x: 0,
            y: 0
        };
        speed = Settings.pluginConfiguration.KeyboardMapScroller.scrollSpeed;
    }.call(this));

    /**
     * Handles a single game engine's timer tick. The method sends the
     * <code>scrollMapView</code> event if the scrolling vector is not a zero
     * vector. The event carries the scrolling vector copy multiplied by the
     * configured scrolling speed (see <code>Settings</code>) as its data.
     */
    // override
    this.handleTick = function () {
        if (vector.x || vector.y) {
            this.sendEvent("scrollMapView", {
                x: vector.x * speed,
                y: vector.y * speed
            });
        }
    };

    /**
     * Event handler for the <code>start</code> event. The handler registers
     * the keyboard event handler on the document so that the plug-in may
     * process the events and scroll the map.
     */
    this.onStart = function () {
        addEventListener('keydown', processKeyDown, false);
        addEventListener('keyup', processKeyUp, false);
    };

    /**
     * Event handler for the <code>stop</code> event. The handler unregisters
     * the keyboard event handler to prevent further processing of on-page
     * events.
     */
    this.onStop = function () {
        removeEventListener('keydown', processKeyDown, false);
        removeEventListener('keyup', processKeyUp, false);
    };

    /**
     * Processes the <code>keydown</code> keyboard event by updating the
     * scrolling vector. The method calls the <code>preventDefault()</code>
     * method of the provided event in case that the key pressed is an arrow
     * key or one of the W, S, A or D keys.
     *
     * @param {Event} event
     */
    function processKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // W
                vector.y = -1;
                break;
            case 40: // down
            case 83: // S
                vector.y = 1;
                break;
            case 37: // left
            case 65: // A
                vector.x = -1;
                break;
            case 39: // right
            case 68: // D
                vector.x = 1;
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    /**
     * Processes the <code>keyup</code> keyboard event by updating the
     * scrolling vector. The method calls the <code>preventDefault()</code>
     * method of the provided event in case that the key pressed is an arrow
     * key or one of the W, S, A or D keys.
     *
     * @param {Event} event
     */
    function processKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // W
            case 40: // down
            case 83: // S
                vector.y = 0;
                break;
            case 37: // left
            case 65: // A
            case 39: // right
            case 68: // D
                vector.x = 0;
                break;
            default:
                return;
        }
        event.preventDefault();
    }
};
KeyboardMapScroller.prototype = new AdvancedMixedPlugin();
