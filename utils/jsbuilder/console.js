"use strict";
var Console;

Console = function () {
    var console;
    
    console = document.querySelectorAll('#console')[0];
    
    this.log = function (message) {
        console.innerHTML += message + '\n';
        console.scrollTop = console.scrollHeight;
    };
    
    this.clear = function () {
        console.innerHTML = '';
        console.scrollTop = 0;
    };
};
