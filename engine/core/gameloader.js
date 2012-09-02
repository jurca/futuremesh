"use strict";
var GameLoader;

/**
 * Loader utility for loading all necessary game data and initializing the game
 * itself. The loader only initializes itself within the constructor. The
 * loading process is started using the load() method.
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
            setProgress, backgroundMusic, map;
    
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
            performNextStep();
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
                    true);
            xhr.send(null);
        },
        function () { // initialize UI
            performNextStep();
        },
        function () { // hide loading page, display gameplay page, start engine
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
        "Initializing battle interface...",
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
