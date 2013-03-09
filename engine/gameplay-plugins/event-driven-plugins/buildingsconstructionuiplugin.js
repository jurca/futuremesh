"use strict";
var BuildingsConstructionUIPlugin;

/**
 * The BuildingsConstructionUIPlugin creates and handles UI buttons for
 * starting construction of buildings and initiating their placement on the map
 * once the construction process is finished.
 */
BuildingsConstructionUIPlugin = function () {
    var currentPlayerRace, template, buttonsContainer, createButton,
            createButtons, scaleButtonIcon, instance, playerId, buttons;

    instance = this;
    buttons = {};

    /**
     * Scales the building construction button's icon image to fit the button
     * while preserving the image's aspect ratio.
     *
     * @param {Object} building Definition of the building for which
     *        the button is to be created.
     * @param {HTMLImageElement} img Image icon of the button.
     */
    scaleButtonIcon = function (building, img) {
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
    };

    /**
     * Creates a building construction button and adds it to the UI.
     *
     * @param {Object} building Definition of the building for which
     *        the button is to be created.
     */
    createButton = function (building) {
        var node, img, progressInfo;
        node = document.createElement(template.tag);
        node.className = template.className;
        node.innerHTML = template.innerHTML;

        img = node.getElementsByTagName('img')[0];
        img.src = building.imageData.src;
        img.alt = building.name;

        progressInfo = node.getElementsByTagName('div')[0];
        node.getElementsByTagName('div')[2].innerHTML = building.name;

        // we have information about image's dimensions, so we can scale it
        if (building.imageWidth && building.imageHeigth) {
            scaleButtonIcon(building, img);
        }

        node.addEventListener('click', function () {
            if (!progressInfo.innerHTML) {
                progressInfo.innerHTML = '0 %';
                instance.sendEvent('enqueueBuildingConstruction', {
                    player: playerId,
                    building: building.type
                });
            } else if (node.ready) {
                alert('placing the building is not implemented yet');
            }
        }, false);

        node.progressInfo = progressInfo;
        buttons[building.type] = node;
        buttonsContainer.appendChild(node);
    };

    /**
     * Creates buttons for constructing new buildings in the UI.
     */
    createButtons = function () {
        var building, type;
        for (
            type = 0;
            building = BuildingsDefinition.getType(type);
            type++
        ) {
            if ((building.race !== null) &&
                    (building.race == currentPlayerRace)) {
                createButton(building);
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
        if (progress.player == playerId) {
            buildingButton = buttons[progress.building];
            if (progress.progress >= 1000) {
                progressLabel = 'READY';
                buildingButton.ready = true;
            } else {
                progressLabel = Math.floor(progress.progress / 10) + ' %';
            }
            buildingButton.progressInfo.innerHTML = progressLabel;
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
                '#buildings-buttons .construction-buttons-content *')
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
BuildingsConstructionUIPlugin.prototype = new AdvancedEventDrivenPlugin();
