"use strict";
var UnitsConstructionUIPlugin;

/**
 * The UnitsConstructionUIPlugin creates and handles UI buttons for starting
 * construction of units.
 */
UnitsConstructionUIPlugin = function () {
    var currentPlayerRace, template, buttonsContainer, createButton,
            createButtons, instance, playerId;
    
    instance = this;
    
    /**
     * Creates a unit construction button and adds it to the UI.
     * 
     * @param {Object} unit Definition of the unit for which the button is to
     *        be created.
     */
    createButton = function (unit) {
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
        
        node.addEventListener('click', function () {
            if (!progressInfo.innerHTML) {
                progressInfo.innerHTML = '0 %';
            }
            instance.sendEvent('enqueueBuildingConstruction', {
                player: playerId,
                unit: unit.type
            });
        }, false);
        
        buttonsContainer.appendChild(node);
    };
    
    /**
     * Creates buttons for constructing new units in the UI.
     */
    createButtons = function () {
        var unit, type;
        for (
            type = 0;
            unit = UnitsDefinition.getType(type);
            type++
        ) {
            if ((unit.race !== null) &&
                    (unit.race == currentPlayerRace)) {
                createButton(unit);
            }
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
        if (currentPlayerRace) {
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
};
UnitsConstructionUIPlugin.prototype = new AdvancedEventDrivenPlugin();
