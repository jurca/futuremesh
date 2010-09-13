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

        this.move = function (distance) {
            this.lastX = this.x;
            this.lastY = this.y;
            if ((this.direction >= 1) && (this.direction <= 3)) {
                this.x += distance;
            }
            if (this.direction >= 5) {
                this.x -= distance;
            }
            if ((this.direction == 7) || (this.direction <= 1)) {
                this.y -= distance;
            }
            if ((this.direction >= 3) && (this.direction <= 5)) {
                this.y += distance;
            }
            this.action = 2;
        };

        units.push(this);
    };

    Unit.getUnit = function (id) {
        return units[id];
    };

    return Unit;
}());