var Audio;

Audio = (function () {
    var defaultContainer, getExtension, createAudio;

    defaultContainer = false;

    Audio.setDefaultContainer = function (container) {
        defaultContainer = container
    };

    getExtension = function (path) {
        return path.substring(path.lastIndexOf('.') + 1).toLowerCase();
    };

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

    return function (src, options) {
        var audio, i, runOnEnded, container;
        if (!defaultContainer) {
            defaultContainer = document.body;
        }
        container = options.container ? options.container : defaultContainer;
        audio = createAudio(src, options);
        if (options.onload instanceof Function) {
            i = setInterval(function () {
                if (audio.readyState == 4) {
                    options.onload();
                    clearInterval(i);
                }
            }, 10);
        }
        runOnEnded = false;
        if (options.onended instanceof Function) {
            setInterval(function () {
                var tmp;
                if (audio.ended && !runOnEnded) {
                    runOnEnded = true;
                    if (isNaN(audio.duration)) {
                        options.onended();
                    } else {
                        tmp = setInterval(function () {
                            options.onended();
                            clearInterval(tmp);
                            audio.parentNode.removeChild(audio);
                            audio = createAudio(src, options);
                            container.appendChild(audio);
                        }, 12000);
                    }
                }
            }, 10);
        }

        this.isLoaded = function () {
            return audio.readyState == 4;
        };

        this.play = function () {
            audio.play();
            runOnEnded = false;
        };

        this.pause = function () {
            audio.pause();
        };

        this.getCurrentTime = function () {
            return audio.currentTime;
        };

        this.getVolume = function () {
            return audio.volume;
        };

        this.setVolume = function (volume) {
            audio.volume = volume;
        };

        container.appendChild(audio);
    }
}());