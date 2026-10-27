/**
 * ASCII art for the back of the mall: the CARD-O-MATIC 3000 and Dale
 *
 * The machine is built from pieces of text. Some pieces are parts the player
 * can press (the slots and the coin return): the mall scene turns them into
 * buttons with machineHtml(), and machine() gives the same art as plain text.
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { escape } from '../html.js';

// Width inside the machine's frame
const INSIDE = 26;

const plain = text => ({ text });
const textOf = pieces => pieces.map(piece => piece.text).join('');

// A line inside the frame, padded to the frame's width
function framed(...pieces) {
    return [plain(' |'), ...pieces, plain(' '.repeat(INSIDE - textOf(pieces).length) + '|')];
}

// Put text to the right of some lines, starting at a line, lined up just
// past the widest of those lines
function beside(lines, extra, fromLine) {
    const width = Math.max(...lines.slice(fromLine, fromLine + extra.length).map(line => textOf(line).length));
    return lines.map((line, index) => {
        const addition = extra[index - fromLine];
        return addition === undefined ? line : [...line, plain(' '.repeat(width - textOf(line).length) + addition)];
    });
}

// How each kind of pack looks in its slot
const CELLS = { normal: '[##]', bundle: '[3x]', special: '[**]', mega: '[MM]' };

// People who stand beside the machine during an encounter
const VISITORS = {
    kid: name => ['    (o_o)', '    /| |\\', '     / \\', '     ' + name],
    flip: () => ['    [B-)]', '    /|$|\\', '     / \\', '    FLIP'],
    terry: () => ['    (u_u)', '    /| |\\ [~]', '    _/ \\_', '    TERRY']
};

/**
 * The machine as lines of pieces, carrying the marks of the player's choices
 * @param {Object} state - Game state
 * @param {string|null} visitor - Who is drawn beside it: kid, flip, or terry
 */
function machineLines(state, visitor) {
    const { slots, jammedSlot, kicks } = state.vending;
    const cell = kind => CELLS[kind] || '[  ]';
    const slotRow = start => {
        const pieces = [plain('  ')];
        for (let index = start; index < start + 4; index++) {
            if (index > start) {
                pieces.push(plain('  '));
            }
            pieces.push({ text: cell(slots[index]), slot: index });
        }
        return framed(...pieces);
    };
    const sticker = state.people.pip.kindness > 0 ? ' (^o^)' : '';
    const price = kind => `${CELLS[kind]} ${Format.money(Rules.prices[kind])}`;

    let lines = [
        [plain(' .--------------------------.')],
        framed(plain('  CARD-O-MATIC 3000' + sticker)),
        [plain(' |--------------------------|')],
        slotRow(0),
        framed(plain('   A1    A2    A3    A4')),
        slotRow(4),
        framed(plain('   B1    B2    B3    B4')),
        [plain(' |--------------------------|')],
        framed(plain(`  ${price('normal')}  ${price('special')}`)),
        framed(plain(`  ${price('bundle')}  ${price('mega')}`)),
        framed(plain('  .--------------------.')),
        framed(plain('  |  PUSH      ' + (jammedSlot === null ? '[    ]' : '[ ?? ]') + '  |')),
        framed(plain('  \'--------------------\'')),
        framed(plain('  COIN RETURN '), { text: '[o]', coinReturn: true }),
        [plain(' \'--------------------------\'')]
    ];

    // Each round of kicking leaves another dent in the right side
    for (const [minimumKicks, lineIndex] of [[1, 6], [5, 10], [12, 3]]) {
        if (kicks >= minimumKicks) {
            const line = lines[lineIndex];
            const edge = line[line.length - 1];
            lines[lineIndex] = [...line.slice(0, -1), plain(edge.text.slice(0, -1) + ')')];
        }
    }

    if (state.kindness.note) {
        lines = beside(lines, ['  .---------.', '==| BE NICE |', '  \'---------\''], 3);
    }
    if (visitor) {
        lines = beside(lines, VISITORS[visitor](state.people.pip.kindness > 0 ? 'PIP' : 'kid'), 11);
    }
    return lines;
}

/**
 * The CARD-O-MATIC 3000 as plain text
 * @param {Object} state - Game state
 * @param {string|null} visitor - Who to draw beside it: kid, flip, or terry
 */
export function machine(state, visitor = null) {
    return machineLines(state, visitor).map(textOf).join('\n');
}

/**
 * The CARD-O-MATIC 3000 as HTML, with its slots and coin return drawn by
 * the given functions (usually as buttons)
 * @param {Object} state - Game state
 * @param {Object} controls - slot(index, text) and coinReturn(text), returning HTML
 */
export function machineHtml(state, controls) {
    return machineLines(state, null).map(line => line.map(piece => {
        if (piece.slot !== undefined) {
            return controls.slot(piece.slot, piece.text);
        }
        if (piece.coinReturn) {
            return controls.coinReturn(piece.text);
        }
        return escape(piece.text);
    }).join('')).join('\n');
}

// Officer Dale, mall security
export const guard = [
    '      _____',
    '     |_____|     MALL',
    '      (o_o)      SECURITY',
    '     --|#|--',
    '       / \\'
].join('\n');
