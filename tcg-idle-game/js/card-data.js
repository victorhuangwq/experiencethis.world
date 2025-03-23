/**
 * Card data and card generation functions
 */

const CardData = {
    /**
     * Card types with battle type advantages
     * Fire > Nature > Water > Electric > Fire
     * Dragon is strong against all but weak to itself
     * Spell has special effects
     */
    types: ['Fire', 'Nature', 'Water', 'Electric', 'Dragon', 'Spell'],
    
    /**
     * Type advantage map for battles
     * Key is attacker, value is array of types it's strong against
     */
    typeAdvantages: {
        'Fire': ['Nature'],
        'Nature': ['Water'],
        'Water': ['Electric'],
        'Electric': ['Fire'],
        'Dragon': ['Fire', 'Nature', 'Water', 'Electric'],
        'Spell': []
    },
    
    /**
     * Special abilities for rare+ cards
     */
    specialAbilities: [
        { name: 'Heal', description: 'Recover 10 HP each turn', effect: 'heal', value: 10 },
        { name: 'Sharpness', description: 'Deal +5 damage on attacks', effect: 'damage_boost', value: 5 },
        { name: 'Type Shift', description: 'Change type to counter opponent', effect: 'type_shift', value: 0 },
        { name: 'Shield', description: 'Reduce incoming damage by 3', effect: 'damage_reduce', value: 3 },
        { name: 'Double Strike', description: 'Attack twice in one turn', effect: 'double_attack', value: 0 }
    ],
    
    /**
     * Rarity definitions with weights and value ranges
     */
    rarities: [
        { name: 'common', weight: 70, minValue: 0.10, maxValue: 0.50 },
        { name: 'uncommon', weight: 20, minValue: 0.50, maxValue: 2.00 },
        { name: 'rare', weight: 7, minValue: 2.00, maxValue: 10.00 },
        { name: 'ultra-rare', weight: 2, minValue: 10.00, maxValue: 50.00 },
        { name: 'legendary', weight: 1, minValue: 50.00, maxValue: 200.00 }
    ],
    
    /**
     * Card name prefixes and suffixes for random generation
     */
    namePrefixes: ['Dark', 'Mystic', 'Ancient', 'Fiery', 'Aqua', 'Elemental', 'Cosmic', 'Savage', 'Enchanted', 'Spectral'],
    nameSuffixes: ['Warrior', 'Dragon', 'Wizard', 'Phoenix', 'Serpent', 'Knight', 'Paladin', 'Mage', 'Beast', 'Golem'],
    
    /**
     * Generate a random card
     * @param {boolean} improvedOdds - Whether to improve odds for better rarities
     * @returns {Object} - Generated card object
     */
    generateCard: function(improvedOdds = false) {
        // Copy rarities array and adjust weights if improved odds are enabled
        const rarities = this.rarities.map(r => ({
            name: r.name,
            weight: improvedOdds && r.name !== 'common' ? r.weight * 1.5 : r.weight,
            minValue: r.minValue,
            maxValue: r.maxValue
        }));
        
        // Select a random rarity based on weights
        const rarity = Utils.weightedRandom(rarities);
        
        // Generate a random card name
        const prefix = this.namePrefixes[Utils.randomInt(0, this.namePrefixes.length - 1)];
        const suffix = this.nameSuffixes[Utils.randomInt(0, this.nameSuffixes.length - 1)];
        const name = prefix + ' ' + suffix;
        
        // Select a random card type
        const type = this.types[Utils.randomInt(0, this.types.length - 1)];
        
        // Generate a random value within the rarity's range
        const value = Utils.randomInt(rarity.minValue * 100, rarity.maxValue * 100) / 100;
        
        // Generate battle stats based on rarity
        let hp, attack, specialAbility = null;
        
        // Calculate HP and attack based on rarity (better cards have better stats)
        switch(rarity.name) {
            case 'common':
                hp = Utils.randomInt(30, 50);
                attack = Utils.randomInt(5, 10);
                break;
            case 'uncommon':
                hp = Utils.randomInt(40, 60);
                attack = Utils.randomInt(8, 15);
                break;
            case 'rare':
                hp = Utils.randomInt(50, 70);
                attack = Utils.randomInt(10, 20);
                // Rare cards get a special ability
                specialAbility = this.specialAbilities[Utils.randomInt(0, this.specialAbilities.length - 1)];
                break;
            case 'ultra-rare':
                hp = Utils.randomInt(60, 80);
                attack = Utils.randomInt(15, 25);
                specialAbility = this.specialAbilities[Utils.randomInt(0, this.specialAbilities.length - 1)];
                break;
            case 'legendary':
                hp = Utils.randomInt(70, 100);
                attack = Utils.randomInt(20, 30);
                specialAbility = this.specialAbilities[Utils.randomInt(0, this.specialAbilities.length - 1)];
                break;
        }
        
        // Adjust stats based on type
        if (type === 'Dragon') {
            hp = Math.floor(hp * 1.2); // Dragons have more HP
            attack = Math.floor(attack * 1.2); // Dragons have more attack
        } else if (type === 'Spell') {
            hp = Math.floor(hp * 0.8); // Spells have less HP
            attack = Math.floor(attack * 0.9); // Spells have slightly less attack
            // Spells always have a special ability
            if (!specialAbility) {
                specialAbility = this.specialAbilities[Utils.randomInt(0, this.specialAbilities.length - 1)];
            }
        }
        
        // Create and return the card object with battle attributes
        return {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // Generate a unique ID
            name: name,
            type: type,
            rarity: rarity.name,
            value: value,
            // Battle attributes
            hp: hp,
            maxHp: hp, // Store max HP for healing reference
            attack: attack,
            specialAbility: specialAbility
        };
    },
    
    /**
     * Generate a pack of cards
     * @param {number} packSize - Number of cards in the pack
     * @param {boolean} improvedOdds - Whether to improve odds for better rarities
     * @returns {Array} - Array of card objects
     */
    generatePack: function(packSize = 5, improvedOdds = false) {
        const cards = [];
        for (let i = 0; i < packSize; i++) {
            cards.push(this.generateCard(improvedOdds));
        }
        return cards;
    }
};

// Make card data available globally
window.CardData = CardData;