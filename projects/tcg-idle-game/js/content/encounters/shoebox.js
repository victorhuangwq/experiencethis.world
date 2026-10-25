/**
 * The opening: a shoebox from the player's childhood, and Benny's offer
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../text/index.js';
import { Cards } from '../../systems/cards.js';
import { Wallet } from '../../systems/wallet.js';
import { Collection } from '../../systems/collection.js';

export const ShoeboxEncounters = [
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
    }
];
