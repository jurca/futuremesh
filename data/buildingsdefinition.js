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
            race: 0,
            construction: { // total cost: 5000, duration: 1500 ticks
                step: [10],
                stepProgress: 2, // 500 steps, fully constructed when progress
                                 // is 1000
                stepDuration: 3 // number of ticks
            }
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
            race: null,
            construction: null // non-constructable building
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());