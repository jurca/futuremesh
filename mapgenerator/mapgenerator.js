"use strict";
var MapGenerator;

/**
 * Map Generator main class. This class controlls the UI and map generation.
 */
MapGenerator = function () {
    var tabs, form, select, option, i, type, forms, modal, progressbar, view,
            terrainGenerator, compressor, executeBatch, generateMap, getById,
            resourceGenerator, baseGenerator;
    
    modal = new Modal('Initializing...');
    progressbar = new Progressbar(50);
    modal.appendChild(progressbar);
    modal.center();
    
    tabs = new Tabs();
    forms = new Forms();
    compressor = new MapCompressor();
    view = new MainView();
    view.setCanvases(document.getElementById('terrain'),
            document.getElementById('buildings'),
            document.getElementById('units'), document.getElementById('sfx'));
    new MapGeneratorScrollbars(view);
    terrainGenerator = new TerrainGenerator();
    resourceGenerator = new ResourceGenerator();
    baseGenerator = new BaseGenerator();
    form = document.getElementsByTagName('form')[0];
    select = form.getElementsByTagName('select')[0];
    for (i = 0; type = TilesDefinition.getType(i); i++) {
        if (!type.accessible && (type.resource === null)) {
            option = document.createElement('option');
            option.appendChild(document.createTextNode(i));
            option.value = i;
            select.appendChild(option);
        }
    }
    select = form.getElementsByTagName('select')[1];
    for (i = 0; type = TilesDefinition.getType(i); i++) {
        if (type.accessible) {
            option = document.createElement('option');
            option.appendChild(document.createTextNode(i));
            option.value = i;
            select.appendChild(option);
        }
    }
    
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        modal = new Modal('Generating map...');
        progressbar = new Progressbar(0);
        modal.appendChild(progressbar);
        modal.center();
        tabs.setActiveTab(0, 1);
        generateMap();
    }, false);
    
    /**
     * Generates the map using the data provided in the form.
     */
    generateMap = function () {
        var data, map, playersCount, positions, areas;
        executeBatch([
            function () { // retrieve the form data
                data = forms.getFormData(form);
                playersCount = data.players;
                progressbar.setValue(5);
            },
            function () { // generate an empty map
                map = terrainGenerator.generateEmptyMap(data);
                progressbar.setValue(15);
            },
            function () { // create places for players
                positions = terrainGenerator.generatePlayerSpots(map, data,
                        playersCount);
                areas = [].concat(positions);
                terrainGenerator.generatePlayerAreas(map, data, positions);
                progressbar.setValue(20);
            },
            function () { // generate central area
                terrainGenerator.generateCentralArea(map, data, areas);
                progressbar.setValue(25)
            },
            function () { // generate circular passage areas
                terrainGenerator.generateCircularPassageAreas(map, data, areas);
                progressbar.setValue(30);
            },
            function () { // generate square passage areas
                terrainGenerator.generateRectangularPassageAreas(map, data,
                        areas);
                progressbar.setValue(35);
            },
            function () {
                terrainGenerator.generateDiamondPassageAreas(map, data, areas);
                progressbar.setValue(40);
            },
            function () {
                terrainGenerator.generatePassages(map, data, areas);
                progressbar.setValue(45);
            },
            function () {
                resourceGenerator.generateTileResources(map, data, positions);
                progressbar.setValue(50);
            },
            function () {
                resourceGenerator.generateBuildingResources(map, data,
                        positions);
                progressbar.setValue(55);
            },
            function () {
                baseGenerator.generateBases(map, data, positions);
                progressbar.setValue(60);
            },
            function () { // export the map data
                document.getElementById('map').value =
                        compressor.compress(map.exportData(), 3);
                progressbar.setValue(70);
            },
            function () { // generate the global overview of the map
                var size;
                view.setCanvases(getById('global-terrain'),
                        getById('global-buildings'), getById('global-units'),
                        getById('global-sfx'));
                view.setMap(map);
                size = view.getLayersDimensions();
                getById('global-terrain').width = size.width;
                getById('global-terrain').height = size.height;
                getById('global-buildings').width = size.width;
                getById('global-buildings').height = size.height;
                getById('global-units').width = size.width;
                getById('global-units').height = size.height;
                getById('global-sfx').width = size.width;
                getById('global-sfx').height = size.height;
                view.display(0, 0);
                progressbar.setValue(85);
            },
            function () { // display the map
                view.setCanvases(getById('terrain'), getById('buildings'),
                        getById('units'), getById('sfx'));
                view.setMap(map);
                view.display(0, 0);
                modal.close();
            }
        ], 10);
    };
    
    /**
     * Executes a batch of functions (tasks) in the provided order. The tasks
     * with be executed with scheduled breaks between the task execution, so
     * that the browser UI can be updated.
     * 
     * @param {Array} tasks An array of functions to execute in order.
     * @param {Number} pause The pause between task execution in miliseconds.
     */
    executeBatch = function (tasks, pause) {
        var interval, task;
        task = 0;
        interval = setInterval(function () {
            if (task >= tasks.length) {
                clearInterval(interval);
                return;
            }
            tasks[task++]();
        }, pause);
    };
    
    /**
     * Returns an element of the specified ID.
     * 
     * @return Element The element of the specified ID.
     */
    getById = function (elementId) {
        return document.getElementById(elementId);
    };
    
    modal.close();
};
