"use strict";
var Confirm;

/**
 * Creates a confirm-like modal window using the Modal class.
 * 
 * @param {String} message Message for the user.
 * @param {Function} callback Optional callback function triggered when the
 *        user hits the "Cancel" or the "OK" button. If the user hits the "OK"
 *        button, it will receive true, otherwise it will receive false.
 */
Confirm = function (message, callback) {
    var modal, paragraph, form, button;
    modal = new Modal(document.title, true);
    paragraph = document.createElement('p');
    paragraph.appendChild(document.createTextNode(message));
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
            callback(false);
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
            callback(true);
        }
    }, false);
    modal.appendChild(form);
    modal.center();
};
