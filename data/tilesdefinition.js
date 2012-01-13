var TilesDefinition;

TilesDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            image: 'data/images/tiles/grass.jpg',
            accessible: true,
            minimap: 'rgb(0,200,0)'
        },
        {
            type: 1,
            image: 'data/images/tiles/water.jpg',
            accessible: false,
            minimap: 'rgb(0,0,215)'
        },
        {
            type: 2,
            image: 'data/images/tiles/rock.jpg',
            accessible: false,
            minimap: 'rgb(128,128,128)'
        },
        {
            type: 3,
            image: 'data/images/tiles/energy.jpg',
            accessible: false,
            minimap: 'rgb(200,150,42)'
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());
