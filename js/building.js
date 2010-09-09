var Building;

Building = (function () {
    var id, Building, buldings;

    id = 0;
    buldings = [];

    Building = function (x, y, width, height, type, player, color) {
        this.id = id++;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
