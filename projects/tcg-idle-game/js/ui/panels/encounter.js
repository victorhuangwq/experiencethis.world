/**
 * An encounter, shown in place of the scene where it happens
 */

import { ArtByKey } from '../art/index.js';
import { escape, button, art } from '../html.js';

export function renderEncounter(game, encounter) {
    const choices = encounter.choices(game).map((choice, index) =>
        button('encounter.choose', choice.label, { args: { index }, disabled: choice.disabled }));
    return art(ArtByKey[encounter.art](game, encounter)) +
        `<div class="encounter">${encounter.text(game).map(line => `<p>${escape(line)}</p>`).join('')}</div>` +
        `<p>${choices.join(' ')}</p>`;
}
