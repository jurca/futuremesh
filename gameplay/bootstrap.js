window.onerror = function (message, source, line) {
    var text;
    text = "The application has encountered an error!\n\n" +
            "Error description: " + message + "\n" +
            "Source of error: " + source + "\n" +
            "Line number: " + line;
    alert(text);
};

addEventListener('load', function () {
    var $;

    $ = function (selector) {
        return document.querySelectorAll(selector);
    };

    setTimeout(function () {
        var loader;
        Player.createGenericPlayers();
        loader = new GameLoader($('#loading-all')[0], $('#loading-current')[0],
                $('#loading-message')[0], $('#loading-screen')[0],
                $('#gameplay-screen')[0], 'data/maps/test2.map',
                Player.getPlayer(0), [
                    [10000] // resources of player 0
                ],
                $('#view-canvas')[0], $('#minimap')[0]);
        loader.load();
    }, 25);
}, false);
