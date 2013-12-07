"use strict";
var AdvancedUIPlugin;

/**
 * The Advanced UI Plugin is an extension of the UI plugin that enables
 * declaratice creation of event handles for specific events. An event handler
 * is a function with name matching the <code>/^on[A-Z][a-zA-Z]*$/</code>
 * regular expression, e.g. <code>onStart</code>.
 *
 * <p>The <code>AdvancedUIPlugin</code> class implements the
 * <code>getObservedEvents()</code> and <code>handleEvent(name, data)</code>
 * methods using a reflective code that uses the defined event handlers.</p>
 *
 * <p>An example plugin is shown below:</p>
 *
 * <pre>
 * var ExamplePlugin;
 *
 * ExamplePlugin = function () {
 *     this.onStart = function () {
 *         alert("start event delivered!");
 *     };
 *
 *     this.onStop = function () {
 *         alert("stop event delivered!");
 *     };
 * };
 * ExamplePlugin.prototype = new AdvancedUIPlugin();
 * </pre>
 *
 * Please note that the plug-in extending this class must still implement the
 * <code>renderFrame()</code> method defined by the <code>ScheduledPlugin</code>
 * class.
 */
AdvancedUIPlugin = function () {
    // override
    this.getObservedEvents = function () {
        var events, i;
        events = [];

        for (i in this) {
            if (this[i] instanceof Function) {
                if (/^on[A-Z][a-zA-Z]*$/.test(i)) {
                    events.push(i.substring(2, 3).toLowerCase() +
                            i.substring(3));
                }
            }
        }

        return events;
    };

    // override
    this.handleEvent = function (eventName, eventData) {
        var method;
        method = 'on' + eventName.substring(0, 1).toUpperCase() +
                eventName.substring(1);
        this[method](eventData);
    };
};
AdvancedUIPlugin.prototype = new UIPlugin();
