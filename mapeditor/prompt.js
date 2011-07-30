"use strict";
require('mapeditor.modal');
var Prompt;

/**
 * Displays a prompt-like modal window using the Modal class.
 * 
 * @param {String} message Message Message for the user.
 * @param {String} defaultValue Optional default return value, will be
 *        pre-filled in the input field.
 * @param {Function} callback Optional callback function that will recieve the
 *        user-input if "OK" is clicked and null if "Cancel" is clicked.
 */
Prompt = function (message, defaultValue, callback) {
    var modal, paragraph, input, form, button;
    modal = new Modal(document.title, true);
    paragraph = document.createElement('p');
    paragraph.appendChild(document.createTextNode(message));
    modal.appendChild(paragraph);
    paragraph = document.createElement('p');
    input = document.createElement('input');
    input.type = 'text';
    if (defaultValue !== undefined) {
        input.value = defaultValue;
    }
    paragraph.appendChild(input);
    modal.appendChild(paragraph);
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
        e.preventDefault();
        modal.close();
        if (callback) {
            callback(input.value);
        }
    }, false);
    modal.appendChild(form);
    modal.center();
};
