"use strict";
var SellRepairButtons;

/**
 * UI plugin of observing user click on the "sell" and "repair" button and
 * notifying other plugins.
 *
 * @constructor
 */
SellRepairButtons = function () {
    /**
     * The current instance of this plugin.
     *
     * @type SellRepairButtons
     */
    var instance,

    /**
     * Updates to the UI.
     *
     * @type Array
     */
    updates,

    /**
     * "Sell building" button.
     *
     * @type HTMLElement
     */
    sellButton,

    /**
     * "Repair building" button.
     *
     * @type HTMLElement
     */
    repairButton;

    /**
     * Constructor.
     */
    (function () {
        instance = this;
        updates = [];
    }.call(this));

    // override
    this.renderFrame = function () {
        var i, length, command;
        length = updates.length;
        for (i = 0; i < length; i++) {
            command = updates[i];
            switch (command.command) {
                case 0:
                    command.node.className = "active";
                    break;
                case 1:
                    command.node.className = "";
                    break;
                default:
                    throw new Error("Unknown command: " + command.command);
            }
        }
    };

    /**
     * Handler for the <code>sellModeSwitch</code> event. The handler updates
     * the states of the sell/repair buttons as needed.
     */
    this.onSellModeSwitch = function () {
        if (sellButton.className) {
            updates.push({
                node: sellButton,
                command: 1
            });
        } else {
            updates.push({
                node: sellButton,
                command: 0
            });
            updates.push({
                node: repairButton,
                command: 1
            });
        }
    };

    /**
     * Handler for the <code>repairModeSwitch</code> event. The handler updates
     * the states of the sell/repair buttons as needed.
     */
    this.onRepairModeSwitch = function () {
        if (repairButton.className) {
            updates.push({
                node: repairButton,
                command: 1
            });
        } else {
            updates.push({
                node: repairButton,
                command: 0
            });
            updates.push({
                node: sellButton,
                command: 1
            });
        }
    };

    /**
     * Handler for the <code>start</code> event. The handler initializes the UI
     * callbacks.
     */
    this.onStart = function () {
        repairButton = document.getElementById("button-repair");
        repairButton.addEventListener("click", handleRepairClick, false);
        sellButton = document.getElementById("button-sell");
        sellButton.addEventListener("click", handleSellClick, false);
    };

    /**
     * Handler for the <code>stop</code> event. The handler removes the UI
     * callbacks.
     */
    this.onStop = function () {
        var button;
        button = document.getElementById("button-repair");
        button.removeEventListener("click", handleRepairClick, false);
        button = document.getElementById("button-sell");
        button.removeEventListener("click", handleSellClick, false);
    };

    /**
     * Handles click on the sell button.
     */
    function handleSellClick() {
        instance.sendEvent("sellModeSwitch", null);
    }

    /**
     * Handles click on the repair button.
     */
    function handleRepairClick() {
        instance.sendEvent("repairModeSwitch", null);
    }
};
SellRepairButtons.prototype = new AdvancedUIPlugin();
