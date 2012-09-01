"use strict";

/**
 * Persistent storage API using localStorage global object. The storage can be
 * used to store even complex data objects that can be serialized using JSON.
 * 
 * When page is being loaded the storage automatically reads the contents of
 * itself and loads them into global context using their key names as variable
 * names.
 * 
 * Before the page is unloaded by the user by closing the window or by visiting
 * another page or by refreshing the page the storage reads global copies of
 * the persisted objects and saves any changes into the storage automatically.
 * If the global copy has been removed or set to undefined, the data is also
 * removed from the storage.
 */
var Storage = {
    /**
     * Persists the data identified by provided name into the storage. This
     * also creates a reference to them using a global variable named by the
     * provided name for the data. This can be later used to directly modify
     * the data in the storage.
     * 
     * @param {String} name Name for the data record
     * @param {Object} data Any value serializable through JSON
     */
    persist: function (name, data) {
        localStorage.setItem(name, JSON.stringify(data));
        window[name] = data;
    },
    
    /**
     * Retrieves the data from the storage. This method can be usefull if the
     * global copy has been overwritten by another script because it read the
     * data from the persistent memory which is updated only when the page is
     * unloaded.
     * 
     * @param {String} name Name of the data record to be retrieved.
     * @return {Object} Data retrieved from the persistent storage.
     */
    get: function (name) {
        return JSON.parse(localStorage.getItem(name));
    },
    
    /**
     * Returns list of all keys in the persistent storage in form of an array.
     * 
     * @return {Array} List of all keys for data stored in the storage.
     */
    getKeys: function () {
        var keys, i;
        keys = [];
        for (i = localStorage.length; i--;) {
            keys.push(localStorage.key(i));
        }
        return keys;
    },
    
    /**
     * Deletes the data record from the persistent storage but leaves the
     * global copy. This will be removed automatically when the page is
     * reloaded.
     * 
     * @param {String} name Name of the data record.
     */
    remove: function (name) {
        localStorage.removeItem(name);
    },
    
    /**
     * Clears the contents of the persistent storage but leaves all of the
     * global copies. These will be removed automatically when the page is
     * reloaded.
     */
    clear: function () {
        localStorage.clear();
    }
};

(function () {
    var keys, i;
    
    keys = Storage.getKeys();
    for (i = keys.length; i--;) {
        window[keys[i]] = Storage.get(keys[i]);
    }
    
    addEventListener('beforeunload', function () {
        keys = Storage.getKeys();
        for (i = keys.length; i--;) {
            if (window[keys[i]] === undefined) {
                Storage.remove(keys[i])
            } else {
                Storage.persist(keys[i], window[keys[i]]);
            }
        }
    }, false);
}());
