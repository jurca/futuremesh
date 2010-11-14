var Building;
require('../data/buildingsdefinition', 'player');

Building = (function () {
    var id, Building, buldings;

    id = 0;
    buldings = [];

    Building = function (x, y, type, player, color) {
        var definition;
        definition = BuildingsDefinition.getType(type);
        this.id = id++;
        this.x = x;
        this.y = y;
        this.image = definition.image;
        this.imageWidth = definition.imageWidth;
        this.imageHeigth = definition.imageHeigth;
        this.width = definition.width;
        this.height = definition.height;
        this.type = type;
        this.player = player;
        this.color = color === undefined ?
                Player.getPlayer(player).color : color;
        buldings.push(this);
    };

    Building.getBuilding = function (id) {
        return buldings[id];
    };

    return Building;
}());
