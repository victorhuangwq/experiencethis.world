/**
 * Game core
 *
 * The game is made of systems (wallet, vending machine, collection, ...).
 * Each system is an object with:
 *
 *   id                        Key of its slice in the game state
 *   defaults(now)             Its starting state. Saves are laid over this,
 *                             so new fields only need a default here.
 *   load(slice, game, now)    Optional: fix up a loaded slice
 *   save(slice)               Optional: return a compact slice for the save
 *   setup(game)               Optional: listen to game events
 *   tick(game, now)           Optional: advance with the real clock
 *   actions                   Optional: { name(game, args, now) } that the
 *                             UI can call as "<id>.<name>"
 *
 * Content (unlocks, encounters, endings) is plain data; see js/content/.
 */

import { mergeDefaults } from './merge.js';
import { nextRandom } from './random.js';

export class Game {
    /**
     * @param {Object} options
     * @param {Array} options.systems - Systems
     * @param {Array} options.unlocks - Unlocks: { id, when(game), run(game) }
     * @param {Array} options.encounters - Encounters (see js/content/encounters/index.js)
     * @param {Object} options.endings - Store of endings found: { found(), record(id) }
     */
    constructor({ systems, unlocks, encounters, endings }) {
        this.systems = systems;
        this.unlocks = unlocks;
        this.encounters = new Map(encounters.map(encounter => [encounter.id, encounter]));
        this.endings = endings;

        this.state = null;
        // The current time, set on every tick and action
        this.time = 0;
        // Log messages, newest first. Not saved.
        this.messages = [];
        // When the player last did something. Not saved.
        this.lastActionAt = 0;

        this.listeners = new Map();
        // Lines collected while catching up on time away
        this.awayReport = null;

        for (const system of systems) {
            system.setup?.(this);
        }
    }

    /**
     * Get the state for a new run
     * @param {number} now - Current time
     * @returns {Object} - Game state
     */
    defaults(now) {
        const state = {
            meta: { startedAt: now, lastTick: now, seed: Math.floor(Math.random() * 4294967296), ended: null },
            progress: { unlocked: [] },
            encounter: null
        };
        for (const system of this.systems) {
            state[system.id] = system.defaults(now);
        }
        return state;
    }

    /**
     * Start from a save, or as a new run
     * @param {Object|null} saveData - Game save data
     * @param {number} now - Current time
     */
    start(saveData, now) {
        this.time = now;
        this.lastActionAt = now;
        this.state = mergeDefaults(this.defaults(now), saveData);

        if (saveData) {
            for (const system of this.systems) {
                system.load?.(this.state[system.id], this, now);
            }
            if (this.state.encounter && !this.encounters.has(this.state.encounter.id)) {
                this.state.encounter = null;
            }
        }

        this.emit('start', { fresh: !saveData });
        this.catchUp(now);
    }

    /**
     * Get the data to store in the save
     * @returns {Object} - Game save data
     */
    toSaveData() {
        const data = { ...this.state };
        for (const system of this.systems) {
            if (system.save) {
                data[system.id] = system.save(this.state[system.id]);
            }
        }
        return data;
    }

    // Seeded randomness. The seed is saved, so reloading can't reroll results.
    random() {
        const [value, seed] = nextRandom(this.state.meta.seed);
        this.state.meta.seed = seed;
        return value;
    }

    chance(probability) {
        return this.random() < probability;
    }

    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    pick(list) {
        return list[Math.floor(this.random() * list.length)];
    }

    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
    }

    /**
     * Tell listeners something happened, then start any encounter it triggers
     * @param {string} event - Event name
     * @param {Object} data - Event details
     */
    emit(event, data = {}) {
        for (const listener of this.listeners.get(event) || []) {
            listener(data);
        }
        this.triggerEncounter(event, data);
    }

    /**
     * Add a message to the log. A repeat of the newest message is counted
     * instead of added again.
     * @param {string} text - Message
     * @param {string} kind - info, good, warning, or danger
     */
    say(text, kind = 'info') {
        const newest = this.messages[0];
        if (newest && newest.text === text) {
            newest.count++;
            return;
        }
        this.messages.unshift({ text, kind, count: 1 });
        this.messages.length = Math.min(this.messages.length, 20);
    }

    /**
     * Add a line to the "while you were away" summary, if catching up
     * @param {string} text - Line
     */
    reportAway(text) {
        if (this.awayReport && !this.awayReport.includes(text)) {
            this.awayReport.push(text);
        }
    }

    /**
     * Advance to the current time. Called every second.
     * @param {number} now - Current time
     */
    tick(now) {
        if (this.state.meta.ended) {
            return;
        }
        this.time = now;
        for (const system of this.systems) {
            system.tick?.(this, now);
        }
        this.state.meta.lastTick = now;
        this.checkUnlocks();
    }

    /**
     * Advance after time away (page load, or returning to the tab) and
     * summarise what happened in one message
     * @param {number} now - Current time
     */
    catchUp(now) {
        this.lastActionAt = now;
        this.awayReport = [];
        this.tick(now);
        if (this.awayReport.length > 0) {
            this.say('While you were away, ' + this.awayReport.join(', and ') + '.', 'good');
        }
        this.awayReport = null;
    }

    /**
     * Run a player action
     * @param {string} name - "<system id>.<action>", or "encounter.choose"
     * @param {Object} args - Action arguments
     * @param {number} now - Current time
     */
    perform(name, args, now) {
        if (this.state.meta.ended) {
            return;
        }
        this.time = now;
        this.lastActionAt = now;

        if (name === 'encounter.choose') {
            this.choose(Number(args.index));
        } else {
            const [systemId, actionName] = name.split('.');
            const action = this.systems.find(system => system.id === systemId)?.actions?.[actionName];
            if (!action) {
                return;
            }
            action(this, args, now);
        }

        this.emit('action', { name });
        this.checkUnlocks();
    }

    unlocked(id) {
        return this.state.progress.unlocked.includes(id);
    }

    /**
     * Run every unlock whose condition is now met
     */
    checkUnlocks() {
        let changed = true;
        while (changed && !this.state.meta.ended) {
            changed = false;
            for (const unlock of this.unlocks) {
                if (!this.unlocked(unlock.id) && unlock.when(this)) {
                    this.state.progress.unlocked.push(unlock.id);
                    unlock.run?.(this);
                    changed = true;
                }
            }
        }
    }

    /**
     * The active encounter, if any
     * @returns {Object|null} - Encounter
     */
    encounter() {
        return this.state.encounter ? this.encounters.get(this.state.encounter.id) : null;
    }

    /**
     * Start the first encounter that this event triggers
     * @param {string} event - Event name
     * @param {Object} data - Event details
     */
    triggerEncounter(event, data) {
        if (this.state.encounter || this.state.meta.ended) {
            return;
        }
        for (const encounter of this.encounters.values()) {
            if (encounter.on === event && encounter.check(this, data)) {
                this.startEncounter(encounter.id);
                return;
            }
        }
    }

    startEncounter(id) {
        this.state.encounter = { id };
        this.encounters.get(id).start?.(this);
    }

    /**
     * Pick a choice in the active encounter
     * @param {number} index - Choice index
     */
    choose(index) {
        const encounter = this.encounter();
        const choice = encounter?.choices(this)[index];
        if (!choice || choice.disabled) {
            return;
        }
        this.state.encounter = null;
        choice.run(this);
    }

    /**
     * End the run with an ending
     * @param {string} id - Ending id
     */
    end(id) {
        this.state.meta.ended = id;
        this.state.encounter = null;
        this.endings.record(id);
        this.emit('end', { id });
    }
}
