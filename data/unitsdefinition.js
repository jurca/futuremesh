var UnitsDefinition;

UnitsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: 'Harvester',
            image: 'data/images/units/harvester/?.png',
            speed: 30,
            turnSpeed: 100,
            hitpoints: 800, // how much damage can the unit take
            colorify: '#ffffff',
            colorifyDistance: 240,
            resource: 0,
            harvestSpeed: 2, // hitpoints per tick
            harvestEfficiency: 1.5, // gained resources per tick =
                                    // harvestSpeed * harvestEfficiency
            firingSpeed: 0, // rate of fire = 1000 / 50 * (1 / tick duration)
            attackPower: 0, // hitpoints damage to the target per attack
            attackRange: 0, // the range (in adjusted tile units) at which the
                            // unit may attack its target.
            race: 0,
            construction: { // total cost: 150, duration: 50 ticks
                step: [6],
                stepProgress: 40, // 25 steps (1000 is complete construction)
                stepDuration: 1   // +1 for resource request
            }
        },
        {
            type: 1,
            name: 'Tank',
            image: 'data/images/units/tank/?.png',
            speed: 50,
            turnSpeed: 300,
            hitpoints: 300, // how much damage can the unit take
            colorify: '#007524',
            colorifyDistance: 50,
            resource: null,
            harvestSpeed: 0, // hitpoints per tick
            harvestEfficiency: 0, // gained resources per tick =
                                  // harvestSpeed * harvestEfficiency
            firingSpeed: 50, // rate of fire = 1000 / 50 * (1 / tick duration)
            attackPower: 20, // hitpoints damage to the target per attack
            attackRange: 3, // the range (in adjusted tile units) at which the
                            // unit may attack its target.
            race: 0,
            construction: { // total cost: 100, duration: 40 ticks
                step: [5],
                stepProgress: 50, // 20 steps (1000 is complete construction)
                stepDuration: 1   // +1 for resource request
            }
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());
