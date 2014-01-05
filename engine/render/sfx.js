"use strict";
var SFX;

/**
 * Renderer of simple SFX and UI overlays over the main world view.
 */
SFX = function () {
    var canvas, map, tiles, canvasWidth, canvasHeight, tileWidth, tileHeight,
            context, canvasTileWidth, canvasTileHeight, depthFactor,
            canvasCenterX, canvasCenterY, buildingsIndex, enableBuildOverlay,
            navigationIndex, enableNavigationIndex, inaccessibleColor,
            accessibleColor, projectiles, selectBoxStartX, selectBoxStartY,
            selectBoxWidth, selectBoxHeight, selectedUnits, mouseoverUnit,
            selectedBuilding, mouseoverBuilding, buildingToPlace,
            buildingPlacementAllowed;

    depthFactor = Settings.sfx3DLightFactor;
    accessibleColor = Settings.sfxAccessibleTileColor;
    inaccessibleColor = Settings.sfxInaccessibleTileColor;
    enableBuildOverlay = false;
    enableNavigationIndex = false;
    projectiles = [];
    selectedUnits = [];

    /**
     * Sets the output canvas for rendering.
     *
     * @param {HTMLCavansElement} newCanvas New output canvas for rendering.
     */
    this.setCanvas = function (newCanvas) {
        canvas = newCanvas;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        context = canvas.getContext('2d');
        context.strokeStyle = Settings.sfx3DLightColor;
        context.lineCap = 'round';
        canvasCenterX = canvasWidth / 2;
        canvasCenterY = canvasHeight / 2;
    };

    /**
     * Sets the current map of which SFX should be renderer.
     *
     * @param {Map} newMap The map for rendering. The method also accepts raw
     *        map data.
     */
    this.setMap = function (newMap) {
        if (!canvas) {
            throw new Error("cannot set map for SFX before canvas!");
        }
        map = newMap;
        tiles = newMap.getTiles();
        tileWidth = TilesDefinition.getType(0).imageData.width - 1;
        tileHeight = TilesDefinition.getType(0).imageData.height / 2 - 1;
        canvasTileWidth = Math.ceil(canvasWidth / tileWidth);
        canvasTileHeight = Math.ceil(canvasHeight / tileHeight);
        buildingsIndex = newMap.getBuildingsIndex();
        navigationIndex = newMap.getNavigationIndex();
        projectiles = newMap.getProjectiles();
    };

    /**
     * Set whether or not the SFX renderer should display an overlay over the
     * buildings to signal that those tiles cannot be used for placing other
     * buildings.
     *
     * @param {Boolean} displayBuildableOverlay When set to true, the SFX
     *        renderer will display an overlay over the buildings.
     */
    this.setDisplayBuildableOverlay = function (displayBuildableOverlay) {
        enableBuildOverlay = displayBuildableOverlay;
    };

    /**
     * Enables or disables the rendering of the navigation index over the UI.
     * The navigation index will show which tiles can be navigated by units
     * (are not occupied by another unit or a building).
     *
     * @param {Boolean} displayNavigationIndex <code>true</code> if the
     *        navigation display should be visible.
     */
    this.setDisplayNavigationIndex = function (displayNavigationIndex) {
        enableNavigationIndex = displayNavigationIndex;
    };

    /**
     * Displays the SFX of the map on the chosen offset on the provided
     * canvas.
     *
     * @param {Number} x X offset for rendering.
     * @param {Number} y Y offset for rendering.
     */
    this.display = function (x, y) {
        context.globalAlpha = 0.6;
        displayProjectiles(x, y);
        displaySelectionBox(x, y);
        displayHealthBars(x, y);
        displayBuildingToPlace(x, y);
        context.globalAlpha = 0.3;
        displayLightSFX(x, y);
        enableBuildOverlay && displayBuildableTiles(x, y);
        enableNavigationIndex && displayNavigableTiles(x, y);
        context.globalAlpha = 1;
    };

    /**
     * Sets the starting and ending coordinates of the unit selection box.
     * Setting all parameters to <code>0</code> will disable the selection box.
     *
     * @param {Number} startX The X-coordinate of the selection start tile.
     * @param {Number} startY The Y-coordinate of the selection start tile.
     * @param {Number} endX The X-coordinate of the selection end tile.
     * @param {Number} endY The Y-coordinate of the selection end tile.
     */
    this.setSelectionBox = function (startX, startY, endX, endY) {
        selectBoxStartX = startX * tileWidth;
        selectBoxStartY = startY * tileHeight;
        selectBoxWidth = (endX - startX + 1.5) * tileWidth;
        selectBoxHeight = (endY - startY + 1) * tileHeight;
    };

    /**
     * Sets the currently selected units. The SFX renderer will show the
     * hitpoints of the units as healtbars over the units (for each visible
     * unit).
     *
     * @param {Array} units The player's currently selected units.
     */
    this.setSelectedUnits = function (units) {
        selectedUnits = units;
    };

    /**
     * Sets the unit over which the mouse cursor is currently located. The SFX
     * renderer will show the unit's hitpoints as a healthbar over the unit (if
     * the unit is visible).
     *
     * @param {Unit} unit The unit over which the mouse cursor is currently
     *        located. Can be <code>null</code> if the mouse cursor is over no
     *        unit.
     */
    this.setMouseoverUnit = function (unit) {
        mouseoverUnit = unit;
    };

    /**
     * Sets the currently selected building in the UI. The building will have
     * its healthbar fully displayed.
     *
     * @param {Building} building The building that is currently selected. The
     *        parameter can be <code>null</code> if no building is currently
     *        selected.
     */
    this.setSelectedBuilding = function (building) {
        selectedBuilding = building;
    };

    /**
     * Sets the building which is currently located under the mouse cursor. The
     * building will have its healthbar displayed in the simple way.
     *
     * @param {Building} building The building located under the mouse cursor.
     *        The parameter can be <code>null</code> if no building is under
     *        the mouse cursor.
     */
    this.setMouseoverBuilding = function (building) {
        mouseoverBuilding = building;
    };

    /**
     * Sets the building about to be placed by the user. The building will be
     * displayed in a semi-transparent way along with a per-tile grid showing
     * whether the buidlding can be placed.
     *
     * @param {Building} building The building to place on the map.
     * @param {Boolean} allowed Is it allowed to place the building onto this
     *        possition if all underlying tiles were free? This can be used to
     *        restrict the distance from other buildings at which new buildings
     *        can be placed.
     */
    this.setBuildingToPlace = function (building, allowed) {
        buildingToPlace = building;
        buildingPlacementAllowed = allowed;
    };

    /**
     * Displays the building about to be placed on the map by the user along
     * with a helping overlay showing whether the building can or cannot be
     * placed.
     *
     * @param {Number} x The horintal offset of the world view in pixels.
     * @param {Number} y The vertical offset of the world view in pixels.
     */
    function displayBuildingToPlace(x, y) {
        var screenX, screenY, type, tiles, i, tile, atTile;
        if (!buildingToPlace) {
            return;
        }
        context.globalAlpha = 0.6;
        screenX = buildingToPlace.x * tileWidth +
                (tileWidth / 2) * (buildingToPlace.y % 2) - x;
        screenY = buildingToPlace.y * tileHeight - y;
        type = BuildingsDefinition.getType(buildingToPlace.type);
        context.drawImage(type.playerImages[buildingToPlace.player], screenX,
                screenY - 2);
        tiles = map.getTilesOccupiedByBuilding(buildingToPlace);
        context.globalAlpha = 0.3;
        context.lineWidth = 1;
        for (i = tiles.length; i--;) {
            tile = tiles[i];
            context.fillStyle = "#00cf00";
            context.strokeStyle = "#007500";
            if (buildingPlacementAllowed) {
                atTile = map.getObjectAt(tile.x, tile.y);
                if (atTile || !map.getNavigationIndex()[tile.y][tile.x]) {
                    context.fillStyle = "#cf0000";
                    context.strokeStyle = "#750000";
                }
            } else {
                context.fillStyle = "#cf0000";
                context.strokeStyle = "#750000";
            }
            screenX = tile.x * tileWidth + (tileWidth / 2) * (tile.y % 2) - x;
            screenY = tile.y * tileHeight - y;
            displayTileOverlay(screenX, screenY, true);
        }
    }

    /**
     * Displays the health bars of selected units and the unit under the mouse
     * cursor.
     *
     * @param {Number} x Horizontal offset of the world view.
     * @param {Number} y Vertical offset of the world view.
     */
    function displayHealthBars(x, y) {
        var i;
        for (i = selectedUnits.length; i--;) {
            displayUnitHealthBar(x, y, selectedUnits[i], true);
        }
        if (mouseoverUnit) {
            displayUnitHealthBar(x, y, mouseoverUnit, false);
        }
        if (selectedBuilding) {
            displayBuildingHealthBar(x, y, selectedBuilding, true);
        }
        if (mouseoverBuilding) {
            displayBuildingHealthBar(x, y, mouseoverBuilding, false);
        }
    }

    /**
     * Displays the health bar of a single building.
     *
     * @param {Number} viewX Horizontal offset of the world view.
     * @param {Number} viewY Vertical offset of the world view.
     * @param {Building} building
     * @param {Boolean} full Whether the healtbar should be fully displayed
     *        (selected buildigns) or in a striped-down fashion (mouseover
     *        buildings).
     */
    function displayBuildingHealthBar(viewX, viewY, building, full) {
        var x, y, offsetX, boxWidth, barSize;
        offsetX = (building.y % 2) * tileWidth / 2;
        x = building.x * tileWidth - viewX + offsetX;
        y = building.y * tileHeight - viewY - 4;
        if ((x < -tileWidth) || (y < -2) || (x >= canvasWidth) ||
                (y >= canvasHeight)) {
            return;
        }
        boxWidth = tileWidth * building.width;
        if (full) {
            context.fillStyle = "#ffffff";
            context.fillRect(x, y, boxWidth, 3);
        }
        boxWidth -= 2;
        barSize = (building.hitpoints / building.maxHitpoints) * (boxWidth);
        context.fillStyle = "#00cf00";
        context.fillRect(x + 1, y + 1, barSize, 1);
    }

    /**
     * Displays the health bar of a single unit.
     *
     * @param {Number} viewX Horizontal offset of the world view.
     * @param {Number} viewY Vertical offset of the world view.
     * @param {Unit} unit The unit for which the health bar should be
     *        displayed.
     * @param {Boolean} full Whether the healtbar should be fully displayed
     *        (selected units) or in a striped-down fashion (mouseover units).
     */
    function displayUnitHealthBar(viewX, viewY, unit, full) {
        var x, y, offsetX, barSize;
        offsetX = (unit.y % 2) * tileWidth / 2;
        x = unit.x * tileWidth - unit.moveOffsetX - viewX + offsetX;
        y = unit.y * tileHeight - unit.moveOffsetY - viewY - 2;
        if ((x < -tileWidth) || (y < -2) || (x >= canvasWidth) ||
                (y >= canvasHeight)) {
            return;
        }
        if (full) {
            context.fillStyle = "#ffffff";
            context.fillRect(x, y, tileWidth, 3);
        }
        barSize = (unit.hitpoints / unit.maxHitpoints) * (tileWidth - 2);
        context.fillStyle = "#00cf00";
        context.fillRect(x + 1, y + 1, barSize, 1);
    }

    /**
     * Displays the unit group selection box when the user is selecting a group
     * of units using drag & drop.
     *
     * @param {Number} x Horizontal offset of the world view.
     * @param {Number} y Vertical offset of the worlds view.
     */
    function displaySelectionBox(x, y) {
        if (!selectBoxStartX) {
            return;
        }
        context.fillStyle = "lightgreen";
        context.globalAlpha = 0.15;
        context.fillRect(selectBoxStartX - x, selectBoxStartY - y,
                selectBoxWidth, selectBoxHeight);
        context.strokeStyle = "lightgreen";
        context.lineWidth = 1;
        context.globalAlpha = 1;
        context.strokeRect(selectBoxStartX - x, selectBoxStartY - y,
                selectBoxWidth, selectBoxHeight);
    }

    /**
     * Displays the projectiles that are present on the map.
     *
     * @param {Number} x  The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayProjectiles(x, y) {
        var i, projectile;
        context.lineWidth = 2; // laser beam width (projectile type 0)
        for (i = projectiles.length; i--;) {
            projectile = projectiles[i];
            switch (projectile.type) {
                case 0:
                    context.strokeStyle = projectile.player.color;
                    context.beginPath();
                    context.moveTo(projectile.startX - x,
                            projectile.startY - y);
                    context.lineTo(projectile.targetX - x,
                            projectile.targetY - y);
                    context.stroke();
                    break;
                default:
                    throw new Error("Unsupported projectile type: " +
                            projectile.type);
            }
        }
    }

    /**
     * Displays a 3D-like light beams emmanating from the map's surface.
     *
     * @param {Number} x  The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayLightSFX(x, y) {
        var mapOffsetX, mapOffsetY, i, j, offsetX, offsetY, shiftX, endX, endY,
                mapRow, mapTile;
        context.strokeStyle = "#ffffff";
        y -= tileHeight;
        x -= tileWidth / 2;
        mapOffsetX = Math.floor(x / tileWidth);
        mapOffsetY = Math.floor(y / tileHeight);
        context.strokeStyle = Settings.sfx3DLightColor;
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = tiles[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                if (!mapTile || !mapTile.lightSfx) {
                   continue;
                }
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                endX = offsetX + (offsetX - canvasCenterX) / depthFactor;
                endY = offsetY + (offsetY - canvasCenterY) / depthFactor;
                context.lineWidth = mapTile.lightSfx;
                context.beginPath();
                context.moveTo(offsetX, offsetY);
                context.lineTo(endX, endY);
                context.stroke();
            }
        }
    }

    /**
     * Displays the overlay showing which tiles are occupied by buildings and
     * which are still free for building construction.
     *
     * @param {Number} x  The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayBuildableTiles(x, y) {
        var mapOffsetX, mapOffsetY, i, j, mapRow, offsetY, shiftX, mapTile,
                offsetX;
        context.fillStyle = Settings.sfxBuildLayerColor;
        mapOffsetX = Math.floor(x / tileWidth) - 1;
        mapOffsetY = Math.floor(y / tileHeight) - 1;
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = buildingsIndex[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                if (!mapTile) {
                    continue;
                }
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                displayTileOverlay(offsetX, offsetY);
            }
        }
    }

    /**
     * Displays an overlay over a single map tile at the specified coordinates.
     * The tile will be overlayed using a polygon filled with the current fill
     * style.
     *
     * @param {Number} x The horizontal offset of the tile's position from the
     *        map's top left cornenr.
     * @param {Number} y The vertical offset of the tile's position from the
     *        map's top left corner.
     * @param {Boolean} createBorder Should the method also draw a "border"
     *        around the tile's edges?
     */
    function displayTileOverlay(x, y, createBorder) {
        context.beginPath();
        context.moveTo(x + (tileWidth / 2), y);
        context.lineTo(x + tileWidth, y + tileHeight);
        context.lineTo(x + (tileWidth / 2), y + (tileHeight * 2));
        context.lineTo(x, y + tileHeight);
        context.fill();
        if (createBorder) {
            context.beginPath();
            context.moveTo(x + (tileWidth / 2), y - 1);
            context.lineTo(x + tileWidth + 1, y + tileHeight);
            context.lineTo(x + (tileWidth / 2), y + (tileHeight * 2) + 1);
            context.lineTo(x - 1, y + tileHeight);
            context.stroke();
        }
    }

    /**
     * Displays the overlay showing which tiles are navigable by units
     * (accessible for unit movement).
     *
     * @param {Number} x The horizonat offset of the camera from the map's top
     *        left corner in pixels.
     * @param {Number} y The vertical offset of the camera from the map's top
     *        left corner in pixels.
     */
    function displayNavigableTiles(x, y) {
        var mapOffsetX, mapOffsetY, i, j, mapRow, offsetY, shiftX, mapTile,
                offsetX;
        mapOffsetX = Math.floor(x / tileWidth) - 1;
        mapOffsetY = Math.floor(y / tileHeight) - 1;
        for (j = canvasTileHeight + 2; j--;) {
            mapRow = navigationIndex[j + mapOffsetY];
            if (!mapRow) {
                continue;
            }
            offsetY = (j + mapOffsetY) * tileHeight - y;
            shiftX = ((mapOffsetY + j) % 2) * tileWidth / 2;
            for (i = canvasTileWidth + 2; i--;) {
                mapTile = mapRow[i + mapOffsetX];
                context.fillStyle = mapTile ? accessibleColor :
                        inaccessibleColor;
                offsetX = (i + mapOffsetX) * tileWidth + shiftX - x;
                displayTileOverlay(offsetX, offsetY);
            }
        }
    }
};
