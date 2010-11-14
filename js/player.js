var Player;

Player = (function () {
    var id, Player, players;

    id = 0;
    players = [];

    Player = function (color, isHuman, name, resources, race) {
        this.id = id++;
        this.color = color;
        this.isHuman = isHuman;
        this.name = name;
        this.resources = resources;
        this.race = race;
        players.push(this);
    };

    Player.getPlayer = function (id) {
        return players[id];
    };

    return Player;
}());