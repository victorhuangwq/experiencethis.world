/**
 * The narrator: seasons, idle comments, the real clock, and the developer
 */

export const Story = {
    seasons: {
        spring: 'SPRING',
        summer: 'SUMMER'
    },
    // Summer comes, and Set 2 with it
    summer: 'It is summer. Backyard Brawl is out. Everyone plays Critter Clash now. Officer Dale has a deck. Linda has two. Gus has put his prices up, and the machine at the mall has never been so popular.',

    // Said after 3, 10, and 30 minutes without doing anything
    idle: [
        'You have been watching the number go up for 3 minutes. It is going up. Well done.',
        '10 minutes. The number is still going up. You are doing nothing. Sometimes this is the whole game.',
        '30 minutes. Have you considered getting a hobby? Oh. Right.'
    ],

    night: time => `It is ${time}. The mall is closed. The machine is still open. The machine is always open.`,
    earlyMorning: time => `It is ${time}. Even the delivery driver is asleep.`,

    developer: {
        hundredPacks: 'A note from the developer: you have opened 100 packs. I did not think anyone would. Please drink some water.'
    }
};
