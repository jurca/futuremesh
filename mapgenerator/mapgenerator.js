"use strict";
var MapGenerator;
require('mapgenerator.tabs', 'mapgenerator.forms', 'mapeditor.modal',
        'mapeditor.progressbar', 'mainview', 'mapgenerator.terraingenerator',
        'mapcompressor', 'mapgenerator.mapgeneratorscrollbars');

MapGenerator = function () {
    var tabs, form, select, option, i, type, forms, modal, progressbar, view,
            terrainGenerator, compressor;
    
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
    form = document.getElementsByTagName('form')[0];
    select = form.getElementsByTagName('select')[0];
    for (i = 0; type = TilesDefinition.getType(i); i++) {
        if (!type.accessible) {
            option = document.createElement('option');
            option.appendChild(document.createTextNode(i));
            option.value = i;
            select.appendChild(option);
        }
    }
    
    form.addEventListener('submit', function (e) {
        var data, map;
        e.preventDefault();
        modal = new Modal('Generating map...');
        progressbar = new Progressbar(0);
        modal.appendChild(progressbar);
        modal.center();
        tabs.setActiveTab(0, 1);
        setTimeout(function () {
            data = forms.getFormData(form);
            progressbar.setValue(5);
            setTimeout(function () {
                map = terrainGenerator.generate(data);
                document.getElementById('map').value =
                        compressor.compress(map.exportData(), 3);
                progressbar.setValue(90);
                setTimeout(function () {
                    view.setMap(map);
                    view.display(0, 0);
                    modal.close();
                }, 10);
            }, 10);
        }, 100);
    }, false);
    
    modal.close();
};
