/**
 * TCG Idle Collector game logic
 * Holds the game state and every action the player can take.
 * Timed events follow the real clock and are stored as timestamps,
 * so progress continues while the page is closed.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Tuning values. See STORY.md (Pacing) for the targets behind them.
const Rules = {
    allowancePerSecond: 0.02,
    offlineCap: 8 * HOUR,
    restockEvery: 15 * MINUTE,
    slotCount: 8,
    specialRestockChance: 0.1,
    prices: { normal: 3, special: 6 },
    jamChance: 0.04,
    chorePay: 0.5,
    choreRest: 20 * 1000,
    pipAfterPacks: 3,
    pipChance: 0.35,
    pipGiftChance: 0.3,
    maxStrikes: 3,
    // Cards opened before Gus's store appears, with and without Pip's tip
    gusWithTip: 40,
    gusWithoutTip: 60
};

const Endings = [
    { id: 'collector', name: 'Greatest Collector' },
    { id: 'champion', name: 'TCG Champion' },
    { id: 'business', name: 'TCG Businessperson' },
    { id: 'scalper', name: 'Bad end: Scalper' },
    { id: 'shame', name: 'Shame' }
];

const Format = {
    money: amount => '$' + amount.toFixed(2),
    clock: timestamp => new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    slotLabel: index => 'AB'[Math.floor(index / 4)] + (index % 4 + 1)
};

class Game {
    constructor() {
        this.state = null;
        // Messages for the log, newest first. Not saved.
        this.messages = [];
        // Cards from the most recently opened pack
        this.lastPack = [];
        // Called with the ending id when the run ends
        this.onEnd = null;
    }

    /**
     * Create the state for a new run
     * @param {number} now - Current time
     * @returns {Object} - Game state
     */
    static newState(now) {
        return {
            startedAt: now,
            lastTick: now,
            money: 0,
            packs: { normal: 0, special: 0 },
            collection: [],
            strikes: 0,
            choreReadyAt: 0,
            vending: { restockedAt: 0, slots: [], bought: 0, pipChecked: false, jammedSlot: null },
            pip: { inLine: false, encounters: 0, kindness: 0 },
            flags: { binder: false, benny: false, gusTip: false, gus: false },
            stats: { packsBought: 0, cardsOpened: 0 },
            ended: null
        };
    }

    /**
     * Start the game from a save, or as a new run
     * @param {Object|null} saveData - Loaded save
     * @param {number} now - Current time
     */
    start(saveData, now) {
        this.state = Game.newState(now);

        if (saveData && saveData.game) {
            this.applySaveData(saveData.game, now);
        } else {
            this.say(`Your allowance trickles into your piggy bank at ${Format.money(Rules.allowancePerSecond * 60)} a minute. A pack costs ${Format.money(Rules.prices.normal)}.`);
            this.say('You find the CARD-O-MATIC 3000 at the back of the mall. It sells Critter Clash packs.');
        }

        this.tick(now);
    }

    /**
     * Get the game data to store in the save
     * @returns {Object} - Game save data
     */
    toSaveData() {
        return {
            ...this.state,
            collection: this.state.collection.map(card => Cards.packCard(card))
        };
    }

    /**
     * Restore game data from the save, keeping defaults for missing or invalid values
     * @param {Object} data - Game save data
     * @param {number} now - Current time
     */
    applySaveData(data, now) {
        const state = this.state;
        const number = (value, fallback) => Number.isFinite(value) ? value : fallback;
        const time = (value, fallback) => Math.min(number(value, fallback), now);

        state.startedAt = time(data.startedAt, now);
        state.lastTick = time(data.lastTick, now);
        state.money = number(data.money, 0);
        state.strikes = number(data.strikes, 0);
        state.choreReadyAt = number(data.choreReadyAt, 0);

        const packs = data.packs || {};
        state.packs.normal = number(packs.normal, 0);
        state.packs.special = number(packs.special, 0);

        if (Array.isArray(data.collection)) {
            state.collection = data.collection
                .map(packed => Cards.unpackCard(packed))
                .filter(card => card !== null);
        }

        const vending = data.vending || {};
        state.vending.restockedAt = time(vending.restockedAt, 0);
        state.vending.slots = Array.from({ length: Rules.slotCount }, (_, index) => {
            const slot = Array.isArray(vending.slots) ? vending.slots[index] : null;
            return slot === 'normal' || slot === 'special' ? slot : null;
        });
        state.vending.bought = number(vending.bought, 0);
        state.vending.pipChecked = !!vending.pipChecked;
        state.vending.jammedSlot = Number.isInteger(vending.jammedSlot) ? vending.jammedSlot : null;

        const pip = data.pip || {};
        state.pip.inLine = !!pip.inLine;
        state.pip.encounters = number(pip.encounters, 0);
        state.pip.kindness = number(pip.kindness, 0);

        for (const key in state.flags) {
            state.flags[key] = !!(data.flags && data.flags[key]);
        }

        const stats = data.stats || {};
        state.stats.packsBought = number(stats.packsBought, 0);
        state.stats.cardsOpened = number(stats.cardsOpened, 0);
    }

    /**
     * Add a message to the log
     * @param {string} text - Message
     * @param {string} kind - info, good, warning, or danger
     */
    say(text, kind = 'info') {
        this.messages.unshift({ text, kind });
        this.messages.length = Math.min(this.messages.length, 40);
    }

    /**
     * Advance the game to the current time
     * @param {number} now - Current time
     */
    tick(now) {
        const state = this.state;
        if (state.ended) {
            return;
        }

        // Allowance, including time spent away, up to the piggy bank's limit
        const elapsed = now - state.lastTick;
        if (elapsed > 0) {
            const earned = Math.min(elapsed, Rules.offlineCap) / 1000 * Rules.allowancePerSecond;
            state.money += earned;

            if (elapsed > MINUTE) {
                const full = elapsed > Rules.offlineCap ? ' It\'s full! It only holds 8 hours of allowance.' : '';
                this.say(`While you were away, your piggy bank filled up by ${Format.money(earned)}.${full}`, 'good');
            }
        }
        state.lastTick = now;

        this.checkRestock(now);
    }

    /**
     * Restock the vending machine at every quarter hour of the real clock
     * @param {number} now - Current time
     */
    checkRestock(now) {
        const vending = this.state.vending;
        const restockTime = Math.floor(now / Rules.restockEvery) * Rules.restockEvery;
        if (restockTime <= vending.restockedAt) {
            return;
        }

        const firstStock = vending.restockedAt === 0;
        vending.restockedAt = restockTime;
        vending.slots = new Array(Rules.slotCount).fill('normal');
        vending.bought = 0;
        vending.pipChecked = false;

        if (firstStock) {
            return;
        }

        if (Math.random() < Rules.specialRestockChance) {
            const slot = Cards.randomInt(0, Rules.slotCount - 1);
            vending.slots[slot] = 'special';
            this.say(`*clank* A delivery driver restocks the CARD-O-MATIC 3000. Something in slot ${Format.slotLabel(slot)} is sparkling.`, 'good');
        } else {
            this.say('*clank* A delivery driver restocks the CARD-O-MATIC 3000.');
        }
    }

    /**
     * Get when the vending machine restocks next
     * @returns {number} - Timestamp
     */
    nextRestockAt() {
        return this.state.vending.restockedAt + Rules.restockEvery;
    }

    /**
     * Count the packs left in the vending machine
     * @returns {number} - Packs left
     */
    stockLeft() {
        return this.state.vending.slots.filter(slot => slot !== null).length;
    }

    /**
     * Whether the player can buy from the vending machine right now
     * @returns {boolean}
     */
    canUseMachine() {
        return !this.state.ended && !this.state.pip.inLine && this.state.vending.jammedSlot === null;
    }

    /**
     * Buy the pack in a vending machine slot
     * @param {number} index - Slot index
     */
    buy(index) {
        const state = this.state;
        const kind = state.vending.slots[index];
        if (!kind || !this.canUseMachine()) {
            return;
        }

        const price = Rules.prices[kind];
        if (state.money < price) {
            this.say(`You need ${Format.money(price)}. You check your pockets again. Still not enough.`);
            return;
        }
        state.money -= price;

        // Sometimes the machine takes the money and keeps the pack
        if (state.stats.packsBought >= 2 && Math.random() < Rules.jamChance) {
            state.vending.jammedSlot = index;
            this.say(`The CARD-O-MATIC 3000 swallows your money. The pack in ${Format.slotLabel(index)} wobbles... and stays put.`, 'warning');
            return;
        }

        this.dispense(index);
        this.maybeCallPip();
    }

    /**
     * Drop the pack from a slot into the player's hands
     * @param {number} index - Slot index
     */
    dispense(index) {
        const state = this.state;
        const kind = state.vending.slots[index];
        state.vending.slots[index] = null;
        state.vending.bought++;
        state.packs[kind]++;
        state.stats.packsBought++;

        const pack = kind === 'special' ? 'a sparkling special pack' : 'a pack';
        this.say(`*thunk* You got ${pack} from slot ${Format.slotLabel(index)}.`);
    }

    /**
     * Kick the jammed machine. Half the time the pack drops.
     */
    kickMachine() {
        const vending = this.state.vending;
        if (vending.jammedSlot === null) {
            return;
        }

        const slot = vending.jammedSlot;
        vending.jammedSlot = null;
        if (Math.random() < 0.5) {
            this.say('You give the machine a solid kick.');
            this.dispense(slot);
            this.maybeCallPip();
        } else {
            this.say('You kick the machine. It hums smugly. Your money is gone.', 'warning');
        }
    }

    /**
     * Give up on the jammed machine
     */
    walkAwayFromJam() {
        if (this.state.vending.jammedSlot === null) {
            return;
        }
        this.state.vending.jammedSlot = null;
        this.say('You decide the pack isn\'t worth a fight. The machine wins this round.');
    }

    /**
     * After a few packs in one restock, a kid may be waiting in line
     */
    maybeCallPip() {
        const { vending, pip } = this.state;
        if (vending.pipChecked || vending.bought < Rules.pipAfterPacks || this.stockLeft() === 0) {
            return;
        }

        // The first time is guaranteed so every player meets the kid
        vending.pipChecked = true;
        if (pip.encounters > 0 && Math.random() >= Rules.pipChance) {
            return;
        }

        pip.inLine = true;
        pip.encounters++;
        if (pip.encounters === 1) {
            this.say('You hear a sniffle behind you. A kid is waiting for the machine, clutching three crumpled dollars.', 'warning');
        } else if (pip.kindness > 0) {
            this.say('Pip is in line behind you again, holding three crumpled dollars.', 'warning');
        } else {
            this.say('The kid from before is back in line behind you. They won\'t look at you.', 'warning');
        }
    }

    /**
     * Let the kid in line buy a pack
     */
    stepAside() {
        const { vending, pip, flags } = this.state;
        if (!pip.inLine) {
            return;
        }

        pip.inLine = false;
        pip.kindness++;

        const slot = vending.slots.indexOf('normal');
        if (slot === -1) {
            this.say('You step aside. The kid looks at the special pack, then at their three dollars, and buys a granola bar from the machine next door instead. They still say thanks.', 'good');
            return;
        }
        vending.slots[slot] = null;

        if (pip.kindness === 1) {
            flags.gusTip = true;
            this.say('You step aside. The kid buys a pack, tears it open, and gasps. "THANK YOU! I\'m Pip. Hey, have you been to Gus\'s Games & Grub? They have packs ALL the time. This machine ate my money twice last week."', 'good');
        } else if (Math.random() < Rules.pipGiftChance) {
            this.state.collection.push(Cards.fixedCard('wet-sock-goblin'));
            this.say('Pip buys a pack and hands you a card. "I have like four of these. Take it!" You got a Wet Sock Goblin.', 'good');
        } else {
            this.say(Cards.pick([
                'You step aside. Pip buys a pack and waves at you on the way out.',
                'Pip pulls a shiny card and does a little dance. You feel good about this.',
                'Pip buys a pack and tells you all about their Critter Clash deck. It has a lot of possums.'
            ]), 'good');
        }

        this.checkGus();
    }

    /**
     * Keep buying while the kid waits. This is a strike.
     */
    keepBuying() {
        const state = this.state;
        if (!state.pip.inLine) {
            return;
        }

        const index = state.vending.slots.findIndex(kind => kind && state.money >= Rules.prices[kind]);
        if (index === -1) {
            return;
        }

        state.pip.inLine = false;
        state.money -= Rules.prices[state.vending.slots[index]];
        this.dispense(index);
        this.addStrike([
            'The kid stares at the machine, then walks away without a word. A man at the food court shakes his head at you.',
            'The kid doesn\'t come back. The food court goes quiet when you walk past. Someone has taped a note to the CARD-O-MATIC 3000: "BE NICE." People are starting to talk. One more, and you\'re done here.'
        ]);
    }

    /**
     * Add a strike. The third strike ends the run.
     * @param {Array} messages - What happens at the first and second strike
     */
    addStrike(messages) {
        const state = this.state;
        state.strikes++;

        if (state.strikes >= Rules.maxStrikes) {
            this.end('shame');
            return;
        }
        this.say(messages[state.strikes - 1], 'danger');
    }

    /**
     * End the run with an ending
     * @param {string} id - Ending id
     */
    end(id) {
        this.state.ended = id;
        if (this.onEnd) {
            this.onEnd(id);
        }
    }

    /**
     * Whether chores can be done yet
     * @param {number} now - Current time
     * @returns {boolean}
     */
    canDoChores(now) {
        return now >= this.state.choreReadyAt;
    }

    /**
     * Do chores for a little money
     * @param {number} now - Current time
     */
    doChores(now) {
        if (this.state.ended || !this.canDoChores(now)) {
            return;
        }

        this.state.money += Rules.chorePay;
        this.state.choreReadyAt = now + Rules.choreRest;
        this.say(Cards.pick([
            'You fold the laundry.',
            'You take out the trash.',
            'You walk the neighbour\'s dog. The dog walks you, mostly.',
            'You wash the dishes, including the weird pan.',
            'You find coins in the couch cushions. Technically a chore.'
        ]) + ` +${Format.money(Rules.chorePay)}`);
    }

    /**
     * Open one unopened pack
     * @param {string} kind - normal or special
     */
    openPack(kind) {
        const state = this.state;
        if (state.ended || !(state.packs[kind] > 0)) {
            return;
        }

        state.packs[kind]--;
        const cards = Cards.openPack(kind);

        // Mark fixed cards the player is seeing for the first time
        const owned = new Set(state.collection.map(card => card.fixedId).filter(Boolean));
        this.lastPack = cards.map(card => ({ ...card, isNew: !!card.fixedId && !owned.has(card.fixedId) }));

        state.collection.push(...cards);
        state.stats.cardsOpened += cards.length;

        if (!state.flags.binder) {
            state.flags.binder = true;
            this.say('You open your first pack. You\'re going to need a binder.', 'good');
        } else {
            this.say(kind === 'special' ? 'You open the special pack. It smells like a new car.' : 'You open a pack.');
        }

        for (const card of this.lastPack.filter(card => card.isNew)) {
            this.say(`New for your binder: ${card.name}!`, 'good');
        }

        this.checkBenny();
        this.checkGus();
    }

    /**
     * Find duplicate cards, keeping the most valuable copy of each name
     * @returns {Array} - Duplicate cards
     */
    duplicates() {
        const kept = new Map();
        const duplicates = [];
        for (const card of this.state.collection) {
            const current = kept.get(card.name);
            if (!current) {
                kept.set(card.name, card);
            } else if (card.value > current.value) {
                duplicates.push(current);
                kept.set(card.name, card);
            } else {
                duplicates.push(card);
            }
        }
        return duplicates;
    }

    /**
     * Sell every duplicate to Benny
     */
    sellDuplicates() {
        const state = this.state;
        const duplicates = new Set(this.duplicates());
        if (state.ended || !state.flags.benny || duplicates.size === 0) {
            return;
        }

        const total = [...duplicates].reduce((sum, card) => sum + card.value, 0);
        state.collection = state.collection.filter(card => !duplicates.has(card));
        state.money += total;

        const amount = Format.money(total);
        this.say(Cards.pick([
            `Benny counts out ${amount} in coins and one button. "Pleasure doing business."`,
            `Benny pays you ${amount}. "I'm gonna be rich," Benny whispers.`,
            `Benny gives you ${amount} and offers you a slightly used eraser. You decline.`
        ]));
    }

    /**
     * Benny shows up once the player has a duplicate to sell
     */
    checkBenny() {
        if (this.state.flags.benny || this.duplicates().length === 0) {
            return;
        }
        this.state.flags.benny = true;
        this.say('At school, your classmate Benny spots your duplicates. "I\'ll buy those off you. Cash." You can now sell duplicates to Benny from your binder.', 'good');
    }

    /**
     * Gus's store appears once the player has opened enough cards
     */
    checkGus() {
        const { flags, stats } = this.state;
        if (flags.gus) {
            return;
        }

        if (flags.gusTip && stats.cardsOpened >= Rules.gusWithTip) {
            flags.gus = true;
            this.say('With a binder this full, it\'s time to check out the store Pip mentioned. Gus\'s Games & Grub is now on your map.', 'good');
        } else if (stats.cardsOpened >= Rules.gusWithoutTip) {
            flags.gus = true;
            this.say('Benny leans over. "You know Gus\'s Games & Grub sells packs, right? Like, a real store." Gus\'s Games & Grub is now on your map.', 'good');
        }
    }
}

// Make the game available globally
window.Rules = Rules;
window.Endings = Endings;
window.Format = Format;
window.Game = Game;
