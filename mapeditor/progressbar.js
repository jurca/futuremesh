var Progressbar;

/**
 * Progressbar UI component. Creates and HTML node of progressbar with API for
 * setting the progressbar's value.
 * 
 * @param {Number} value The value the progressbar should have by default.
 *        Should be a number from range 0-100.
 */
Progressbar = function (value) {
    var outer, inner, progress;
    
    outer = document.createElement('div');
    outer.className = 'progressbar';
    
    inner = document.createElement('div');
    outer.appendChild(inner);
    
    progress = document.createElement('div');
    inner.appendChild(progress);
    
    /**
     * Sets current value of the progressbar.
     * 
     * @param {Number} value Value to be set to progressbar. Should be a number
     *        from range 0-100.
     */
    outer.setValue = function (value) {
        progress.style.width = value + '%';
    };
    
    outer.setValue(value);
    
    return outer;
};
