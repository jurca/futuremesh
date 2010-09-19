var UnitsDefinition;

UnitsDefinition = function () {
    var types;

    types = [
        {
            type: 0,
            image: 'data/images/units/harvester/?.jpg',
            speed: 3,
            turnSpeed: 1
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
};