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

const plain = text => ({ text });
const part = (area, text) => ({ text, area });
const textOf = pieces => pieces.map(piece => piece.text).join('');

// The store is three columns: the shelves, the corkboard, and the window on
// the back wall, then Gus, the glass case, and the table at the front. Each
// column's width:
const COLUMNS = [13, 13, 11];
// Width inside the walls: the columns, two spaces between them, and one at
// each side
const INSIDE = 43;

/**
 * Lines of a row of parts of the store, side by side. Only the drawn part
 * of each line can be pressed, not the space around it.
 * @param {Array} blocks - { area, lines }, one per column
 * @param {string} align - 'top' or 'bottom'
 */
function side(blocks, align) {
    const height = Math.max(...blocks.map(block => block.lines.length));
    return Array.from({ length: height }, (_, row) => {
        const pieces = [plain(' ')];
        blocks.forEach((block, column) => {
            const offset = align === 'top' ? 0 : height - block.lines.length;
            const line = (block.lines[row - offset] ?? '').padEnd(COLUMNS[column]);
            const drawn = line.trim();
            const before = line.length - line.trimStart().length;
            pieces.push(plain((column > 0 ? '  ' : '') + line.slice(0, before)));
            if (drawn) {
                pieces.push(part(block.area, drawn));
            }
            pieces.push(plain(line.slice(before + drawn.length)));
        });
        pieces.push(plain(' '));
        return pieces;
    });
}

/**
 * The inside of the store as lines of pieces
 * @param {Object} options - marcus: whether Marcus is at the table by the
 *                           window; newSet: whether a new set is on the
 *                           shelves; night: whether it's dark out
 */
function insideLines({ marcus = false, newSet = false, night = false } = {}) {
    const shelves = [
        '.-----------.',
        '|   PACKS   |',
        '| [##] [##] |',
        '|===========|',
        '| [##] [##] |',
        '|===========|',
        newSet ? '| [BB] [BB] |' : '| [##] [##] |',
        '\'-----------\''
    ];
    const board = [
        '.-----------.',
        '|o         o|',
        '|  FRIDAY   |',
        '|   NIGHT   |',
        '|  LOCALS!  |',
        '| EVERY HOUR|',
        '|o         o|',
        '\'-----------\''
    ];
    const window = [
        '.---------.',
        night ? '| *  |    |' : '|    |    |',
        night ? '|    |  * |' : '|    |    |',
        '|----+----|',
        night ? '|  * |    |' : '|    |    |',
        '\'----\'----\'',
        '',
        'TRADE TABLE'
    ];
    const gus = [
        '    (o_o)',
        '   _/|=|\\_',
        '.-----------.',
        '| [$]  GUS  |',
        '\'-----------\''
    ];
    const glassCase = [
        '   SINGLES',
        '.-----------.',
        '|[*] [*] [*]|',
        '|[*] [*] [*]|',
        '\'-----------\''
    ];
    const table = [
        ...(marcus ? ['  (-_-)', '  /|#|\\'] : []),
        '.---------.',
        '\'---------\'',
        '  |     |'
    ];

    const rows = [
        ...side([{ area: 'shelves', lines: shelves }, { area: 'board', lines: board }, { area: 'table', lines: window }], 'top'),
        [plain(' '.repeat(INSIDE))],
        ...side([{ area: 'gus', lines: gus }, { area: 'case', lines: glassCase }, { area: 'table', lines: table }], 'bottom')
    ];
    const name = 'GUS\'S GAMES & GRUB';
    const before = Math.floor((INSIDE - name.length) / 2);
    return [
        [plain('  ' + '_'.repeat(INSIDE))],
        [plain(' |' + ' '.repeat(before) + name + ' '.repeat(INSIDE - before - name.length) + '|')],
        [plain(' |' + '='.repeat(INSIDE) + '|')],
        ...rows.map(row => [plain(' |'), ...row, plain('|')]),
        [plain(' |' + '_'.repeat(INSIDE) + '|')]
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
