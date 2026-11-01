/**
 * The opening: the box from the player's childhood room, and, once it's
 * been sorted, Benny's offer
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../text/index.js';
import { Cards } from '../../systems/cards.js';
import { Wallet } from '../../systems/wallet.js';
import { Collection } from '../../systems/collection.js';
import { Box } from '../../systems/box.js';

// The dragon was on top, so it counts
const cardsInBox = () => Rules.boxCards + 1;

export const ShoeboxEncounters = [
    {
        // The opening: the box arrives, with the chewed dragon on top
        id: 'shoebox',
        location: 'home',
        art: 'shoebox',
        text: () => Lines.opening.arrival(Rules.boxCards),
        choices: () => [
            { label: Lines.opening.takeOut, run: game => Box.draw(game) }
        ]
    },
    {
        id: 'shoebox-offer',
        location: 'home',
        art: 'shoebox',
        start: game => {
            game.state.people.benny.met = true;
        },
        text: game => Lines.opening.value(cardsInBox(), game.state.box.sorterAt > 0),
        choices: () => [
            {
                label: `${Lines.opening.sell} (${Format.money(Rules.shoeboxOffer)})`,
                run: game => {
                    Wallet.earn(game, Rules.shoeboxOffer);
                    game.state.story.shoebox = 'sold';
                    game.say(Lines.opening.sold(game.state.box.sorterAt > 0));
                }
            },
            {
                // Keeping it holds on to a misprint that matters much later
                label: Lines.opening.keep,
                run: game => {
                    Collection.add(game, Cards.shoeboxCards(game));
                    game.state.story.shoebox = 'kept';
                    game.say(Lines.opening.kept(cardsInBox()));
                }
            }
        ]
    }
];
