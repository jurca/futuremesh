"use strict";
var Map;

/**
 * Map container and utility. Contains raw map data and utility methods for
 * manipulating the map and extracting useful information.
 */
Map = function () {
    var tiles, buildings, buildingsList, units, unitsList, navigationIndex,
            projectiles, name;

    /**
     * Map's name.
     */
    name = "unnamed map";

    /**
     * Two-dimensional array of tiles on the map. The first index is vertical
     * axis (y), the second index is horizontal index (x). The name map is
     * used instead of tiles only for legacy reasons and should be changed one
     * day in the future.
     */
    tiles = [];

    /**
     * Two-dimensional array matching the tiles of the map. Each item is a null
     * or a reference to the building occupying the tile. If a building is
     * uccupying several tiles at once, all occupied tiles hold reference to
     * the building.
     * The structure of the index is: [verical axis (y)][horizontal axis (x)]
     */
    buildings = [];

    /**
     * List of all buildings instances present on the map.
     */
    buildingsList = [];

    /**
     * Tow-dimensional array matching the tiles of the map. Each item is a null
     * or a reference to the unit occupying the tile. The structure of the
     * index is: [vertical axis(y)][horizontal axis (x)]
     */
    units = [];

    /**
     * List of all units instances present on the map.
     */
    unitsList = [];

    /**
     * Two-dimensional array matching the tiles of the map. Each item is a
     * boolean value representing whether the tile is occupied or empty. The
     * tile can be occupied by either a unit or a building through which units
     * cannot pass.
     */
    navigationIndex = [];

    /**
     * List of all projectiles currently present on the map. Each element is an
     * instance of the <code>Projectile</code> class.
     */
    projectiles = [];

    /**
     * Sets the map's name.
     * 
     * @param {string} newName The new name of the map.
     */
    this.setName = function (newName) {
        name = newName;
    };
    
    /**
     * Returns the map's name.
     * 
     * @returns {string} Map's name.
     */
    this.getName = function () {
        return name;
    };

    /**
     * Updates the building's status on the map (e.g. adding to the map or
     * editing it).
     *
     * @param {Building} building The building that has been updated on the map.
     */
    this.updateBuilding = function (building) {
        var positions, position, i;
        buildingsList.push(building);
        positions = getBuildingPositions(building);
        for (i = positions.length; i--;) {
            position = positions[i];
            buildings[position.y][position.x] = building;
            (!building.passable) &&
                    (navigationIndex[position.y][position.x] = false);
        }
    };

    /**
     * Removes the building from the map.
     *
     * @param {Building} building The building to remove from the map.
     */
    this.removeBuilding = function (building) {
        var positions, position, i;
        for (i = buildingsList.length; i--;) {
            if (buildingsList[i].id === building.id) {
                buildingsList.splice(i, 1);
                break;
            }
        }
        positions = getBuildingPositions(building);
        for (i = positions.length; i--;) {
            position = positions[i];
            buildings[position.y][position.x] = null;
            (!building.passable) &&
                    (navigationIndex[position.y][position.x] = true);
        }
    };

    /**
     * Adds a new projectile to the map.
     *
     * @param {Projectile} projectile
     */
    this.addProjectile = function (projectile) {
        projectiles.push(projectile);
    };

    /**
     * Returns the list of all projectiles currently present on the map. Each
     * element of the list is a Projectile instance.
     *
     * @returns {Array} The list of all projectiles currently present on the
     *          map.
     */
    this.getProjectiles = function () {
        return projectiles;
    };

    /**
     * Removes the projectile at the specified index from the map.
     *
     * @param {Number} index The index of the projectile in the projectile
     *        list.
     * @see getProjectiles()
     */
    this.removeProjectile = function (index) {
        projectiles.splice(index, 1);
    };

    /**
     * Updates the unit's status on the map (e.g. adding to the map).
     *
     * @param {Unit} unit The unit that has been updated on the map.
     */
    this.updateUnit = function (unit) {
        var i;
        switch (unit.action) {
            case 0: // created
                unitsList.push(unit);
                units[unit.y][unit.x] = unit;
                navigationIndex[unit.y][unit.x] = false;
                break;
            case 1: // destroyed
                for (i = unitsList.length; i--;) {
                    if (unitsList[i].id === unit.id) {
                        unitsList.splice(i, 1);
                        break;
                    }
                }
                if (units[unit.y][unit.x] &&
                        (units[unit.y][unit.x].id === unit.id)) {
                    units[unit.y][unit.x] = null;
                    navigationIndex[unit.y][unit.x] = true;
                }
                break;
            case 2: // moved
                if (units[unit.lastY][unit.lastX] &&
                        (units[unit.lastY][unit.lastX].id === unit.id)) {
                    units[unit.lastY][unit.lastX] = null;
                    navigationIndex[unit.lastY][unit.lastX] = true;
                }
                units[unit.y][unit.x] = unit;
                navigationIndex[unit.y][unit.x] = false;
                break;
        }
    };

    /**
     * Sets raw map data.
     *
     * @param {Array} newMap The two-dimensional array of map tiles
     *        representing the map.
     * @deprecated Use setTiles({Array} newTiles) instead.
     */
    this.setMap = function (newMap) {
        tiles = newMap;
        createIndexes();
    };

    /**
     * Returns the raw map data in a form of a two-dimensional array of map
     * tiles.
     *
     * @return {Array} Raw map data.
     * @deprecated Use getTiles() instead.
     */
    this.getMap = function () {
        return tiles;
    };

    /**
     * Returns the object (building/unit) at the specified coordinates. If the
     * specified tile contains both building and unit, the method returns the
     * unit.
     *
     * @param {Number} x The x-coordinate.
     * @param {Number} y The y-coordinate.
     */
    this.getObjectAt = function (x, y) {
        if (units[y] && units[y][x]) {
            return units[y][x];
        }
        return buildings[y] && buildings[y][x];
    };

    /**
     * Sets tiles of the map.
     *
     * @param {Array} newTiles Two-dimensional array of map tiles objects.
     */
    this.setTiles = function (newTiles) {
        tiles = newTiles;
        createIndexes();
    };

    /**
     * Retuns the tiles of the map as a two-dimensional array of tile objects.
     *
     * @return {Array} Map's tiles.
     */
    this.getTiles = function () {
        return tiles;
    };

    /**
     * Returns list of all buildings the map contains.
     *
     * @return {Array} List of all buildings on the map.
     */
    this.getBuildings = function () {
        return buildingsList;
    };

    /**
     * Returns list of all units the map contains.
     *
     * @return {Array} List of all units on the map.
     */
    this.getUnits = function () {
        return unitsList;
    };

    /**
     * Returns the tile index referencing to the buildings occuyping the tiles.
     *
     * @return {Array} Two-dimensional array matching the tiles containing
     *         references to buildings occupying them.
     */
    this.getBuildingsIndex = function () {
        return buildings;
    };

    /**
     * Returns the tile index about which tiles are accessible to units and
     * which are not. This index is represented as a matrix, thus the first
     * array coordinate represents the Y axis and the second array coordinate
     * represents the X axis.
     *
     * @return {Array} Two-dimensional array matching the tiles containing
     *         information whether the tile is accessible to units or not.
     */
    this.getNavigationIndex = function () {
        return navigationIndex;
    };

    /**
     * Returns the chosen part of the raw map data. Originaly meant for the
     * DOM-based renderer of the main view. Currently has no known usage.
     *
     * @param {Number} x The X offset of the part to return
     * @param {Number} y The Y offset of the part to return
     * @param {Number} width The width of the part of the map data to return
     * @param {Number} height The height of the part of the map data to return
     * @return {Array} The two-dimensional array of map tiles extracted from
     *         the map.
     */
    this.getView = function (x, y, width, height) {
        var view, i;
        view = tiles.slice(y, y + height);
        width += x;
        for (i = height; i--;) {
            view[i] = view[i].slice(x, width);
        }
        return view;
    };

    /**
     * Generates a completely empty map consisting of only type 0 tiles.
     *
     * @param {Number} width The width of the required map
     * @param {Number} height The height of the required map
     */
    this.emptyMap = function (width, height) {
        var i, j, row;
        tiles = [];
        for (i = height; i--;) {
            row = [];
            for (j = width; j--;) {
                row.push(new Tile(0));
            }
            tiles.push(row);
        }
        createIndexes();
    };

    /**
     * Generates a completely random map - completely random without any mean
     * or semantic or usefulness. Useful for simple testing.
     *
     * @param {Number} width The width of the required random map
     * @param {Number} height The height of the required random map
     */
    this.randomMap = function (width, height) {
        var i, j, row, tile;
        tiles = [];
        for (i = height; i--;) {
            row = [];
            for (j = width; j--;) {
                tile = new Tile(Math.floor(Math.random() * 3));
                tile.lightSfx = !Math.floor(Math.random() * 20) ?
                        Math.floor(Math.random() * 5) : 0;
                row.push(tile);
            }
            tiles.push(row);
        }
        createIndexes();
    };

    /**
     * Exports the information about the map in a form of a JSON-serializable
     * object so that the map could be reconstructed from this data later.
     *
     * @return {Object} object representing the information about the map
     *         required to restore it to it's current state. This object is
     *         JSON-serializable.
     */
    this.exportData = function () {
        var i, tilesData, mapRow, buildingData, unitsData, projectileData,
                width, height, x, y;
        tilesData = [];
        width = tiles[0].length;
        height = tiles.length;
        for (y = 0; y < height; y++) {
            mapRow = tiles[y];
            for (x = 0; x < width; x++) {
                tilesData.push(mapRow[x].exportData());
            }
        }
        buildingData = [];
        for (i = buildingsList.length; i--;) {
            buildingData.unshift(buildingsList[i].exportData());
        }
        unitsData = [];
        for (i = unitsList.length; i--;) {
            unitsData.unshift(unitsList[i].exportData());
        }
        projectileData = [];
        for (i = projectiles.length; i--;) {
            projectileData.unshift(projectiles[i].exportData());
        }
        return {
            version: 0.9,
            name: name,
            width: width,
            height: height,
            tiles: tilesData,
            buildings: buildingData,
            units: unitsData,
            projectiles: projectiles
        };
    };
    
    /**
     * Returns a compact serialized JSON-compatible representation of this
     * map. The returned array contains unsigned 16-bit integers and array
     * containg unsigned 16-bit integers (recursively).
     * 
     * @return {Array}
     */
    this.toPackedJson = function () {
        var width, height, encodedName, i, tilesData, tilesRow, x, y;
        encodedName = [];
        for (i = 0; i < name.length; i++) {
            encodedName.push(name.charCodeAt(i));
        }
        width = tiles[0].length;
        height = tiles.length;
        tilesData = [];
        for (y = 0; y < height; y++) {
            tilesRow = tiles[y];
            for (x = 0; x < width; x++) {
                tilesData.push(tilesRow[x].toPackedJson());
            }
        }

        return [
            90,
            encodedName,
            width,
            height,
            tilesData
        ].concat(this.createSavePoint().slice(1));
    };

    /**
     * Creates a save point capturing the current state of the dynamic
     * properties (e.g. buildings, units, ...) of this map.
     *
     * @returns {(number|Array)[]} A save point capturing the current state of
     *          the dynamic properties of this map.
     */
    this.createSavePoint = function () {
        var i, buildingsData, unitsData, projectilesData;
        buildingsData = [];
        for (i = buildingsList.length; i--;) {
            buildingsData.unshift(buildingsList[i].toPackedJson());
        }
        unitsData = [];
        for (i = unitsList.length; i--;) {
            unitsData.unshift(unitsList[i].toPackedJson());
        }
        projectilesData = [];
        for (i = projectiles.length; i--;) {
            projectilesData.unshift(projectiles[i].toPackedJson());
        }
        return [
            90,
            buildingsData,
            unitsData,
            projectilesData
        ];
    };

    /**
     * Creates map from provided data. The data should be a result of the
     * exportData method.
     *
     * @param {Object} data The data from the exportData method.
     */
    this.importData = function (data) {
        var i, x, y, mapRow, unit, action, projectile, width, height;
        if (data.version < 0.9) {
            throw new Error("Cannot import map of version older than 0.9");
        }
        if (data.version > 0.9) {
            throw new Error("Cannot import map of version greater than 0.9");
        }
        name = data.name;
        width = data.width;
        height = data.height;
        tiles = [];
        for (y = 0; y < height; y++) {
            mapRow = [];
            for (x = 0; x < width; x++) {
                mapRow.push(Tile.importData(data.tiles[y * width + x]));
            }
            tiles.push(mapRow);
        }
        buildingsList = [];
        createIndexes();
        for (i = data.buildings.length; i--;) {
            this.updateBuilding(Building.importData(data.buildings[i]));
        }
        unitsList = [];
        for (i = data.units.length; i--;) {
            unit = Unit.importData(data.units[i], this);
            action = unit.action;
            unit.action = 0;
            this.updateUnit(unit);
            unit.action = action;
        }
        for (i = data.units.length; i--;) {
            Unit.finishImport(unitsList[i], data.units[i].target, this);
        }
        projectiles = [];
        for (i = data.projectiles.length; i--;) {
            projectile = Projectile.importData(data.projectiles[i], this);
            this.addProjectile(projectile);
        }
    };

    /**
     * Loads the state of the dynamic properties of this map from the provided
     * save point.
     *
     * @param {(number|Array)[]} savePoint Save point to load.
     */
    this.loadSavePoint = function (savePoint) {
        var buildingsData, unitsData, projectilesData, i, offset, target;
        if (savePoint[0] < 90) {
            throw new Error("Cannot load save point of format older than 0.9");
        }
        if (savePoint[0] > 90) {
            throw new Error("Cannot load save point of format newer than 0.9");
        }
        this.getBuildings().forEach(function (building) {
            this.removeBuilding(building);
        }, this);
        this.getUnits().forEach(function (unit) {
            unit.action = 1; // destroyed
            this.updateUnit(unit);
        }, this);
        this.getProjectiles().forEach(function (projectile, index) {
            this.removeProjectile(index);
        }, this);
        createIndexes(); // reset the units, buildings and navigation indexes
        buildingsData = savePoint[1];
        for (i = 0; i < buildingsData.length; i++) {
            this.updateBuilding(Building.fromPackedJson(buildingsData[i]));
        }
        unitsData = savePoint[2];
        for (i = 0; i < unitsData.length; i++) {
            this.updateUnit(Unit.fromPackedJson(unitsData[i], this));
        }
        for (i = unitsData.length; i--;) {
            if (unitsData[i][13] > 1) {
                offset = 14;
                if (unitsData[i][13] % 2) {
                    offset += 2;
                }
                target = unitsData[i].slice(offset, offset + 2);
                Unit.finishImport(units[i], target, this);
            }
        }
        projectilesData = savePoint[3];
        for (i = 0; i < projectilesData.length; i++) {
            this.addProjectile(
                Projectile.fromPackedJson(projectilesData[i], this));
        }
    };

    /**
     * Returns a list of coordinates of all tiles occupied by the specified
     * building. Each coordinate is specified as an object with the following
     * fieds:
     *
     * <ul>
     *     <li><code>x</code> - the X coordinate.</li>
     *     <li><code>y</code> - the Y coordinate.</li>
     * </ul>
     *
     * @param {Building} building The building.
     * @returns {Array}
     */
    this.getTilesOccupiedByBuilding = function (building) {
        return getBuildingPositions(building);
    };

    /**
     * Returns a list of coordinates of all tiles occupied by the specified
     * building. Each coordinate is specified as an object with the following
     * fieds:
     *
     * <ul>
     *     <li><code>x</code> - the X coordinate.</li>
     *     <li><code>y</code> - the Y coordinate.</li>
     * </ul>
     *
     * @param {Building} building The building.
     * @returns {Array}
     */
    function getBuildingPositions(building) {
        var positions, startX, startY, i, j, x, y;
        positions = [];
        startX = building.x + Math.floor((building.height - 1) / 2);
        startY = building.y;
        for (j = 0; j < building.height; j++) {
            x = startX - Math.ceil((j - startY % 2) / 2);
            y = startY + j;
            for (i = 0; i < building.width; i++) {
                positions.push({
                    x: x,
                    y: y
                });
                if (y % 2) {
                    x++;
                    y++;
                } else {
                    y++;
                }
            }
        }
        return positions;
    }

    /**
     * Creates a generic 2D index array filled with nulls. The dimensions of
     * the created array match the dimensions of the tiles array.
     *
     * @returns {Array}
     */
    function createIndex() {
        var i, j, row, index;
        index = [];
        for (i = tiles.length; i--;) {
            row = [];
            for (j = tiles[0].length; j--;) {
                row.push(null);
            }
            index.push(row);
        }
        return index;
    }

    /**
     * Creates the indexes used for quick assessment of which tiles are free
     * for buildings and/or units and which can be navigated by units.
     *
     * @see buildings
     * @see units
     * @see navigationIndex
     */
    function createIndexes() {
        buildings = createIndex();
        units = createIndex();
        navigationIndex = createIndex();
        initNavigationIndex();
    }

    /**
     * Initializes the navigation index. The index is used for quick
     * determination of which tiles can be navigated by units. The flag status
     * for each tile is determined by the accessible flag of the tile. The
     * initialized navigation index therefore doesn't take into account any
     * buildings or units after this method finishes - these has to be taken
     * care of separately.
     *
     * @see navigationIndex
     */
    function initNavigationIndex() {
        var i, j, row, navigationRow;
        for (j = tiles.length; j--;) {
            row = tiles[j];
            navigationRow = navigationIndex[j];
            for (i = row.length; i--;) {
                navigationRow[i] = row[i].accessible;
            }
        }
    }
};

/**
 * Creates a new map from the provided data. The data should be a result of the
 * toPackedJson method.
 * 
 * @param {Array} data Data to deserialize.
 * @returns {Map} Loaded map.
 */
Map.fromPackedJson = function (data) {
    var map, name, width, height, tilesData, x, y, tilesRow, tiles,
            buildingsData, unitsData, projectilesData;
    if (data[0] < 90) {
        throw new Error("Cannot import map of version older than 0.9");
    }
    if (data[0] > 90) {
        throw new Error("Cannot import map of version greater than 0.9");
    }
    map = new Map();
    name = String.fromCharCode.apply(null, data[1]);
    map.setName(name);
    width = data[2];
    height = data[3];
    tilesData = data[4];
    tiles = new Array(height);
    for (y = 0; y < height; y++) {
        tilesRow = new Array(width);
        for (x = 0; x < width; x++) {
            tilesRow[x] = Tile.fromPackedJson(tilesData[y * width + x]);
        }
        tiles[y] = tilesRow;
    }
    map.setTiles(tiles);
    buildingsData = data[5];
    unitsData = data[6];
    projectilesData = data[7];
    map.loadSavePoint([90, buildingsData, unitsData, projectilesData]);
    return map;
};
