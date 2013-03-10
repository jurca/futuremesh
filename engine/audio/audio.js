"use strict";

(function () {
    var Audio, defaultContainer, getExtension, createAudio;

    defaultContainer = false;

    /**
     * Returns the lowercase extension of the filename in the provided path.
     *
     * @param {String} path The path to the file of which extension should be
     *        returned.
     */
    getExtension = function (path) {
        return path.substring(path.lastIndexOf('.') + 1).toLowerCase();
    };

    /**
     * Creates a new audio HTML element according to the settings.
     *
     * @param {Array} src List of strings containing paths to files of the same
     *        audio in various audio formats.
     * @param {Object} options Audio options. Properties are:
     *        <ul>
     *          <li>volume - Number from range [0, 1] specifying the audio
     *              volume</li>
     *          <li>controls - when set and set to value that evaluates as true
     *              the audio element will display controls provided by the
     *              browser</li>
     *          <li>loop - <code>true</code> if the audio should be looped by
     *              the browser (requires native support on the browser).</li>
     *        </ul>
     *        Other options properties are used by the constructor and are
     *        irrelevant here.
     */
    createAudio = function (src, options) {
        var audio, source, i;
        if (typeof src == 'string') {
            src = [src];
        }
        audio = document.createElement('audio');
        audio.volume = options.volume !== undefined ? options.volume : 1;
        audio.setAttribute('preload', 'auto');
        if (options.controls) {
            audio.setAttribute('controls', 'controls');
        }
        audio.autobuffer = true;
        if (options.loop) {
            audio.loop = true;
        }
        for (i = src.length; i--;) {
            source = document.createElement('source');
            source.setAttribute('type', 'audio/' +
                    (getExtension[src[i]] == 'ogg' ? 'ogg' : 'mpeg'));
            source.setAttribute('src', src[i]);
            audio.appendChild(source);
        }
        audio.load();
        return audio;
    };

    /**
     * Audio API library. Uses HTML5 browser's capabilities to create a simple
     * API for using ogg/mp3 audio files.
     *
     * The constructor of the Audio object will create an audio HTML5 element
     * with specified sources set accordingly to the values of the provided
     * options object.
     *
     * @constructor
     * @param {Array} src List of strings containing paths to files of the same
     *        audio in various audio formats.
     * @param {Object} options Audio options. Properties are:
     *        <ul>
     *          <li>volume - Number from range [0, 1] specifying the audio
     *              volume.</li>
     *          <li>controls - When set and set to value that evaluates as true
     *              the audio element will display controls provided by the
     *              browser.</li>
     *          <li>container - The container for the audio HTML element. If
     *              not set, default container will be used. If default
     *              container has not been set, the body element is used.</li>
     *          <li>duration - Number specifying the audio lenght in
     *              seconds. Required by the onended option.</li>
     *          <li>onload - Function that should be executed once the audio
     *              has been loaded and is ready for playback.</li>
     *          <li>onended - Function that should be executed once the audio
     *              playback has finished. This requires the duration property
     *              to be set.</li>
     *          <li>loop - <code>true</code> if the audio should be looped by
     *              the browser (requires native support on the browser).</li>
     *        </ul>
     */
    Audio = function (src, options) {
        var audio, i, runOnEnded, container, duration, playOffset, playStart,
                instance;
        instance = this;
        if (!defaultContainer) {
            defaultContainer = document.body;
        }
        container = options.container ? options.container : defaultContainer;
        audio = createAudio(src, options);
        if (options.onload instanceof Function) {
            i = setInterval(function () {
                if (audio.readyState == 4) {
                    clearInterval(i);
                    options.onload();
                }
            }, 10);
        }
        duration = options.duration;
        playOffset = 0;
        runOnEnded = false;

        if (options.onended instanceof Function) {
            if (!duration) {
                throw new Error('Cannot use onended without duration info');
            }
            setInterval(function () {
                if (!runOnEnded && (instance.getCurrentTime() >= duration)) {
                    runOnEnded = true;
                    instance.stop();
                    options.onended();
                }
            }, 10);
        }

        /**
         * Returns true if the audio has been loaded, false otherwise.
         *
         * @return {Boolean} True if the audio has been loaded, false
         *         otherwise.
         */
        this.isLoaded = function () {
            return audio.readyState == 4;
        };

        /**
         * Starts the playback of the audio. If the audio has been paused, the
         * playback is resumed.
         */
        this.play = function () {
            audio.play();
            playStart = (new Date()).getTime();
            runOnEnded = false;
        };

        /**
         * Pauses the current playback of the audio.
         */
        this.pause = function () {
            audio.pause();
            playOffset += ((new Date()).getTime() - playStart) / 1000;
        };

        /**
         * Stops the audio playback and resets the audio element. Starting the
         * playback will make the audio play from the beggining.
         */
        this.stop = function () {
            audio.pause();
            playOffset = 0;
            audio.parentNode.removeChild(audio);
            audio = createAudio(src, options);
            container.appendChild(audio);
        };

        /**
         * Plays the audio from the beggining, even if the playback has already
         * begun before.
         */
        this.playFromStart = function () {
            this.stop();
            this.play();
        };

        /**
         * Returns true if the playback is paused or has not started yet.
         *
         * @return {Boolean} True if the playback is paused or has not started
         *         yet.
         */
        this.isPaused = function () {
            return audio.paused;
        };

        /**
         * Returns the current playback position as a number of seconds played
         * from the beggining.
         *
         * @return {Number} The current playback position.
         */
        this.getCurrentTime = function () {
            if (!duration) {
                throw new Error(
                        'cannot determine current time without duration info');
            }
            return playOffset + (this.isPaused() ? 0 :
                    ((new Date()).getTime() - playStart) / 1000);
        };

        /**
         * Returns current volume level as a Number from the interval [0,1].
         *
         * @return {Number} Current volume level represented as a Number from
         *         the interval [0,1]
         */
        this.getVolume = function () {
            return audio.volume;
        };

        /**
         * Sets the volume level.
         *
         * @param {Number} volume The new volume level represented as a number
         *        from the interval [0,1].
         */
        this.setVolume = function (volume) {
            audio.volume = volume;
        };

        container.appendChild(audio);
    };

    /**
     * Sets the default container for the audio HTML elements.
     *
     * @param {HTMLElement} container The container which will contain the new
     *        audio HTML elements by default
     */
    Audio.setDefaultContainer = function (container) {
        defaultContainer = container;
    };

    window.Audio = Audio;
}());