"use strict";
var FormBuilder;

/**
 * Simple form generator utility.
 * 
 * @param {String} legend The legend of the form.
 * @param {Array} items Array of items to be placed into the form. Each item
 *        should be an object with the following properties:<ul>
 *            <li>label - label of the field</li>
 *            <li>type - input field type</li>
 *            <li>name - input field name</li>
 *            <li>value - default value of the input field</li>
 *            <li>checked - whether the input field should be in checked
 *                state</li>
 *            <li>cols - number of columns on textarea</li>
 *            <li>rows - number of rows on textarea</li>
 *        </ul>
 * @param {String} submitButton Text content of the form's submit button.
 */
FormBuilder = function (legend, items, submitButton) {
    var form, fieldset, legendNode, table, row, cell, i, input;
    form = document.createElement('form');
    fieldset = document.createElement('fieldset');
    form.appendChild(fieldset);
    legendNode = document.createElement('legend');
    legendNode.appendChild(document.createTextNode(legend));
    fieldset.appendChild(legendNode);
    
    table = document.createElement('table');
    fieldset.appendChild(table);
    
    for (i = 0; i < items.length; i++) {
        row = document.createElement('tr');
        cell = document.createElement('th');
        cell.appendChild(document.createTextNode(items[i].label));
        row.appendChild(cell);
        cell = document.createElement('td');
        input = document.createElement(items[i].type == 'textarea' ?
                'textarea' : 'input');
        input.type = items[i].type;
        input.name = items[i].name;
        input.value = items[i].value;
        input.checked = items[i].checked;
        input.cols = items[i].cols;
        input.rows = items[i].rows;
        cell.appendChild(input);
        row.appendChild(cell);
        table.appendChild(row);
    }
    
    row = document.createElement('tr');
    cell = document.createElement('td');
    cell.setAttribute('colspan', '2');
    input = document.createElement('input');
    input.type = 'submit';
    input.value = submitButton;
    cell.appendChild(input);
    row.appendChild(cell);
    table.appendChild(row);
    
    /**
     * Sets the handler of submit action, preventing the default action.
     * 
     * @param {Function} handler The handler of the submit action. This handler
     *        will receive a data object containing values of the form fields
     *        as it's properties. The property name is the same as the name of
     *        the input field.
     */
    form.setHandler = function (handler) {
        form.addEventListener('submit', function (e) {
            var data, elements, j;
            e.preventDefault();
            data = {};
            for (i = 0; i < items.length; i++) {
                elements = form.
                        querySelectorAll('[name="' + items[i].name + '"]');
                if (elements[0].type == 'radio') {
                    for (j = elements.length; j--;) {
                        if (elements[j].checked) {
                            data[items[i].name] = elements[j].value;
                        }
                    }
                } else {
                    data[items[i].name] = elements[0].value;
                }
            }
            handler(data);
        }, false);
    };
    
    return form;
};
