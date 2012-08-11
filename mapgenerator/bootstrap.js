"use strict";
require('mapgenerator.mapgenerator', 'player', 'spriteloader',
        'mapeditor.modal', 'mapeditor.progressbar', 'data.tilesdefinition',
        'data.buildingsdefinition', 'data.unitsdefinition');

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