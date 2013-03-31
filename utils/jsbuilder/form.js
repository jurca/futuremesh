"use strict";
var Form;

Form = function () {
    var $, instance;

    instance = this;

    $ = function (selector) {
        return document.querySelectorAll(selector);
    };

    $('#addDir')[0].addEventListener('click', function (e) {
        var par, input;
        e.preventDefault();
        par = document.createElement('p');
        input = document.createElement('input');
        input.type = 'text';
        input.name = 'dir';
        input.size = 40;
        par.appendChild(input);
        $('#addDir')[0].parentNode.parentNode.appendChild(par);
    }, false);

    $('#addExclude')[0].addEventListener('click', function (e) {
        var par, input;
        e.preventDefault();
        par = document.createElement('p');
        input = document.createElement('input');
        input.type = 'text';
        input.name = 'exclude';
        par.appendChild(input);
        $('#addExclude')[0].parentNode.parentNode.appendChild(par);
    }, false);

    this.getData = function () {
        var data, inputs, i;
        data = {
            dirs: [],
            exclude: []
        };
        inputs = $('input[name="dir"]');
        for (i = inputs.length; i--;) {
            inputs[i].value = this.trim(inputs[i].value);
            inputs[i].value && (data.dirs.push(inputs[i].value));
        }
        inputs = $('input[name="exclude"]');
        for (i = inputs.length; i--;) {
            inputs[i].value = this.trim(inputs[i].value);
            inputs[i].value && (data.exclude.push(inputs[i].value));
        }
        data.useClosure = $('input[name="useClosure"]')[0].checked;
        data.useJSMin = $('input[name="useJSMin"]')[0].checked;
        data.jsMinLevel = $('select[name="level"]')[0].value;
        return data;
    };

    this.trim = function (string) {
        return string.replace(/^\s*(\S*)\s*$/, '$1');
    };

    this.setHandler = function (handler) {
        $('form')[0].addEventListener('submit', function (e) {
            e.preventDefault();
            handler(instance.getData());
        }, false);
    };
};
