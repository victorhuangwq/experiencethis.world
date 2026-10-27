/**
 * ASCII art for cards and packs
 */

import { Catalog } from '../../content/catalog.js';

// The edge of a card shows its rarity
export const edges = { common: '-', uncommon: '=', rare: '*', 'ultra-rare': '#', legendary: '$' };

/**
 * The bottom edge of a card, with its number printed on it
 * @param {string} edge - Edge character
 * @param {number} width - Width inside the card
 * @param {string} number - Card number, or '' for none
 */
export function bottomEdge(edge, width, number) {
    if (!number) {
        return '\'' + edge.repeat(width) + '\'';
    }
    return '\'' + edge.repeat(width - number.length - 3) + ' ' + number + ' ' + edge + '\'';
}

/**
 * A face-up card
 * @param {Object} card - Card, optionally with isNew
 */
export function card(card) {
    const width = 15;
    const edge = edges[card.rarity];
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
        bottomEdge(edge, width, Catalog.number(card.cardId))
    ].join('\n');
}

// A face-down card, the same size as a face-up one
export const cardBack = [
    '.---------------.',
    '|  .---------.  |',
    '|  | CRITTER |  |',
    '|  |  CLASH  |  |',
    '|  \'---------\'  |',
    '|               |',
    '\'---------------\''
].join('\n');

// A pack being torn open, frame by frame
export const packTear = [
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
];

/**
 * Wrap text to a width, breaking at spaces
 */
export function wrap(text, width) {
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
