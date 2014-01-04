var ResourcesDefinition;

ResourcesDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: "Ore",
            minimap: "#d69200"
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());