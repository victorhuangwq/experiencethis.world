/**
 * Save system for the TCG Idle Game
 * Stores one versioned save in local storage and upgrades older saves on load
 *
 * Save format (version 2):
 * {
 *     version: 2,
 *     savedAt: <timestamp>,
 *     game: <GameState.toSaveData()>,
 *     shop: <ShopSystem.toSaveData()> or null
 * }
 */

const SaveSystem = {
    key: 'tcgIdleGameSave',
    version: 2,

    /**
     * Load the save, upgrading it to the current version
     * @returns {Object|null} - Save data, or null if there is no usable save
     */
    load: function() {
        let raw;
        try {
            raw = localStorage.getItem(this.key);
        } catch (error) {
            console.error('Could not access local storage:', error);
            return null;
        }

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
     * @param {Object} data - Save sections ({ game, shop })
     * @returns {boolean} - Whether the save was written
     */
    save: function(data) {
        const saveData = {
            version: this.version,
            savedAt: Date.now(),
            game: data.game,
            shop: data.shop || null
        };

        return this.write(this.key, JSON.stringify(saveData));
    },

    /**
     * Delete the save
     */
    clear: function() {
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            console.error('Could not delete save data:', error);
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
     * Upgrade save data from older versions to the current version
     * @param {Object} data - Parsed save data
     * @returns {Object} - Save data in the current format
     */
    migrate: function(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Save data is not an object');
        }

        // Version 1: flat game fields, full card objects, and upgrade objects
        if (!data.version) {
            const upgrades = data.upgrades || {};
            data = {
                version: 2,
                savedAt: data.lastSaved,
                game: {
                    money: data.money,
                    packs: data.packs,
                    phase: data.phase,
                    highestTournamentWon: data.highestTournamentWon,
                    lastIncomeTime: data.lastIncomeTime,
                    collection: (data.collection || []).map(card => CardData.packCard(card)),
                    upgrades: {
                        autoOpener: !!(upgrades.autoOpener && upgrades.autoOpener.purchased),
                        autoBuyer: !!(upgrades.autoBuyer && upgrades.autoBuyer.purchased),
                        autoSeller: !!(upgrades.autoSeller && upgrades.autoSeller.purchased),
                        betterPacks: !!(upgrades.betterPacks && upgrades.betterPacks.purchased),
                        incomeBoost: (upgrades.incomeBoost && upgrades.incomeBoost.level) || 0
                    }
                },
                shop: data.shop || null
            };
        }

        if (data.version > this.version) {
            throw new Error(`Save version ${data.version} is newer than this game supports`);
        }

        return data;
    }
};

// Make the save system available globally
window.SaveSystem = SaveSystem;
