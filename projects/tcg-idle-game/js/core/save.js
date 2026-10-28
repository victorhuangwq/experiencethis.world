/**
 * Save system
 * Stores one versioned save in local storage, plus the list of endings found.
 * The endings list is kept under its own key so it survives a game over.
 *
 * Save format:
 * {
 *     version: <format version>,
 *     savedAt: <timestamp>,
 *     game: <Game.toSaveData()>
 * }
 *
 * A save from an older version is upgraded one step at a time by the steps
 * in js/content/migrations.js, after a copy of it is kept under its own
 * key (critterClashSave-v2, and so on), so a bad release can be rolled back.
 */

import { Migrations } from '../content/migrations.js';

// Version 2 was the first release; every step after it is a migration
const FIRST_VERSION = 2;

export const SaveSystem = {
    key: 'critterClashSave',
    endingsKey: 'critterClashEndings',
    version: Math.max(FIRST_VERSION, ...Object.keys(Migrations).map(Number)),
    migrations: Migrations,

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
            const data = JSON.parse(raw);
            // Keep the save as it was before upgrading it
            if (data?.version >= FIRST_VERSION && data.version < this.version) {
                this.write(`${this.key}-v${data.version}`, raw);
            }
            return this.migrate(data).game;
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
     * Upgrade save data from older versions to the current version, one
     * step at a time. Missing or new fields don't need a step: the game
     * fills them in from its defaults.
     * @param {Object} data - Parsed save data
     * @returns {Object} - Save data in the current format
     */
    migrate(data) {
        if (!data || typeof data !== 'object' || !Number.isInteger(data.version) || !data.game) {
            throw new Error('Save data is not in a known format');
        }

        // Version 1 was an unreleased test build with a different story
        if (data.version < FIRST_VERSION) {
            throw new Error('Save is from an earlier test version');
        }

        if (data.version > this.version) {
            throw new Error(`Save version ${data.version} is newer than this game supports`);
        }

        let game = data.game;
        for (let version = data.version + 1; version <= this.version; version++) {
            game = this.migrations[version](game);
        }
        return { ...data, version: this.version, game };
    }
};
