/**
 * Game state management
 * Handles the core game logic and state
 */

class GameState {
    constructor() {
        // Initialize game state
        this.money = 5.00;
        this.packs = 0;
        this.collection = [];
        this.phase = 'Collector';
        
        // Passive income rate (money per second)
        this.incomeRate = 0.1;
        this.lastIncomeTime = Date.now();
        
        // Define game phases and their requirements (slower progression)
        this.phases = {
            'Collector': { index: 0, description: 'Start collecting cards' },
            'Competitor': { index: 1, description: 'Enter tournaments', requirement: { collectionSize: 30 } },
            'Trader': { index: 2, description: 'Trade with NPCs', requirement: { collectionSize: 75, money: 150 } },
            'Shop Owner': { index: 3, description: 'Open your own shop', requirement: { collectionSize: 150, money: 750 } },
            'Influencer': { index: 4, description: 'Host tournaments', requirement: { collectionSize: 300, money: 3000 } }
        };
        
        // Upgrades - ensure all properties exist
        this.upgrades = {
            autoOpener: { purchased: false, interval: null, speed: 5000 },
            betterPacks: { purchased: false },
            autoBuyer: { purchased: false, interval: null, speed: 5000 },
            autoSeller: { purchased: false },
            incomeBoost: { purchased: false, level: 0, multiplier: 1 }
        };
        
        // Load saved game if exists
        const savedGame = Utils.loadGame();
        if (savedGame) {
            this.loadSavedGame(savedGame);
        }
    }
    
    /**
     * Load a saved game state
     * @param {Object} savedGame - Saved game data
     */
    loadSavedGame(savedGame) {
        this.money = savedGame.money;
        this.packs = savedGame.packs;
        this.collection = savedGame.collection;
        this.phase = savedGame.phase;
        
        // Make sure to preserve the default structure with saved values
        if (savedGame.upgrades) {
            // For each default upgrade
            for (const key in this.upgrades) {
                // If the saved game has this upgrade
                if (savedGame.upgrades[key]) {
                    // Preserve the base structure but update with saved values
                    this.upgrades[key] = {
                        ...this.upgrades[key],
                        ...savedGame.upgrades[key]
                    };
                }
            }
        }
        
        // Make sure lastIncomeTime is properly set
        if (savedGame.lastIncomeTime) {
            this.lastIncomeTime = savedGame.lastIncomeTime;
        } else {
            this.lastIncomeTime = Date.now();
        }
    }
    
    /**
     * Buy a card pack
     * @returns {boolean} - Whether the purchase was successful
     */
    buyPack() {
        const packCost = 5;
        if (this.money >= packCost) {
            this.money -= packCost;
            this.packs += 1;
            return true;
        }
        return false;
    }
    
    /**
     * Open a card pack
     * @returns {Array|null} - Array of cards from the pack, or null if no packs available
     */
    openPack() {
        if (this.packs > 0) {
            this.packs -= 1;
            const packSize = 5;
            const improvedOdds = this.upgrades.betterPacks.purchased;
            const cards = CardData.generatePack(packSize, improvedOdds);
            this.addCardsToCollection(cards);
            this.checkPhaseProgression();
            return cards;
        }
        return null;
    }
    
    /**
     * Add cards to the player's collection
     * @param {Array} cards - Array of card objects
     */
    addCardsToCollection(cards) {
        this.collection = this.collection.concat(cards);
    }
    
    /**
     * Sell a card from the collection
     * @param {string} cardId - ID of the card to sell
     * @returns {number|null} - The value of the sold card, or null if card not found
     */
    sellCard(cardId) {
        const cardIndex = this.collection.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            const card = this.collection[cardIndex];
            this.collection.splice(cardIndex, 1);
            this.money += card.value;
            return card.value;
        }
        return null;
    }
    
    /**
     * Check if the player can progress to the next phase
     */
    checkPhaseProgression() {
        const phases = Object.keys(this.phases);
        const currentPhaseIndex = this.phases[this.phase].index;
        
        // Check if there is a next phase
        if (currentPhaseIndex < phases.length - 1) {
            const nextPhase = phases[currentPhaseIndex + 1];
            const requirement = this.phases[nextPhase].requirement;
            
            // Check if the player meets the requirements for the next phase
            if (
                (!requirement.collectionSize || this.collection.length >= requirement.collectionSize) &&
                (!requirement.money || this.money >= requirement.money)
            ) {
                this.phase = nextPhase;
                return true;
            }
        }
        return false;
    }
    
    /**
     * Update passive income based on time passed
     * @returns {number} - Amount of money earned
     */
    updatePassiveIncome() {
        const now = Date.now();
        const timePassedMs = now - this.lastIncomeTime;
        const timePassedSec = timePassedMs / 1000;
        
        // Calculate income with multiplier (from upgrades)
        // Check if incomeBoost exists and is purchased
        const multiplier = this.upgrades.incomeBoost && this.upgrades.incomeBoost.purchased ? 
            this.upgrades.incomeBoost.multiplier : 1;
        
        // Add phase bonus (each phase increases income slightly)
        const phaseBonus = this.phases[this.phase].index * 0.05 + 1;
        
        // Calculate income
        const income = this.incomeRate * timePassedSec * multiplier * phaseBonus;
        
        // Update money and last income time
        this.money += income;
        this.lastIncomeTime = now;
        
        return income;
    }
    
    /**
     * Automatically sell duplicate cards
     * @returns {Object} - Sale results
     */
    autoSellDuplicates() {
        if (!this.upgrades.autoSeller.purchased) {
            return { count: 0, value: 0 };
        }
        
        // Find duplicate cards
        const cardCounts = {};
        const duplicateIds = [];
        
        // Count cards and identify duplicates
        this.collection.forEach(card => {
            const key = `${card.name}-${card.rarity}-${card.type}`;
            if (!cardCounts[key]) {
                cardCounts[key] = [];
            }
            cardCounts[key].push(card.id);
            
            // If we have more than one of this card, mark all but the first as duplicates
            if (cardCounts[key].length > 1) {
                duplicateIds.push(card.id);
            }
        });
        
        // Sell duplicates
        let totalValue = 0;
        let count = 0;
        
        // Make a copy of duplicateIds since we're modifying the collection
        const duplicatesToSell = [...duplicateIds];
        
        duplicatesToSell.forEach(cardId => {
            const cardIndex = this.collection.findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
                const card = this.collection[cardIndex];
                this.money += card.value;
                totalValue += card.value;
                this.collection.splice(cardIndex, 1);
                count++;
            }
        });
        
        return { count, value: totalValue };
    }
    
    /**
     * Purchase an upgrade
     * @param {string} upgradeName - Name of the upgrade to purchase
     * @returns {boolean} - Whether the purchase was successful
     */
    purchaseUpgrade(upgradeName) {
        let cost = 0;
        let success = false;
        
        switch(upgradeName) {
            case 'autoOpener':
                if (!this.upgrades.autoOpener.purchased) {
                    cost = 30;
                    if (this.money >= cost) {
                        this.money -= cost;
                        this.upgrades.autoOpener.purchased = true;
                        success = true;
                    }
                }
                break;
                
            case 'autoBuyer':
                if (!this.upgrades.autoBuyer.purchased) {
                    cost = 50;
                    if (this.money >= cost) {
                        this.money -= cost;
                        this.upgrades.autoBuyer.purchased = true;
                        success = true;
                    }
                }
                break;
                
            case 'autoSeller':
                if (!this.upgrades.autoSeller.purchased) {
                    cost = 75;
                    if (this.money >= cost) {
                        this.money -= cost;
                        this.upgrades.autoSeller.purchased = true;
                        success = true;
                    }
                }
                break;
                
            case 'betterPacks':
                if (!this.upgrades.betterPacks.purchased) {
                    cost = 100;
                    if (this.money >= cost) {
                        this.money -= cost;
                        this.upgrades.betterPacks.purchased = true;
                        success = true;
                    }
                }
                break;
                
            case 'incomeBoost':
                // Income boost can be purchased multiple times
                const level = this.upgrades.incomeBoost.level;
                cost = 25 * Math.pow(2, level);
                
                if (this.money >= cost) {
                    this.money -= cost;
                    this.upgrades.incomeBoost.purchased = true;
                    this.upgrades.incomeBoost.level++;
                    this.upgrades.incomeBoost.multiplier = 1 + (this.upgrades.incomeBoost.level * 0.25);
                    success = true;
                }
                break;
        }
        
        return success;
    }
    
    /**
     * Get stats about the collection
     * @returns {Object} - Collection statistics
     */
    getCollectionStats() {
        const stats = {
            total: this.collection.length,
            byRarity: {},
            totalValue: 0
        };
        
        // Count cards by rarity and calculate total value
        for (const card of this.collection) {
            stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
            stats.totalValue += card.value;
        }
        
        return stats;
    }
    
    /**
     * Save the current game state
     */
    saveGame() {
        Utils.saveGame(this);
    }
}

// Make GameState available globally
window.GameState = GameState;