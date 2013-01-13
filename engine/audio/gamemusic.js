"use strict";
var GameMusic;

/**
 * GameMusic is a music daemon playing game background music of various
 * intensity. The daemon mantains multiple music playlists, each marked by the
 * target game play intensity (a number from 0 to 1 inclusive) and fades the
 * another music playlist whenever the game play intensity changes enough.
 * 
 * <p>The changes between playlists and songs within playlist happen with
 * cross-fading. The change of playlist makes the playlist start at random
 * song.</p>
 * 
 * <p>The daemon loads all its configuration and playlists from the global
 * Settings class.</p>
 * 
 * <p>Note that the daemon starts loading the game music the moment its
 * instance is constructed.</p>
 */
GameMusic = function () {
    // -------------------- private field definitions -------------------------
    
    /**
     * The playlists of game music organized as object. Each property name is
     * the playlist's target game play intensity - a number from the range
     * [0, 1]. Each playlist is an Array of Audio instances.
     * 
     * @type Object
     */
    var playlists,
    
    /**
     * The duration of cross-fading between songs and playlists in
     * milliseconds.
     * 
     * @type Number
     */
    fadeDuration,
    
    /**
     * The current game play intensity. Specifies also the approximate
     * intensity of the currently played music. The intensity is specified as a
     * number from range [0, 1].
     * 
     * @type Number
     */
    intensity,
    
    /**
     * The number of the currently played song the of current playlist. The
     * songs of a playlist are numbered from 0.
     * 
     * @type Number
     */
    song,
    
    /**
     * The volume of the played music, specified as a number within the range
     * [0, 1]
     * 
     * @type Number
     */
    volume,
    
    /**
     * An object representing map of songs' durations. Each property name is a
     * playlist intensity. Each property is an array of numbers. Each number
     * is duration of the song in milliseconds (the song is identified by the
     * playlist intesity and index of the song in the playlist array).
     * 
     * <p>Note: the specified duration does not have to be accurate with
     * millisecond precision becouse slight errors will be hidden by song
     * cross-fading.</p>
     * 
     * @type Object
     */
    songDurations,
    
    /**
     * An object representing map of loaded songs. Each property name is a
     * playlist intensity. Each property is an array of Booleans. Each boolean
     * is set to true if the song has been loaded already, or false if the song
     * is still being loaded.
     * 
     * @type Object
     */
    loadedSongs,
    
    /**
     * A boolean flag signalling whether all songs has been loaded yet. The
     * flag is set to true if all songs have been already loaded. The flag is
     * set to false otherwise.
     * 
     * @type Boolean
     */
    loaded,
    
    /**
     * An array of registered loading process observers. Each registered
     * observer is executed every time a song has finished loading itself. Each
     * observer is a single-parameter function. The parameter is set to the
     * current loading progress represented as a number withing [0, 1].
     * 
     * @type Array
     */
    loadingObservers,
    
    /**
     * A Boolean flag signifying whether the daemon is playing any music. This
     * flag is used to prevent multiple songs playing at the same time by
     * repeatedly invoking the public play() method.
     * 
     * @type Boolean
     */
    playing,
    
    /**
     * Identifier of the currently registered timeout callback for performing
     * the cross-fade efect between songs.
     * 
     * @type Number
     */
    crossFadeTimeout,
    
    /**
     * Boolean flag used for synchronization of cross-fade timeout callback
     * registrations. This flag prevents registering a cross-fade effect while
     * another cross-fade effect is active.
     *
     * @type Boolean
     */
    crossFading;
    
    // -------------------------- private methods -----------------------------
    
    /**
     * Finds the closest intensity (a number within range [0, 1]) to the
     * specified intensity for which exists a playlist of songs.
     * 
     * @param {Number} wantedIntensity
     * @return {Number} The closes intensity to the wantedIntesity for which
     *         exists a playlist.
     */
    function findIntensity(wantedIntensity) {
        var playlistIntensity, bestIntensity;
        bestIntensity = 0;
        for (playlistIntensity in playlists) {
            if (!playlists.hasOwnProperty(playlistIntensity)) {
                continue;
            }
            if (Math.abs(wantedIntensity - playlistIntensity) <
                    Math.abs(wantedIntensity - bestIntensity)) {
                bestIntensity = playlistIntensity;
            }
        }
        return bestIntensity;
    }
    
    /**
     * Prepares intervals and timeouts performing the song cross-fade effect.
     * 
     * @param {Number} nextIntensity The intensity of the next playlist to use.
     * @param {Number} nextSong The number of the song to play from the new
     *        playlist.
     * @param {Boolean} now Set to true if the cross-fade effect should take
     *        place right now. Set to false to perform the cross-fade during
     *        the last seconds of the current song (the continious parameter
     *        has to be true).
     * @param {Boolean} continious Set to true if the method is being called
     *        when another song is already playing. This is neccessary for
     *        correct timing of the cross-fade effect. Only this method sets
     *        this parameter to true.
     */
    function prepareSongCrossFade(nextIntensity, nextSong, now, continious) {
        var interval;
        // aren't we already cross-fading to another song?
        if (crossFading) {
            // wait for the current cross-fading to finish
            interval = setInterval(function () {
                if (crossFading) {
                    return;
                }
                prepareSongCrossFade(nextIntensity, nextSong, now, continious);
                clearInterval(interval);
            }, 17); // prime number - to prevent timing collisions
            return; // we will return here later
        }
        
        // cancel the upcoming cross-fade to another song
        crossFadeTimeout && clearTimeout(crossFadeTimeout);
        
        // set up cross-fading
        crossFadeTimeout = setTimeout(function () {
            var start;
            crossFading = true; // think of this as of synchronization lock
            start = (new Date()).getTime();
            playlists[nextIntensity][nextSong].setVolume(0);
            playlists[nextIntensity][nextSong].play();
            
            interval = setInterval(function () {
                var current, progress;
                current = (new Date()).getTime();
                progress = (current - start) / fadeDuration;
                if (progress <= 1) {
                    playlists[intensity][song].
                            setVolume((1 - progress) * volume);
                    playlists[nextIntensity][nextSong].
                            setVolume(progress * volume);
                } else {
                    clearInterval(interval);
                    playlists[intensity][song].stop();
                    intensity = nextIntensity;
                    song = nextSong;
                    crossFading = false; // release the lock
                    
                    // prepare fade to next song
                    prepareSongCrossFade(intensity,
                            (song + 1) % playlists[intensity].length, false,
                            true);
                }
            }, 10);
            crossFadeTimeout = null; // the callback has been executed
        }, now ? 1 : (songDurations[intensity][song] * 1000 -
            (continious ? 2 * fadeDuration : fadeDuration)));
    }
    
    // ----------------------------- public API -------------------------------
    
    this.play = function () {
        var interval, startTime;
        if (playing) {
            throw new Error('GameMusic: Already playing music');
        }
        // select random song
        song = Math.floor(Math.random() * playlists[intensity].length);
        // start playback with a fade-in
        playlists[intensity][song].setVolume(0);
        playlists[intensity][song].play();
        startTime = (new Date()).getTime();
        interval = setInterval(function () {
            var now;
            now = (new Date()).getTime();
            if (now - startTime < fadeDuration) {
                playlists[intensity][song].
                        setVolume((now - startTime) / fadeDuration * volume);
            } else {
                playlists[intensity][song].setVolume(volume);
                clearInterval(interval);
            }
        }, 10);
        playing = true;
        prepareSongCrossFade(intensity,
                (song + 1) % playlists[intensity].length, false, false);
    };
    
    this.stop = function () {
        var interval, startTime;
        if (!playing) {
            throw new Error('GameMusic: The music is not playing');
        }
        crossFadeTimeout && clearTimeout(crossFadeTimeout);
        startTime = (new Date()).getTime();
        interval = setInterval(function () {
            var now;
            now = (new Date()).getTime();
            if (now - startTime < fadeDuration) {
                playlists[intensity][song].setVolume(
                        (1 - (now - startTime) / fadeDuration) * volume);
            } else {
                playlists[intensity][song].stop();
                clearInterval(interval);
                playing = false;
            }
        }, 10);
    };
    
    this.setIntensity = function (newIntensity) {
        if ((newIntensity < 0) || (newIntensity > 1)) {
            throw new Error(
                    'GameMusic: The intensity must be within range [0, 1]');
        }
        newIntensity = findIntensity(newIntensity);
        if (newIntensity == intensity) {
            return;
        }
        if (playing) {
            prepareSongCrossFade(newIntensity, Math.floor(
                    Math.random() * playlists[newIntensity].length), true,
                    false);
        } else { // we're not playing music right now, so set the intensity now
            intensity = newIntensity;
        }
    };
    
    /**
     * Registers an observer of the loading process. An observer is a function
     * with a single Number parameter. The game music daemon invokes the
     * observer every time a song finishes its loading process. The loading
     * progress is passed to the observer as a Number from range [0, 1].
     * 
     * <p>Note that the observer is not registered but invoked immediately if
     * all songs have been already loaded.</p>
     *
     * @param {Function} observer The loading progress observer function. The
     *        function should have a single Number parameter. The parameter is
     *        set to a value from range [0, 1] every time a song is loaded.
     */
    this.registerLoadingObserver = function (observer) {
        if (loaded) {
            observer(1);
            return;
        }
        loadingObservers.push(observer);
    };
    
    // ----------------------------- constructor ------------------------------
    
    // Initialize private fields
    playlists        = Settings.gameMusic.playlists;
    fadeDuration     = Settings.gameMusic.fadeDuration;
    volume           = Settings.gameMusic.volume;
    intensity        = findIntensity(0);
    loadedSongs      = {};
    songDurations    = {};
    loaded           = false;
    loadingObservers = [];
    playing          = false;
    
    // Constructor body. The constructor is within a closure so that the
    // instance will not contain any unneccessary fields.
    (function () {
        var playlistIntensity, playlist, i;
        
        function loadingCallback() {
            var songCount, loadedCount, playlistIntensity;
            songCount = 0;
            loadedCount = 0;
            for (playlistIntensity in playlists) {
                if (!playlists.hasOwnProperty(playlistIntensity)) {
                    continue;
                }
                songCount += playlists[playlistIntensity].length;
                playlists[playlistIntensity].forEach(function (loaded) {
                    loaded && loadedCount++;
                });
            }
            
            loadingObservers.forEach(function (observer) {
                observer(loadedCount / songCount);
            });
            
            loaded = loadedCount == songCount;
        }
        
        for (playlistIntensity in playlists) {
            if (!playlists.hasOwnProperty(playlistIntensity)) {
                continue;
            }
            playlist = playlists[playlistIntensity];
            loadedSongs[playlistIntensity] = [];
            songDurations[playlistIntensity] = [];
            for (i = playlist.length; i--;) {
                loadedSongs[playlistIntensity][i] = false;
                songDurations[playlistIntensity][i] = playlist[i].duration;
                (function (intensityIndex, songIndex) {
                    playlist[i] = new Audio(playlist[i].src, {
                        volume: volume,
                        onload: function () {
                            loadedSongs[intensityIndex][songIndex] = true;
                            loadingCallback();
                        }
                    });
                }(playlistIntensity, i));
            }
        }
    }());
};
