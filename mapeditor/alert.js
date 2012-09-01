"use strict";
var Alert;

/**
 * Creates an alert-like modal window using the Modal class.
 * 
 * @param {String} message Message for the user.
 * @param {Function} callback Optional callback function triggered when the
 *        user hits the "OK" button.
 */
Alert = function (message, callback) {
    var modal, paragraph, form, button;
    modal = new Modal(document.title, true);
    paragraph = document.createElement('p');
    paragraph.appendChild(document.createTextNode(message));
    modal.appendChild(paragraph);
    form = document.createElement('form');
    form.className = 'center';
    button = document.createElement('input');
    button.type = 'submit';
    button.value = 'OK';
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        modal.close();
        if (callback) {
            callback();
        }
    }, false);
    form.appendChild(button);
    modal.appendChild(form);
    modal.center();
};
