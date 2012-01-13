"use strict";
var Forms;

Forms = function () {
    var forms, initForm, i;
    
    this.getFormData = function (form) {
        var inputs, data, i;
        data = {};
        inputs = form.getElementsByTagName('input');
        for (i = inputs.length; i--;) {
            data[inputs[i].name] = inputs[i].type == 'checkbox' ?
                    inputs[i].checked : parseInt(inputs[i].value, 10);
        }
        inputs = form.getElementsByTagName('select');
        for (i = inputs.length; i--;) {
            data[inputs[i].name] = parseInt(inputs[i].value, 10);
        }
        return data;
    };
    
    initForm = function (form) {
        var inputs, i;
        inputs = form.getElementsByTagName('input');
        for (i = inputs.length; i--;) {
            if (inputs[i].type == 'range') {
                inputs[i].addEventListener('change', function () {
                    var span;
                    span = this.parentNode.getElementsByTagName('span')[1];
                    span.innerHTML = this.value;
                }, false);
                inputs[i].parentNode.getElementsByTagName('span')[1].
                        innerHTML = inputs[i].value;
            }
        }
    };
    
    forms = document.getElementsByTagName('form');
    for (i = forms.length; i--;) {
        initForm(forms[i]);
    }
};
