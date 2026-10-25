/**
 * Every line of text in the game, by topic.
 *
 * Voice: deadpan and absurd, like Candy Box. Short sentences. Never explain
 * a mechanic; let new buttons speak for themselves, and let characters hint
 * at things in their own words. The narrator may talk to the player, joke
 * about idle games, react to the real clock, and the developer may leave
 * the occasional note.
 */

import { Format } from '../core/util.js';

export const Lines = {
    seasons: {
        spring: 'SPRING'
    },

    opening: {
        closet: [
            'You are cleaning out your closet.',
            'You find a shoebox.',
            'It says CARDS - DO NOT TOUCH. It is your handwriting. You were seven.'
        ],
        lookUp: 'Look up what they\'re worth',
        value: [
            'You look the cards up online.',
            'Total value: $0.43.',
            'The holo Absolutely Massive Dragon would be worth $400. You chewed the corner off. You were seven.',
            'There is a knock at the window. It is Benny, age 9, from next door.',
            '"Three dollars for the box," says Benny. "Final offer."',
            'It is the first offer.'
        ],
        sell: 'Sell it to Benny',
        keep: 'Keep it',
        sold: 'Benny counts out three dollars in nickels and leaves without saying goodbye. That is exactly one pack. You find another shoebox. This one says SHOES.',
        kept: 'You put the lid back on. You are not selling your childhood for three dollars. "Your loss," says Benny. It is unclear whose loss it is.'
    },

    allowance: 'You decide to give yourself an allowance. $1.20 a minute. You are a responsible adult.',
    allowanceAway: (cents, capped) => `your allowance paid you ${Format.money(cents)}` +
        (capped ? ' (the piggy bank only holds 8 hours, which is also how long you slept, probably)' : ''),

    work: {
        unlocked: 'Your laptop dings. It is work. Work pays, apparently.',
        button: 'Answer an email',
        resting: 'Pretending to read',
        done: [
            'You answer an email.',
            'You reply-all by accident.',
            'You write "per my last email".',
            'You schedule a meeting about a meeting.',
            'You mark an email as unread so it is a problem for later you.',
            'You say "circling back" out loud, to nobody.'
        ]
    },

    mall: {
        unlocked: 'There is a vending machine at the back of the mall. It sells Critter Clash packs. It has been there since you were seven. It has been waiting.',
        name: 'The back of the mall',
        restock: 'A delivery driver restocks the machine. The driver does not make eye contact.',
        restockSpecial: slot => `A delivery driver restocks the machine. Something in slot ${slot} is sparkling.`,
        restockAway: 'the machine was restocked',
        nextRestock: time => `Restocks every 15 minutes. Next: ${time}.`,
        empty: 'The machine is empty. It looks smug about it.',
        cantAfford: price => `You need ${price}. You check your pockets again. Same pockets.`,
        bought: (slot, special) => `*thunk* ${special ? 'A sparkling special pack' : 'A pack'} drops out of ${slot}.`,
        jammed: slot => `The machine swallows your money. The pack in ${slot} wobbles. It stays.`,
        kickFree: 'You kick the machine. The pack falls out. Violence works, sometimes.',
        kickLost: 'You kick the machine. It hums smugly. Your money is gone.',
        walkAway: 'You walk away. The machine wins this round. The machine wins most rounds.',
        kicks: [
            'You kick the machine. Nothing happens. A security guard looks up from his pretzel.',
            'You kick the machine. The guard\'s name tag says DALE. Dale writes something down.'
        ],
        kickMore: [
            'You kick the machine. Dale writes something down.',
            'You kick the machine. The dent gets a little bigger. You did that.',
            'You kick the machine. Dale turns a page in his notebook. It is a new page.'
        ],
        coinNothing: [
            'Nothing.',
            'Nothing. You check again. Still nothing.',
            'There is gum in there. It is not yours. You leave it.',
            'Nothing. The coin return is a metaphor, probably.'
        ],
        coinQuarter: 'A quarter! It is yours now. That is how coin returns work.',
        coinKey: 'There is a small key in the coin return. It says CARD-O-MATIC. You keep it. It does nothing. For now.',
        night: time => `It is ${time}. The mall is closed. The machine is still open. The machine is always open.`,
        earlyMorning: time => `It is ${time}. Even the delivery driver is asleep.`
    },

    packs: {
        first: 'You open your first pack in years. Your hands remember how.',
        open: 'You open a pack.',
        openSpecial: 'You open the special pack. It smells like a new car.',
        faster: 'You have opened 20 packs. You are faster at it now. This is called progress.',
        legendary: 'A legendary card. Your hands are shaking. That is normal.',
        rare: 'A good one.',
        sniffs: {
            1: 'You smell the pack. It smells like 1998.',
            2: 'Still 1998.',
            5: 'A stranger watches you smell the pack. You smell it again, for them.',
            10: 'You have smelled 10 packs. Benny would charge for this.',
            25: 'You can tell the print run by smell now. Probably.',
            49: 'Almost.',
            50: 'You smell the pack, and somehow every pack in the mall. Special packs will find you more often now.'
        },
        sniff: [
            'You smell the pack.',
            'You smell the pack. Cardboard and hope.',
            'You smell the pack. Something is building.'
        ],
        sniffAttuned: 'You smell the pack. You are one with the packs.'
    },

    storage: {
        closet: 'The closet',
        names: {
            'shoebox': 'A shoebox',
            'binder': 'A binder',
            'two-binders': 'Two binders',
            'bookshelf': 'A bookshelf of binders',
            'card-room': 'The card room'
        },
        upgraded: {
            'binder': 'Your cards no longer fit in the shoebox. You buy a binder. You are a binder person now.',
            'two-binders': 'One binder was not enough. You have two binders. They are friends.',
            'bookshelf': 'You buy a bookshelf for your binders. Visitors will ask about it. Nobody visits.',
            'card-room': 'The guest room is the card room now. Guests can sleep on the couch. There are no guests.'
        },
        count: (cards, different) => `${cards} cards. ${different} different.`,
        unknown: '???',
        unknownNote: 'The developer knows where the rest are. The developer is not telling.',
        others: 'Other critters'
    },

    benny: {
        arrives: 'There is a knock at the window. It is Benny. "I hear you have duplicates," says Benny. Benny will not say how Benny heard.',
        sell: (count, cents) => `Sell ${count} duplicates to Benny (${Format.money(cents)})`,
        sold: [
            cents => `Benny pays ${Format.money(cents)}. "Twenty-five percent finder's fee," says Benny. Benny found nothing.`,
            cents => `Benny counts out ${Format.money(cents)} in nickels. Nobody knows where Benny gets the nickels.`,
            cents => `Benny pays ${Format.money(cents)} and offers you a slightly used eraser. You decline. Benny writes that down.`
        ],
        none: '"No duplicates?" says Benny, at the window. "Lame."'
    },

    pip: {
        arrive: [
            'There is a kid behind you.',
            'The kid is holding three crumpled dollars.',
            'The kid is looking at you.'
        ],
        arriveFriend: [
            'Pip is behind you.',
            'Pip is holding three crumpled dollars.',
            'Pip waves. Pip has been waving the whole time.'
        ],
        arriveAgain: [
            'The kid is back.',
            'The kid is holding three crumpled dollars and a grudge.'
        ],
        stepAside: 'Step aside',
        keepBuying: 'Keep buying',
        firstKindness: 'The kid buys a pack, rips it open, and screams. "I\'M PIP. THANK YOU. Have you been to Gus\'s Games & Grub? They have packs ALL THE TIME. This machine ate my lunch money twice." Pip puts a sticker on the machine. It is a sticker of Pip.',
        kindness: [
            'Pip buys a pack and waves at you all the way out of the mall.',
            'Pip pulls a shiny card and does a little dance. Dale claps.',
            'Pip buys a pack and explains Pip\'s entire deck to you. It is mostly possums. It is a good deck.'
        ],
        gift: '"I have nine of these," says Pip, and hands you a Wet Sock Goblin.',
        specialOnly: 'You step aside. The only pack left is the special one. Pip looks at it, then at three crumpled dollars, and buys a pretzel instead. Pip still says thanks.'
    },

    // Each strike line gets who the strike was against
    strikes: {
        pip: [
            who => `You keep buying. ${who} watches. ${who} leaves. Dale has stopped eating his pretzel.`,
            () => 'Someone has taped a note to the machine. It says BE NICE.'
        ],
        // The narrator talks to the player directly at the second strike
        warning: 'The narrator would like a word. You have done this twice now. There will not be a third time. Well. There can be. Once.'
    },

    gus: {
        name: 'Gus\'s Games & Grub',
        unlockedWithTip: 'Your collection is getting serious. You remember what Pip said. Gus\'s Games & Grub appears on your map. You did not know you had a map.',
        unlockedWithoutTip: 'Benny mentions a store called Gus\'s Games & Grub. "They don\'t let me in anymore," says Benny. Gus\'s Games & Grub appears on your map. You did not know you had a map.',
        knock: 'Knock',
        firstKnock: 'The door opens a crack. "We\'re closed," says Gus. "Come back in summer." It is spring.',
        knocks: [
            '"Still spring," says Gus, through the door.',
            '"Summer," says Gus. "S. U. M. M. E. R."',
            'You knock. Somewhere inside, Gus sighs.'
        ],
        look: 'The lights are off. You can see shelves of packs inside. More packs than the machine has ever held. More packs than you have ever held.'
    },

    idle: [
        'You have been watching the number go up for 3 minutes. It is going up. Well done.',
        '10 minutes. The number is still going up. You are doing nothing. Sometimes this is the whole game.',
        '30 minutes. Have you considered getting a hobby? Oh. Right.'
    ],

    developer: {
        hundredPacks: 'A note from the developer: you have opened 100 packs. I did not think anyone would. Please drink some water.'
    },

    status: {
        money: 'You have',
        packs: count => `Unopened packs: ${count}`,
        specialPacks: count => `Special packs: ${count}`,
        open: 'Open one',
        openSpecial: 'Open one',
        smell: 'Smell it'
    },

    machine: {
        buy: 'Buy from',
        kick: 'Kick the machine',
        kickJammed: 'Kick it',
        walkAway: 'Walk away',
        coinReturn: 'Check the coin return'
    },

    reveal: {
        skip: 'Skip'
    },

    otherTab: 'The game was saved from another tab. This tab will stop saving now. Reload to play here.',
    saveFailed: 'Your progress could not be saved. The browser\'s storage may be full or turned off.'
};
