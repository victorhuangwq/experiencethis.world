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

    // Linda only ever speaks in subject lines. Emails come in rarities, like
    // cards (Rules.emailOdds), so now and then there's one nobody has seen.
    emails: {
        common: [
            'Linda: "Quick question". It is not quick. You answer it.',
            'Linda: "RE: RE: RE: FW: Synergy". You reply "Sounds good".',
            'Linda: "Per my last email". You reply "Per your last email".',
            'Linda: "Circling back". You circle back.',
            'Linda: "No rush". There is a rush.',
            'Linda: "Meeting to plan the meeting". You accept.',
            'Linda: "(no subject)". The worst kind. You answer it carefully.',
            'Linda: "Thoughts?". You have thoughts. You reply "Looks great!"',
            'Linda: "Friendly reminder". It is not friendly. You are reminded.',
            'Linda: "Going forward". You go forward.',
            'Linda: "Updated deck attached". You get excited. It is slides.',
            'You answer an email. Two replies come back. This is how inboxes work.',
            'You mark an email as unread so it is a problem for later you.'
        ],
        uncommon: [
            'You reply-all by accident. Forty people now know you said "lol".',
            'You say "circling back" out loud, to nobody.',
            'Linda: "Quick call?". Your camera is off. Your binder is open.',
            'Linda: "Q3 priorities". Nobody knows which quarter it is. You reply "Aligned".',
            'Linda: "Out of office". It is an auto-reply. It still needs a reply.',
            'Linda: "Rare opportunity". It is a webinar. You know rare. This is not rare.',
            'Accounting: "Has anyone seen the stapler?". Forty people reply-all "No". You are one of them.'
        ],
        rare: [
            'Linda: "Thank you". Just that. You read it four times. You take a screenshot.',
            'An email from 2019 arrives. Subject: "Quick question". It is still not quick.',
            'You type "Best," and delete it. "Thanks," and delete it. "Best,". Twenty minutes pass.',
            'The email is from you. You do not remember sending it. It says "Sounds good". You agree.',
            'Linda: "Please stop clicking". You click.'
        ],
        'ultra-rare': [
            'Linda: "Free packs in the break room". You run. They are packets. Of ketchup.',
            'A note from the developer, in your inbox: "This is the rarest email. You may never see it again. Do not tell Benny."'
        ]
    },

    // The sticky note for the browser tab, sold at the kitchen table
    stickyNote: {
        buy: price => `Buy a sticky note for the tab (${price})`,
        bought: price => `You buy a sticky note and stick it to the browser tab. It cost ${price}. It shows your money, even from your work tab. It is a very good sticky note.`,
        // The tab's title
        title: (money, page) => `${money} · ${page}`
    },

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
        notices: 'Marcus from IT looks over the partition. He looks at the card taped to your terminal for a long time. "Base set," he says, and goes back down.',
        lunch: 'Marcus appears as the pack opens. He has been waiting. "What did you pull?" You show him. He nods like a doctor. "Lunch sometime," he says. "Bring the binder."',
        binder: 'Marcus looks over the partition at your binder. He looks at it the way other people look at puppies. "Lunch," he says. "Bring that."',
        // Looking over the partition when there's a game or a pack today
        around: 'Marcus is looking over the partition with his deck box. It is lunch somewhere.',
        lunchButton: 'Lunch with Marcus',
        lunchTitle: 'Lunch with Marcus in the break room. One game, best of three. Nobody else is here. Nobody else is ever here.',
        lunchWon: 'You win. Marcus nods slowly. "Again tomorrow," he says. He means it.',
        lunchLost: 'Marcus wins. He does not gloat. He writes something in a small notebook.',
        offersPacks: '"I pass the good vending machine on my way in," says Marcus. "I can get you a special pack. Six dollars. What it costs. I am not Flip."',
        packButton: price => `Buy the special pack Marcus brought (${price})`,
        boughtPack: 'Marcus passes a special pack over the partition. "Six dollars," he says. "Exact change. I am not a bank."',
        cantAfford: price => `"${price}," says Marcus. "Tomorrow, then." He keeps the pack. It is still yours, morally.`
    }
};
