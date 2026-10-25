/**
 * ASCII art for home: the shoebox and the storage that replaces it
 */

export function shoebox(label) {
    return [
        '    ____________________',
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
 */
export function storage(kind, shoeboxFate) {
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
            return shoebox(shoeboxFate === 'sold' ? ['SHOES', ''] : ['CARDS - DO NOT', 'TOUCH']);
    }
}
