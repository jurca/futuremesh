"use strict";
var Colorifier;

/**
 * Image processor that can generate images of player's buildings and units
 * from universal images by shifting specified colors to the player's own
 * color while preserving gradients.
 */
Colorifier = function () {
    var processData, decodeColor, getDistance, getTargetColor;
    
    Player.createGenericPlayers();
    
    /**
     * Generates colorized images for all defined players.
     * 
     * @param {Image} image Source image.
     * @param {String} source Color that will be changed.
     * @param {Number} maxDistance The maximum distance from the source color
     *        of color that will be repainted.
     * @return {Array} Array of canvas elements containing recolored images.
     */
    this.colorifyForPlayers = function (image, source, maxDistance) {
        var images, player, i;
        images = [];
        for (i = 0; player = Player.getPlayer(i++);) {
            images.push(this.colorify(image, source, player.color,
                    maxDistance));
        }
        return images;
    };
    
    /**
     * Generates a image colorized by the target color while preserving the
     * gradients.
     * 
     * @param {Image} image Source image.
     * @param {String} source Color that will be repainted.
     * @param {String} target The color which will be used to repaint the
     *        image.
     * @param {Number} maxDistance The maximum distance from the source color
     *        of color that will be repainted.
     * @return {HTMLCanvasElement} Canvas element containing the repainted
     *         image.
     */
    this.colorify = function (image, source, target, maxDistance) {
        var canvas, context, data;
        canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        data = context.getImageData(0, 0, image.width - 1, image.height - 1);
        processData(data, decodeColor(source), decodeColor(target),
                maxDistance);
        context.putImageData(data, 0, 0);
        return canvas;
    };
    
    processData = function (pixelData, source, target, maxDistance) {
        var data, i, r, g, b, length, distance, newColor;
        data = pixelData.data;
        length = data.length;
        for (i = 0; i < length; i += 4) {
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            distance = getDistance(r, g, b, source.r, source.g, source.b);
            if (distance <= maxDistance) {
                newColor = getTargetColor(source, {
                    r: r,
                    g: g,
                    b: b
                }, target);
                data[i] = newColor.r;
                data[i + 1] = newColor.g;
                data[i + 2] = newColor.b;
            }
        }
    };
    
    getTargetColor = function (source, pixel, target) {
        var rd, gd, bd;
        rd = target.r - source.r;
        gd = target.g - source.g;
        bd = target.b - source.b;
        return {
            r: Math.max(0, Math.min(255, pixel.r + rd)),
            g: Math.max(0, Math.min(255, pixel.g + gd)),
            b: Math.max(0, Math.min(255, pixel.b + bd))
        };
    };
    
    getDistance = function (r1, g1, b1, r2, g2, b2) {
        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) +
                Math.pow(b1 - b2, 2));
    };
    
    decodeColor = function (color) {
        color = color.length == 7 ? color.substring(1) : color;
        return {
            r: parseInt(color.substring(0, 2), 16),
            g: parseInt(color.substring(2, 4), 16),
            b: parseInt(color.substring(4, 6), 16)
        };
    };
};
