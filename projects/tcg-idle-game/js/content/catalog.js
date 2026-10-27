/**
 * The Critter Clash card catalogue. Every card in the game is on this list,
 * in a set, like a real card game. Packs hold cards from the set that is in
 * packs, by rarity (the odds are in js/rules.js). Values are in cents.
 * Card logic is in js/systems/cards.js.
 */

export const Catalog = {
    types: ['Fire', 'Water', 'Nature'],

    // Promos can also have this wildcard type
    wildType: 'Wild',

    rarities: ['common', 'uncommon', 'rare', 'ultra-rare', 'legendary'],

    /**
     * Sets, in the order their checklists are shown
     *   inPacks   Packs hold cards from this set
     *   hidden    The checklist only shows once a card from it is found
     *   secret    Not a real set: no numbers, and no count of what is missing
     */
    sets: [
        { id: 'base', name: 'Critter Clash Base Set', inPacks: true },
        { id: 'promo', name: 'Promos', hidden: true },
        { id: 'secret', name: 'Not on any checklist', secret: true }
    ],

    /**
     * Every card. A card's number is its place among its set's cards in
     * this list, so a set's checklist reads in this order. Ids are saved;
     * never change one. Source is where a card can be found: pack,
     * vending-special, card-show, trade-up, tournament, gift, or shoebox.
     */
    cards: [
        // Base Set commons
        { id: 'wet-sock-goblin', set: 'base', name: 'Wet Sock Goblin', type: 'Water', rarity: 'common', power: 2, value: 15, source: 'pack', flavor: 'Smells like a Tuesday.' },
        { id: 'soggy-toad', set: 'base', name: 'Soggy Toad', type: 'Water', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Was not asked to be soggy. Is soggy anyway.' },
        { id: 'drizzle-frog', set: 'base', name: 'Drizzle Frog', type: 'Water', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Brings its own weather. The weather is drizzle.' },
        { id: 'bathtub-snail', set: 'base', name: 'Bathtub Snail', type: 'Water', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has seen things in the bathtub. Will not say what.' },
        { id: 'snorkel-ferret', set: 'base', name: 'Snorkel Ferret', type: 'Water', rarity: 'common', power: 3, value: 12, source: 'pack', flavor: 'The snorkel has a hole in it. The ferret has a plan.' },
        { id: 'leaky-faucet-frog', set: 'base', name: 'Leaky Faucet Frog', type: 'Water', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Drip. Drip. Drip. It is not sorry.' },
        { id: 'lukewarm-newt', set: 'base', name: 'Lukewarm Newt', type: 'Water', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Not hot. Not cold. Not anything, really.' },
        { id: 'rain-boot-beetle', set: 'base', name: 'Rain Boot Beetle', type: 'Water', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Lives in the left boot. Has opinions about the right boot.' },
        { id: 'dishwater-goldfish', set: 'base', name: 'Dishwater Goldfish', type: 'Water', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has seen every plate you own. Judges none of them.' },
        { id: 'sprinkler-snail', set: 'base', name: 'Sprinkler Snail', type: 'Water', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Goes tick-tick-tick-tick. Then the other way.' },
        { id: 'spilled-juice-jellyfish', set: 'base', name: 'Spilled Juice Jellyfish', type: 'Water', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Sticky. Everywhere. Forever.' },
        { id: 'kiddie-pool-crab', set: 'base', name: 'Kiddie Pool Crab', type: 'Water', rarity: 'common', power: 3, value: 11, source: 'pack', flavor: 'Rules the kiddie pool with one tiny claw.' },
        { id: 'damp-towel-weasel', set: 'base', name: 'Damp Towel Weasel', type: 'Water', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Left on the floor. Has been there since Thursday.' },
        { id: 'ice-cube-penguin', set: 'base', name: 'Ice Cube Penguin', type: 'Water', rarity: 'common', power: 2, value: 10, source: 'pack', flavor: 'Melting slowly. Waddling quickly.' },
        { id: 'puddle-jumper-mouse', set: 'base', name: 'Puddle Jumper Mouse', type: 'Water', rarity: 'common', power: 3, value: 12, source: 'pack', flavor: 'Has never once landed in the puddle. Has never once tried not to.' },
        { id: 'fogged-glasses-owl', set: 'base', name: 'Fogged Glasses Owl', type: 'Water', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Cannot see anything. Is very wise about it.' },
        { id: 'garden-hose-eel', set: 'base', name: 'Garden Hose Eel', type: 'Water', rarity: 'common', power: 3, value: 10, source: 'pack', flavor: 'Kinked somewhere. Nobody can find the kink.' },
        { id: 'soup-spoon-shrimp', set: 'base', name: 'Soup Spoon Shrimp', type: 'Water', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Swims laps in your soup. Leaves no tip.' },
        { id: 'moist-mole', set: 'base', name: 'Moist Mole', type: 'Water', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Everyone hates the name of this card. The mole does not care.' },
        { id: 'shower-thought-seal', set: 'base', name: 'Shower Thought Seal', type: 'Water', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Had a great idea in the shower. Forgot it immediately.' },
        { id: 'sleepy-ember-toad', set: 'base', name: 'Sleepy Ember Toad', type: 'Fire', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Has been "just resting its eyes" since 2003.' },
        { id: 'spicy-gecko', set: 'base', name: 'Spicy Gecko', type: 'Fire', rarity: 'common', power: 3, value: 10, source: 'pack', flavor: 'Ate a pepper once. Never got over it.' },
        { id: 'matchstick-mouse', set: 'base', name: 'Matchstick Mouse', type: 'Fire', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Lights up. Does not cheer up.' },
        { id: 'one-fire-ant', set: 'base', name: 'One Fire Ant', type: 'Fire', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'It is just the one. It is very committed.' },
        { id: 'birthday-candle-moth', set: 'base', name: 'Birthday Candle Moth', type: 'Fire', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Makes a wish every time it flies into something.' },
        { id: 'burnt-toast-beetle', set: 'base', name: 'Burnt Toast Beetle', type: 'Fire', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Was supposed to be golden brown.' },
        { id: 'hot-sauce-hornet', set: 'base', name: 'Hot Sauce Hornet', type: 'Fire', rarity: 'common', power: 3, value: 11, source: 'pack', flavor: 'Extra hot. Extra angry. Extra.' },
        { id: 'microwave-mantis', set: 'base', name: 'Microwave Mantis', type: 'Fire', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Waits for the ding. Opens the door at 0:01 anyway.' },
        { id: 'static-shock-shrew', set: 'base', name: 'Static Shock Shrew', type: 'Fire', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Touches the door handle. Regrets it. Does it again.' },
        { id: 'campfire-cricket', set: 'base', name: 'Campfire Cricket', type: 'Fire', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Tells the same ghost story every night. It is not scary.' },
        { id: 'hair-dryer-hedgehog', set: 'base', name: 'Hair Dryer Hedgehog', type: 'Fire', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Very fluffy. Very loud.' },
        { id: 'sunburnt-lizard', set: 'base', name: 'Sunburnt Lizard', type: 'Fire', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Forgot the sunscreen. Remembers now.' },
        { id: 'space-heater-slug', set: 'base', name: 'Space Heater Slug', type: 'Fire', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Will not move from in front of the heater. Neither will you.' },
        { id: 'ember-earwig', set: 'base', name: 'Ember Earwig', type: 'Fire', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Small, warm, and nowhere you want it to be.' },
        { id: 'chili-pepper-crow', set: 'base', name: 'Chili Pepper Crow', type: 'Fire', rarity: 'common', power: 3, value: 12, source: 'pack', flavor: 'Steals the peppers. Regrets the peppers.' },
        { id: 'firework-frog', set: 'base', name: 'Firework Frog', type: 'Fire', rarity: 'common', power: 3, value: 13, source: 'pack', flavor: 'Goes up. Goes bang. Goes home.' },
        { id: 'smoldering-snail', set: 'base', name: 'Smoldering Snail', type: 'Fire', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has been about to burst into flames for six years.' },
        { id: 'toasty-tadpole', set: 'base', name: 'Toasty Tadpole', type: 'Fire', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Not a frog yet. Already warm.' },
        { id: 'grill-mark-gopher', set: 'base', name: 'Grill Mark Gopher', type: 'Fire', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Has three stripes. Got them at a barbecue. Will not discuss it.' },
        { id: 'candle-wick-worm', set: 'base', name: 'Candle Wick Worm', type: 'Fire', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Burning at both ends. Very busy.' },
        { id: 'suspicious-pigeon', set: 'base', name: 'Suspicious Pigeon', type: 'Nature', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Watching. Always watching. Mostly for bread.' },
        { id: 'lawn-gnome-hedgehog', set: 'base', name: 'Lawn Gnome Hedgehog', type: 'Nature', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has stood in the garden for 30 years. Nobody has seen it blink.' },
        { id: 'squirrels-in-a-trench-coat', set: 'base', name: 'Squirrels in a Trench Coat', type: 'Nature', rarity: 'common', power: 3, value: 14, source: 'pack', flavor: 'Three squirrels. One coat. One dream.' },
        { id: 'grumpy-turnip-beetle', set: 'base', name: 'Grumpy Turnip Beetle', type: 'Nature', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Dislikes everything. Especially you. Especially Tuesdays.' },
        { id: 'lawn-crab', set: 'base', name: 'Lawn Crab', type: 'Nature', rarity: 'common', power: 1, value: 10, source: 'pack', flavor: 'It is a crab. It lives on your lawn. Nobody knows how it got there.' },
        { id: 'dandelion-gopher', set: 'base', name: 'Dandelion Gopher', type: 'Nature', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Makes a wish on every dandelion. Every wish is for more dandelions.' },
        { id: 'compost-heap-hen', set: 'base', name: 'Compost Heap Hen', type: 'Nature', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Lives in the compost. Thrives.' },
        { id: 'pinecone-porcupine', set: 'base', name: 'Pinecone Porcupine', type: 'Nature', rarity: 'common', power: 3, value: 11, source: 'pack', flavor: 'Is it a pinecone? Is it a porcupine? Do not touch it to find out.' },
        { id: 'hedge-maze-mouse', set: 'base', name: 'Hedge Maze Mouse', type: 'Nature', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Has been in the maze for three days. Says it is fine.' },
        { id: 'moss-sloth', set: 'base', name: 'Moss Sloth', type: 'Nature', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has not moved since spring. Might be spring.' },
        { id: 'sunflower-starling', set: 'base', name: 'Sunflower Starling', type: 'Nature', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Turns to face the sun. Turns to face you. Stares.' },
        { id: 'leaf-pile-bunny', set: 'base', name: 'Leaf Pile Bunny', type: 'Nature', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'You jumped in the leaf pile. The bunny was already there.' },
        { id: 'picnic-ant', set: 'base', name: 'Picnic Ant', type: 'Nature', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Brought 400 friends. Did not bring food.' },
        { id: 'acorn-chipmunk', set: 'base', name: 'Acorn Chipmunk', type: 'Nature', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Has buried 3,000 acorns. Remembers where four of them are.' },
        { id: 'rosebush-rat', set: 'base', name: 'Rosebush Rat', type: 'Nature', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Smells lovely. Bites anyway.' },
        { id: 'clover-caterpillar', set: 'base', name: 'Clover Caterpillar', type: 'Nature', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Looking for the four-leaf one. Has eaten every three-leaf one.' },
        { id: 'mushroom-ring-toad', set: 'base', name: 'Mushroom Ring Toad', type: 'Nature', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Sits in a fairy ring. Grants no wishes. Will not leave.' },
        { id: 'birdhouse-bluejay', set: 'base', name: 'Birdhouse Bluejay', type: 'Nature', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Pays no rent. Has redecorated.' },
        { id: 'snake-in-the-grass', set: 'base', name: 'Snake in the Grass', type: 'Nature', rarity: 'common', power: 3, value: 12, source: 'pack', flavor: 'A real one. Also a figurative one.' },
        { id: 'hay-bale-llama', set: 'base', name: 'Hay Bale Llama', type: 'Nature', rarity: 'common', power: 3, value: 11, source: 'pack', flavor: 'Eats the hay bale. Sits on the hay bale. Becomes the hay bale.' },

        // Base Set uncommons
        { id: 'captain-bathwater', set: 'base', name: 'Captain Bathwater', type: 'Water', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'A rubber duck. Has never lost a bath.' },
        { id: 'gutter-otter', set: 'base', name: 'Gutter Otter', type: 'Water', rarity: 'uncommon', power: 3, value: 30, source: 'pack', flavor: 'Lives in the gutter. Thinks it is a river. Let it believe.' },
        { id: 'lifeguard-seagull', set: 'base', name: 'Lifeguard Seagull', type: 'Water', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Blows the whistle. Takes your chips.' },
        { id: 'laundromat-lobster', set: 'base', name: 'Laundromat Lobster', type: 'Water', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Watches the dryers spin. Has found its purpose.' },
        { id: 'water-bed-walrus', set: 'base', name: 'Water Bed Walrus', type: 'Water', rarity: 'uncommon', power: 5, value: 50, source: 'pack', flavor: 'Sloshes when it sits. Sits a lot.' },
        { id: 'sock-puppet-squid', set: 'base', name: 'Sock Puppet Squid', type: 'Water', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'Eight arms. Eight socks. Puts on a show nobody asked for.' },
        { id: 'umbrella-heron', set: 'base', name: 'Umbrella Heron', type: 'Water', rarity: 'uncommon', power: 3, value: 30, source: 'pack', flavor: 'Brought an umbrella. It is not raining. It will be.' },
        { id: 'aquarium-castle-catfish', set: 'base', name: 'Aquarium Castle Catfish', type: 'Water', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Lives in the plastic castle. Is king of the plastic castle.' },
        { id: 'fountain-coin-carp', set: 'base', name: 'Fountain Coin Carp', type: 'Water', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Takes your coin. Grants nothing. Takes the next coin.' },
        { id: 'snow-day-seal', set: 'base', name: 'Snow Day Seal', type: 'Water', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'School is cancelled. The seal is thrilled.' },
        { id: 'water-cooler-crab', set: 'base', name: 'Water Cooler Crab', type: 'Water', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Knows all the office gossip. Spreads it sideways.' },
        { id: 'iceberg-lettuce-turtle', set: 'base', name: 'Iceberg Lettuce Turtle', type: 'Water', rarity: 'uncommon', power: 5, value: 55, source: 'pack', flavor: 'Only eats iceberg lettuce. Nobody understands why.' },
        { id: 'toaster-salamander', set: 'base', name: 'Toaster Salamander', type: 'Fire', rarity: 'uncommon', power: 4, value: 50, source: 'pack', flavor: 'Ding!' },
        { id: 'smoke-alarm-owl', set: 'base', name: 'Smoke Alarm Owl', type: 'Fire', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Goes off whenever anyone makes toast. Lives next to Toaster Salamander. It is a whole thing.' },
        { id: 'barbecue-badger', set: 'base', name: 'Barbecue Badger', type: 'Fire', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Owns one apron. It says KISS THE BADGER. Nobody has.' },
        { id: 'fire-drill-ferret', set: 'base', name: 'Fire Drill Ferret', type: 'Fire', rarity: 'uncommon', power: 3, value: 30, source: 'pack', flavor: 'Leads everyone outside twice a year. Takes it very seriously.' },
        { id: 'sparkler-sparrow', set: 'base', name: 'Sparkler Sparrow', type: 'Fire', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Writes its name in the air. Spells it wrong.' },
        { id: 'kettle-whistle-wren', set: 'base', name: 'Kettle Whistle Wren', type: 'Fire', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Screams when it is ready. Is ready often.' },
        { id: 'science-fair-volcano-frog', set: 'base', name: 'Science Fair Volcano Frog', type: 'Fire', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'Baking soda. Vinegar. Second place.' },
        { id: 'pizza-oven-pangolin', set: 'base', name: 'Pizza Oven Pangolin', type: 'Fire', rarity: 'uncommon', power: 5, value: 55, source: 'pack', flavor: 'Rolls into a ball. Comes out crispy.' },
        { id: 'chimney-sweep-bat', set: 'base', name: 'Chimney Sweep Bat', type: 'Fire', rarity: 'uncommon', power: 3, value: 30, source: 'pack', flavor: 'Covered in soot. Sings anyway.' },
        { id: 'bonfire-bear', set: 'base', name: 'Bonfire Bear', type: 'Fire', rarity: 'uncommon', power: 5, value: 50, source: 'pack', flavor: 'Brought marshmallows for everyone. Ate them all.' },
        { id: 'heatwave-hyena', set: 'base', name: 'Heatwave Hyena', type: 'Fire', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Laughs at the thermometer. The thermometer does not laugh back.' },
        { id: 'habanero-hare', set: 'base', name: 'Habanero Hare', type: 'Fire', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'Fast. Hot. Regrets nothing until later.' },
        { id: 'sir-reginald', set: 'base', name: 'Sir Reginald Pigeonsworth', type: 'Nature', rarity: 'uncommon', power: 4, value: 50, source: 'pack', flavor: 'Has never once paid for a sandwich.' },
        { id: 'mildly-haunted-tortoise', set: 'base', name: 'Mildly Haunted Tortoise', type: 'Nature', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'The ghost is also a tortoise. Neither of them is in a hurry.' },
        { id: 'tax-season-mole', set: 'base', name: 'Tax Season Mole', type: 'Nature', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Does your taxes. Charges in worms. Very reasonable.' },
        { id: 'neighbourhood-watch-owl', set: 'base', name: 'Neighbourhood Watch Owl', type: 'Nature', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Has a clipboard. Has notes. Has notes about you.' },
        { id: 'bonsai-bear', set: 'base', name: 'Bonsai Bear', type: 'Nature', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Very small. Very calm. Has been pruned.' },
        { id: 'topiary-peacock', set: 'base', name: 'Topiary Peacock', type: 'Nature', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'Made of hedge. Very proud of it.' },
        { id: 'honey-badger-retired', set: 'base', name: 'Honey Badger, Retired', type: 'Nature', rarity: 'uncommon', power: 5, value: 50, source: 'pack', flavor: 'Does care now. Cares a lot, actually.' },
        { id: 'mulch-monster', set: 'base', name: 'Mulch Monster', type: 'Nature', rarity: 'uncommon', power: 3, value: 30, source: 'pack', flavor: 'Spread across the flower bed. Has never been happier.' },
        { id: 'scarecrow-crow', set: 'base', name: 'Scarecrow Crow', type: 'Nature', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'The scarecrow works for the crows now.' },
        { id: 'flower-show-frog', set: 'base', name: 'Flower Show Frog', type: 'Nature', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Second place in roses. Contesting the results.' },
        { id: 'weather-vane-rooster', set: 'base', name: 'Weather Vane Rooster', type: 'Nature', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'Points the way the wind goes. Takes the credit.' },
        { id: 'treehouse-koala', set: 'base', name: 'Treehouse Koala', type: 'Nature', rarity: 'uncommon', power: 5, value: 55, source: 'pack', flavor: 'No grown-ups allowed. The koala is 40.' },

        // Base Set rares
        { id: 'damp-mothman', set: 'base', name: 'Damp Mothman', type: 'Water', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Just wants the lamp.' },
        { id: 'puddle-kraken', set: 'base', name: 'Puddle Kraken', type: 'Water', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: 'Lives in a puddle. The puddle is much deeper than it looks.' },
        { id: 'lost-lake-leviathan', set: 'base', name: 'Lost Lake Leviathan', type: 'Water', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: 'Seen twice. Both times by the same uncle.' },
        { id: 'the-bathtub-admiral', set: 'base', name: 'The Bathtub Admiral', type: 'Water', rarity: 'rare', power: 6, value: 350, source: 'pack', flavor: 'Commands a fleet of rubber ducks. Captain Bathwater reports to it.' },
        { id: 'tsunami-tadpole', set: 'base', name: 'Tsunami Tadpole', type: 'Water', rarity: 'rare', power: 5, value: 250, source: 'pack', flavor: 'Very small. Very large wave.' },
        { id: 'water-cooler-ghost', set: 'base', name: 'Water Cooler Ghost', type: 'Water', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Haunts the office. Gurgles at 3 PM. Linda has filed a ticket.' },
        { id: 'lava-lamp-newt', set: 'base', name: 'Lava Lamp Newt', type: 'Fire', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Groovy, and also on fire.' },
        { id: 'dragonfly-of-pebbleton', set: 'base', name: 'Dragonfly of Pebbleton', type: 'Fire', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: 'Not a dragon. Not a fly. The pride of Pebbleton.' },
        { id: 'inferno-iguana', set: 'base', name: 'Inferno Iguana', type: 'Fire', rarity: 'rare', power: 6, value: 350, source: 'pack', flavor: 'Too hot to hold. Collectors hold it anyway.' },
        { id: 'the-toast-whisperer', set: 'base', name: 'The Toast Whisperer', type: 'Fire', rarity: 'rare', power: 5, value: 250, source: 'pack', flavor: 'Knows exactly when the toast is done. Has never been asked.' },
        { id: 'volcano-vole', set: 'base', name: 'Volcano Vole', type: 'Fire', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Lives in a volcano. The rent is great.' },
        { id: 'solar-flare-firefly', set: 'base', name: 'Solar Flare Firefly', type: 'Fire', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: "Very bright. Briefly broke everyone's phones." },
        { id: 'possum-of-many-faces', set: 'base', name: 'Possum of Many Faces', type: 'Nature', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Plays dead in every format.' },
        { id: 'ancient-oak-owl', set: 'base', name: 'Ancient Oak Owl', type: 'Nature', rarity: 'rare', power: 6, value: 350, source: 'pack', flavor: 'Has been asked "who" for 300 years. Still does not know who.' },
        { id: 'great-garden-gnome', set: 'base', name: 'Great Garden Gnome', type: 'Nature', rarity: 'rare', power: 5, value: 250, source: 'pack', flavor: 'The other gnomes call it sir.' },
        { id: 'lawnmower-lion', set: 'base', name: 'Lawnmower Lion', type: 'Nature', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: 'Mows the lawn. Roars. Mows the rest of the lawn.' },
        { id: 'thousand-year-turtle', set: 'base', name: 'Thousand-Year Turtle', type: 'Nature', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Has seen everything. Was not impressed by any of it.' },
        { id: 'mothership-moth', set: 'base', name: 'Mothership Moth', type: 'Nature', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: "Damp Mothman's mother. Visits on Sundays." },

        // Base Set ultra-rares
        { id: 'tidal-raccoon', set: 'base', name: 'The Tidal Raccoon', type: 'Water', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'Washes everything. Especially your hopes.' },
        { id: 'the-great-wet-sock', set: 'base', name: 'The Great Wet Sock', type: 'Water', rarity: 'ultra-rare', power: 9, value: 3500, source: 'pack', flavor: "The goblin's final form. Smells like every Tuesday at once." },
        { id: 'thundering-hamster', set: 'base', name: 'Thundering Hamster', type: 'Fire', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'The wheel spins. The sky darkens.' },
        { id: 'supreme-toaster-overlord', set: 'base', name: 'Supreme Toaster Overlord', type: 'Fire', rarity: 'ultra-rare', power: 9, value: 3500, source: 'pack', flavor: "Toaster Salamander's final form. All toast bows." },
        { id: 'mr-whiskers', set: 'base', name: "Grandma's Cat, Mr. Whiskers", type: 'Nature', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'Has knocked over more decks than any player alive.' },
        { id: 'sir-reginald-emperor', set: 'base', name: 'Sir Reginald, Emperor of Pigeons', type: 'Nature', rarity: 'ultra-rare', power: 9, value: 3500, source: 'pack', flavor: 'Still has never paid for a sandwich. Now owns every sandwich.' },

        // Promos: never in packs; each comes from one place
        { id: 'card-o-matic-prime', set: 'promo', name: 'CARD-O-MATIC Prime', type: 'Wild', rarity: 'legendary', power: 10, value: 15000, source: 'vending-special', flavor: 'It finally dispensed itself.' },
        { id: 'absolutely-massive-dragon', set: 'promo', name: 'Absolutely Massive Dragon', type: 'Fire', rarity: 'legendary', power: 10, value: 40000, source: 'card-show', flavor: 'The card is normal-sized. The dragon is not.' },
        { id: 'golden-paperclip-phoenix', set: 'promo', name: 'Golden Paperclip Phoenix', type: 'Wild', rarity: 'legendary', power: 10, value: 50000, source: 'trade-up', flavor: 'It started as a paperclip. It always does.' },
        { id: 'champions-crown', set: 'promo', name: "Champion's Crown", type: 'Wild', rarity: 'legendary', power: 10, value: 30000, source: 'tournament', flavor: 'Heavy is the head. Heavier is the binder.' },
        { id: 'pips-favourite', set: 'promo', name: "Pip's Favourite", type: 'Nature', rarity: 'legendary', power: 10, value: 100, source: 'gift', flavor: 'Worth one dollar. Worth everything.' },

        // From the childhood shoebox
        { id: 'wet-sock-gobln', set: 'secret', name: 'Wet Sock Gobln', type: 'Water', rarity: 'common', power: 2, value: 5, source: 'shoebox', flavor: 'A misprint. The i is missing. Nobody knows where it went.' },
        { id: 'chewed-dragon', set: 'secret', name: 'Absolutely Massive Dragon (chewed)', type: 'Fire', rarity: 'legendary', power: 4, value: 11, source: 'shoebox', flavor: 'You did this. You were seven.' }
    ],

    find(id) {
        return this.cards.find(card => card.id === id);
    },

    findSet(id) {
        return this.sets.find(set => set.id === id);
    },

    /**
     * A set's cards, in checklist order
     */
    inSet(setId) {
        return this.cards.filter(card => card.set === setId);
    },

    /**
     * The cards packs can hold
     * @param {string} rarity - Only cards of this rarity, if given
     */
    inPacks(rarity) {
        const sets = this.sets.filter(set => set.inPacks).map(set => set.id);
        return this.cards.filter(card => sets.includes(card.set) && (!rarity || card.rarity === rarity));
    },

    /**
     * A card's number in its set, as printed on it: "7/30", "PROMO 2",
     * or '' for cards on no checklist
     */
    number(id) {
        const card = this.find(id);
        const set = card && this.findSet(card.set);
        if (!set || set.secret) {
            return '';
        }
        const cards = this.inSet(set.id);
        const position = cards.indexOf(card) + 1;
        return set.inPacks ? `${position}/${cards.length}` : `PROMO ${position}`;
    }
};
