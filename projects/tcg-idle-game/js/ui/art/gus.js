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
