"use strict";
var Ajax;

/**
 * Simple AJAX utility that was easier to write than downloading and unpacking
 * a random AJAX library.
 */
Ajax = {
    /**
     * Performs a GET request to the specified URL.
     * 
     * @param {String} url URL to load.
     * @param {Function} success Callback function to execute in the case of
     *        success. The callback function will receive single parameter -
     *        the response body.
     * @param {Function} failure Callback function to execute in the case of
     *        failure. The callback function will receive single parameter -
     *        the response body.
     */
    get: function (url, success, failure) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    success && success(xhr.responseText);
                } else {
                    failure && failure(xhr.responseText);
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    }
};
