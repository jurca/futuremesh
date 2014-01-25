"use strict";
var SpriteLoader;

/**
 * The SpriteLoader is a highly-efficient alternative to the ImageLoader class.
 * The SpriteLoader loads all images using two HTTP requests:
 *
 * <ol>
 *     <li>data/images.png - a sprite containing all unit, building and tile
 *         images.</li>
 *     <li>data/sprite.json - a helping index file easing the process of
 *         extraction of the tile, building and unit images from the loaded
 *         sprite image.</li>
 * </ol>
 *
 * The SpriteLoader then processes the loaded sprite, extract the images and
 * uses the Colorifier utility to create variants for each side.
 */
SpriteLoader = function () {
    var observers, notifyObservers, loadSprite, indexes, getBaseURL, canvas,
            context, baseUrl, extractTiles, tileWidth, tileHeight,
            extractImage, extractUnits, extractBuildings, colorifier;

    observers = [];
    colorifier = new Colorifier();

    /**
     * Add a new observer of the loading process. The loader executes all
     * registered observers every time the loading process progresses. An
     * observer is a single-argument function. The loader sets this argument
     * to a floating-point number representing the current process, 0 being
     * the start, 1 meaning finished. The argument may be alternatively set to
     * -1 to indicate an error.
     *
     * @param {Function} observer Loading progress observer.
     */
    this.addObserver = function (observer) {
        if (observer instanceof Function) {
            observers.push(observer);
        }
    };

    /**
     * Initializes the loading process. The SpriteLoader loads first the index
     * file, then loads the sprite, then extracts all images from the sprite
     * and uses the Colorifier to finish the process.
     *
     * <p>The loader executes the registered loading process observers each
     * time the process progresses.</p>
     *
     * @see #addObserver({Function} observer)
     */
    this.load = function () {
        var xhr, time;
        tileWidth = Math.ceil(Settings.tileWidth);
        tileHeight = Math.ceil(Settings.tileHeight);
        baseUrl = baseUrl || getBaseURL();
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    notifyObservers(0.2);
                    try {
                        indexes = JSON.parse(xhr.responseText);
                        loadSprite();
                    } catch (e) {
                        notifyObservers(-1);
                    }
                } else {
                    notifyObservers(-1);
                }
            }
        };
        time = (new Date()).getTime();
        xhr.open('GET', baseUrl + 'data/sprite.json?time=' + time, true);
        xhr.send(null);
    };

    /**
     * Loads the sprite containing all images. The progress is set to 0.7 upon
     * completion and the loader continues then with extracting tile images.
     */
    loadSprite = function () {
        var image;
        image = new Image();
        image.onload = function () {
            canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            notifyObservers(0.7);
            setTimeout(extractTiles, 0);
        };
        image.onabort = function () {
            notifyObservers(-1);
        };
        image.onerror = function () {
            notifyObservers(-1);
        };
        image.onstalled = function () {
            notifyObservers(-1);
        }
        image.onsuspend = function () {
            notifyObservers(-1);
        }
        image.src = baseUrl + 'data/images.png?time=' + (new Date()).getTime();
    };

    /**
     * Extracts tile images from the loaded sprite. The progress is set to 0.8
     * upon completion. The loader extracts unit images during the next step.
     */
    extractTiles = function () {
        var i, tile;
        for (i = 0; tile = TilesDefinition.getType(i); i++) {
            tile.imageData = extractImage(tileWidth * i, 0, tileWidth,
                    tileHeight);
        }
        notifyObservers(0.8);
        setTimeout(extractUnits, 0);
    };

    /**
     * Extracts unit images from the loaded sprite and colorifies them. The
     * progress is set to 0.9 upon completion. The loader extracts building
     * images during the next step.
     */
    extractUnits = function () {
        var i, j, unit, start;
        start = indexes.unitsStart;
        for (i = 0; unit = UnitsDefinition.getType(i); i++) {
            unit.imageData = [];
            unit.playerImages = []
            for (j = 0; j < 8; j++) {
                unit.imageData.push(extractImage(j * tileWidth,
                        start + i * tileHeight, tileWidth, tileHeight));
                unit.playerImages.push(colorifier.colorifyForPlayers(
                        unit.imageData[j], unit.colorify,
                        unit.colorifyDistance));
            }
        }
        notifyObservers(0.9);
        setTimeout(extractBuildings, 0);
    };

    /**
     * Extracts building images from the loaded sprite and colorifies them. The
     * progress is set to 1 upon completion (the loading process has finished).
     */
    extractBuildings = function () {
        var i, building, starts, heights, startY, startX;
        starts = indexes.buildings.ends;
        starts.unshift(0);
        heights = indexes.buildings.heights;
        startX = 0;
        startY = indexes.buildings.start;
        for (i = 0; building = BuildingsDefinition.getType(i); i++) {
            startX += starts[i];
            building.imageData = extractImage(startX, startY,
                    starts[i + 1], heights[i]);
            building.playerImages = colorifier.colorifyForPlayers(
                    building.imageData, building.colorify,
                    building.colorifyDistance);
        }
        notifyObservers(1);
    };

    /**
     * Extracts sub-image from the loaded sprite image.
     *
     * @param {Number} x The X-coordinate of the left top corner of the
     *        extracted image within the sprite image.
     * @param {Number} y The Y-coordinate of the left top cornenr of the
     *        extracted image within the sprite image.
     * @param {Number} width Width of the extracted image.
     * @param {Number} height Height of the extracted image.
     * @return {Image} Extracted image.
     */
    extractImage = function (x, y, width, height) {
        var imageCanvas, image;
        imageCanvas = document.createElement('canvas');
        imageCanvas.width = width;
        imageCanvas.height = height;
        imageCanvas.getContext('2d').putImageData(
                context.getImageData(x, y, width, height), 0, 0);
        image = new Image();
        image.src = imageCanvas.toDataURL();
        return image;
    };

    /**
     * Attempts to auto-detect the base URL of the whole application for
     * setting the correct URLs of the sprite and index file. The method
     * requires a script tag within the current document pointing to this file
     * (no compressed alternative).
     *
     * @return {String} Detected base URL or an empty string if the
     *         autodetection fails.
     */
    getBaseURL = function () {
        var scripts, i, url;
        scripts = document.getElementsByTagName('script');
        for (i = scripts.length; i--;) {
            if (scripts[i].src.match(/^.*spriteloader[.]js/)) {
                url = scripts[i].src;
                url = url.substring(0, url.indexOf('futuremesh.js'));
                url = url.replace(/js\/$/, '');
                return url;
            }
        }
        return '';
    };

    /**
     * Executes all progress observers and passes them the provided argument.
     *
     * @param {Number} progress Current loading progress. Should be a
     *        floating-point number within the range [0, 1], or -1.
     */
    notifyObservers = function (progress) {
        var i;
        for (i = observers.length; i--;) {
            observers[i](progress);
        }
    };
};
