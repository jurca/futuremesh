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
                    options.onload();
                    clearInterval(i);
                }
            }, 10);
        }
        duration = options.duration;
        playOffset = 0;
        runOnEnded = false;

        if (options.onended instanceof Function) {
            if (!duration) {
                throw new Error('Cannot use onended API withou duration info');
            }
            setInterval(function () {
                if (!runOnEnded && (instance.getCurrentTime() >= duration)) {
                    options.onended();
                    runOnEnded = true;
                    instance.stop();
                }
            }, 10);
        }

        this.isLoaded = function () {
            return audio.readyState == 4;
        };

        this.play = function () {
            audio.play();
            playStart = (new Date()).getTime();
            runOnEnded = false;
        };

        this.pause = function () {
            audio.pause();
            playOffset += ((new Date()).getTime() - playStart) / 1000;
        };

        this.stop = function () {
            audio.pause();
            playOffset = 0;
            audio.parentNode.removeChild(audio);
            audio = createAudio(src, options);
            container.appendChild(audio);
        };

        this.playFromStart = function () {
            this.stop();
            this.play();
        };

        this.isPaused = function () {
            return audio.paused;
        };

        this.getCurrentTime = function () {
            if (!duration) {
                throw new Error(
                        'cannot determine current time without duration info');
            }
            return playOffset + (this.isPaused() ? 0 :
                    ((new Date()).getTime() - playStart) / 1000);
        };

        this.getVolume = function () {
            return audio.volume;
        };

        this.setVolume = function (volume) {
            audio.volume = volume;
        };

        setInterval(function () {
            var s = '', i;
            for (i in audio) {
                try {
                    s += i + "\t=\t" + audio[i] + "\n";
                } catch (e) {
                    s += i + "\r=\t[well... something]\n";
                }
            }
            document.getElementsByTagName('pre')[0].innerHTML = s;
        }, 50);

        container.appendChild(audio);
    }
}());