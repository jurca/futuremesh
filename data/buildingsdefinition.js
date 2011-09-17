var BuildingsDefinition;

BuildingsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            image: 'data/images/buildings/construction-yard.png',
            imageWidth: undefined,
            imageHeight: undefined,
            width: 3,
            height: 3,
            passable: false
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());