/**
 * ASCII art. Everything here returns plain text for a <pre>.
 */

import { Format } from '../core/util.js';
import { Rules } from '../rules.js';

// Put text to the right of some lines of art, starting at a line
function beside(lines, extra, fromLine) {
    const width = Math.max(...lines.map(line => line.length));
    return lines.map((line, index) => {
        const addition = extra[index - fromLine];
        return addition === undefined ? line : line.padEnd(width) + addition;
    });
}

export const Art = {
    shoebox(label) {
        return [
            '    ____________________',
            '   /                   /|',
            '  /___________________/ |',
            '  |                   | |',
            '  |  ' + label[0].padEnd(17) + '| |',
            '  |  ' + label[1].padEnd(17) + '| /',
            '  |___________________|/'
        ].join('\n');
    },

    /**
     * The CARD-O-MATIC 3000, carrying the marks of the player's choices
     * @param {Object} state - Game state
     * @param {boolean} kidInLine - Whether to draw the kid waiting in line
     */
    machine(state, kidInLine) {
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
    },

    /**
     * Where the player keeps their cards
     * @param {string} storage - Storage id from Rules.storage
     * @param {string} shoebox - 'sold' or 'kept'
     */
    storage(storage, shoebox) {
        switch (storage) {
            case 'binder':
                return [
                    '   ________________',
                    '  |o|              |',
                    '  |o|   CRITTER    |',
                    '  |o|    CLASH     |',
                    '  |o|              |',
                    '  |o|______________|'
                ].join('\n');
            case 'two-binders':
                return [
                    '   ____________   ____________',
                    '  |o|          | |o|          |',
                    '  |o| CRITTER  | |o| CRITTER  |',
                    '  |o|  CLASH   | |o|  CLASH   |',
                    '  |o|      1   | |o|      2   |',
                    '  |o|__________| |o|__________|'
                ].join('\n');
            case 'bookshelf':
                return [
                    '  ___________________________',
                    ' | |o| |o| |o| |o| |o| |o|   |',
                    ' | |o| |o| |o| |o| |o| |o|   |',
                    ' |___________________________|',
                    ' | |o| |o| |o| |o| |o|       |',
                    ' | |o| |o| |o| |o| |o|       |',
                    ' |___________________________|'
                ].join('\n');
            case 'card-room':
                return [
                    '  _______________________________',
                    ' |  THE CARD ROOM                |',
                    ' |  (formerly the guest room)    |',
                    ' |  [|||] [|||] [|||] [|||] [||| |',
                    ' |  [|||] [|||] [|||] [|||] [||| |',
                    ' |  [|||] [|||] [|||] [|||] [||| |',
                    ' |_______________________________|'
                ].join('\n');
            default:
                return Art.shoebox(shoebox === 'sold' ? ['SHOES', ''] : ['CARDS - DO NOT', 'TOUCH']);
        }
    },

    store: [
        '  _______________________________',
        ' |      GUS\'S GAMES & GRUB       |',
        ' |_______________________________|',
        ' |  ____   ____   .-----------.  |',
        ' | |[##]| |[##]|  | CLOSED FOR|  |',
        ' | |____| |____|  | INVENTORY.|  |',
        ' |                |     - GUS |  |',
        ' |   ________     \'-----------\'  |',
        ' |  |        |                   |',
        ' |  |      o |                   |',
        ' |__|________|___________________|'
    ].join('\n'),

    guard: [
        '      _____',
        '     |_____|     MALL',
        '      (o_o)      SECURITY',
        '     --|#|--',
        '       / \\'
    ].join('\n'),

    /**
     * A face-up card
     * @param {Object} card - Card, optionally with isNew
     */
    card(card) {
        const width = 15;
        const edge = { common: '-', uncommon: '=', rare: '*', 'ultra-rare': '#', legendary: '$' }[card.rarity];
        const nameLines = wrap(card.name, width);
        while (nameLines.length < 3) {
            nameLines.push('');
        }
        const power = 'P' + card.power;

        return [
            '.' + edge.repeat(width) + '.',
            ...nameLines.slice(0, 3).map(text => '|' + text.padEnd(width) + '|'),
            '|' + card.type.toUpperCase().padEnd(width - power.length) + power + '|',
            '|' + (card.isNew ? card.rarity + ' NEW!' : card.rarity).padEnd(width) + '|',
            '\'' + edge.repeat(width) + '\''
        ].join('\n');
    },

    // A face-down card, the same size as a face-up one
    cardBack: [
        '.---------------.',
        '|  .---------.  |',
        '|  | CRITTER |  |',
        '|  |  CLASH  |  |',
        '|  \'---------\'  |',
        '|               |',
        '\'---------------\''
    ].join('\n'),

    // A pack being torn open, frame by frame
    packTear: [
        [
            ' .---------------.',
            ' |    CRITTER    |',
            ' |     CLASH     |',
            ' |   ~~~~~~~~~   |',
            ' \'---------------\''
        ].join('\n'),
        [
            ' .------  ~  ----.',
            ' |    CRITT  ~ER |   rrrrip',
            ' |     CLA  ~ SH |',
            ' |   ~~~~~ ~ ~~~ |',
            ' \'-------  ~ ----\''
        ].join('\n')
    ]
};

/**
 * Wrap text to a width, breaking at spaces
 */
function wrap(text, width) {
    const lines = [];
    let current = '';
    for (const word of text.split(' ')) {
        const next = current ? current + ' ' + word : word;
        if (next.length <= width) {
            current = next;
        } else {
            if (current) {
                lines.push(current);
            }
            current = word.slice(0, width);
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines;
}
