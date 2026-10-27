/**
 * The scalper: Flip Resellington, years before his business offers, lines
 * up behind the player to buy whatever is left. Buying him out is fair,
 * unless a kid is waiting behind him too.
 */

import { Rules } from '../../rules.js';
import { Lines } from '../text/index.js';
import { Wallet } from '../../systems/wallet.js';
import { Vending } from '../../systems/vending.js';
import { Kindness } from '../../systems/kindness.js';

export const ScalperEncounter = {
    id: 'scalper',
    location: 'mall',
    art: 'machine',
    on: 'pack-bought',
    check: game => {
        const vending = game.state.vending;
        // Pip comes first: kindness, then the scalper
        const metPip = game.state.people.pip.encounters > 0;
        if (!metPip || vending.scalperChecked || vending.packsBought < Rules.scalperAfterPacks || Vending.stockLeft(game) === 0) {
            return false;
        }
        // One chance per restock. The first time always happens.
        vending.scalperChecked = true;
        return game.state.people.flip.encounters === 0 || game.chance(Rules.scalperChance);
    },
    start: game => {
        game.state.people.flip.encounters++;
        game.state.vending.kidBehind = game.chance(Rules.scalperKidChance);
    },
    text: game => {
        const lines = [...(game.state.people.flip.encounters > 1 ? Lines.flip.arriveAgain : Lines.flip.arrive)];
        if (game.state.vending.kidBehind) {
            lines.push(Lines.flip.kidBehind(kidName(game)));
        }
        return lines;
    },
    choices: game => {
        const kid = game.state.vending.kidBehind;
        const affordable = cheapestFirst(game).some(index => Wallet.canAfford(game, Rules.prices[game.state.vending.slots[index]]));
        return [
            { label: Lines.flip.buyAll, disabled: !affordable, run: game => buyOut(game, false) },
            kid && { label: Lines.flip.leaveOne, disabled: !affordable, run: game => buyOut(game, true) },
            { label: Lines.flip.letHim, run: letHim }
        ].filter(Boolean);
    }
};

function kidName(game) {
    return game.state.people.pip.kindness > 0 ? 'Pip' : 'a kid';
}

/**
 * Filled slots, cheapest pack first
 */
function cheapestFirst(game) {
    const slots = game.state.vending.slots;
    return slots.map((kind, index) => index)
        .filter(index => slots[index])
        .sort((a, b) => Rules.prices[slots[a]] - Rules.prices[slots[b]]);
}

/**
 * Buy every pack the player can afford, most special first. Flip takes
 * whatever is left; a kid, if one is waiting, gets one pack or nothing.
 * @param {boolean} leaveOne - Leave the cheapest pack for the kid
 */
function buyOut(game, leaveOne) {
    const vending = game.state.vending;
    const people = game.state.people;
    // Buying out happens in one go; nobody else steps up mid-way, even if
    // the machine was restocked while he waited
    vending.pipChecked = true;
    vending.scalperChecked = true;

    const forKid = leaveOne ? cheapestFirst(game)[0] : -1;
    const wanted = cheapestFirst(game).filter(index => index !== forKid).reverse();
    for (const index of wanted) {
        if (Wallet.spend(game, Rules.prices[vending.slots[index]])) {
            Vending.dispense(game, index);
        }
    }
    if (forKid !== -1) {
        vending.slots[forKid] = null;
        if (people.pip.kindness > 0) {
            people.pip.kindness++;
        }
        game.say(Lines.flip.kidGetsOne(kidName(game)), 'good');
    }

    const left = vending.slots.filter(Boolean).length;
    vending.slots.fill(null);
    if (left > 0) {
        game.say(Lines.flip.takesTheRest);
    } else {
        people.flip.annoyed++;
        const lines = Lines.flip.annoyed;
        game.say(lines[Math.min(people.flip.annoyed, lines.length) - 1], 'warning');
    }

    if (vending.kidBehind && !leaveOne) {
        Kindness.addStrike(game, 'buyout', people.pip.kindness > 0 ? 'Pip' : 'The kid');
    }
}

/**
 * Let Flip buy everything that's left
 */
function letHim(game) {
    game.state.vending.slots.fill(null);
    game.say(game.state.vending.kidBehind ? Lines.flip.tookItAllKid(kidName(game)) : Lines.flip.tookItAll);
}
