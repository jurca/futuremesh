"use strict";
var ConstructionButtonsScroller;

/**
 * The Construction Buttons Scroller enables the functionality of the scroll
 * button used to scroll the panels of buttons representing the available units
 * and buildings that may be constructed by the current player.
 *
 * @constructor
 */
ConstructionButtonsScroller = function () {
    var scrollDown1stHandler, scrollUp1stHandler, stopScroll1stHandler,
            scrolling1st, scrollDown2ndHandler, scrollUp2ndHandler,
            stopScroll2ndHandler, scrolling2nd, $, scrollSpeed, buttonsStrip1,
            buttonsStrip2, upButton1, downButton1, upButton2, downButton2;

    scrollSpeed = 7; // 7 px per tick

    $ = function (selector) {
        return document.querySelectorAll(selector);
    };

    scrollDown1stHandler = function () {
        scrolling1st = scrollSpeed;
    };
    scrollUp1stHandler = function () {
        scrolling1st = -scrollSpeed;
    };
    stopScroll1stHandler = function () {
        scrolling1st = 0;
    };
    scrollDown2ndHandler = function () {
        scrolling2nd = scrollSpeed;
    };
    scrollUp2ndHandler = function () {
        scrolling2nd = -scrollSpeed;
    };
    stopScroll2ndHandler = function () {
        scrolling2nd = 0;
    };

    // override
    this.handleTick = function () {
        if (scrolling1st) {
            buttonsStrip1.scrollTop += scrolling1st;
        }
        if (scrolling2nd) {
            buttonsStrip2.scrollTop += scrolling2nd;
        }
    };

    /**
     * Event handler for the <code>start</code> event.
     *
     * @param {Object} data Event data.
     */
    this.onStart = function (data) {
        upButton1 = $('#buildings-buttons .button-scroll-up')[0];
        downButton1 = $('#buildings-buttons .button-scroll-down')[0];
        buttonsStrip1 = $(
                '#buildings-buttons .construction-buttons-content')[0];
        upButton2 = $('#units-buttons .button-scroll-up')[0];
        downButton2 = $('#units-buttons .button-scroll-down')[0];
        buttonsStrip2 = $('#units-buttons .construction-buttons-content')[0];

        upButton1.addEventListener('mousedown', scrollUp1stHandler, false);
        upButton1.addEventListener('mouseup', stopScroll1stHandler, false);
        downButton1.addEventListener('mousedown', scrollDown1stHandler, false);
        downButton1.addEventListener('mouseup', stopScroll1stHandler, false);

        upButton2.addEventListener('mousedown', scrollUp2ndHandler, false);
        upButton2.addEventListener('mouseup', stopScroll2ndHandler, false);
        downButton2.addEventListener('mousedown', scrollDown2ndHandler, false);
        downButton2.addEventListener('mouseup', stopScroll2ndHandler, false);
    };

    /**
     * Event handler for the <code>stop</code> event.
     *
     * @param {Object} data Event data.
     */
    this.onStop = function (data) {
        scrolling1st = 0;
        scrolling2nd = 0;
        upButton1.removeEventListener('mousedown', scrollUp1stHandler, false);
        upButton1.removeEventListener('mouseup', stopScroll1stHandler, false);
        downButton1.removeEventListener('mousedown', scrollDown1stHandler,
                false);
        downButton1.removeEventListener('mouseup', stopScroll1stHandler,
                false);

        upButton2.removeEventListener('mousedown', scrollUp2ndHandler, false);
        upButton2.removeEventListener('mouseup', stopScroll2ndHandler, false);
        downButton2.removeEventListener('mousedown', scrollDown2ndHandler,
                false);
        downButton2.removeEventListener('mouseup', stopScroll2ndHandler,
                false);
    };
};
ConstructionButtonsScroller.prototype = new AdvancedMixedPlugin();
