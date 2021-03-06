"use strict";
var BuildingsConstructionUIPlugin;

/**
 * The BuildingsConstructionUIPlugin creates and handles UI buttons for
 * starting construction of buildings and initiating their placement on the map
 * once the construction process is finished.
 */
BuildingsConstructionUIPlugin = function () {
    /**
     * The current technological race of the player.
     * 
     * @type Number
     */
    var currentPlayerRace,
            
    /**
     * A "template" describing how the construction button should be created.
     * 
     * @type Object
     */
    template,

    /**
     * Container element for construction buttons.
     * 
     * @type HTMLElement
     */
    buttonsContainer,
    
    /**
     * The current instance of this plugin.
     * 
     * @type BuildingsConstructionUIPlugin
     */
    instance,

    /**
     * The ID of the current player.
     * 
     * @type Number
     */
    playerId,
    
    /**
     * Map of building types to the HTML elements representing the construction
     * buttons.
     * 
     * @type Object
     */
    buttons,
    
    /**
     * Updates that should be done to the UI in the next frame.
     * 
     * @type Array
     */
    uiUpdate,
    
    /**
     * The current map.
     * 
     * @type Map
     */
    map;

    /**
     * Constructor.
     */
    (function () {
        instance = this;
        buttons = {};
        uiUpdate = [];
    }.call(this));

    // override
    this.renderFrame = function () {
        var i, update;
        for (i = uiUpdate.length; i--;) {
            update = uiUpdate[i];
            switch (update.command) {
                case 0: // update innerHTML
                    update.node.innerHTML = update.value;
                    break;
                case 1: // show
                    update.node.style.display = "";
                    break;
                case 2: // hide
                    update.node.style.display = "none";
                    break;
                default:
                    throw new Error("Unknown update command: " +
                            uiUpdate.command);
            }
        }
        uiUpdate = [];
    };
    
    /**
     * Event handler for the <code>gameMapInitialization</code> event. The
     * handler sets the internal map reference.
     *
     * @param {Map} gameMap The current game map.
     */
    this.onGameMapInitialization = function (gameMap) {
        map = gameMap;
    };
    
    /**
     * Event handler for the <code>buildingDestroyed</code> event. The handler
     * updates the construction buttons so that only buildings with satisfied
     * prerequisities may be constructed.
     * 
     * @param {type} building
     */
    this.onBuildingDestroyed = function (building) {
        var type, definition, prerequisities, ownedTypes;
        building = building.building;
        if (building.player !== playerId) {
            return;
        }
        ownedTypes = getBuildingTypesOwnedByPlayer();
        for (type in buttons) {
            if (!buttons.hasOwnProperty(type)) {
                continue;
            }
            definition = BuildingsDefinition.getType(type);
            prerequisities = definition.prerequisities;
            if (hasSatisfiedRequirements(prerequisities, ownedTypes)) {
                uiUpdate.push({
                    command: 1,
                    node: buttons[type]
                });
            } else {
                uiUpdate.push({
                    command: 2,
                    node: buttons[type]
                });
            }
        }
    };

    /**
     * Handler for the <code>buildingPlaced</code> event. The event occurrs
     * when the user successfully places a newly constructed building on the
     * map. The handler resets the related building construction button. The
     * handler also updates the construction buttons so that only buildings
     * with satisfied prerequisities may be constructed.
     *
     * @param {Object} data Event's data.
     */
    this.onBuildingPlaced = function (data) {
        var building, button, type, definition, prerequisities, ownedTypes;
        building = data.building;
        if (building.player !== playerId) {
            return;
        }
        button = buttons[building.type];
        uiUpdate.push({
            command: 0,
            node: button.progressInfo,
            value: ""
        });
        button.ready = false;
        ownedTypes = getBuildingTypesOwnedByPlayer();
        for (type in buttons) {
            if (!buttons.hasOwnProperty(type)) {
                continue;
            }
            definition = BuildingsDefinition.getType(type);
            prerequisities = definition.prerequisities;
            if (hasSatisfiedRequirements(prerequisities, ownedTypes)) {
                uiUpdate.push({
                    command: 1,
                    node: buttons[type]
                });
            } else {
                uiUpdate.push({
                    command: 2,
                    node: buttons[type]
                });
            }
        }
    };

    /**
     * Event handler for the <code>buildingConstructionProgress</code> event.
     * The event is sent by the BuildingsUnitsConstruction plug-in whenever a
     * construction of a building progresses.
     *
     * @param {Object} progress The progress of building construction details.
     *        The construction progress number is a number within the range
     *        [0, 1000]. The progress number is set to 1000 when the building
     *        is fully constructed and is ready to be placed on the map.
     */
    this.onBuildingConstrucionProgress = function (progress) {
        var buildingButton, progressLabel;
        if (progress.player === playerId) {
            buildingButton = buttons[progress.building];
            if (!buildingButton.progressInfo.innerHTML) {
                return;
            }
            if (progress.progress >= 1000) {
                progressLabel = 'READY';
                buildingButton.ready = true;
            } else {
                progressLabel = Math.floor(progress.progress / 10) + ' %';
            }
            uiUpdate.push({
                command: 0,
                node: buildingButton.progressInfo,
                value: progressLabel
            });
        }
    };

    /**
     * Event handler for the <code>playerInitialization</code>. The event is
     * sent by the GameLoader utility.
     *
     * @param {Player} player The current human player controlling the UI
     *        repesented as a Player instance.
     */
    this.onPlayerInitialization = function (player) {
        playerId = player.id;
        currentPlayerRace = player.race;
        if (template) {
            createButtons();
        }
    };

    /**
     * Event handler for the <code>start</code> event. The event is sent by the
     * GamePlay daemon when it is started and carries a <code>null</code> as
     * its data.
     *
     * @param {Object} tmp A <code>null</code> representing the event's data.
     */
    this.onStart = function (tmp) {
        var templateNode;
        templateNode = document.querySelector(
                '#buildings-buttons .construction-buttons-content *');
        buttonsContainer = templateNode.parentNode;

        template = {
            tag: templateNode.nodeName,
            className: templateNode.className,
            innerHTML: templateNode.innerHTML,
            width: 70,
            height: 38
        };
        buttonsContainer.innerHTML = '';
        if (currentPlayerRace !== undefined) {
            createButtons();
        }
    };

    /**
     * Event handler for the <code>stop</code> event. The event is sent by the
     * GamePlay daemon when it is stopped and carries a <code>null</code> as
     * its data.
     *
     * @param {Object} tmp A <code>null</code> representing the event's data.
     */
    this.onStop = function (tmp) {
        buttonsContainer.innerHTML = '';
    };

    /**
     * Scales the building construction button's icon image to fit the button
     * while preserving the image's aspect ratio.
     *
     * @param {Object} building Definition of the building for which
     *        the button is to be created.
     * @param {HTMLImageElement} img Image icon of the button.
     */
    function scaleButtonIcon(building, img) {
        var horizontalRatio, verticalRatio, shrinkRatio;
        if ((building.imageWidth <= template.width) ||
                (building.imageHeigth <= template.height)) {
            img.style.width = building.imageWidth + 'px';
            img.style.height = building.imageHeigth + 'px';
        } else {
            // preserve the image's aspect ratio
            horizontalRatio = building.imageWidth / template.width;
            verticalRatio = building.imageHeigth / template.height;
            shrinkRatio = Math.max(horizontalRatio, verticalRatio);
            img.style.width = building.imageWidth / shrinkRatio + 'px';
            img.style.height = building.imageHeigth / shrinkRatio + 'px';
        }
    }

    /**
     * Creates a building construction button and adds it to the UI.
     *
     * @param {Object} building Definition of the building for which
     *        the button is to be created.
     * @param {Array} ownedTypes Types of buildings owned by the current
     *        player.
     */
    function createButton(building, ownedTypes) {
        var node, img, progressInfo;
        node = document.createElement(template.tag);
        node.className = template.className;
        node.innerHTML = template.innerHTML;

        img = node.getElementsByTagName('img')[0];
        img.src = building.imageData.src;
        img.alt = building.name;

        progressInfo = node.getElementsByTagName('div')[0];
        node.getElementsByTagName('div')[2].innerHTML = building.name;
        node.title = '¢ ' + (building.construction.step[0] *
                (1000 / building.construction.stepProgress));

        // we have information about image's dimensions, so we can scale it
        if (building.imageWidth && building.imageHeigth) {
            scaleButtonIcon(building, img);
        }

        node.addEventListener('click', function () {
            handleLeftMouseClick(node, progressInfo, building);
        }, false);
        addEventListener('contextmenu', function (event) {
            handleRightMouseClick(event, node, building);
        });

        node.progressInfo = progressInfo;
        node.style.display =
                hasSatisfiedRequirements(building.prerequisities, ownedTypes) ?
                "" : "none";
        buttons[building.type] = node;
        buttonsContainer.appendChild(node);
    }
    
    /**
     * Tests whether the provided array of owned types of buildings contains
     * all types in the specified prerequisities array.
     * 
     * @param {Array} prerequisities Types of buildings that the player must
     *        own.
     * @param {Array} ownedTypes Types of buildings that the player owns.
     * @return {Boolean} <code>true</code> if the prerequisities are satisfied.
     */
    function hasSatisfiedRequirements(prerequisities, ownedTypes) {
        var i;
        for (i = prerequisities.length; i--;) {
            if (ownedTypes.indexOf(prerequisities[i]) === -1) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Returns the types of the buildings the player currently owns.
     * 
     * @return {Array} Types of buildings the player currently owns.
     */
    function getBuildingTypesOwnedByPlayer() {
        var types, i, buildings;
        types = [];
        buildings = map.getBuildings();
        for (i = buildings.length; i--;) {
            if (buildings[i].player !== playerId) {
                continue;
            }
            if (types.indexOf(buildings[i].type) === -1) {
                types.push(buildings[i].type);
            }
        }
        return types;
    }

    /**
     * Handles an event produced when the user performs a click with the left
     * mouse button on the building construction button. The method starts the
     * building construction if the building isn't in construction yet. The
     * method starts the building placement process if the building has been
     * fully constructed.
     *
     * @param {HTMLElement} node HTML element containing the button
     *        representing the construction button.
     * @param {HTMLElement} progressInfo HTML element to contain the current
     *        construction progress info.
     * @param {Building} building Building definition represented by the
     *        button.
     */
    function handleLeftMouseClick(node, progressInfo, building) {
        if (!progressInfo.innerHTML) {
            uiUpdate.push({
                command: 0,
                node: progressInfo,
                value: "0 %"
            });
            instance.sendEvent('enqueueBuildingConstruction', {
                player: playerId,
                building: building.type
            });
        } else if (node.ready) {
            instance.sendEvent('startBuildingPlacing', {
                building: building.type
            });
        }
    }

    /**
     * Handles an event produced when the user performs a click with the right
     * mouse button. If the building represented by the button is being built,
     * the method will cancel the building construction. The method will cause
     * building construction refund if the building has already been built but
     * hasn't been placed on the map yet.
     *
     * @param {MouseEvent} event The captured right-mouse-button click event.
     * @param {HTMLElement} node Root HTML node of the button representing the
     *        building.
     * @param {Building} building Building definition represented by the
     *        button.
     */
    function handleRightMouseClick(event, node, building) {
        var clickedNode;
        event.preventDefault();
        clickedNode = getConstructionButton(event.target);
        if (clickedNode === node) {
            if (node.ready) {
                instance.sendEvent('refundBuildingConstruction', {
                    player: playerId,
                    building: building.type
                });
                node.ready = false;
            } else {
                instance.sendEvent('cancelBuildingConstruction', {
                    player: playerId,
                    building: building.type
                });
            }
            uiUpdate.push({
                command: 0,
                node: node.progressInfo,
                value: ""
            });
        }
    }

    /**
     * Creates buttons for constructing new buildings in the UI.
     */
    function createButtons() {
        var building, type, playerRace, ownedTypes;
        building = BuildingsDefinition.getType(0);
        playerRace = currentPlayerRace;
        ownedTypes = getBuildingTypesOwnedByPlayer();
        for (type = 0; building;) {
            if ((building.race !== null) && (building.race === playerRace)) {
                createButton(building, ownedTypes);
            }
            building = BuildingsDefinition.getType(++type);
        }
    }

    /**
     * Returns the construction button encapsuling the provided clicked HTML
     * element. The method returns <code>null</code> if the clicked element is
     * not encapsulated by a construction button element.
     *
     * @param {HTMLElement} clickedNode The HTML clicked by the user.
     * @returns {HTMLElement} The construction button element or
     *          <code>null</code>.
     */
    function getConstructionButton(clickedNode) {
        var limit;
        limit = 3;
        while (clickedNode.className !== 'construction-button') {
            if (!limit--) {
                return null;
            }
            clickedNode = clickedNode.parentNode;
            if (!clickedNode) {
                return null;
            }
        }
        return clickedNode;
    }
};
BuildingsConstructionUIPlugin.prototype = new AdvancedUIPlugin();
