"use strict";
var MapEditorMainMenu;

/**
 * Class handling the main menu of the Map Editor.
 */
MapEditorMainMenu = function (mapEditor, defaultMapWidth, defaultMapHeight) {
    var $, compressor, fileName;

    compressor = new MapCompressor();
    fileName = null; // the name of the file the map was loaded from/saved to

    $ = function (selector) {
        return document.getElementById(selector);
    };

    $('menu-newmap').addEventListener('click', function () {
        var modal, form;
        modal = new Modal('New map', true);
        form = new FormBuilder('New map options', [
            {
                label: 'Map width:',
                name: 'width',
                value: defaultMapWidth
            },
            {
                label: 'Map height:',
                name: 'height',
                value: defaultMapHeight
            },
            {
                label: 'Create empty map:',
                name: 'type',
                value: 0,
                type: 'radio',
                checked: true
            },
            {
                label: 'Create random map:',
                name: 'type',
                value: 1,
                type: 'radio'
            }
        ], 'create');
        form.setHandler(function (data) {
            var map;
            modal.close()
            map = new Map();
            if (data.type == 1) {
                map.randomMap(data.width, data.height);
            } else {
                map.emptyMap(data.width, data.height);
            }
            mapEditor.setMap(map);
            fileName = null;
            $('menu-save').className = 'disabled';
        });
        modal.appendChild(form);
        modal.center();
    }, false);
    
    $('menu-save').addEventListener('click', function () {
        var modal, message;
        if (!fileName) {
            return;
        }
        message = document.createElement('p');
        message.appendChild(document.createTextNode('Saving...'));
        modal = new Modal('Saving map...', false);
        modal.appendChild(message);
        modal.center();
        setTimeout(function () {
            var data, url;
            data = 'name=' + fileName + '&data=' + encodeURIComponent(
                    compressor.compress(mapEditor.getMap().exportData(), 3));
            url = 'cgi-bin/savemap.py';
            Ajax.post(url, data, function () {
                modal.close();
                new Alert('Saved!');
            }, function () {
                modal.close();
                new Alert('Save failed.');
            });
        }, 25);
    }, false);
    
    $('menu-save-as').addEventListener('click', function () {
        var modal, loadingMessage, url;
        modal = new Modal('Save map as...', false);
        loadingMessage = document.createElement('p');
        loadingMessage.appendChild(
                document.createTextNode('Loading files...'));
        modal.appendChild(loadingMessage);
        modal.center();
        url = 'cgi-bin/listdir.py?dir=' + encodeURIComponent('data/maps');
        Ajax.get(url,
            function (files) {
                var chooser;
                modal.close();
                chooser = new FileChooser('maps/', JSON.parse(files), true,
                        function (file) {
                    if (!file) {
                        return;
                    }
                    if (files.indexOf(file) > -1 && !confirm('Overwrite?')) {
                        return;
                    }
                    loadingMessage.firstChild.nodeValue = 'Saving...';
                    modal = new Modal('Saving map...', false);
                    modal.appendChild(loadingMessage);
                    modal.center();
                    setTimeout(function () {
                        var data, url;
                        data = 'name=' + file + '&data=' +
                                encodeURIComponent(compressor.compress(
                                mapEditor.getMap().exportData(), 3));
                        url = 'cgi-bin/savemap.py';
                        Ajax.post(url, data, function () {
                            modal.close();
                            new Alert('Saved!');
                            fileName = file;
                            $('menu-save').className = '';
                        }, function () {
                            modal.close();
                            new Alert('Save failed.');
                        });
                    }, 25);
                });
                chooser.setFileSaveMode();
            },
            function () {
                loadingMessage.firstChild.nodeValue = 'Cannot load files';
                setInterval(function () {
                    modal.close()
                }, 700);
            }
        );
    }, false);
    
    $('menu-load').addEventListener('click', function () {
        var modal, loadingMessage, url;
        modal = new Modal('Load map', false);
        loadingMessage = document.createElement('p');
        loadingMessage.appendChild(
                document.createTextNode('Loading files...'));
        modal.appendChild(loadingMessage);
        modal.center();
        url = 'cgi-bin/listdir.py?dir=' + encodeURIComponent('data/maps');
        Ajax.get(url, function (files) {
                var chooser;
                modal.close();
                chooser = new FileChooser('maps/', JSON.parse(files), true,
                        function (file) {
                    if (file) {
                        loadingMessage.firstChild.nodeValue = 'Loading...';
                        modal = new Modal('Loading map...', false);
                        modal.appendChild(loadingMessage);
                        modal.center();
                        setTimeout(function () {
                            var time;
                            time = (new Date()).getTime();
                            Ajax.get('data/maps/' + file + '?time=' + time,
                            function (data) {
                                var map;
                                map = new Map();
                                map.importData(compressor.decompress(data, 3));
                                mapEditor.setMap(map);
                                fileName = file;
                                $('menu-save').className = '';
                                modal.close();
                            },
                            function () {
                                modal.close();
                                new Alert('Cannot load file ' + file);
                            });
                        }, 25);
                    }
                });
            },
            function () {
                loadingMessage.firstChild.nodeValue = 'Cannot load files';
                setInterval(function () {
                    modal.close()
                }, 700);
            }
        );
    }, false);

    $('menu-export').addEventListener('click', function () {
        var modal, textarea;
        modal = new Modal('Export map', true);
        textarea = document.createElement('textarea');
        textarea.cols = 40;
        textarea.rows = 6;
        modal.appendChild(textarea);
        modal.center();
        textarea.value = compressor.compress(mapEditor.getMap().exportData(),
                3);
    }, false);

    $('menu-import').addEventListener('click', function () {
        var modal, form;
        modal = new Modal('Import map', true);
        form = new FormBuilder('Import map from serialized data', [
            {
                label: '',
                value: '',
                type: 'textarea',
                cols: 40,
                rows: 6,
                name: 'data'
            }
        ], 'import');
        modal.appendChild(form);
        modal.center();
        form.setHandler(function (data) {
            var map;
            map = new Map;
            map.importData(compressor.decompress(data.data, 3));
            mapEditor.setMap(map);
            modal.close();
        });
    }, false);
};
