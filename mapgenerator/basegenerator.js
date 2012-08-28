"use strict";
var BaseGenerator;
require('map');

/**
 * Utility for generating bases on the map. That is currently a main building
 * and 2 harvesters.
 */
BaseGenerator = function () {
    this.generateBases = function (map, data, positions) {
        var i, type, tiles, width, height, distX, distY, dist, degree,
                building, posX, posY, unitType, unit;
        for (type = 0; BuildingsDefinition.getType(type); type++) {
            type = BuildingsDefinition.getType(type);
            if ((type.prerequisities.length == 0) &&
                    (type.resource === null)) {
                break;
            }
        }
        if (type.type === undefined) {
            return;
        }
        
        for (unitType = 0; UnitsDefinition.getType(unitType); unitType++) {
            if (UnitsDefinition.getType(unitType).resource !== null) {
                break;
            }
        }
        if (!UnitsDefinition.getType(unitType)) {
            return;
        }
        
        type = type.type; // TODO
        tiles = map.getTiles();
        width = tiles[0].length;
        height = tiles.length;
        
        for (i = positions.length; i--;) {
            // compute the degree of the player's base towards the map's center
            distX = positions[i].x - Math.floor(width / 2);
            distY = positions[i].y - Math.floor(height / 2);
            dist = Math.sqrt(distX * distX + distY * distY);
            degree = -Math.acos(distX / dist); // WTF?!
            if (distY > 0) { // 3. and 4. quadrant
                degree = 2 * Math.PI - degree;
            }
            // find nice position for the building
            posX = positions[i].x + Math.round(Math.cos(degree) *
                        data.baseAreaRadius / 2);
            posY = positions[i].y + Math.round(Math.sin(degree) *
                        data.baseAreaRadius / 2);
            building = new Building(posX, posY, type, i);
            map.updateBuilding(building);
            
            // place the harvesters
            unit = new Unit(positions[i].x, positions[i].y, 0, unitType, i);
            map.updateUnit(unit);
            unit = new Unit(positions[i].x + 2, positions[i].y + 2, 0,
                    unitType, i);
            map.updateUnit(unit);
        }
    };
};
