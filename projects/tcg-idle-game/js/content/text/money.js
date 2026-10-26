/**
 * Money: the allowance and the day job
 */

import { Format } from '../../core/format.js';

export const Money = {
    label: 'You have',
    allowance: 'You decide to give yourself an allowance. $1.20 a minute. You are a responsible adult.',
    allowanceAway: (cents, capped) => `your allowance paid you ${Format.money(cents)}` +
        (capped ? ' (the piggy bank only holds 8 hours, which is also how long you slept, probably)' : ''),

    work: {
        unlocked: 'Your laptop dings. It is work. Work pays, apparently.',
        button: 'Answer an email',
        resting: 'Pretending to read',
        done: [
            'You answer an email.',
            'You reply-all by accident.',
            'You write "per my last email".',
            'You schedule a meeting about a meeting.',
            'You mark an email as unread so it is a problem for later you.',
            'You say "circling back" out loud, to nobody.'
        ]
    }
};
