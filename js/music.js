"use strict";
var Music;

require('audio');

/**
 * Music API - extends the Audio API with playlist and related functions
 * including fading between two songs.
 */
Music = function () {
    var playlist, playing, current, prepareSong, defaultContainer, volume,
            instance, loop, observers, notifyObservers;

    playlist = [];
    playing = false;
    current = 0;
    defaultContainer = document.body;
    volume = 1;
    instance = this;
    loop = true;
    observers = [];

    /**
     * Starts the playback of the current song.
     */
    this.play = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        playlist[current].audio.play();
        playing = true;
    };

    /**
     * Pauses the playback of the current song.
     */
    this.pause = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        playlist[current].audio.pause();
        playing = false;
    };

    /**
     * Stops the playback of the current song.
     */
    this.stop = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        playlist[current].audio.stop();
        playing = false;
    };

    /**
     * Skips the current song and starts playback of the next song. If loop is
     * enabled and current song is the last song, the playback of the first
     * song is started.
     */
    this.next = function () {
        if (!playlist.length) {
            throw new Error('cannot skip to next song of empty playlist');
        }
        this.stop();
        if (loop || ((current + 1) < playlist.length)) {
            current = (current + 1) % playlist.length;
            this.play();
        }
    };

    /**
     * Skips the current song and starts playback of the previous song. If loop
     * is enabled and current song is the first song, the playback of the last
     * song is started.
     */
    this.previous = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        this.stop();
        if (loop || current) {
            current ? --current : (current = playlist.length - 1);
            this.play();
        }
    }

    /**
     * Return true if the playback is active.
     *
     * @return {Boolean} true if the playback is active.
     */
    this.isPlaying = function () {
        return playing;
    };

    /**
     * Returns playlist ID of the current track.
     *
     * @return {Number} Playlist ID of the current track.
     */
    this.getCurrentTrack = function () {
        return current;
    };

    /**
     * Returns current playback time of the current track.
     *
     * @return {Number} Number of seconds front the start of the playback of
     *         the current song.
     */
    this.getCurrentTime = function () {
        return playlist[current].audio.getCurrentTime();
    };

    /**
     * Enables or disables loop mode. Enabled by default.
     *
     * @param {Boolean} newLoop True if the playlist should be played in a
     *        loop.
     */
    this.setLoop = function (newLoop) {
        loop = newLoop;
    }

    /**
     * Returns true if loop mode is enabled.
     *
     * @return {Boolean} true if loop mode is enabled.
     */
    this.getLoop = function () {
        return loop;
    };

    /**
     * Slowly fades the playback of one song into playback to another song.
     *
     * @param {Number} next The playlist ID of the next song to play.
     * @param {Number} speed Number of seconds how long the fade should take.
     *        This parameter is optional, default value is 0.5 seconds.
     * @param {Function} way Fade progress function - changes the shape of the
     *        curve of volume change. This parameter is optional, default value
     *        is a linear function: function (x) { return x; }.
     */
    this.fadeToSong = function (next, speed, way) {
        var start, interval;
        if (!playlist[next]) {
            throw new Error('song of this index is not in playlist');
        }
        if (next == current) {
            throw new Error('cannot fade to the same song');
        }
        if (!(way instanceof Function)) {
            way = function (x) {
                return x;
            };
        }
        if (!speed) {
            speed = 0.5;
        }
        speed *= 1000;
        start = (new Date()).getTime();
        playlist[next].audio.setVolume(0);
        playlist[next].audio.play();
        interval = setInterval(function () {
            var offset;
            offset = (new Date()).getTime() - start;
            offset = offset > speed ? speed : offset;
            offset = way(offset / speed);
            playlist[current].audio.setVolume(volume * (1 - offset));
            playlist[next].audio.setVolume(volume * offset);
            if (offset >= 1) {
                playlist[current].audio.stop();
                clearInterval(interval);
                current = next;
            }
        }, 10);
    };

    /**
     * Sets the new playlist. Playlist should be presented in a form of a array
     * of object where each object contains details about each song in the
     * playlist (source files, duration).
     *
     * @param {Array} newPlaylist Array of objects representing individual
     *        songs in the playlist. Each object should have these properties:
     *        <ul>
     *          <li>src - Array of strings containing paths to files of the
     *              same audio in various audio formats.</li>
     *          <li>duration - duration of the song in seconds</li>
     *        </ul>
     */
    this.setPlaylist = function (newPlaylist) {
        var i;
        if (!(newPlaylist instanceof Array)) {
            throw new Error('Playlist has to be an array');
        }
        playlist = newPlaylist;
        for (i = playlist.length; i--;) {
            prepareSong(playlist[i]);
        }
    };

    /**
     * Adds new song to the end of the playlist.
     *
     * @param {Object} song The song to be added. It should be represented
     *        as an object with these properties:
     *        <ul>
     *          <li>src - Array of strings containing paths to files of the
     *              same audio in various audio formats.</li>
     *          <li>duration - duration of the song in seconds</li>
     *        </ul>
     */
    this.appendSong = function (song) {
        prepareSong(song);
        playlist.push(song);
    };

    /**
     * Sets the default container for the audio HTML elements used by Audio
     * API.
     *
     * @param {HTMLElement} container The container which will contain the new
     *        audio HTML elements by default.
     */
    this.setContainer = function (container) {
        defaultContainer = container;
    };

    /**
     * Sets new playback volume. The new volume will be applied to all songs.
     *
     * @param {Number} newVolume The new volume represented as a Number from
     *        interval [0,1]
     */
    this.setVolume = function (newVolume) {
        var i;
        volume = newVolume;
        for (i = playlist.length; i--;) {
            playlist[i].audio.setVolume(volume);
        }
    };

    /**
     * Adds an observer of the loading progress. This should be used
     * <strong>before</strong> using the setPlaylist or appendSong methods.
     *
     * @param {Function} observer The observing function. This function will
     *        be invoked every time the loading progresses, receiving the
     *        progress in a form of a Number from interval [0,1].
     */
    this.addLoadingObserver = function (observer) {
        if (!(observer instanceof Function)) {
            throw new Error('observer has to be a function');
        }
        observers.push(observer);
    };

    /**
     * Executes all registered loading observing functions, while passing the
     * current loading progress in a form of a Number from interval [0,1] as a
     * single parameter.
     */
    notifyObservers = function () {
        var i, count;
        count = 0;
        for (i = playlist.length; i--;) {
            count += playlist[i].loaded ? 1 : 0;
        }
        count /= playlist.length;
        for (i = observers.length; i--;) {
            observers[i](count);
        }
    };

    /**
     * Initializes and starts loading of the song to be used in the playlist.
     *
     * @param {Object} song The song to be added. It should be represented
     *        as an object with these properties:
     *        <ul>
     *          <li>src - Array of strings containing paths to files of the
     *              same audio in various audio formats.</li>
     *          <li>duration - duration of the song in seconds</li>
     *        </ul>
     */
    prepareSong = function (song) {
        song.loaded = false;
        song.audio = new Audio(song.src, {
            duration: song.duration,
            container: defaultContainer,
            volume: volume,
            onload: function () {
                song.loaded = true;
                notifyObservers();
            },
            onended: function () {
                instance.next();
            }
        });
    };
};