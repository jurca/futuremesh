require('imageloader', '../mapeditor/modal', '../mapeditor/progressbar',
        '../mapeditor/mapeditorviewui', '../mapeditor/mapeditormainmenu',
        '../mapeditor/mapeditorpallets', '../mapeditor/mapeditormouse');

var MapEditor;

MapEditor = function () {
    var $, viewUI, defaultMapWidth, defaultMapHeight, map, currentBrush,
            mouse;
    
    defaultMapWidth = 170;
    defaultMapHeight = 400;
    
    $ = function (selector) {
        return document.getElementById(selector);
    };

    map = new Map();
    map.emptyMap(defaultMapWidth, defaultMapHeight);
    mouse = new MapEditorMouse();
    viewUI = new MapEditorViewUI(mouse);
    viewUI.setMap(map);
    new MapEditorMainMenu(this, defaultMapWidth, defaultMapHeight);
    new MapEditorPallets(this);

    this.setMap = function (map) {
        viewUI.setMap(map);
    };

    this.getMap = function () {
        return viewUI.getMap();
    };
    
    this.setCurrentBrush = function (brush) {
        currentBrush = brush;
    };
    
    this.getCurrentBrush = function () {
        return currentBrush;
    };
};

addEventListener('load', function () {
    setTimeout(function () {
        var modal, imageLoader, progressbar;
        modal = new Modal('Loading images...');
        progressbar = new Progressbar(0);
        modal.appendChild(progressbar);
        modal.center();
        imageLoader = new ImageLoader();
        imageLoader.addObserver(function (percent) {
            progressbar.setValue(percent * 100);
            if (percent == 1) {
                new MapEditor();
                modal.close();
            }
        });
        imageLoader.load(BuildingsDefinition, UnitsDefinition,
            TilesDefinition);
    }, 100);
}, false);
