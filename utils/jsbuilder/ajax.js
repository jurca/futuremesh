"use strict";
var Ajax;

Ajax = function () {
    this.get = function(url, success, failure) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    success(xhr.responseText, xhr);
                } else {
                    failure(xhr.responseText, xhr);
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    };
};
