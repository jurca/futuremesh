"use strict";
var GameMusicPlugin;

/**
 * The GameMusicPlugin is an event-driven plugin that manages the GameMusic
 * daemon, starting and stopping the in-game music playback and changing music
 * playlists as the game's intensity changes.
 * 
 * <p>The plugin observes the following events:</p>
 * 
 * <ul>
 *     <li><code>gameMusicInitialization</code> - has a GameMusic instance as
 *         event data. This event initializes this plugin.</li>
 *     <li><code>gameIntensityChange</code> - this event occurs whenever the
 *         game's intensity changes (number of created/destroyed buildings
 *         and/or units). The event data is a number from range [0, 1] that
 *         specifies the game's intensity, where 0 is the lowest and 1 is the
 *         highest.</li>
 *     <li><code>start</code> - this event is sent by the GamePlay daemon
 *         itself when its <code>start()</code> method is invoked. This event
 *         starts the music playback if the plugin has already been initalized
 *         (does not happen at the first occurance of this event).</li>
 *     <li><code>stop</code> - this event is sent by the GamePlay daemon itself
 *         when its <code>stop()</code> method is ivoked. This event stops the
 *         music playback. This event must not be sent before this plugin is
 *         fully initialized.</li>
 * </ul>
 */
GameMusicPlugin = function () {
    var gameMusic;
    
    this.onGameMusicInitialization = function (gameMusicInstance) {
        gameMusic = gameMusicInstance;
        gameMusic.play();
    };
    
    this.onGameIntensityChange = function (newIntensity) {
        gameMusic.setIntensity(newIntensity);
    };
    
    this.onStart = function (tmp) {
        // When this event is delivered for the first time, gameMusic is not
        // set yet.
        if (gameMusic) {
            gameMusic.play();
        }
    };
    
    this.onStop = function (tmp) {
        gameMusic.stop();
    };
};
GameMusicPlugin.prototype = new AdvancedEventDrivenPlugin();
