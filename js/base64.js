"use strict";
var Base64;

/**
 * Base64 encoder/decoder. Compatibility with other base64 encoders is not
 * guaranteed, but it correctly decodes whatever has been encoded by it.
 */
Base64 = function () {
    /**
     * Base64 characters. Used by the encoder/decoder to transform numbers into
     * characters and vice versa.
     */
    var keyString;
    
    keyString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
           '0123456789+/=';
    
    /**
     * Encodes string to base64 encoding.
     * 
     * @param {String} input String to be encoded.
     * @return {String} Base64 encoded input.
     */
    this.encode = function (input) {
        var output, chr1, chr2, chr3, enc1, enc2, enc3, enc4, i;
        input = escape(input);
        output = '';
        i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            isNaN(chr2) && (enc3 = enc4 = 64);
            isNaN(chr3) && (enc4 = 64);
            output += keyString.charAt(enc1) + keyString.charAt(enc2) +
                    keyString.charAt(enc3) + keyString.charAt(enc4);
        } while (i < input.length);
        return output;
    };

    /**
     * Decodes base64 encoded string to the original form. The method does not
     * check whether the provided input is correct base64 string. Decoding an
     * invalid input may produce unexpected behaviour.
     * 
     * @param {String} input Base64-encoded string. Must contain only valid
     *        base64 characters.
     * @return {String} Decoded string.
     */
    this.decode = function (input) {
        var output, chr1, chr2, chr3, enc1, enc2, enc3, enc4, i;
        i = 0;
        output = '';
        do {
            enc1 = keyString.indexOf(input.charAt(i++));
            enc2 = keyString.indexOf(input.charAt(i++));
            enc3 = keyString.indexOf(input.charAt(i++));
            enc4 = keyString.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output += String.fromCharCode(chr1);
            (enc3 != 64) && (output += String.fromCharCode(chr2));
            (enc4 != 64) && (output += String.fromCharCode(chr3));
        } while (i < input.length);
        return unescape(output);
    };
};
