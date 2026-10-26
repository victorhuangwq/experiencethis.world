/**
 * ASCII art for the back of the mall: the CARD-O-MATIC 3000 and Dale
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';

// Put text to the right of some lines of art, starting at a line
function beside(lines, extra, fromLine) {
    const width = Math.max(...lines.map(line => line.length));
    return lines.map((line, index) => {
        const addition = extra[index - fromLine];
        return addition === undefined ? line : line.padEnd(width) + addition;
    });
}

/**
 * The CARD-O-MATIC 3000, carrying the marks of the player's choices
 * @param {Object} state - Game state
 * @param {boolean} kidInLine - Whether to draw the kid waiting in line
 */
export function machine(state, kidInLine) {
    const { slots, jammedSlot, kicks } = state.vending;
    const cell = kind => kind === 'special' ? '[**]' : kind ? '[##]' : '[  ]';
    const row = start => slots.slice(start, start + 4).map(cell).join('  ');
    const line = inner => ' |' + inner.padEnd(26) + '|';
    const sticker = state.people.pip.kindness > 0 ? ' (^o^)' : '';

    let lines = [
        ' .--------------------------.',
        line('  CARD-O-MATIC 3000' + sticker),
        ' |--------------------------|',
        line('  ' + row(0)),
        line('   A1    A2    A3    A4'),
        line('  ' + row(4)),
        line('   B1    B2    B3    B4'),
        ' |--------------------------|',
        line(`  [##] ${Format.money(Rules.prices.normal)}   [**] ${Format.money(Rules.prices.special)}`),
        line('  .--------------------.'),
        line('  |  PUSH      ' + (jammedSlot === null ? '[    ]' : '[ ?? ]') + '  |'),
        line('  \'--------------------\''),
        ' \'--------------------------\''
    ];

    // Each round of kicking leaves another dent in the right side
    for (const [minimumKicks, lineIndex] of [[1, 6], [5, 9], [12, 3]]) {
        if (kicks >= minimumKicks) {
            lines[lineIndex] = lines[lineIndex].slice(0, -1) + ')';
        }
    }

    if (state.kindness.note) {
        lines = beside(lines, ['  .---------.', '==| BE NICE |', '  \'---------\''], 3);
    }
    if (kidInLine) {
        const name = state.people.pip.kindness > 0 ? 'PIP' : 'kid';
        lines = beside(lines, ['    (o_o)', '    /| |\\', '     / \\', '     ' + name], 9);
    }
    return lines.join('\n');
}

// Officer Dale, mall security
export const guard = [
    '      _____',
    '     |_____|     MALL',
    '      (o_o)      SECURITY',
    '     --|#|--',
    '       / \\'
].join('\n');
