var PlayersDefinition;

PlayersDefinition = (function () {
    var types;
    
    types = [
        {
            type: 0,
            color: '#cfcfcf',
            race: 0
        },
        {
            type: 1,
            color: '#ff3300',
            race: 0
        },
        {
            type: 2,
            color: '#2de000',
            race: 1
        },
        {
            type: 3,
            color: '#3300ff',
            race: 2
        },
        {
            type: 4,
            color: '#b300ff',
            race: 0
        },
        {
            type: 5,
            color: '#ffff00',
            race: 1
        },
        {
            type: 6,
            color: '#00fff7',
            race: 2
        },
        {
            type: 7,
            color: '#8c6c00',
            race: 1
        },
        {
            type: 8,
            color: '#000000',
            race: 2
        }
    ];
    
    return {
        getType: function (type) {
            return types[type];
        }
    };
}());
