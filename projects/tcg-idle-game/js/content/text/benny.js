/**
 * Benny, age 9, from next door
 */

import { Format } from '../../core/format.js';

export const Benny = {
    arrives: 'There is a knock at the window. It is Benny. "I hear you have duplicates," says Benny. Benny will not say how Benny heard.',
    sell: (count, cents) => `Sell ${count} duplicates to Benny (${Format.money(cents)})`,
    sold: [
        cents => `Benny pays ${Format.money(cents)}. "Twenty-five percent finder's fee," says Benny. Benny found nothing.`,
        cents => `Benny counts out ${Format.money(cents)} in nickels. Nobody knows where Benny gets the nickels.`,
        cents => `Benny pays ${Format.money(cents)} and offers you a slightly used eraser. You decline. Benny writes that down.`
    ],
    none: '"No duplicates?" says Benny, at the window. "Lame."'
};
