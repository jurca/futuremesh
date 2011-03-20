var Music;

require('audio');

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

    this.play = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        playlist[current].audio.play();
        playing = true;
    };
    
    this.pause = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        playlist[current].audio.pause();
        playing = false;
    };

    this.stop = function () {
        if (!playlist.length) {
            throw new Error('Cannot play empty playlist');
        }
        playlist[current].audio.stop();
        playing = false;
    };

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

    this.isPlaying = function () {
        return playing;
    };

    this.getCurrentTrack = function () {
        return current;
    };

    this.getCurrentTime = function () {
        return playlist[current].audio.getCurrentTime();
    };
    
    this.setLoop = function (newLoop) {
        loop = newLoop;
    }

    this.getLoop = function () {
        return loop;
    };

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

    this.appendSong = function (song) {
        prepareSong(song);
        playlist.push(song);
    };

    this.setContainer = function (container) {
        defaultContainer = container;
    };

    this.setVolume = function (newVolume) {
        var i;
        volume = newVolume;
        for (i = playlist.length; i--;) {
            playlist[i].audio.setVolume(volume);
        }
    };

    this.addLoadingObserver = function (observer) {
        if (!(observer instanceof Function)) {
            throw new Error('observer has to be a function');
        }
        observers.push(observer);
    };

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