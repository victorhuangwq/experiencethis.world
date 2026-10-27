/**
 * ASCII art for Gus's Games & Grub: the front, closed until the grand
 * opening, and the inside once it's open
 *
 * The inside is built from pieces of text, like the vending machine. Some
 * pieces are parts of the store the player can press to look closer (the
 * shelves, the corkboard, Gus, the glass case, and the table by the
 * window): the store scene turns them into buttons with insideHtml(), and
 * inside() gives the same art as plain text.
 */

import { escape } from '../html.js';

export const store = [
    '  _______________________________',
    ' |      GUS\'S GAMES & GRUB       |',
    ' |_______________________________|',
    ' |  ____   ____   .-----------.  |',
    ' | |[##]| |[##]|  |  GRAND    |  |',
    ' | |____| |____|  |  OPENING  |  |',
    ' |                | TOMORROW! |  |',
    ' |   ________     \'-----------\'  |',
    ' |  |        |                   |',
    ' |  |      o |                   |',
    ' |__|________|___________________|'
].join('\n');

// Width inside the walls
const INSIDE = 31;

const plain = text => ({ text });
const part = (area, text) => ({ text, area });
const textOf = pieces => pieces.map(piece => piece.text).join('');

/**
 * The inside of the store as lines of pieces
 * @param {Object} options - marcus: whether Marcus is at the table by the
 *                           window; newSet: whether a new set is on the shelves
 */
function insideLines({ marcus = false, newSet = false } = {}) {
    const shelf = row => part('shelves', newSet && row < 2 ? '[BB][BB][BB]' : '[##][##][##]');
    const rows = [
        [plain(' '), shelf(0), plain('   '), part('board', '.-----------.')],
        [plain(' '), shelf(1), plain('   '), part('board', '|  FRIDAY   |')],
        [plain(' '), shelf(2), plain('   '), part('board', '|   NIGHT   |')],
        [plain(' '), shelf(3), plain('   '), part('board', '|  LOCALS!  |')],
        [plain('                '), part('board', '\'-----------\'')],
        [plain('   '), part('gus', '(o_o)'), ...(marcus ? [plain('                '), part('table', '(-_-)')] : [])],
        [plain('   '), part('gus', '/|=|\\'), ...(marcus ? [plain('                '), part('table', '/|#|\\')] : [])],
        [plain('  '), part('gus', '__|_|__'), plain('  '), part('case', '.--------.'), plain('  '), part('table', marcus ? '__|_|__' : '_______')],
        [plain(' '), part('gus', '| GUS   |'), plain(' '), part('case', '|[] [] []|'), plain(' '), part('table', '|_______|')],
        [plain(' '), part('gus', '|_______|'), plain(' '), part('case', '\'--------\''), plain('   '), part('table', '| |')]
    ];
    return [
        [plain('  _______________________________')],
        [plain(' |      GUS\'S GAMES & GRUB       |')],
        [plain(' |_______________________________|')],
        ...rows.map(row => [plain(' |'), ...row, plain(' '.repeat(INSIDE - textOf(row).length) + '|')]),
        [plain(' |_______________________________|')]
    ];
}

/**
 * The inside of the store as plain text
 */
export function inside(options) {
    return insideLines(options).map(textOf).join('\n');
}

/**
 * The inside of the store as HTML, with the parts the player can press
 * drawn by the given function (usually as buttons)
 * @param {Object} options - As for inside()
 * @param {Function} area - (id, text, first) returning HTML; first is true
 *                          for the first piece of each part
 */
export function insideHtml(options, area) {
    const seen = new Set();
    return insideLines(options).map(line => line.map(piece => {
        if (!piece.area) {
            return escape(piece.text);
        }
        const first = !seen.has(piece.area);
        seen.add(piece.area);
        return area(piece.area, piece.text, first);
    }).join('')).join('\n');
}

/**
 * The tournament table: the opponent behind it, and the last cards played
 * @param {string} face - The opponent's face
 * @param {string} name - The opponent's name
 * @param {Object|null} last - The last round: { theirs, mine }, each a card
 *                             with a type and power
 */
export function table(face, name, last = null) {
    const card = played => played ? `|${played.type[0]}${String(played.power).padStart(3)}|` : '|    |';
    // Centred under each card, cut short to fit
    const half = text => {
        const fitted = text.slice(0, 13);
        return fitted.padStart(Math.ceil((13 + fitted.length) / 2)).padEnd(13);
    };
    return [
        '            ' + face,
        '            /|=|\\',
        ' ___________|_|_____________',
        '|    .----.       .----.    |',
        `|    ${card(last?.theirs)}       ${card(last?.mine)}    |`,
        '|    \'----\'       \'----\'    |',
        `|${half(name.toUpperCase())} ${half('YOU')}|`,
        '|___________________________|'
    ].join('\n');
}
