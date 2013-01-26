"use strict";
var GameLoader;

/**
 * Loader utility for loading all necessary game data and initializing the game
 * itself. The loader only initializes itself within the constructor. The
 * loading process is started using the load() method.
 * 
 * <p>The loading and initialization process in performed in several steps:</p>
 * 
 * <ol>
 *     <li>loading of loading screen background music - The GameLoader loads
 *         the background music played during loading of in-game files and game
 *         initialization. The music playback is started immidiately once the
 *         music file is loaded.</li>
 *     <li>loading of images - The GameLoader initializes a SpriteLoader
 *         instance and uses it to load all in-game images from a single sprite
 *         file.</li>
 *     <li>loading of music - The GameLoader initializes a GameMusic instance
 *         and lets it load all in-game music files.</li>
 *     <li>map loading - The GameLoader loads the map file, decompresses it and
 *         load it into a Map instance.</li>
 *     <li>initialization of GamePlay daemon's plugins - The loader creates
 *         instances of all GamePlay daemon's plugins that are specified in the
 *         <code>Settings</code> global configuration object.</li>
 *     <li>GamePlay daemon's start - the loader starts the GamePlay daemon and
 *         sends the following events to the daemon's plugins:
 *         <ul>
 *             <li><code>gameMusicInitialization</code> - The event has the
 *                 initialized and loaded GameMusic daemon instance as its
 *                 data. Any plugin managing or affecting the in-game music
 *                 should observe this event.</li>
 *             <li><code>gameMapInitialization</code> - The event has the
 *                 Map instance containing the loaded map as its data. This
 *                 event should be observed by any plugin using the game map,
 *                 e.g. renderers and unit navigators (path finders).</li>
 *         </ul>
 *         </li>
 *     <li>switch to in-game UI - the loader fades-out the loading music, hides
 *         the loading UI and displays the in-game UI.</li>
 * </ol>
 * 
 * @param {HTMLElement} progressbarAll An HTML element containing a single HTML
 *        DIV element. This element represents a progressbar for the overall
 *        progress of the loading process.
 * @param {HTMLElement} progressbarCurrent An HTML element contraining a single
 *        HTML DIV element. This element represents a progressbar for the
 *        progress of the current loading step.
 * @param {HTMLElement} progressMessage An HTML element that is used as an
 *        container of the message discribing the current loading step.
 * @param {HTMLElement} loadingScreen An HTML element containing the whole
 *        loading screen. This element is made invisible once the loading
 *        process is finished.
 * @param {HTMLElement} gameplayScreen An HTML element containing the gameplay
 *        UI. This element is made visible once the loading process is
 *        finished.
 * @param {String} mapFileUrl URL the the file containing the gameplay map
 *        data.
 */
GameLoader = function (progressbarAll, progressbarCurrent, progressMessage,
        loadingScreen, gameplayScreen, mapFileUrl) {
    var spriteloader, steps, stepMessages, currentStep, performNextStep,
            setProgress, backgroundMusic, map, gamePlay, gameMusic, plugins;
    
    spriteloader = new SpriteLoader();
    
    steps = [
        function () { // images
            spriteloader.addObserver(function (progress) {
                if (progress < 0) {
                    throw new Error('Cannot load images');
                }
                setProgress(progress);
                if (progress == 1) {
                    performNextStep();
                }
            });
            spriteloader.load();
        },
        function () { // music
            var movedToNextStep;
            movedToNextStep = false;
            
            gameMusic = new GameMusic();
            gameMusic.registerLoadingObserver(function (progress) {
                if (progress < 0) {
                    throw new Error('Cannot load music');
                }
                setProgress(progress);
                if ((progress == 1) && !movedToNextStep) {
                    performNextStep();
                    movedToNextStep = true;
                }
            });
        },
        function () { // map
            var xhr;
            xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                var compressor;
                if (xhr.readyState != 4) {
                    return;
                }
                if (xhr.status == 200) {
                    compressor = new MapCompressor();
                    map = new Map();
                    map.importData(compressor.decompress(xhr.responseText, 3));
                    performNextStep();
                } else {
                    throw new Error('Cannot load map file: ' + mapFileUrl);
                }
            };
            xhr.open('GET', mapFileUrl + '?time=' + (new Date()).getTime(),
                    true); // add timestamp to avoid the browser's cache
            xhr.send(null);
        },
        function () { // initialize GamePlay daemon's plugins
            var i, pluginName;
            plugins = [];
            
            for (i = Settings.gamePlayPlugins.length; i--;) {
                pluginName = Settings.gamePlayPlugins[i];
                plugins.push(eval('new ' + pluginName + '()'));
                setProgress(i / Settings.gamePlayPlugins.length);
            }
            
            performNextStep();
        },
        function () { // start game engine (the GamePlay daemon)
            gamePlay = new GamePlay(plugins, Settings);
            
            // enqueue plugin initialization events
            gamePlay.sendEvent("gameMusicInitialization", gameMusic);
            gamePlay.sendEvent("gameMapInitialization", map);
            
            gamePlay.start();
            
            performNextStep();
        },
        function () { // hide loading page and display gameplay page
            var i, interval, total;
            i = 0;
            total = 75;
            interval = setInterval(function () {
                var volume;
                i++;
                volume = (1 - i / total) * Settings.loadingMusicVolume;
                backgroundMusic.setVolume(volume);
                setProgress(i / total);
                if (i == total) {
                    clearInterval(interval);
                    setTimeout(function () {
                        loadingScreen.style.display = 'none';
                        gameplayScreen.style.display = 'block';
                    }, 15);
                    backgroundMusic.stop();
                }
            }, 20);
        }
    ];
    stepMessages = [
        "Loading images...",
        "Loading music...",
        "Loading map...",
        "Initializing the battle interface...",
        "Starting command relays...",
        "Done"
    ];
    currentStep = -1;
    
    /**
     * Initiates the loading process. The loader loads the background music
     * first, the loading of game data is started after the music playback
     * begins.
     */
    this.load = function () {
        backgroundMusic = new Audio(Settings.loadingMusic, {
            volume: Settings.loadingMusicVolume,
            duration: Settings.loadingMusicLength,
            onload: function () {
                backgroundMusic.play();
                performNextStep();
            },
            onended: function () {
                backgroundMusic.playFromStart();
            }
        });
    };
    
    /**
     * Executes the next step of the loading process. The step is executed
     * after a 15ms delay, so that the browser can perform DOM reflow of the
     * progress bars.
     */
    performNextStep = function () {
        setTimeout(function () {
            currentStep++;
            setProgress(0);
            progressMessage.innerHTML = stepMessages[currentStep];
            steps[currentStep]();
        }, 15);
    };
    
    /**
     * Sets the values of the progress bars. It is necessary to specify only
     * the value of the current step progressbar, the "overall progress"
     * progressbar's value is computed automatically.
     * 
     * @param {Number} progress The progress within the current step specified
     *        as a number between 0 and 1 inclusive.
     */
    setProgress = function (progress) {
        var all;
        progressbarCurrent.getElementsByTagName('div')[0].style.width =
                (progress * 100) + '%';
        all = currentStep / steps.length * 100 +
                100 / steps.length * progress;
        progressbarAll.getElementsByTagName('div')[0].style.width = all + '%';
    };
};
