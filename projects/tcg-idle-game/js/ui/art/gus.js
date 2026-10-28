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

// The store is three columns: the shelves of packs down the left wall;
// the corkboard, with Gus behind the counter below it; and the window, with
// the trade table below it. Each column's width, and the space before it:
const COLUMNS = [{ width: 10, gap: 1 }, { width: 16, gap: 2 }, { width: 11, gap: 3 }];
// Width inside the walls
const INSIDE = 44;
// Rows inside the walls
const HEIGHT = 16;

/**
 * Lay out the parts of the store in their columns, each part at the top or
 * the bottom of its column, and turn each row into pieces. Only the drawn
 * part of each line can be pressed, not the space around it.
 * @param {Array} columns - Per column, a list of { area, lines, bottom }
 * @returns {Array} - Rows of pieces
 */
function layOut(columns) {
    const grid = columns.map(parts => {
        const cells = Array.from({ length: HEIGHT }, () => ({ text: '', area: null }));
        let top = 0;
        let bottom = HEIGHT;
        for (const { area, lines, bottom: atBottom } of parts) {
            const start = atBottom ? (bottom -= lines.length) : top;
            lines.forEach((text, index) => {
                cells[start + index] = { text, area };
            });
            if (!atBottom) {
                top += lines.length;
            }
        }
        return cells;
    });

    return Array.from({ length: HEIGHT }, (_, row) => {
        const pieces = [];
        grid.forEach((cells, column) => {
            const { width, gap } = COLUMNS[column];
            const { text, area } = cells[row];
            const line = text.padEnd(width);
            const drawn = line.trim();
            const before = line.length - line.trimStart().length;
            pieces.push(plain(' '.repeat(gap) + line.slice(0, before)));
            if (drawn) {
                pieces.push(part(area, drawn));
            }
            pieces.push(plain(line.slice(before + drawn.length)));
        });
        const used = textOf(pieces).length;
        pieces.push(plain(' '.repeat(INSIDE - used)));
        return pieces;
    });
}

/**
 * The inside of the store as lines of pieces
 * @param {Object} options - marcus: whether Marcus is at the table by the
 *                           window; newSet: whether a new set is on the
 *                           shelves; night: whether it's dark out; poster:
 *                           what's on the corkboard ('notices', 'soon', or
 *                           'clash')
 */
function insideLines({ marcus = false, newSet = false, night = false, poster: posterShows = 'clash' } = {}) {
    const shelves = [
        '.--------.',
        '| PACKS  |',
        ...Array.from({ length: HEIGHT - 3 }, (_, row) => newSet && row < 4 ? '|[BB][BB]|' : '|[##][##]|'),
        '\'--------\''
    ];
    // The corkboard: the neighbourhood's notices, then Gus's poster
    const poster = {
        notices: [
            '.--------------.',
            '|o  LOST CAT  o|',
            '|  (NOT GUS\'S) |',
            '|--------------|',
            '| BAND WANTED  |',
            '|o  NO DRUMS  o|',
            '\'--------------\''
        ],
        soon: [
            '.--------------.',
            '|o  FRIDAY    o|',
            '|  NIGHT CLASH |',
            '|--------------|',
            '| LOCAL TOURNEY|',
            '|o TOMORROW!  o|',
            '\'--------------\''
        ],
        clash: [
            '.--------------.',
            '|o  FRIDAY    o|',
            '|  NIGHT CLASH |',
            '|--------------|',
            '| LOCAL TOURNEY|',
            '|o EVERY DAY  o|',
            '\'--------------\''
        ]
    }[posterShows];
    const gus = [
        '     (o_o)',
        '    _/|=|\\_'
    ];
    // The counter is a glass case of singles, with Gus's till at the front
    const glassCase = [
        '.--------------.',
        '| [*] [*] [*]  |',
        '|   SINGLES    |'
    ];
    const counter = [
        '|--------------|',
        '|  COUNTER  [$]|',
        '\'--------------\''
    ];
    const window = [
        '.---------.',
        night ? '| *  |    |' : '|    |    |',
        '|----+----|',
        night ? '|    |  * |' : '|    |    |',
        '\'---------\''
    ];
    const table = [
        ...(marcus ? ['  (-_-)', ' _/|#|\\_'] : []),
        '|=======|',
        '|       |',
        'TRADE TABLE'
    ];

    const rows = layOut([
        [{ area: 'shelves', lines: shelves }],
        [
            { area: 'board', lines: poster },
            { area: 'gus', lines: counter, bottom: true },
            { area: 'case', lines: glassCase, bottom: true },
            { area: 'gus', lines: gus, bottom: true }
        ],
        [
            { area: 'table', lines: window },
            { area: 'table', lines: table, bottom: true }
        ]
    ]);
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
