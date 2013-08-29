"use strict";
var JsBuilder;

JsBuilder = function () {
    var $, ajax, console, files, loadDirs, loadDir, addFile, loadFiles,
            fileContents, loadFile, buildFile;

    $ = function (selector) {
        return document.querySelectorAll(selector);
    };

    ajax = new Ajax();
    console = new Console();

    (new Form()).setHandler(function (data) {
        var i;
        console.clear();
        files = [];
        fileContents = [];
        for (i = 0; i < data.files.length; i++) {
            addFile(data.files[i], data.exclude);
            data.exclude.push(data.files[i]);
        }
        loadDirs(data);
    });

    loadDirs = function (data) {
        console.log('Loading directories contents...');
        loadDir(data, 0);
    };

    loadDir = function (data, i) {
        var dir;
        if (i >= data.dirs.length) {
            console.log('Dirs content loaded');
            console.log('Files to be loaded: ' + files.join(', '));
            loadFiles(data);
            return;
        }
        dir = data.dirs[i];
        console.log('Loading contents of directory ' + dir);
        dir = encodeURIComponent(dir);
        ajax.get('../cgi-bin/listdir.php?dir=' + dir, function (response) {
            var files, j;
            files = JSON.parse(response);
            dir = decodeURIComponent(dir);
            for (j = files.length; j--;) {
                addFile(dir + '/' + files[j], data.exclude);
            }
            loadDir(data, i + 1);
        }, function () {
            console.log('Cannot load direcotory: ' + dir);
        });
    };

    addFile = function (file, exclude) {
        var i;
        if (!file.match(/^.*[.]js$/i)) {
            return;
        }
        for (i = exclude.length; i--;) {
            if (exclude[i] === file) {
                return;
            }
        }
        files.push(file);
    };

    loadFiles = function (data) {
        console.log('Loading file contents...');
        loadFile(data, 0);
    };

    loadFile = function (data, i) {
        var file, nocache;
        if (i >= files.length) {
            console.log('Files loaded');
            buildFile(data);
            return;
        }
        file = files[i];
        console.log('Loading file ' + file);
        nocache = (new Date()).getTime();
        ajax.get('../' + file + '?nocache=' + nocache, function (response) {
            fileContents.push(response);
            loadFile(data, i + 1);
        }, function () {
            console.log('Cannot load file ' + file);
        });
    };

    buildFile = function (data) {
        var content, size;
        console.log('Building file...');
        content = fileContents.join('\n');
        if (data.useClosure) {
            content = '(function () {\n' + content + '\n}());';
        }
        if (data.useJSMin) {
            size = content.length;
            console.log('Applying JS Min...');
            content = jsmin('', content, data.jsMinLevel);
            console.log('Compression results:');
            console.log('\tOriginal size: ' + size);
            console.log('\tCompressed size: ' + content.length);
            console.log('\tCompression ratio: ' +
                    (Math.round(content.length / size * 10000) / 100) + '%');
        }
        $('#output')[0].value = content;
        console.log('Done');
    };
};

addEventListener('DOMContentLoaded', function () {
    new JsBuilder();
}, false);
