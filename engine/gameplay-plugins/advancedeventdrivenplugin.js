"use strict";
var AdvancedEventDrivenPlugin;

/**
 * The Advanced Event-Driven Plugin is an extension of Event-Drive Plugin that
 * enables declaratice creation of event handles for specific events. An event
 * handler is a function with name matching the
 * <code>/^on[A-Z][a-zA-Z]*$/</code> regular expression, e.g.
 * <code>onStart</code>.
 * 
 * <p>The <code>AdvancedEventDrivenPlugin</code> class implements the
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
 * ExamplePlugin.prototype = new AdvancedEventDrivenPlugin();
 * </pre> 
 */
AdvancedEventDrivenPlugin = function () {
    this.getObservedEvents = function () {
        var events, i, eventName;
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
    
    this.handleEvent = function (eventName, eventData) {
        var method;
        method = 'on' + eventName.substring(0, 1).toUpperCase() +
                eventName.substring(1);
        this[method](eventData);
    };
};
AdvancedEventDrivenPlugin.prototype = new EventDrivenPlugin();
