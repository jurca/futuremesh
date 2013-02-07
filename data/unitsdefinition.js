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
            race: 0
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());