"use strict";
var MapEditorMouse;

MapEditorMouse = function () {
    var $, mouse, status, inCanvas;

    $ = function (selector) {
        return document.getElementById(selector);
    };

    inCanvas = false;
    status = $('mouse');
    mouse = new Mouse();
    mouse.setCanvasOffset($('view-canvas').offsetLeft,
            $('view-canvas').offsetTop);

    this.setMapOffset = function (x, y) {
        mouse.setMapOffset(x, y);
    };

    this.getX = function () {
        return mouse.getMapX();
    };

    this.getY = function() {
        return mouse.getMapY();
    };

    addEventListener('mousemove', function () {
        if (inCanvas) {
            status.innerHTML = '[' + mouse.getMapX() + ',' +
                    mouse.getMapY() + ']';
        } else {
            status.innerHTML = '[--,--]';
        }
    }, false);

    $('view-canvas').addEventListener('mouseover', function () {
        inCanvas = true;
    }, false);

    $('view-canvas').addEventListener('mouseout', function () {
        inCanvas = false;
    }, false);

    status.innerHTML = '[--,--]';
};
