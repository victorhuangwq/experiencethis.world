/**
 * ASCII art for the office: the player's cubicle, seen from its opening.
 * It starts clean and corporate and fills up as the hobby takes over (see
 * Job.desk), and its calendar shows the real date and time.
 */

// Width of the cubicle, and its height
const WIDTH = 48;
const HEIGHT = 22;

/**
 * A grid of characters to draw things on
 */
function canvas() {
    const rows = Array.from({ length: HEIGHT }, () => new Array(WIDTH).fill(' '));
    return {
        put(row, column, lines) {
            [].concat(lines).forEach((line, index) => {
                [...line].forEach((char, offset) => {
                    rows[row + index][column + offset] = char;
                });
            });
        },
        text: () => rows.map(row => row.join('').trimEnd()).join('\n')
    };
}

/**
 * The cubicle
 * @param {number} stage - How far the hobby has taken over, from 0 (a clean
 *                         desk) to 6 (buried in cards); see Job.desk
 * @param {Object} options - inbox (emails in it), calendar ({ month, day,
 *                           date, time }, each 7 characters at most), and
 *                           marcus (whether he's looking over the partition)
 */
export function desk(stage, { inbox, calendar, marcus = false }) {
    const art = canvas();
    const center = (text, width) => {
        const fitted = String(text).slice(0, width);
        const before = Math.floor((width - fitted.length) / 2);
        return ' '.repeat(before) + fitted + ' '.repeat(width - before - fitted.length);
    };

    // The partition: the side panels come towards us, the back panel is flat
    art.put(1, 0, [
        '__' + ' '.repeat(44) + '__',
        '| `-.' + ' '.repeat(38) + '.-\' |',
        '|    `-.' + ' '.repeat(32) + '.-\'    |',
        '|       |' + '-'.repeat(30) + '|       |',
        ...new Array(12).fill('|       |' + ' '.repeat(30) + '|       |'),
        '|      /' + '_'.repeat(32) + '\\      |',
        '|     /' + ' '.repeat(34) + '\\     |',
        '|    /' + ' '.repeat(36) + '\\    |',
        '|   /' + ' '.repeat(38) + '\\   |',
        '|__/' + '_'.repeat(40) + '\\__|'
    ]);

    // Marcus, looking over the partition from the next cubicle
    if (marcus) {
        art.put(0, 39, '(o_o)');
        art.put(1, 38, 'd     b');
    }

    // The back panel: the poster, Gus's flyer, and the calendar
    art.put(5, 10, stage >= 6
        ? ['.---------.', '|BACKYARD |', '| BRAWL!! |', '\'---------\'']
        : ['.---------.', '|QUARTERLY|', '| SYNERGY |', '\'---------\'']);
    if (stage >= 4) {
        art.put(5, 22, ['.-----.', '|FRI. |', '|CLASH|', '\'-----\'']);
    }
    const { month, day, date, time } = calendar;
    art.put(5, 29, ['.-------.', `|${center(month, 7)}|`, `|${center(`${day} ${date}`, 7)}|`, `|${center(time, 7)}|`, '\'-------\'']);

    // The corkboard on the right-hand panel: a memo, then cards over it
    let pinned = ['|MEMO|', '|    |', '|    |', '|    |'];
    if (stage >= 2) {
        pinned[1] = '|[#] |';
    }
    if (stage >= 4) {
        pinned = ['|MEMO|', '|[#] |', '| [#]|', '|[#] |'];
    }
    if (stage >= 6) {
        pinned = ['|[#][|', '|][#]|', '|[#][|', '|][#]|'];
    }
    art.put(5, 40, ['  .--|', '.\'   |', ...pinned, '\'.   |', '  \'--|']);

    // The terminal, with the inbox on its screen, and cards taped to it
    art.put(10, 16, [
        '.------------.',
        '| .--------. |',
        '| | INBOX  | |',
        `| |${center(`(${Math.min(inbox, 99999)})`, 8)}| |`,
        '| \'--------\' |',
        '\'------------\''
    ]);
    if (stage >= 1) {
        art.put(10, 16, '[#]');
    }
    if (stage >= 6) {
        art.put(10, 27, '[#]');
        art.put(15, 16, '[#]');
        art.put(15, 27, '[#]');
    }

    // Binders, stacked on the left
    const binders = stage >= 6 ? 3 : stage >= 3 ? 2 : stage >= 2 ? 1 : 0;
    for (let binder = 0; binder < binders; binder++) {
        art.put(16 - binder, 9, '[CARDS]');
    }

    // Graded cards on stands, on the right
    if (stage >= 5) {
        art.put(13, 31, ['.--.', '|10|', '/__\\']);
    }
    if (stage >= 6) {
        art.put(13, 35, ['.--.', '|9 |', '/__\\']);
    }

    // On the desk: the keyboard, the trackball, the mug, then pack
    // wrappers and a playmat
    if (stage >= 1) {
        art.put(17, 31, stage >= 4 ? '%%%' : '%');
    }
    art.put(18, 13, '[==========]  (o)');
    art.put(18, 34, 'c[_]');
    if (stage >= 3) {
        art.put(19, 11, '~'.repeat(23));
    }

    // Under the desk: a bag from Gus's, then a box of bulk commons
    if (stage >= 4) {
        art.put(20, 36, ['.---.', '|GUS|']);
    }
    if (stage >= 6) {
        art.put(20, 5, ['.------.', '|_BULK_|']);
    }
    return art.text();
}
