"use strict";
require('mapeditor.modal');
var FileChooser;

/**
 * Displays a simple file chooser-like modal window.
 * 
 * @param {String} location The location displayed in the textfield on the top
 *        of the dialog modal window - uneditable.
 * @param {Array} files Array of string containing file names for choose.
 *        Directories are not supported.
 * @param {Boolean} single When set to true, it will be possible to select only
 *        one file. The callback function will receive it's name as string, not
 *        as a array.
 * @param {Function} callback An optional callback function that will receive a
 *        null or array of selected files. If single is set to true, the
 *        function will receive the file name as a string instead of an array
 *        of length 1.
 */
FileChooser = function (location, files, single, callback) {
    var modal, select, input, button, form, lastSelected;
    modal = new Modal('File chooser', true);
    files = files || [];
    lastSelected = null;
    
    this.setFiles = function (newFiles) {
        var option, i;
        files = newFiles;
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        for (i = 0; i < files.length; i++) {
            option = document.createElement('option');
            option.value = files[i];
            option.appendChild(document.createTextNode(files[i]));
            select.appendChild(option);
        }
    };
    
    form = document.createElement('form');
    form.className = 'filechooser';
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    }, false);
    input = document.createElement('input');
    input.type = 'text';
    input.value = location;
    input.disabled = true;
    form.appendChild(input);
    modal.appendChild(form);
    
    form = document.createElement('form');
    form.className = 'filechooser';
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    }, false);
    select = document.createElement('select');
    select.multiple = true;
    select.size = 7;
    this.setFiles(files);
    select.addEventListener('change', function (e) {
        var option, files;
        console.log(select.value);
        files = [];
        if (single) {
            option = select.firstChild;
            while (option) {
                if (option.selected && (option.value == lastSelected)) {
                    option.selected = false;
                }
                if (option.selected) {
                    lastSelected = option.value;
                }
                option = option.nextSibling;
            }
            option = select.firstChild;
            while (option) {
                option.selected = option.value == lastSelected;
                option = option.nextSibling;
            }
        }
        option = select.firstChild;
        while (option) {
            if (option.selected) {
                files.push(option.value);
            }
            option = option.nextSibling;
        }
        input.value = files.join(', ');
    }, false);
    form.appendChild(select);
    modal.appendChild(form);
    
    form = document.createElement('form');
    form.className = 'filechooser';
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    }, false);
    form.appendChild(document.createTextNode('Filename: '));
    input = document.createElement('input');
    input.className = 'filename';
    input.type = 'text';
    form.appendChild(input);
    modal.appendChild(form);
    
    form = document.createElement('form');
    form.className = 'center';
    button = document.createElement('input');
    button.type = 'submit';
    button.value = 'Cancel';
    button.addEventListener('click', function (e) {
        e.preventDefault();
        modal.close();
        if (callback) {
            callback(null);
        }
    }, false);
    form.appendChild(button);
    button = document.createElement('input');
    button.type = 'submit';
    button.value = 'OK';
    form.appendChild(button);
    form.addEventListener('submit', function (e) {
        var option, files;
        e.preventDefault();
        modal.close();
        if (callback) {
            if (single) {
                option = select.firstChild;
                while (option) {
                    if (option.selected) {
                        callback(option.value);
                        return;
                    }
                    option = option.nextSibling;
                }
                callback(null);
                return;
            }
            files = [];
            option = select.firstChild;
            while (option) {
                if (option.selected) {
                    files.push(option.value);
                }
                option = option.nextSibling;
            }
            callback(files);
        }
    }, false);
    modal.appendChild(form);
    
    modal.center();
};
