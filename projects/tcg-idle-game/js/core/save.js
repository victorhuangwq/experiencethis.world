/**
 * Save system
 * Stores one versioned save in local storage, plus the list of endings found.
 * The endings list is kept under its own key so it survives a game over.
 *
 * Save format (version 2):
 * {
 *     version: 2,
 *     savedAt: <timestamp>,
 *     game: <Game.toSaveData()>
 * }
 */

export const SaveSystem = {
    key: 'critterClashSave',
    endingsKey: 'critterClashEndings',
    version: 2,

    /**
     * Load the save, upgrading it to the current version
     * @returns {Object|null} - Game save data, or null if there is no usable save
     */
    load() {
        const raw = this.read(this.key);
        if (!raw) {
            return null;
        }

        try {
            return this.migrate(JSON.parse(raw)).game;
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
    save(game) {
        return this.write(this.key, JSON.stringify({
            version: this.version,
            savedAt: Date.now(),
            game: game
        }));
    },

    /**
     * Delete the save. The endings list is kept.
     */
    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            console.error('Could not delete save data:', error);
        }
    },

    /**
     * The endings list, shared by every run
     */
    endings: {
        found() {
            try {
                const endings = JSON.parse(SaveSystem.read(SaveSystem.endingsKey));
                return Array.isArray(endings) ? endings : [];
            } catch (error) {
                return [];
            }
        },

        record(id) {
            const endings = this.found();
            if (!endings.includes(id)) {
                endings.push(id);
                SaveSystem.write(SaveSystem.endingsKey, JSON.stringify(endings));
            }
        },

        clear() {
            try {
                localStorage.removeItem(SaveSystem.endingsKey);
            } catch (error) {
                console.error('Could not delete endings:', error);
            }
        }
    },

    read(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Could not access local storage:', error);
            return null;
        }
    },

    write(key, value) {
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
     * Missing or new fields don't need a step here: the game fills them in
     * from its defaults. Add a step only when existing data changes shape.
     * @param {Object} data - Parsed save data
     * @returns {Object} - Save data in the current format
     */
    migrate(data) {
        if (!data || typeof data !== 'object' || !data.version) {
            throw new Error('Save data is not in a known format');
        }

        // Version 1 was an unreleased test build with a different story
        if (data.version < 2) {
            throw new Error('Save is from an earlier test version');
        }

        if (data.version > this.version) {
            throw new Error(`Save version ${data.version} is newer than this game supports`);
        }

        return data;
    }
};
