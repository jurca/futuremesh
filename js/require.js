"use strict";
var require;

(function () {
    var path, scripts, i, script, loaded;

    scripts = document.getElementsByTagName('script');
    path = 'js/';
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
     * 
     * The function also supports "java package-like" naming of the files,
     * while the js directory (also location of the file require.js) is
     * considered to be the default package.
     * 
     * Example of usage of this notation: require('settings', 'data.settings');
     * This example will load files js/settings.js and data/settings.js.
     */
    require = function () {
        var i, file, length;
        length = arguments.length;
        for (i = 0; i < length; i++) {
            file = arguments[i];
            if (file.indexOf('.') > 1) {
                file = '../' + file.split('.').join('/');
            }
            if (!loaded[file]) {
                document.write('<script type="text/javascript" src="' +
                        path + file + '.js"></script>');
                loaded[file] = true;
            }
        }
    };
}());