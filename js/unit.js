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
            var lastX, lastY;
            lastX = this.x;
            lastY = this.y;
            if (distance > 1) {
                this.move(distance - 1);
            }
            this.lastX = lastX;
            this.lastY = lastY;
            switch (this.direction) {
                case 0:
                    this.y -= 2;
                    break;
                case 1:
                    this.x += this.y % 2;
                    this.y -= 1;
                    break;
                case 2:
                    this.x += 1;
                    break;
                case 3:
                    this.x += this.y % 2;
                    this.y += 1;
                    break;
                case 4:
                    this.y += 2;
                    break;
                case 5:
                    this.x -= 1 - (this.y % 2);
                    this.y += 1;
                    break;
                case 6:
                    this.x -= 1;
                    break;
                case 7:
                    this.x -= 1 - (this.y % 2);
                    this.y -= 1;
                    break;
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