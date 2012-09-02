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
        loader = new GameLoader($('#loading-all')[0], $('#loading-current')[0],
                $('#loading-message')[0], $('#loading-screen')[0],
                $('#gameplay-screen')[0], 'data/maps/test2.map');
        loader.load();
    }, 25);
}, false);
