/**
 * Terry waits for the drop: he is at the machine in the minute before the
 * driver comes, if the player is there too. Vending.checkCamper starts this.
 * Once they've made a deal, the driver comes, so the deal is seen to happen.
 */

import { Lines } from '../text/index.js';
import { Kindness } from '../../systems/kindness.js';
import { Vending } from '../../systems/vending.js';

export const CamperEncounter = {
    id: 'camper',
    location: 'mall',
    art: 'machine',
    start: game => {
        game.state.people.terry.encounters++;
    },
    text: game => {
        const terry = game.state.people.terry;
        if (terry.friend) {
            return Lines.terry.arriveFriend;
        }
        return terry.encounters > 1 ? Lines.terry.arriveAgain : Lines.terry.arrive;
    },
    choices: game => [
        {
            // Split the drop: Terry takes row B, and becomes a friend
            label: game.state.people.terry.friend ? Lines.terry.splitAgain : Lines.terry.persuade,
            run: game => {
                const terry = game.state.people.terry;
                game.say(terry.friend ? Lines.terry.agreedAgain : Lines.terry.agreed, 'good');
                terry.friend = true;
                game.state.vending.dropDeal = 'share';
                Vending.dropNow(game);
            }
        },
        {
            label: Lines.terry.letHimFirst,
            run: game => {
                game.state.vending.dropDeal = 'first';
                game.say(Lines.terry.waiting);
                Vending.dropNow(game);
            }
        },
        {
            label: Lines.terry.shove,
            run: game => {
                const terry = game.state.people.terry;
                terry.friend = false;
                Kindness.addStrike(game, 'camper', 'Terry');
            }
        }
    ]
};
