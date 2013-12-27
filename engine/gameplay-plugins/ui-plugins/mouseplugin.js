"use strict";
var MousePlugin;

/**
 * The Mouse Plugin provides integration with the mouse. The plugin observes
 * the current location of the mouse cursor on the screen on calculates over
 * which tile the mouse cursor currently is.
 * 
 * @constructor
 */
MousePlugin = function () {
    /**
     * The X-coordinate of the current position of the mouse cursor.
     * 
     * @type Number
     */
    var mouseX,
            
    /**
     * The Y-coordinate of the current position of the mouse cursor.
     * 
     * @type Number
     */
    mouseY,
    
    /**
     * Set to <code>true</code> if the mouse cursor has been moved since the
     * last frame.
     * 
     * @type Boolean
     */
    moved,
            
    /**
     * The X-coordinate of the tile over which the mouse cursor is currently
     * located.
     * 
     * @type Number
     */
    tileX,
    
    /**
     * The Y-coordinate of the tile over which the mouse cursor is currently
     * located.
     * 
     * @type Number
     */
    tileY,
    
    /**
     * Width of a single tile image on the screen in pixels.
     * 
     * @type Number
     */
    tileWidth,
    
    /**
     * Cached half of the tile image's width.
     * 
     * @type Number
     */
    tileWidthHalf,
    
    /**
     * Half of the height of the tile image on the screen in pixels.
     * 
     * @type Number
     */
    tileHeight,
    
    /**
     * Set to <code>true</code> if the mouse cursor has moved to another tile
     * since the last frame.
     * 
     * @type Boolean
     */
    movedTile,
    
    /**
     * Current horizontal offset of the world view in pixels.
     * 
     * @type Number
     */
    viewOffsetLeft,
    
    /**
     * Current vertical offset of the world view in pixels.
     * 
     * @type Number
     */
    viewOffsetTop,
            
    /**
     * Current instance of this plugin.
     * 
     * @type MousePlugin
     */
    instance,
          
    /**
     * The canvas for the main world view.
     * 
     * @type HTMLElement
     */
    canvas,
            
    /**
     * Set to <code>true</code> if the left or the right mouse button is down.
     * 
     * @type Boolean
     */
    mouseDown,
            
    /**
     * The X-coordinate of the tile the mouse cursor was located at when the
     * user pushed down a mouse button.
     * 
     * @type Number
     */
    dragStartTileX,
    
    /**
     * The Y-coordinate of the tile the mouse cursor was located at when the
     * user pushed down a mouse button.
     * 
     * @type Number
     */
    dragStartTileY;
    
    /**
     * Constructor.
     */
    (function () {
        instance = this;
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
        tileWidthHalf = tileWidth / 2;
    }.call(this));
    
    // override
    this.renderFrame = function () {
        if (moved) {
            this.sendEvent("mousemove", {
                x: mouseX,
                y: mouseY
            });
            moved = false;
        }
        if (movedTile) {
            this.sendEvent("mousetilemove", {
                x: tileX,
                y: tileY
            });
            movedTile = false;
        }
    };
    
    /**
     * Event handler for the <code>viewOffsetUpdate</code> event. The handler
     * updates the view offsets used to calculate over which tile the mouse
     * currently is.
     * 
     * @param {Object} data Information about the new view offset.
     */
    this.onViewOffsetUpdate = function (data) {
        viewOffsetLeft = data.offsetLeft;
        viewOffsetTop = data.offsetTop;
    };
    
    /**
     * Event handler for the <code>start</code> event. The handler registers
     * the mouse movement handler with the main view canvas.
     */
    this.onStart = function () {
        canvas = document.getElementById("view-canvas");
        canvas.addEventListener("mousemove", mouseMoveHandler);
        canvas.addEventListener("mousedown", mouseDownHandler);
        addEventListener("mouseup", mouseUpHandler);
    };
    
    /**
     * Event handler for the <code>stop</code> event. The handler unregisters
     * the mouse movement handler from the main view canvas.
     */
    this.onStop = function () {
        canvas.removeEventListener("mousemove", mouseMoveHandler);
        canvas.removeEventListener("mousedown", mouseDownHandler);
        removeEventListener("mouseup", mouseUpHandler);
    };
    
    /**
     * The handler executed when the user pushes a mouse button while over the
     * canvas area.
     * 
     * @param {MouseEvent} event The event representing the user's action.
     */
    function mouseDownHandler(event) {
        var button;
        if (mouseDown) {
            return; // one of the mouse buttons is already pressed
        }
        mouseDown = true;
        dragStartTileX = tileX;
        dragStartTileY = tileY;
        if (event.button === 0) { // left mouse button click
            button = "left";
        } else if (event.button === 1) { // right mouse button click
            button = "right";
        }
        instance.sendEvent(button + "MouseDown", {
            x: tileX,
            y: tileY
        });
    }
    
    /**
     * The handler executed when the user releases the pressed mouse button.
     * 
     * @param {MouseEvent} event Event representing the user's action.
     */
    function mouseUpHandler(event) {
        var button;
        if (!mouseDown) {
            return;
        }
        mouseDown = false;
        if (event.button === 0) { // left mouse button click
            button = "left";
        } else if (event.button === 1) { // right mouse button click
            button = "right";
        }
        if (button) {
            if ((dragStartTileX === tileX) && (dragStartTileY === tileY)) {
                instance.sendEvent(button + "MouseButtonClick", {
                    x: tileX,
                    y: tileY
                });
            } else {
                instance.sendEvent(button + "MouseButtonBoxSelect", {
                    startX: dragStartTileX,
                    startY: dragStartTileY,
                    endX: tileX,
                    endY: tileY
                });
            }
        }
    }
    
    /**
     * Handles the mouse cursor movement over the main view canvas.
     * 
     * @param {MouseEvent} event The mouse move event to process.
     */
    function mouseMoveHandler(event) {
        var newTileX, newTileY, xShift, yShift, button;
        mouseX = event.offsetX;
        mouseY = event.offsetY;
        moved = true;
        newTileX = Math.floor((mouseX + viewOffsetLeft) / tileWidth);
        newTileY = Math.floor((mouseY + viewOffsetTop) / tileHeight);
        xShift = mouseX - newTileX * tileWidth;
        yShift = mouseY - newTileY * tileHeight;
        if (newTileY % 2) {
            if (xShift >= tileWidthHalf) {
                xShift -= tileWidthHalf;
                newTileY -= (xShift + yShift < tileWidthHalf) ? 1 : 0;
            } else {
                if (tileWidthHalf - xShift + yShift < tileWidthHalf) {
                    newTileY--;
                } else {
                    newTileX--;
                }
            }
        } else {
            if (xShift >= tileWidthHalf) {
                xShift -= tileWidthHalf;
                newTileY -= (tileWidthHalf - xShift + yShift < tileWidthHalf) ?
                        1 : 0;
            } else {
                if (xShift + yShift < tileWidthHalf) {
                    newTileX--;
                    newTileY--;
                }
            }
        }
        if ((tileX !== newTileX) || (tileY !== newTileY)) {
            handleMoveToAnotherTile(event, newTileX, newTileY);
        }
    }
    
    /**
     * Handles movement of the mouse cursor to another tile.
     * 
     * @param {MouseEvent} event The event representing the user's action of
     *        moving the mouse cursor.
     * @param {Number} newTileX X-coordinate of the new tile over which the
     *        mouse cursor is right now.
     * @param {Number} newTileY Y-coordinate of the new tile over which the
     *        mouse cursor is right now.
     */
    function handleMoveToAnotherTile(event, newTileX, newTileY) {
        var button;
        tileX = newTileX;
        tileY = newTileY;
        movedTile = true;
        if (mouseDown) {
            if (event.button === 0) { // left mouse button click
                button = "left";
            } else if (event.button === 1) { // right mouse button click
                button = "right";
            }
            instance.sendEvent(button + "MouseButtonBoxSelectProgress", {
                startX: dragStartTileX,
                startY: dragStartTileY,
                endX: tileX,
                endY: tileY
            });
        }
    }
};
MousePlugin.prototype = new AdvancedUIPlugin();
