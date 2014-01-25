"use strict";
var UnitsConstructionUIPlugin;

/**
 * The UnitsConstructionUIPlugin creates and handles UI buttons for starting
 * construction of units.
 */
UnitsConstructionUIPlugin = function () {
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
     * @type UnitsConstructionUIPlugin
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
            definition = UnitsDefinition.getType(type);
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
    
    this.onBuildingPlaced = function (data) {
        var type, definition, prerequisities, ownedTypes;
        ownedTypes = getBuildingTypesOwnedByPlayer();
        for (type in buttons) {
            if (!buttons.hasOwnProperty(type)) {
                continue;
            }
            definition = UnitsDefinition.getType(type);
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
     * Handler for the <code>unitConstructionProgress</code> event. The handler
     * updates the UI with percentual info about the current unit construction
     * progress.
     *
     * @param {Object} data Event's data.
     */
    this.onUnitConstructionProgress = function (data) {
        var unitButton, label, i;
        if (data.player === playerId) {
            unitButton = buttons[data.unit];
            if (!unitButton.progressInfo.innerHTML) {
                return; // already canceled
            }
            label = Math.floor(data.progress / 10) + ' %';
            if (data.enqueued) {
                label += ' (' + data.enqueued + ')';
            } else if (data.progress >= 1000) {
                label = "";
            }
            if (!unitButton.progressInfo.innerHTML) {
                return; // construction has been canceled
            }
            for (i = uiUpdate.length; i--;) {
                if ((uiUpdate[i].node === unitButton.progressInfo) &&
                        !uiUpdate[i].value) {
                    return; // construction has been canceled
                }
            }
            uiUpdate.push({
                command: 0,
                node: unitButton.progressInfo,
                value: label
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
                '#units-buttons .construction-buttons-content *');
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
     * Creates a unit construction button and adds it to the UI.
     *
     * @param {Object} unit Definition of the unit for which the button is to
     *        be created.
     * @param {Array} ownedTypes Types of buildings owned by the current
     *        player.
     */
    function createButton(unit, ownedTypes) {
        var node, img, progressInfo;
        node = document.createElement(template.tag);
        node.className = template.className;
        node.innerHTML = template.innerHTML;

        img = node.getElementsByTagName('img')[0];
        img.src = unit.imageData[5].src;
        img.alt = unit.name;
        img.style.width = Settings.tileWidth + 'px';
        img.style.height = Settings.tileHeight + 'px';

        progressInfo = node.getElementsByTagName('div')[0];
        node.getElementsByTagName('div')[2].innerHTML = unit.name;
        node.title = '¢ ' + (unit.construction.step[0] *
                (1000 / unit.construction.stepProgress));

        node.addEventListener('click', function () {
            if (!progressInfo.innerHTML) {
                uiUpdate.push({
                    command: 0,
                    node: progressInfo,
                    value: "0 %"
                });
            }
            instance.sendEvent('enqueueUnitConstruction', {
                player: playerId,
                unit: unit.type
            });
        }, false);
        addEventListener('contextmenu', function (event) {
            var clickedNode;
            event.preventDefault();
            clickedNode = getConstructionButton(event.target);
            if (clickedNode === node) {
                uiUpdate.push({
                    command: 0,
                    node: progressInfo,
                    value: ""
                });
                instance.sendEvent('cancelUnitConstruction', {
                    player: playerId,
                    unit: unit.type
                });
            }
        });

        node.progressInfo = progressInfo;
        buttons[unit.type] = node;
        node.style.display =
                hasSatisfiedRequirements(unit.prerequisities, ownedTypes) ?
                "" : "none";
        buttonsContainer.appendChild(node);
    };
    
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
     * Creates buttons for constructing new units in the UI.
     */
    function createButtons() {
        var unit, type, ownedTypes;
        ownedTypes = getBuildingTypesOwnedByPlayer();
        for (
            type = 0;
            unit = UnitsDefinition.getType(type);
            type++
        ) {
            if ((unit.race !== null) &&
                    (unit.race === currentPlayerRace)) {
                createButton(unit, ownedTypes);
            }
        }
    };

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
    };
};
UnitsConstructionUIPlugin.prototype = new AdvancedUIPlugin();
