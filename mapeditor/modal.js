var Modal;

/**
 * Creates an overlay over the page and places a HTML-generated modal window
 * over it. The window will be placed in the center of the page by default.
 * 
 * @param {String} title The title of the modal window.
 * @param {Boolean} closeable Optional boolean enabling the users to close the
 *        modal window by themselves. Default is false.
 */
Modal = function (title, closeable) {
    var overlay, container, titlebar, content, closeButton, instance;
    instance = this;
    
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    container = document.createElement('div');
    container.className = 'modal-window';
    
    titlebar = document.createElement('h2');
    titlebar.appendChild(document.createTextNode(title));
    container.appendChild(titlebar);
    
    content = document.createElement('div');
    container.appendChild(content);
    
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    
    if (closeable) {
        closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        titlebar.appendChild(closeButton);
        closeButton.addEventListener('click', function () {
            instance.close();
        }, false);
    }
    
    /**
     * Centers the position of the window on the screen.
     */
    this.center = function () {
        var width, height;
        width = container.offsetWidth;
        height = container.offsetHeight;
        container.style.left = Math.floor((window.innerWidth - width) / 2) +
                'px';
        container.style.top = Math.floor((window.innerHeight - height) / 2) +
                'px';
    };
    
    /**
     * Appends and HTML element to the window's content.
     * 
     * @param {HTMLElement} node The node to be added at the end of the
     *        window's content.
     */
    this.appendChild = function (node) {
        content.appendChild(node);
    };
    
    /**
     * Removes an HTML element from the window's content.
     * 
     * @param {HTMLElement} node The node to be removed from the window's
     *        content.
     */
    this.removeChild = function (node) {
        content.removeChild(node);
    };
    
    /**
     * Closes the modal window. The window and overlay is removed from the page
     * using this method.
     */
    this.close = function () {
        document.body.removeChild(container);
        document.body.removeChild(overlay);
    };
    
    this.center();
};
