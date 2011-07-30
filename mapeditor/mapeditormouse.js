"use strict";
var MapEditorMouse;

require('mouse');

MapEditorMouse = function () {
    var $, mouse, status, inCanvas;
    
    $ = function (selector) {
        return document.getElementById(selector);
    };
    
    inCanvas = false;
    status = $('mouse');
    mouse = new Mouse();
    mouse.setCanvasOffset($('sfx').offsetLeft, $('sfx').offsetTop);
    
    this.setMapOffset = function (x, y) {
        mouse.setMapOffset(x, y);
    };
    
    addEventListener('mousemove', function () {
        if (inCanvas) {
            status.innerHTML = '[' + mouse.getMapX() + ',' +
                    mouse.getMapY() + ']';
        } else {
            status.innerHTML = '[--,--]';
        }
    }, false);
    
    $('sfx').addEventListener('mouseover', function () {
        inCanvas = true;
    }, false);
    
    $('sfx').addEventListener('mouseout', function () {
        inCanvas = false;
    }, false);
    
    status.innerHTML = '[--,--]';
};
