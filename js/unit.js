var Unit;

Unit = (function () {
    var id, Unit, units;

    id = 0;
    units = [];

    Unit = function (x, y, direction, player, color) {
        this.id = id++;
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.direction = direction;
        this.action = 0;
        this.player = player;
        this.color = color === undefined ?
                Player.getPlayer(player).color : color;
        units.push(this);
    };

    Unit.getUnit = function (id) {
        return units[id];
    };

    return Unit;
}());