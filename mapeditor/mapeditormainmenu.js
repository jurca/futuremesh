require('../mapeditor/modal', '../mapeditor/formbuilder');

var MapEditorMainMenu;

/**
 * Class handling the main menu of the Map Editor.
 */
MapEditorMainMenu = function (mapEditor, defaultMapWidth, defaultMapHeight) {
    var $;

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
        });
        modal.appendChild(form);
        modal.center();
    }, false);

    $('menu-export').addEventListener('click', function () {
        var modal, textarea;
        modal = new Modal('Export map', true);
        textarea = document.createElement('textarea');
        textarea.cols = 40;
        textarea.rows = 6;
        modal.appendChild(textarea);
        modal.center();
        textarea.value = JSON.stringify(mapEditor.getMap().exportData());
    }, false);

    $('menu-import').addEventListener('click', function () {
        var modal, form;
        modal = new Modal('Import map', true);
        form = new FormBuilder('Import map from JSON data', [
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
            map.importData(JSON.parse(data.data));
            mapEditor.setMap(map);
            modal.close();
        });
    }, false);
};
