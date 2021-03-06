var UnitsDefinition;

// Note on adjusted distance:
// targetDistance = Math.sqrt(Math.pow(distanceY, 2) +
//                  Math.pow(distanceX, 2) * 4)
// This formula ensures that the distance will appear euclidean on the screen.
// See: UnitAI and BuildingControl game plugins.

UnitsDefinition = (function () {
    var types;

    types = [
        {
            type: 0,
            name: 'Harvester',
            image: 'data/images/units/harvester/?.png',
            speed: 500,
            turnSpeed: 500,
            hitpoints: 800, // how much damage can the unit take
            colorify: '#ffffff',
            colorifyDistance: 240,
            resource: 0,
            harvestSpeed: 50, // hitpoints per tick
            harvestEfficiency: 1.5, // gained resources per tick =
                                    // harvestSpeed * harvestEfficiency
            firingSpeed: 0, // rate of fire = 1000 / 50 * (1 / tick duration)
            attackPower: 0, // hitpoints damage to the target per attack
            attackRange: 0, // the range (in adjusted tile units) at which the
                            // unit may attack its target.
            projectileType: null,
            projectileDuration: null, // how many ticks for the projectile to
                                      // reach its target
            visionRange: 12, // the distance at which the units is able to spot
                             // other units or buildings
            projectileOffsets: [ // start offsets for each of the directions
                [{ // north
                    x: 0.5,
                    y: 0.5
                }],
                [{ // north-east
                    x: 0.5,
                    y: 0.5
                }],
                [{ // east
                    x: 0.5,
                    y: 0.5
                }],
                [{ // south-east
                    x: 0.5,
                    y: 0.5
                }],
                [{ // south
                    x: 0.5,
                    y: 0.5
                }],
                [{ // south-west
                    x: 0.5,
                    y: 0.5
                }],
                [{ // west
                    x: 0.5,
                    y: 0.5
                }],
                [{ // north-west
                    x: 0.5,
                    y: 0.5
                }]
            ],
            race: 0,
            construction: { // total cost: 150, duration: 50 ticks
                step: [6],
                stepProgress: 40, // 25 steps (1000 is complete construction)
                stepDuration: 1   // +1 for resource request
            },
            prerequisities: [],
            powerRequirement: 20  // negative = generates power,
                                  // positive = consumes power
        },
        {
            type: 1,
            name: 'Tank',
            image: 'data/images/units/tank/?.png',
            speed: 500,
            turnSpeed: 500,
            hitpoints: 300, // how much damage can the unit take
            colorify: '#007524',
            colorifyDistance: 50,
            resource: null,
            harvestSpeed: 0, // hitpoints per tick
            harvestEfficiency: 0, // gained resources per tick =
                                  // harvestSpeed * harvestEfficiency
            firingSpeed: 50, // rate of fire = 1000 / 50 * (1 / tick duration)
            attackPower: 20, // hitpoints damage to the target per attack
            attackRange: 8, // the range (in adjusted tile units) at which the
                            // unit may attack its target.
            projectileType: 1,
            projectileDuration: 5, // how many ticks for the projectile to
                                   // reach its target
            visionRange: 12, // the distance at which the units is able to spot
                             // other units or buildings
            projectileOffsets: [ // start offsets for each of the directions
                [{ // north
                    x: 0.5,
                    y: 0.3
                }],
                [{ // north-east
                    x: 0.7,
                    y: 0.4
                }],
                [{ // east
                    x: 0.8,
                    y: 0.6
                }],
                [{ // south-east
                    x: 0.7,
                    y: 0.8
                }],
                [{ // south
                    x: 0.5,
                    y: 0.85
                }],
                [{ // south-west
                    x: 0.3,
                    y: 0.8
                }],
                [{ // west
                    x: 0.2,
                    y: 0.6
                }],
                [{ // north-west
                    x: 0.3,
                    y: 0.4
                }]
            ],
            race: 0,
            construction: { // total cost: 100, duration: 20 ticks
                step: [10],
                stepProgress: 100, // 10 steps (1000 is complete construction)
                stepDuration: 1   // +1 for resource request
            },
            prerequisities: [],
            powerRequirement: 15  // negative = generates power,
                                  // positive = consumes power
        },
        {
            type: 2,
            name: 'Heavy Tank',
            image: 'data/images/units/heavy-tank/?.png',
            speed: 500,
            turnSpeed: 500,
            hitpoints: 300, // how much damage can the unit take
            colorify: '#007524',
            colorifyDistance: 50,
            resource: null,
            harvestSpeed: 0, // hitpoints per tick
            harvestEfficiency: 0, // gained resources per tick =
                                  // harvestSpeed * harvestEfficiency
            firingSpeed: 40, // rate of fire = 1000 / 50 * (1 / tick duration)
            attackPower: 22, // hitpoints damage to the target per attack
            attackRange: 8, // the range (in adjusted tile units) at which the
                            // unit may attack its target.
            projectileType: 1,
            projectileDuration: 6, // how many ticks for the projectile to
                                   // reach its target
            visionRange: 12, // the distance at which the units is able to spot
                             // other units or buildings
            projectileOffsets: [ // start offsets for each of the directions
                [ // north
                    { x: 0.4, y: 0.3 },
                    { x: 0.6, y: 0.3 }
                ],
                [ // north-east
                    { x: 0.65, y: 0.35 },
                    { x: 0.75, y: 0.45 }
                ],
                [ // east
                    { x: 0.8, y: 0.5 },
                    { x: 0.8, y: 0.7 }
                ],
                [ // south-east
                    { x: 0.75, y: 0.75 },
                    { x: 0.65, y: 0.85 }
                ],
                [ // south
                    { x: 0.4, y: 0.85 },
                    { x: 0.6, y: 0.85 }
                ],
                [ // south-west
                    { x: 0.25, y: 0.75 },
                    { x: 0.35, y: 0.85 }
                ],
                [ // west
                    { x: 0.2, y: 0.5 },
                    { x: 0.2, y: 0.7 }
                ],
                [ // north-west
                    { x: 0.25, y: 0.45 },
                    { x: 0.35, y: 0.35 }
                ]
            ],
            race: 0,
            construction: { // total cost: 150, duration: 30 ticks
                step: [15],
                stepProgress: 100, // 10 steps (1000 is complete construction)
                stepDuration: 2   // +1 for resource request
            },
            prerequisities: [2],
            powerRequirement: 25  // negative = generates power,
                                  // positive = consumes power
        }
    ];

    return {
        getType: function (type) {
            return types[type];
        }
    };
}());
