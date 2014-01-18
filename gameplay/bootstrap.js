(function () {
    var alertLimit;

    alertLimit = 5;

    window.onerror = function (message, source, line) {
        var text;
        text = "The application has encountered an error!\n\n" +
                "Error description: " + message + "\n" +
                "Source of error: " + source + "\n" +
                "Line number: " + line;
        if (alertLimit) {
            alert(text);
            alertLimit--;
        }
    };
}());

addEventListener('load', function () {
    var $;

    $ = function (selector) {
        return document.querySelectorAll(selector);
    };

    setTimeout(function () {
        var loader;
        $("body")[0].setAttribute("unselectable", "on");
        $("body")[0].addEventListener("selectstart", function (e) {
            e.preventDefault();
        }, false);
        Player.createGenericPlayers();
        loader = new GameLoader($('#loading-all')[0], $('#loading-current')[0],
                $('#loading-message')[0], $('#loading-screen')[0],
                $('#gameplay-screen')[0], 'data/maps/tinytest.map',
                Player.getPlayer(0), [
                    [10000] // resources of player 0
                ],
                1, $('#view-canvas')[0], $('#minimap')[0]);
        loader.load();
    }, 25);
}, false);
