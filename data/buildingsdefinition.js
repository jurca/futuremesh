var BuildingsDefinition;

BuildingsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: 'Construction Yard',
            image: 'data/images/buildings/construction-yard.png',
            imageWidth: undefined,
            imageHeight: undefined,
            width: 3,
            height: 3,
            passable: false,
            colorify: '#ffffff',
            colorifyDistance: 440,
            prerequisities: [],
            resource: null,
            race: 0
        },
        {
            type: 1,
            name: 'Ore',
            image: 'data/images/buildings/ore.png',
            imageWidth: undefined,
            imageHeight: undefined,
            width: 1,
            height: 1,
            passable: true,
            colorify: '#000000',
            colorifyDistance: 0,
            prerequisities: [],
            resource: 1,
            race: null
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());