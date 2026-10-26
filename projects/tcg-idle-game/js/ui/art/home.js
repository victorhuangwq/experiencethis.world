/**
 * ASCII art for home: the shoebox, the storage that replaces it, and binder
 * pockets
 */

import { wrap } from './cards.js';

/**
 * A shoebox. When it's overflowing, cards stick out of the top.
 * @param {Array} label - Two lines written on the side
 * @param {boolean} overflowing - Whether cards are spilling out
 */
export function shoebox(label, overflowing = false) {
    const top = overflowing
        ? ['      .--.  .--.   .--.', '    __|##|__|##|___|##|_']
        : ['    ____________________'];
    return [
        ...top,
        '   /                   /|',
        '  /___________________/ |',
        '  |                   | |',
        '  |  ' + label[0].padEnd(17) + '| |',
        '  |  ' + label[1].padEnd(17) + '| /',
        '  |___________________|/'
    ].join('\n');
}

/**
 * Where the player keeps their cards
 * @param {string} kind - Storage id from Rules.storage
 * @param {string} shoeboxFate - What happened to the childhood shoebox: 'sold' or 'kept'
 * @param {boolean} overflowing - Whether cards are spilling out of it
 */
export function storage(kind, shoeboxFate, overflowing = false) {
    switch (kind) {
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
            return shoebox(shoeboxFate === 'sold' ? ['SHOES', ''] : ['CARDS - DO NOT', 'TOUCH'], overflowing);
    }
}

// Width inside a binder pocket
const POCKET = 12;

/**
 * A binder pocket holding a critter
 * @param {Object} entry - name, rarity, count
 */
export function pocket(entry) {
    const edge = { common: '-', uncommon: '=', rare: '*' }[entry.rarity] || '-';
    const [first = '', second = ''] = wrap(entry.name, POCKET);
    const count = entry.count > 1 ? 'x' + entry.count : '';
    return [
        '.' + edge.repeat(POCKET) + '.',
        '|' + first.padEnd(POCKET) + '|',
        '|' + second.padEnd(POCKET) + '|',
        '|' + entry.rarity.padEnd(POCKET - count.length) + count + '|',
        '\'' + edge.repeat(POCKET) + '\''
    ].join('\n');
}

// An empty pocket, the same size as a full one
export const emptyPocket = [
    '.' + '.'.repeat(POCKET) + '.',
    ':' + ' '.repeat(POCKET) + ':',
    ':' + ' '.repeat(POCKET) + ':',
    ':' + ' '.repeat(POCKET) + ':',
    ':' + '.'.repeat(POCKET) + ':'
].join('\n');
