var Unit;
require('../data/unitsdefinition', 'player');

Unit = (function () {
    var id, Unit, units;

    id = 0;
    units = [];

    Unit = function (x, y, direction, type, player, color) {
        var definition;
        definition = UnitsDefinition.getType(type);
        this.id = id++;
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.direction = direction;
        this.type = type;
        this.image = definition.image;
        this.speed = definition.speed;
        this.turnSpeed = definition.turnSpeed;
        this.action = 0;
        this.player = player;
        this.moveOffset = 0;
        this.moveOffsetX = 0;
        this.moveOffsetY = 0;
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

        this.setMoveOffset = function (offset) {
            this.moveOffset = offset;
            if ((this.direction >= 1) && (this.direction <= 3)) {
                this.moveOffsetX = Settings.tileWidth * offset *
                        (this.direction == 2 ? 1 : 0.5);
            }
            if (this.direction >= 5) {
                this.moveOffsetX = -Settings.tileWidth * offset *
                        (this.direction == 6 ? 1 : 0.5);
            }
            if ((this.direction == 7) || (this.direction <= 1)) {
                this.moveOffsetY = -Settings.tileHeight * offset *
                        (this.direction == 0 ? 1 : 0.5);
            }
            if ((this.direction >= 3) && (this.direction <= 5)) {
                this.moveOffsetY = Settings.tileHeight * offset *
                        (this.direction == 4 ? 1 : 0.5);
            }
        };

        units.push(this);
    };

    Unit.getUnit = function (id) {
        return units[id];
    };

    return Unit;
}());