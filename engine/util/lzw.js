"use strict";
var LZW;

/**
 * LZW encoder/decoder. Implements the LZW lossless data compression algorithm:
 * http://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Welch
 */
LZW = function () {
    /**
     * Encodes the input data string using the LZW algorithm.
     * 
     * @param {String} string The data to be encoded.
     * @return {String} LZW-encoded string.
     */
    this.encode = function (string) {
        var dictionary, data, output, character, phrase, code, i, length;
        dictionary = {};
        data = string.split('');
        output = [];
        phrase = data[0];
        code = 256;
        length = data.length;
        for (i = 1; i < length; i++) {
            character = data[i];
            if (dictionary[phrase + character]) {
                phrase += character;
            } else {
                output.push(phrase.length > 1 ? dictionary[phrase] :
                        phrase.charCodeAt(0));
                dictionary[phrase + character] = code++;
                phrase = character;
            }
        }
        output.push(phrase.length > 1 ? dictionary[phrase] :
                phrase.charCodeAt(0));
        for (i = length; i--;) {
            output[i] = String.fromCharCode(output[i]);
        }
        return output.join('');
    };
    
    /**
     * Decodes an LZW-encoded data string.
     * 
     * @param {String} string LZW-encoded string.
     * @return {String} The string that was originally encoded by the LZW
     *         algorithm.
     */
    this.decode = function (string) {
        var dictionary, data, character, oldPhrase, output, code, phrase, i,
                length, charCode;
        dictionary = {};
        data = string.split('');
        character = data[0];
        oldPhrase = character;
        output = [character];
        code = 256;
        length = data.length;
        for (i = 1; i < length; i++) {
            charCode = data[i].charCodeAt(0);
            if (charCode < 256) {
                phrase = data[i];
            } else {
                phrase = dictionary[charCode] || (oldPhrase + character);
            }
            output.push(phrase);
            character = phrase.charAt(0);
            dictionary[code++] = oldPhrase + character;
            oldPhrase = phrase;
        }
        return output.join('');
    };
};
