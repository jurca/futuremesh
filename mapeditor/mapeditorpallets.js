var MapEditorPallets;

MapEditorPallets = function (mapEditor) {
    var $, container, initPalette, setImagesSizes;
    
    $ = function (select) {
        return document.querySelectorAll(select);
    };
    
    initPalette = function (definitions, container, layer) {
        var i, definition, tile;
        for (i = 0; definition = definitions.getType(i); i++) {
            tile = document.createElement('img');
            tile.src = definition.imageData instanceof Array ?
                    definition.imageData[0].src : definition.imageData.src;
            (function () {
                var type;
                type = definition;
                tile.addEventListener('click', function () {
                    var imgs, i;
                    imgs = $('#palette img');
                    for (i = imgs.length; i--;) {
                        imgs[i].className = '';
                    }
                    this.className = 'selected';
                    mapEditor.setCurrentBrush({
                        layer: layer,
                        type: type.type
                    });
                }, false);
            }());
            container.appendChild(tile);
        }
    };
    
    setImagesSizes = function (example) {
        var width, height, imgs, i;
        width = example.offsetWidth - 14;
        height = example.offsetHeight - 14;
        imgs = $('#palette img');
        for (i = imgs.length; i--;) {
            imgs[i].style.maxWidth = width + 'px';
            imgs[i].style.maxHeight = height + 'px';
        }
    };
    
    initPalette(TilesDefinition, $('#palette-terrain')[0], 'terrain');
    initPalette(BuildingsDefinition, $('#palette-buildings')[0], 'buildings');
    initPalette(UnitsDefinition, $('#palette-units')[0], 'units');
    initPalette({
        getType: function (i) {
            return ([{
                    imageData: {
                        src: 'data/images/sfx/beam.png'
                    }
            }])[i];
        }
    }, $('#palette-sfx')[0], 'sfx');
    
    setTimeout(function () {
        var event;
        setImagesSizes($('#palette img')[0]);
        event = document.createEvent('Events');
        event.initEvent('click', true, true);
        $('#palette img')[0].dispatchEvent(event);
    }, 100);
};
