"use strict";
require('mapgenerator.mapgenerator', 'player', 'spriteloader',
        'mapeditor.modal', 'mapeditor.progressbar', 'data.tilesdefinition',
        'data.buildingsdefinition', 'data.unitsdefinition');

window.onerror = function (message, url, line) {
    var modal, p;
    p = document.createElement('p');
    p.appendChild(document.createTextNode(message));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode("Try refreshing the page. If the " +
            "problem perserveres, please contact the aplication\'s author."));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode('Source of error: ' + url));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode('Line: ' + line));
    modal = new Modal('Error encountered!', true);
    modal.appendChild(p);
    modal.center();
};

addEventListener('load', function () {
    setTimeout(function () {
        var modal, imageLoader, progressbar;
        Player.createGenericPlayers();
        modal = new Modal('Loading images...');
        progressbar = new Progressbar(0);
        modal.appendChild(progressbar);
        modal.center();
        imageLoader = new SpriteLoader();
        imageLoader.addObserver(function (percent) {
            progressbar.setValue(percent * 100);
            if (percent == 1) {
                setTimeout(function () {
                    new MapGenerator();
                }, 100);
                modal.close();
            }
        });
        imageLoader.load();
    }, 150);
}, false);