/**
 * Encounters: moments that take over a location and make the player choose.
 * The active encounter is saved, so reloading the page can't escape it.
 *
 *   id               Encounter id
 *   location         Where it happens; the view moves there
 *   art              Which ASCII art to show (see ui/art.js)
 *   on, check(game)  Optional: start when this game event fires and check
 *                    returns true. Without these, start it with
 *                    game.startEncounter(id).
 *   start(game)      Optional: runs when it starts
 *   text(game)       Lines of text
 *   choices(game)    [{ label, disabled, run(game) }]
 */

import { Format } from '../core/util.js';
import { Rules } from '../rules.js';
import { Lines } from './lines.js';
import { Cards } from './cards.js';
import { Wallet } from '../systems/wallet.js';
import { Collection } from '../systems/collection.js';
import { Vending } from '../systems/vending.js';
import { Kindness } from '../systems/kindness.js';

export const Encounters = [
    {
        // The opening: a shoebox from the player's childhood
        id: 'shoebox',
        location: 'home',
        art: 'shoebox',
        text: () => Lines.opening.closet,
        choices: () => [
            { label: Lines.opening.lookUp, run: game => game.startEncounter('shoebox-offer') }
        ]
    },
    {
        id: 'shoebox-offer',
        location: 'home',
        art: 'shoebox',
        start: game => {
            game.state.people.benny.met = true;
        },
        text: () => Lines.opening.value,
        choices: () => [
            {
                label: `${Lines.opening.sell} (${Format.money(Rules.shoeboxOffer)})`,
                run: game => {
                    Wallet.earn(game, Rules.shoeboxOffer);
                    game.state.story.shoebox = 'sold';
                    game.say(Lines.opening.sold);
                }
            },
            {
                // Keeping it holds on to a misprint that matters much later
                label: Lines.opening.keep,
                run: game => {
                    Collection.add(game, Cards.shoeboxCards(game));
                    game.state.story.shoebox = 'kept';
                    game.say(Lines.opening.kept);
                }
            }
        ]
    },
    {
        // A kid waits in line after the player buys a few packs in a row
        id: 'pip',
        location: 'mall',
        art: 'machine',
        on: 'pack-bought',
        check: game => {
            const vending = game.state.vending;
            if (vending.pipChecked || vending.bought < Rules.pipAfterPacks || Vending.stockLeft(game) === 0) {
                return false;
            }
            // One chance per restock. The first time always happens.
            vending.pipChecked = true;
            return game.state.people.pip.encounters === 0 || game.chance(Rules.pipChance);
        },
        start: game => {
            game.state.people.pip.encounters++;
        },
        text: game => {
            const pip = game.state.people.pip;
            if (pip.kindness > 0) {
                return Lines.pip.arriveFriend;
            }
            return pip.encounters > 1 ? Lines.pip.arriveAgain : Lines.pip.arrive;
        },
        choices: game => [
            { label: Lines.pip.stepAside, run: stepAside },
            {
                label: Lines.pip.keepBuying,
                disabled: affordableSlot(game) === -1,
                run: game => {
                    const slot = affordableSlot(game);
                    Wallet.spend(game, Rules.prices[game.state.vending.slots[slot]]);
                    Vending.dispense(game, slot);
                    Kindness.addStrike(game, 'pip', game.state.people.pip.kindness > 0 ? 'Pip' : 'The kid');
                }
            }
        ]
    }
];

/**
 * The first vending machine slot the player can afford, or -1
 */
function affordableSlot(game) {
    return game.state.vending.slots.findIndex(kind => kind && Wallet.canAfford(game, Rules.prices[kind]));
}

/**
 * Let the kid buy a pack
 */
function stepAside(game) {
    const pip = game.state.people.pip;
    const slots = game.state.vending.slots;
    pip.kindness++;

    const slot = slots.indexOf('normal');
    if (slot === -1) {
        game.say(Lines.pip.specialOnly, 'good');
        return;
    }
    slots[slot] = null;

    if (!pip.mentionedGus) {
        pip.mentionedGus = true;
        game.say(Lines.pip.firstKindness, 'good');
    } else if (game.chance(Rules.pipGiftChance)) {
        Collection.add(game, [Cards.fixedCard('wet-sock-goblin', game.randomInt(5, 9))]);
        game.say(Lines.pip.gift, 'good');
    } else {
        game.say(game.pick(Lines.pip.kindness), 'good');
    }
}
