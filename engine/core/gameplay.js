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
            eventDeliveryPlugin, eventDrivenPlugins, eventQueue,
            singleTickScheduledPlugins;

    // --------------------- background thread logic --------------------------

    thread = function () {
        var i, j, now, tickCount;
        now = (new Date()).getTime();
        tickCount = (now - lastTick) / settings.tickDuration + tickOverflow;
        tickOverflow = tickCount - Math.floor(tickCount);
        tickCount = Math.floor(tickCount);
        lastTick = now;
        for (i = Math.min(tickCount, settings.maxTicks); i--;) {
            for (j = scheduledPlugins.length; j--;) {
                scheduledPlugins[j].handleTick();
            }
        }
        for (i = singleTickScheduledPlugins.length; i--;) {
            singleTickScheduledPlugins[i].handleTick();
        }
    };

    // --------------------- event delivery plugin ----------------------------

    (function () {
        var PluginConstructor;

        /**
         * Constructor for the event delivery plugin.
         */
        PluginConstructor = function () {
            this.handleTick = function () {
                var currentEvents, i, eventListeningPlugins, j, currentEvent;
                // We create a new queue for events registered during the
                // delivery of the events in the current queue. This prevents
                // us from getting stuck in a possibly infinite loop.
                currentEvents = eventQueue;
                eventQueue = [];

                // deliver the events
                for (i = currentEvents.length; i--;) {
                    currentEvent = currentEvents[i];
                    eventListeningPlugins =
                            eventDrivenPlugins[currentEvent.name];
                    if (eventListeningPlugins) {
                        for (j = eventListeningPlugins.length; j--;) {
                            eventListeningPlugins[j].handleEvent(
                                currentEvent.name,
                                currentEvent.data
                            );
                        }
                    }
                }
            };
        };
        PluginConstructor.prototype = new ScheduledPlugin();

        eventDeliveryPlugin = new PluginConstructor();
    }())

    // -------------------------- public API ----------------------------------

    /**
     * Sends an event to plugins listening for events of the specified name.
     *
     * @param {String} eventName Name of the event to send.
     * @param {Object} eventData Any data to send with the event. Can be of any
     *        type.
     */
    this.sendEvent = function (eventName, eventData) {
        eventQueue.push({
            name: eventName,
            data: eventData
        });
    };

    /**
     * Starts the GamePlay daemon, its background thread, scheduled plugins and
     * event delivery. All event-driven plugins will receive the "start" event
     * with <code>null</code> as event data.
     */
    this.start = function () {
        if (threadInterval) {
            throw new Error('GamePlay daemon is already running');
        }
        lastTick = (new Date()).getTime();
        tickOverflow = 0;
        threadInterval = setInterval(thread, settings.tickDuration);
        this.sendEvent("start", null);
        eventDeliveryPlugin.handleTick(); // deliver the event right now
        this.sendEvent("running", null);
    };

    /**
     * Stops the GamePlay daemon, stopping the background thread, scheduled
     * plugins and event delivery. All event-driven plugins receive the "stop"
     * event with <code>null</code> as event data right before the event
     * delivery is terminated.
     */
    this.stop = function () {
        if (!threadInterval) {
            throw new Error('GamePlay daemon is not running');
        }
        clearInterval(threadInterval);
        this.sendEvent("stop", null);
        eventDeliveryPlugin.handleTick(); // deliver the event right now
        threadInterval = null;
    };

    // -------------------------- constructor ---------------------------------

    (function () {
        var i, plugin, registerEventDrivenPlugin;
        eventQueue = [];
        scheduledPlugins = [];
        singleTickScheduledPlugins = [];
        eventDrivenPlugins = {};

        /**
         * Retrieves the list of observed events from the plugin and registers
         * the plugin as a listener of all the event specified by the plugin.
         *
         * @param {EventDrivenPlugin|MixedPlugin} plugin The plugin to
         *        register as event listener.
         */
        registerEventDrivenPlugin = function (plugin) {
            var observedEvents, i, eventName;
            observedEvents = plugin.getObservedEvents();
            for (i = observedEvents.length; i--;) {
                eventName = observedEvents[i];
                if (!eventDrivenPlugins[eventName]) {
                    eventDrivenPlugins[eventName] = [];
                }
                eventDrivenPlugins[eventName].push(plugin);
            }
        };

        for (i = plugins.length; i--;) {
            plugin = plugins[i];
            plugin.setGamePlay(this);
            if (plugin instanceof ScheduledPlugin) {
                if (plugin.ignoresExtraTicks()) {
                    singleTickScheduledPlugins.push(plugin);
                } else {
                    scheduledPlugins.push(plugin);
                }
                if (plugin instanceof MixedPlugin) {
                    registerEventDrivenPlugin(plugin);
                }
            } else if (plugin instanceof EventDrivenPlugin) {
                registerEventDrivenPlugin(plugin);
            } else {
                throw new Error('The provided object ' + plugin +
                        ' is not a valid plugin');
            }
        }

        scheduledPlugins.push(eventDeliveryPlugin);
    }.call(this));
};
