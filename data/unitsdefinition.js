var UnitsDefinition;

UnitsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: 'Harvester',
            image: 'data/images/units/harvester/?.png',
            speed: 3,
            turnSpeed: 1,
            colorify: '#ffffff',
            colorifyDistance: 240,
            resource: 1,
            race: 0,
            construction: { // total cost: 1500, duration: 500 ticks
                step: [6],
                stepProgress: 4, // 250 steps
                stepDuration: 2
            }
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());