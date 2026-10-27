/**
 * Endings. An ending with a screen has art (a key from js/ui/art/index.js)
 * and lines written from the state at the moment the run ended. The text is
 * in js/content/text/endings.js.
 */

import { Lines } from './text/index.js';

export const Endings = [
    { id: 'collector' },
    { id: 'champion' },
    { id: 'business' },
    { id: 'scalper' },
    {
        id: 'shame',
        art: 'guard',
        lines: game => Lines.endings.shame.lines({
            sadKids: game.state.kindness.strikes.filter(strike => ['pip', 'buyout'].includes(strike.source)).length,
            shoves: game.state.kindness.strikes.filter(strike => strike.source === 'camper').length,
            kicks: game.state.vending.kicks
        }),
        note: Lines.endings.shame.note
    }
].map(ending => ({ ...ending, name: Lines.endings.names[ending.id] }));
