"use strict";
var EventDrivenPlugin;

/**
 * An event-driven plugin is executed only when an event observed by it has
 * been sent by another plugin. The event delivery is handled by the GamePlay's
 * background thread, specifically by an internal scheduled plugin registerd by
 * the GamePlay instance.
 */
EventDrivenPlugin = function () {
    /**
     * GamePlay instance pushed to this plugin by the GamePlay instance using
     * the <code>setGamePlay</code> method.
     *
     * @type GamePlay
     */
    var gamePlayInstance;
    
    /**
     * Handles the provided event and its data. The implementing plugin has to
     * override this method. This method is executed only for the events listed
     * by the <code>getObservedEvents</code>.
     * 
     * <p>This method is executed asynchronously in the GamePlay's background
     * thread. Because of this the plugin should not do any leghty
     * operations.</p>
     * 
     * @param {String} eventName Name of the event.
     * @param {Object} eventData Event data.
     */
    this.handleEvent = function (eventName, eventData) {
        throw new Error('Not implemented yet.');
    };
    
    /**
     * Returns an array of names of events observed by this module. Note that
     * it is neccessary to implement this method because any event of name not
     * listed in the returned list will not be delivered to this plugin for
     * performance reasons.
     */
    this.getObservedEvents = function () {
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
