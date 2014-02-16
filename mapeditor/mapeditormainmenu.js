"use strict";
var MapEditorMainMenu;

/**
 * Class handling the main menu of the Map Editor.
 *
 * @param {MapEditor} mapEditor Instance of the Map Editor using this main
 *        menu.
 * @param {Number} defaultMapWidth The default width of a new map in tiles.
 * @param {Number} defaultMapHeight The default height of a new map in tiles.
 */
MapEditorMainMenu = function (mapEditor, defaultMapWidth, defaultMapHeight) {
    var $, compressor, fileName, compressionLevel, textCompressionLevel,
            base64;

    compressor = new MapCompressor();
    fileName = null; // the name of the file the map was loaded from/saved to
    compressionLevel = 2; // compression to use for binary storage
    textCompressionLevel = 2; // compression for producing text representation
    base64 = new Base64();

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
            modal.close();
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
            var data, url, map, mapData;
            map = mapEditor.getMap();
            mapData = compressor.compress(map, compressionLevel);
            data = 'name=' + fileName + '&data=' + encodeURIComponent(mapData);
            url = 'cgi-bin/savemap.php';
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
        url = 'cgi-bin/listdir.php?dir=' + encodeURIComponent('data/maps');
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
                        var data, url, mapData, map;
                        map = mapEditor.getMap();
                        mapData = compressor.compress(map, compressionLevel);
                        data = 'name=' + file + '&data=' +
                                encodeURIComponent(mapData);
                        url = 'cgi-bin/savemap.php';
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
                    modal.close();
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
        url = 'cgi-bin/listdir.php?dir=' + encodeURIComponent('data/maps');
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
                            var time, url;
                            time = (new Date()).getTime();
                            url = 'cgi-bin/loadmap.php?name=' + file;
                            Ajax.get(url + '&time=' + time,
                            function (data) {
                                var map;
                                map = compressor.decompress(data);
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
                    modal.close();
                }, 700);
            }
        );
    }, false);

    $('menu-export').addEventListener('click', function () {
        var modal, textarea, map;
        modal = new Modal('Export map', true);
        textarea = document.createElement('textarea');
        textarea.cols = 40;
        textarea.rows = 6;
        modal.appendChild(textarea);
        modal.center();
        map = mapEditor.getMap();
        textarea.value = compressor.compress(map, textCompressionLevel);
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
            map = compressor.decompress(data.data);
            mapEditor.setMap(map);
            modal.close();
        });
    }, false);
};
