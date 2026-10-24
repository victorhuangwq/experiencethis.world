/**
 * Save system for Critter Clash
 * Stores one versioned save in local storage, plus the list of endings found.
 * The endings list is kept under its own key so it survives a game over.
 *
 * Save format (version 1):
 * {
 *     version: 1,
 *     savedAt: <timestamp>,
 *     game: <Game.toSaveData()>
 * }
 */

const SaveSystem = {
    key: 'critterClashSave',
    endingsKey: 'critterClashEndings',
    version: 1,

    /**
     * Load the save, upgrading it to the current version
     * @returns {Object|null} - Save data, or null if there is no usable save
     */
    load: function() {
        const raw = this.read(this.key);
        if (!raw) {
            return null;
        }

        try {
            return this.migrate(JSON.parse(raw));
        } catch (error) {
            // Keep the unreadable save so starting fresh does not destroy it
            console.error('Could not read save data, starting a new game:', error);
            this.write(this.key + '-backup', raw);
            return null;
        }
    },

    /**
     * Write the save
     * @param {Object} game - Game save data
     * @returns {boolean} - Whether the save was written
     */
    save: function(game) {
        return this.write(this.key, JSON.stringify({
            version: this.version,
            savedAt: Date.now(),
            game: game
        }));
    },

    /**
     * Delete the save. The endings list is kept.
     */
    clear: function() {
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            console.error('Could not delete save data:', error);
        }
    },

    /**
     * Get the ids of every ending found so far, across all runs
     * @returns {Array} - Ending ids
     */
    loadEndings: function() {
        try {
            const endings = JSON.parse(this.read(this.endingsKey));
            return Array.isArray(endings) ? endings : [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Add an ending to the list of endings found
     * @param {string} id - Ending id
     */
    recordEnding: function(id) {
        const endings = this.loadEndings();
        if (!endings.includes(id)) {
            endings.push(id);
            this.write(this.endingsKey, JSON.stringify(endings));
        }
    },

    /**
     * Read a value from local storage
     * @param {string} key - Storage key
     * @returns {string|null} - Stored value, or null if missing or unavailable
     */
    read: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Could not access local storage:', error);
            return null;
        }
    },

    /**
     * Write a value to local storage
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     * @returns {boolean} - Whether the value was written
     */
    write: function(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            // Storage can be full, disabled, or blocked in private browsing
            console.error('Could not write save data:', error);
            return false;
        }
    },

    /**
     * Upgrade save data from older versions to the current version.
     * Add a step here whenever the save format changes.
     * @param {Object} data - Parsed save data
     * @returns {Object} - Save data in the current format
     */
    migrate: function(data) {
        if (!data || typeof data !== 'object' || !data.version) {
            throw new Error('Save data is not in a known format');
        }

        if (data.version > this.version) {
            throw new Error(`Save version ${data.version} is newer than this game supports`);
        }

        return data;
    }
};

// Make the save system available globally
window.SaveSystem = SaveSystem;
