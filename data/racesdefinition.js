"use strict";
var RacesDefinition;

RacesDefinition = (function () {
    var races;
    
    races = [
        new Race(0, 'RED', '#a00000'),
        new Race(1, 'GREEN', '#00a000'),
        new Race(2, 'BLUE', '#0000a0')
    ];
    
    return {
        getRace: function (id) {
            if (!races[id]) {
                throw new Error('There is no Race with ID ' + id);
            }
            return races[id];
        },
        
        getRaceCount: function () {
            return races.length;
        }
    };
}());
