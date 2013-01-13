"use strict";
var ScheduledPlugin;

/**
 * A ScheduledPlugin is a GamePlay plugin that is executed in regular intervals
 * or "ticks" by GamePlay's background thread. All scheduled plugins extend
 * this class.
 * 
 * <p>A plugin extending this class must override (implement) the abstract
 * method <code>handleTick</code>.</p>
 */
ScheduledPlugin = function () {
    /**
     * GamePlay instance pushed to this plugin by the GamePlay instance using
     * the <code>setGamePlay</code> method.
     *
     * @type GamePlay
     */
    var gamePlayInstance;
    
    /**
     * This method is executed by the GamePlay's background thread on each
     * tick. The only exception to this rule is when the thread cannot execute
     * all plugins in time and starts to drop ticks.
     * 
     * <p>The implementing plugin has to override this method.</p>
     */
    this.handleTick = function () {
        throw new Error('Not implemented yet.');
    };
    
    /**
     * Sends an event asynchronously. The event is delived in the GamePlay's
     * background thread.
     * 
     * @param {String} eventName Name of the send event.
     * @param {Object} eventData Data submitted along with the event. This can
     *        be any data and it's up to the event-receiving plugins to handle
     *        the data appropriately.
     */
    this.sendEvent = function (eventName, eventData) {
        gamePlayInstance.sendEvent(eventName, eventData);
    };
    
    /**
     * Sets the reference to the GamePlay instance. This method is executed by
     * the GamePlay instance.
     * 
     * @param {GamePlay} gamePlay GamePlay instance.
     */
    this.setGamePlay = function (gamePlay) {
        gamePlayInstance = gamePlay;
    };
};
