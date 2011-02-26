var require;

(function () {
    var path, scripts, i, script, loaded;

    scripts = document.getElementsByTagName('script');
    for (i = scripts.length; i--;) {
        script = scripts[i].src;
        if (script && (script.indexOf('require.js') > -1)) {
            path = script.substring(0, script.indexOf('require.js'));
            break;
        }
    }

    loaded = {};

    require = function () {
        var i, file, length;
        length = arguments.length;
        for (i = 0; i < length; i++) {
            file = arguments[i];
            if (!loaded[file]) {
                document.write('<script type="text/javascript" src="' +
                        path + file + '.js"></script>');
                loaded[file] = true;
            }
        }
    };
}());