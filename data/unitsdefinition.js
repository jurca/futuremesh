var UnitsDefinition;

UnitsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: 'Harvester',
            image: 'data/images/units/harvester/?.png',
            speed: 30,
            turnSpeed: 100,
            hitpoints: 800, // how much damage can the unit take
            colorify: '#ffffff',
            colorifyDistance: 240,
            resource: 1,
            race: 0,
            construction: { // total cost: 150, duration: 50 ticks
                step: [6],
                stepProgress: 40, // 25 steps (1000 is complete construction)
                stepDuration: 1   // +1 for resource request
            }
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());
