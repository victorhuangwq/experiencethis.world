/**
 * The day job: hybrid, three days a week at the office. The boss, Linda,
 * only ever speaks in email subject lines. Marcus from IT collects, and has
 * not told anyone.
 */

export const Job = {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    // When work first appears, by where the player works that day
    unlocked: {
        office: day => `Your laptop dings. It is your boss, Linda. It is ${day}, which is an office day. You have to go in. Hybrid is three days a week. Nobody remembers choosing which three.`,
        home: day => `Your laptop dings. It is work. It is ${day}, so you work from home today. You have a job, by the way. You forgot.`,
        off: day => `Your laptop dings. It is your boss, Linda, on a ${day}. Subject: "No rush." You have a job, it turns out. It starts again on Monday.`
    },

    name: 'The office',
    answer: 'Answer an email',
    resting: 'Pretending to read',
    openAtDesk: 'Open a pack under the desk',

    // What the office says about today
    today: {
        office: day => `${day}. An office day. Your badge works on the second try.`,
        home: day => `${day}. You work from home on ${day}s. Your desk is here anyway, waiting. So is everything on it.`,
        off: day => `${day}. The office is closed. The lights are on anyway. Nobody knows who pays for that.`
    },
    kitchenTable: day => `${day}. You work from home today. Your laptop is on the kitchen table, next to your cards.`,

    // Answering an email from the wrong place, after the day has changed
    wrongPlace: {
        office: day => `It is ${day}. ${day}s are office days. Linda can see your status light. Linda knows.`,
        home: day => `It is ${day}. You work from home on ${day}s. You are at the office anyway. Security asks if you are lost.`,
        off: day => `It is ${day}. Nobody works on ${day}s. Except Linda. Linda emails: "No rush."`
    },

    // Linda only ever speaks in subject lines
    emails: [
        'Linda: "Quick question". It is not quick. You answer it.',
        'Linda: "RE: RE: RE: FW: Synergy". You reply "Sounds good".',
        'Linda: "Per my last email". You reply "Per your last email".',
        'Linda: "Circling back". You circle back.',
        'Linda: "No rush". There is a rush.',
        'Linda: "Meeting to plan the meeting". You accept.',
        'Linda: "(no subject)". The worst kind. You answer it carefully.',
        'You reply-all by accident. Forty people now know you said "lol".',
        'You mark an email as unread so it is a problem for later you.',
        'You say "circling back" out loud, to nobody.'
    ],

    boss: {
        // Linda walking past while a pack is open at the desk. The last one
        // repeats.
        walkBys: [
            'Linda walks past your desk. Linda sees the pack. Linda says nothing. Four minutes later, an email to everyone: "Reminder: this is a professional environment." Six people reply-all to ask to be taken off the list.',
            'Linda walks past again. An email to everyone: "RE: Reminder: this is a professional environment (again)".',
            'Linda walks past. You hide the pack. Linda hides something too. It looked like a pack.',
            'Linda walks past. Linda says nothing. An email arrives anyway: "Reminder".'
        ]
    },

    // Marcus from IT
    coworker: {
        notices: 'Marcus from IT stops at your desk to fix nothing. He looks at the card under your monitor for a long time. "Base set," he says, and leaves.',
        lunch: 'Marcus appears as the pack opens. He has been waiting. "What did you pull?" You show him. He nods like a doctor. "Lunch sometime," he says. "Bring the binder."'
    }
};
