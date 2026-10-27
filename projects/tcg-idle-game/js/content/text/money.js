/**
 * Money: the allowance. The day job is in job.js.
 */

import { Format } from '../../core/format.js';

export const Money = {
    label: 'You have',
    allowance: 'You decide to give yourself an allowance. $1.20 a minute. You are a responsible adult.',
    allowanceAway: (cents, capped) => `your allowance paid you ${Format.money(cents)}` +
        (capped ? ' (the piggy bank only holds 8 hours, which is also how long you slept, probably)' : '')
};
