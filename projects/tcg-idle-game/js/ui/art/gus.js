/**
 * ASCII art for Gus's Games & Grub: the front, closed until the grand
 * opening, and the inside once it's open
 */

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

/**
 * The inside of the store
 * @param {Object} options - marcus: whether Marcus is at the table by the window
 */
export function inside({ marcus = false } = {}) {
    const rows = [
        ' [##][##][##]   .-----------.',
        ' [##][##][##]   |  FRIDAY   |',
        ' [##][##][##]   |   NIGHT   |',
        ' [##][##][##]   |  LOCALS!  |',
        '                \'-----------\'',
        '   (o_o)' + (marcus ? '                (-_-)' : ''),
        '   /|=|\\' + (marcus ? '                /|#|\\' : ''),
        '  __|_|__  .--------.  ' + (marcus ? '__|_|__' : '_______'),
        ' | GUS   | |[] [] []| |_______|',
        ' |_______| \'--------\'   | |'
    ];
    return [
        '  _______________________________',
        ' |      GUS\'S GAMES & GRUB       |',
        ' |_______________________________|',
        ...rows.map(row => ' |' + row.padEnd(INSIDE) + '|'),
        ' |_______________________________|'
    ].join('\n');
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
    const half = text => text.slice(0, 13).padStart(Math.ceil((13 + text.length) / 2)).padEnd(13);
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
