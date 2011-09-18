"use strict";
require('mapgenerator.mapgenerator', 'player', 'imageloader',
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
        imageLoader = new ImageLoader();
        imageLoader.addObserver(function (percent) {
            progressbar.setValue(percent * 100);
            if (percent == 1) {
                setTimeout(function () {
                    new MapGenerator();
                }, 100);
                modal.close();
            }
        });
        imageLoader.load(BuildingsDefinition, UnitsDefinition,
            TilesDefinition);
    }, 150);
}, false);