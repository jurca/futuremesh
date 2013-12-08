"use strict";
var Benchmark;

/**
 * The Benchmark plugin is a simple game thread performance bechmark, measuring
 * the average FPS over a 10 seconds interval and then alerting the result.
 * This plug-in is meant only for debugging and profiling use.
 *
 * @constructor
 */
Benchmark = function () {
    /**
     * ID of the timeout scheduling the start of the bechmarking.
     *
     * @type Number
     */
    var scheduledStart,

    /**
     * The frames rendered during the benchmarking interval.
     *
     * @type Number
     */
    ticks,

    /**
     * <code>true</code> if the bechmark is counting the rendered frames.
     *
     * @type boolean
     */
    benchmarking;

    /**
     * Constructor.
     */
    (function () {
        scheduledStart = null;
        ticks = 0;
        benchmarking = false;
    }.call(this));

    // override
    this.handleTick = function () {
        if (benchmarking) {
            ticks++;
        }
        if (scheduledStart) {
            return;
        }
        scheduledStart = setTimeout(function () {
            benchmarking = true;
            setTimeout(function () {
                benchmarking = false;
                alert(ticks / 10);
            }, 10000);
        }, 10000);
        ticks++;
    };

    // override
    this.ignoresExtraTicks = function () {
        return true; // the renderer ignored extra ticks too
    };
};
Benchmark.prototype = new ScheduledPlugin();
