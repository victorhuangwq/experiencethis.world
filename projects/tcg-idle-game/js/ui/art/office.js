/**
 * ASCII art for the office: the player's desk, which fills up as the hobby
 * takes over (see Job.desk)
 */

/**
 * The desk
 * @param {number} stage - 0 bare, 1 a card under the monitor, 2 a binder,
 *                         3 a playmat for a mousepad
 * @param {number} inbox - Emails in the inbox
 */
export function desk(stage, inbox) {
    const count = String(Math.min(inbox, 99999)).padStart(5);
    return [
        ' .---------------------.',
        ' |  QUARTERLY SYNERGY  |',
        " '---------------------'",
        '         .-----------------.',
        `         | Inbox (${count})   |`,
        '         |                 |' + (stage >= 1 ? '[#]' : ''),
        "         '-----------------'",
        (stage >= 2 ? '   .---.' : '        ') + '          |' + (stage >= 3 ? '      .~~~~~~.' : ''),
        (stage >= 2 ? ' __|o  |' : ' _______') + '_______[_____]' + (stage >= 3 ? '___|~~~~~~|_' : '____________'),
        '|                                 |',
        '|                                 |'
    ].join('\n');
}
