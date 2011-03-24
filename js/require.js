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

    /**
     * Index of JS files loaded using the require function used to avoid
     * reloading of the already loaded files.
     */
    loaded = {};

    /**
     * Loads additional JS files. This funcion should be used <strong>only
     * before</strong> the DOMContentLoaded event occurs.
     *
     * The function uses variable number of parameters, each parameter should
     * be name of the JS file to load. These files are loaded from the
     * directory where the require.js file is located.
     *
     * Example: require('tile', 'unit'); // will load tile.js and unit.js.
     */
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