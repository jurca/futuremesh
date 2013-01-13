"use strict";
var GamePlay;

/**
 * The GamePlay class provides the runtime environment for the plugins that
 * provide services, API and handle actions in a way that the user can play the
 * game. The GamePlay class handles event delivery for event-driven plugins and
 * running the scheduled plugins in regular time periods call "ticks".
 * 
 * The GamePlay object is initialized by an GameLoader class instance. You
 * shouldn't create instances of this class unless you really know what you are
 * doing.
 * 
 * @param {Array} plugins Array of plugins instances. Plugins usually extend
 *        the ScheduledPlugin class, the EventDrivenPlugin class or the
 *        MixedPlugin class (for plugins that are both scheduled and
 *        event-driven).
 *        <p>The schedules plugins are plugins that should be executed in
 *        regular periods called as "ticks". The duration of a tick is
 *        specified in the settings. The scheduled plugins can produce events,
 *        but they cannot receive them.</p>
 *        <p>The event-driven plugins that are executed whenever they receive
 *        an event. These plugins can also produce events. A typical use of
 *        these plugins are plugins handling user's interaction with the UI or
 *        plugins computing statistics of the current situation on the
 *        battlefield.</p>
 * @param {Settings} settings Settings object. The class usually uses the
 *        global instance, but it is possible to pass a custom settings object
 *        for debugging and/or testing purposes.
 */
GamePlay = function (plugins, settings) {
    var thread, threadInterval, scheduledPlugins, lastTick, tickOverflow,
            eventDeliveryPlugin;
    
    // --------------------- background thread logic --------------------------
    
    thread = function () {
        var i, j, now, tickCount;
        now = (new Date()).getTime();
        tickCount = (now - lastTick) / settings.tickDuration + tickOverflow;
        tickOverflow = tickCount - Math.floor(tickCount);
        lastTick = now;
        for (i = Math.min(tickCount, settings.maxTicks); i--;) {
            for (j = scheduledPlugins.length; j--;) {
                scheduledPlugins[j].handleTick();
            }
        }
    };
    
    // --------------------- event delivery plugin ----------------------------
    
    (function () {
        var PluginConstructor;
        
        PluginConstructor = function () {
            this.handleTick = function () {
                // TODO
            };
        };
        PluginConstructor.prototype = new ScheduledPlugin();
        
        eventDeliveryPlugin = new PluginConstructor();
    }())
    
    // -------------------------- public API ----------------------------------
    
    this.sendEvent = function (eventName, eventData) {
        // TODO
    };
    
    this.start = function () {
        lastTick = (new Date()).getTime();
        tickOverflow = 0;
        // TODO: start
    };
    
    this.stop = function () {
        // TODO: stop
    };
    
    // -------------------------- constructor ---------------------------------
    
    scheduledPlugins = []; // TODO: initialize
    scheduledPlugins.push(eventDeliveryPlugin);
};
