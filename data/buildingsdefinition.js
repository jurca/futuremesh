var BuildingsDefinition;

BuildingsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: 'Construction Yard',
            image: 'data/images/buildings/construction-yard.png',
            imageWidth: undefined,
            imageHeight: undefined,
            width: 3,
            height: 3,
            hitpoints: 1500, // how much damage can the building take
            passable: false,
            colorify: '#ffffff',
            colorifyDistance: 440,
            prerequisities: [],
            resource: null,
            race: 0,
            isCentral: true, // central buildings produce units
            construction: { // total cost: 500, duration: 100 ticks
                step: [10],
                stepProgress: 20, // 50 steps, fully constructed when progress
                                  // is 1000
                stepDuration: 1   // number of ticks, +1 for resource request
            },
            repair: {
                hitpoints: 10,
                resources: [5]
            },
            placementValidator: null,
            powerRequirement: 0  // negative = generates power,
                                 // positive = consumes power
        },
        {
            type: 1,
            name: 'Ore',
            image: 'data/images/buildings/ore.png',
            imageWidth: undefined,
            imageHeight: undefined,
            width: 1,
            height: 1,
            hitpoints: 100, // represents the amount of resource units
            passable: true,
            colorify: '#000000',
            colorifyDistance: 0,
            prerequisities: [],
            resource: 0,
            race: null,
            isCentral: false, // central buildings produce units
            construction: null, // non-constructable building
            repair: null,
            placementValidator: null,
            powerRequirement: 0  // negative = generates power,
                                 // positive = consumes power
        },
        {
            type: 2,
            name: 'Power plant',
            image: 'data/images/buildings/power-plant.png',
            imageWidth: undefined,
            imageHeight: undefined,
            width: 2,
            height: 2,
            hitpoints: 500, // how much damage can the building take
            passable: false,
            colorify: '#ffffff',
            colorifyDistance: 440,
            prerequisities: [0],
            resource: null,
            race: 0,
            isCentral: false, // central buildings produce units
            construction: { // total cost: 250, duration: 100 ticks
                step: [10],
                stepProgress: 40, // 25 steps, fully constructed when progress
                                  // is 1000
                stepDuration: 1   // number of ticks, +1 for resource request
            },
            repair: {
                hitpoints: 10,
                resources: [3]
            },
            placementValidator: function (tilesCoords, map) {
                var i, tileCoord, tiles, tile;
                tiles = map.getTiles();
                for (i = tilesCoords.length; i--;) {
                    tileCoord = tilesCoords[i];
                    tile = tiles[tileCoord.y][tileCoord.x];
                    if (tile.type === 3) {
                        return true;
                    }
                }
                return false;
            },
            powerRequirement: -100  // negative = generates power,
                                    // positive = consumes power
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());