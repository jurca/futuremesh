"use strict";
var MouseGestures;

/**
 * Basic support for mouse gestures. Creates a mouse gesture monitor to which
 * can be registered event listeners listening for specific or all mouse
 * gestures.
 * 
 * The monitor is able to process the mouse movement in 4 or 8 directions.
 * Sequences of these directions identify the gestures. In case of 4 directions
 * sensitivity the directions are identified as follows:
 * 0 - up
 * 1 - right
 * 2 - down
 * 3 - left
 * 
 * In case of 8 directions sensitivity the directions are identified as follows:
 * 0 - up
 * 1 - up right
 * 2 - right
 * 3 - down right
 * 4 - down
 * 5 - down left
 * 6 - left
 * 7 - up left
 * 
 * @param {Number} directionGranularity Sets the number of the mouse movement
 *        directions the monitor will recognize. The possible values are 4 or 8.
 *        Recommended value is 4.
 * @param {Boolean} ignoreDuplicates When set to true, the monitor ignores
 *        repeated mouse movements of the same direction and reduces them to
 *        a single movement in the given direction. The recommended value is
 *        true.
 * @param {Number} minDistance The minimal distance the mouse cursor has to
 *        travel before the direction of its movement is calculated. Larger
 *        value ignores better sudden movements of the cursor out of the
 *        user-intended direction but may cause problems with recognition of
 *        direction change. Recommended value is 5.
 * @param {Number} mouseButton The mouse button that must be held down during
 *        the mouse gesture. 0 is for the left mouse button, 1 is for the middle
 *        mouse button and 2 is for the right mouse button. Setting this to 2
 *        will disable the context menu of the browser. Recommended value is 2.
 */
MouseGestures = function (directionGranularity, ignoreDuplicates, minDistance,
        mouseButton) {
    var previousX, previousY, active, computeDirection,
            lastDirection, gesture,
            listeners, executeListeners, gestures;
    
    active = false;
    listeners = [];
    gestures = {};
    
    /**
     * Adds a listener that will receive all mouse gestures performed by the
     * user. The listener will receive a single parameter - an array containing
     * the recorded directions of mouse cursor movement.
     * 
     * @param {Function} listener The listener for mouse gestures.
     */
    this.addListener = function (listener) {
        listeners.push(listener);
    };
    
    /**
     * Adds a listener that will be executed only on specific mouse gesture.
     * The listener does not receive any parameters.
     * 
     * @param {String} gesture String containing chain of the mouse movement
     *        directions.
     * @param {Function} listener The listener for mouse gesture.
     */
    this.addGestureListener = function (gesture, listener) {
        if (!gestures[gesture]) {
            gestures[gesture] = [];
        }
        gestures[gesture].push(listener);
    };
    
    this.addListener(function (gesture) {
        var i, listeners;
        listeners = gestures[gesture.join('')];
        if (listeners) {
            for (i = listeners.length; i--;) {
                listeners[i]();
            }
        }
    });
    
    computeDirection = function (x, y) {
        var max, absX, absY;
        absX = Math.abs(x);
        absY = Math.abs(y);
        max = Math.max(absX, absY);
        x /= max;
        y /= max;
        if (directionGranularity == 4) {
            if (absX > absY) {
                return x > 0 ? 1 : 3;
            }
            return y > 0 ? 2 : 0;
        }
        if (absX / 2 > absY) {
            return x > 0 ? 2 : 6;
        }
        if (absX > absY / 2) {
            return x > 0 ? (y > 0 ? 3 : 1) : (y > 0 ? 5 : 7);
        }
        return y > 0 ? 4 : 0;
    };
    
    executeListeners = function (gesture) {
        var i;
        for (i = listeners.length; i--;) {
            listeners[i](gesture);
        }
    };
    
    addEventListener('mousedown', function (e) {
        if (mouseButton == e.button) {
            e.preventDefault();
            e.stopPropagation();
            active = true;
            previousX = undefined;
            lastDirection = undefined;
            gesture = [];
        }
    }, false);
    
    if (mouseButton == 2) {
        addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
    }
    
    addEventListener('mouseup', function () {
        if (active) {
            active = false;
            executeListeners(gesture);
        }
    });
    
    addEventListener('mousemove', function (e) {
        var direction, distance, distanceX, distanceY;
        if (previousX && active) {
            distanceX = e.pageX - previousX;
            distanceY = e.pageY - previousY;
            distance = Math.sqrt(Math.pow(distanceX, 2) +
                    Math.pow(distanceY, 2));
            if (distance < minDistance) {
                return;
            }
            direction = computeDirection(distanceX, distanceY);
            if (ignoreDuplicates && (lastDirection == direction)) {
                return;
            }
            lastDirection = direction;
            gesture.push(direction);
            previousX = undefined;
            return;
        }
        previousX = e.pageX;
        previousY = e.pageY;
    }, false);
};