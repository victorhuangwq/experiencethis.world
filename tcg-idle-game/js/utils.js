/**
 * Utility functions for the TCG Idle Game
 */

const Utils = {
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Format currency with $ symbol and 2 decimal places
     * @param {number} amount - Amount to format
     * @returns {string} - Formatted currency string
     */
    formatCurrency: function(amount) {
        return '$' + amount.toFixed(2);
    },
    
    /**
     * Weighted random selection from an array of objects with weights
     * @param {Array} items - Array of objects with a weight property
     * @returns {Object} - Selected item
     */
    weightedRandom: function(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.weight;
            if (random <= 0) {
                return item;
            }
        }
        
        return items[items.length - 1]; // Fallback
    },
    
    /**
     * Save game data to local storage
     * @param {Object} gameState - Game state object to save
     */
    saveGame: function(gameState) {
        const saveData = {
            money: gameState.money,
            packs: gameState.packs,
            collection: gameState.collection,
            phase: gameState.phase,
            upgrades: gameState.upgrades,
            incomeRate: gameState.incomeRate,
            lastIncomeTime: gameState.lastIncomeTime,
            lastSaved: Date.now()
        };
        
        localStorage.setItem('tcgIdleGameSave', JSON.stringify(saveData));
    },
    
    /**
     * Load game data from local storage
     * @returns {Object|null} - Loaded game state or null if no save exists
     */
    loadGame: function() {
        const saveData = localStorage.getItem('tcgIdleGameSave');
        return saveData ? JSON.parse(saveData) : null;
    },
    
    /**
     * Create ASCII art for a card
     * @param {Object} card - Card object
     * @returns {string} - ASCII art representation
     */
    createCardAscii: function(card) {
        const border = card.rarity === 'common' ? '+' : 
                      card.rarity === 'uncommon' ? '#' : 
                      card.rarity === 'rare' ? '*' : 
                      card.rarity === 'ultra-rare' ? '@' : '$';
        
        // Create top border
        let ascii = border.repeat(20) + '\n';
        
        // Add card name centered
        const namePadding = Math.floor((18 - card.name.length) / 2);
        ascii += border + ' ' + ' '.repeat(namePadding) + card.name + ' '.repeat(18 - card.name.length - namePadding) + ' ' + border + '\n';
        
        // Add type
        ascii += border + ' Type: ' + card.type.padEnd(12) + ' ' + border + '\n';
        
        // Add rarity
        ascii += border + ' Rarity: ' + card.rarity.padEnd(10) + ' ' + border + '\n';
        
        // Add value
        const valueStr = Utils.formatCurrency(card.value);
        ascii += border + ' Value: ' + valueStr.padEnd(11) + ' ' + border + '\n';
        
        // Add bottom border
        ascii += border.repeat(20);
        
        return ascii;
    }
};

// Make the utilities available globally
window.Utils = Utils;