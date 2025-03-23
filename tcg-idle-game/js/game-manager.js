/**
 * Game Manager
 * Coordinates between game state and UI
 */

class GameManager {
    constructor() {
        this.gameState = new GameState();
        this.autoSaveInterval = null;
        this.passiveIncomeInterval = null;
        this.autoSellInterval = null;
        
        // Initialize tournament system
        this.tournamentSystem = new TournamentSystem(this);
        
        // Initialize shop system
        this.shopSystem = new ShopSystem(this);
        
        // Start auto-save
        this.startAutoSave();
        
        // Start passive income
        this.startPassiveIncome();
        
        // Start automation if already purchased
        if (this.gameState.upgrades.autoOpener.purchased) {
            this.startAutoOpener();
        }
        
        if (this.gameState.upgrades.autoBuyer.purchased) {
            this.startAutoBuyer();
        }
        
        if (this.gameState.upgrades.autoSeller.purchased) {
            this.startAutoSeller();
        }
    }
    
    /**
     * Buy a card pack
     * @returns {boolean} - Whether the purchase was successful
     */
    buyPack() {
        return this.gameState.buyPack();
    }
    
    /**
     * Open a card pack
     * @returns {Array|null} - Array of cards from the pack, or null if no packs available
     */
    openPack() {
        return this.gameState.openPack();
    }
    
    /**
     * Sell a card from the collection
     * @param {string} cardId - ID of the card to sell
     * @returns {number|null} - The value of the sold card, or null if card not found
     */
    sellCard(cardId) {
        return this.gameState.sellCard(cardId);
    }
    
    /**
     * Purchase an upgrade
     * @param {string} upgradeName - Name of the upgrade to purchase
     * @returns {boolean} - Whether the purchase was successful
     */
    purchaseUpgrade(upgradeName) {
        return this.gameState.purchaseUpgrade(upgradeName);
    }
    
    /**
     * Start the auto opener functionality
     */
    startAutoOpener() {
        // Clear any existing interval
        if (this.gameState.upgrades.autoOpener.interval) {
            clearInterval(this.gameState.upgrades.autoOpener.interval);
        }
        
        // Set up new interval
        const speed = this.gameState.upgrades.autoOpener.speed;
        this.gameState.upgrades.autoOpener.interval = setInterval(() => {
            // Only open a pack if we have one
            if (this.gameState.packs > 0) {
                const cards = this.gameState.openPack();
                if (this.ui) {
                    this.ui.displayOpenedPack(cards);
                    this.ui.updateUI();
                }
            }
        }, speed);
    }
    
    /**
     * Start the auto buyer functionality
     */
    startAutoBuyer() {
        // Clear any existing interval
        if (this.gameState.upgrades.autoBuyer.interval) {
            clearInterval(this.gameState.upgrades.autoBuyer.interval);
        }
        
        // Set up new interval
        const speed = this.gameState.upgrades.autoBuyer.speed;
        this.gameState.upgrades.autoBuyer.interval = setInterval(() => {
            // Try to buy a pack if we have enough money
            const success = this.gameState.buyPack();
            if (success && this.ui) {
                // Immediately open the pack if auto-opener is purchased
                if (this.gameState.upgrades.autoOpener.purchased) {
                    const cards = this.gameState.openPack();
                    if (cards && this.ui) {
                        this.ui.displayOpenedPack(cards);
                    }
                }
                this.ui.updateUI();
            }
        }, speed);
    }
    
    /**
     * Start the auto seller functionality
     * @param {number} speed - Optional speed in ms, defaults to 10000
     */
    startAutoSeller(speed = 10000) {
        // Clear any existing interval
        if (this.autoSellInterval) {
            clearInterval(this.autoSellInterval);
        }
        
        // Set up new interval
        this.autoSellInterval = setInterval(() => {
            // Automatically sell duplicates
            const result = this.gameState.autoSellDuplicates();
            if (result.count > 0 && this.ui) {
                this.ui.logMessage(`Auto-sold ${result.count} duplicate cards for ${Utils.formatCurrency(result.value)}`);
                this.ui.updateUI();
            }
        }, speed); // Speed can be adjusted by dev menu
    }
    
    /**
     * Start passive income updates
     */
    startPassiveIncome() {
        // Clear any existing interval
        if (this.passiveIncomeInterval) {
            clearInterval(this.passiveIncomeInterval);
        }
        
        // Set up new interval to update passive income
        this.passiveIncomeInterval = setInterval(() => {
            // Update passive income
            const income = this.gameState.updatePassiveIncome();
            
            // Update UI if needed
            if (this.ui) {
                this.ui.updateUI();
                
                // Only log income occasionally to avoid spam
                if (Math.random() < 0.1) {
                    this.ui.logMessage(`Earned ${Utils.formatCurrency(income)} from passive income`);
                }
            }
        }, 1000); // Update every second
    }
    
    /**
     * Start auto-saving the game
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.gameState.saveGame();
        }, 30000); // Save every 30 seconds
    }
    
    /**
     * Set the UI manager reference
     * @param {UIManager} ui - UI manager instance
     */
    setUI(ui) {
        this.ui = ui;
    }
    
    /**
     * Enter a tournament
     * @param {number} tournamentIndex - Index of the tournament to enter
     * @returns {Object} - Tournament result
     */
    enterTournament(tournamentIndex) {
        return this.tournamentSystem.enterTournament(tournamentIndex);
    }
    
    /**
     * Toggle the shop open/closed state
     * @returns {boolean} - New shop state (true = open, false = closed)
     */
    toggleShop() {
        if (this.shopSystem.isOpen) {
            this.shopSystem.closeShop();
            return false;
        } else {
            return this.shopSystem.openShop();
        }
    }
    
    /**
     * Get shop statistics
     * @returns {Object} - Shop statistics
     */
    getShopStats() {
        return this.shopSystem.getShopStats();
    }
    
    /**
     * Purchase a shop upgrade
     * @param {string} upgradeName - Name of the upgrade to purchase
     * @returns {boolean} - Whether the purchase was successful
     */
    purchaseShopUpgrade(upgradeName) {
        return this.shopSystem.purchaseUpgrade(upgradeName);
    }
    
    /**
     * Reset the game (prestige)
     * @param {Object} bonuses - Bonuses to apply after reset
     */
    resetGame(bonuses = {}) {
        // Save some stats for bonuses
        const oldCollectionSize = this.gameState.collection.length;
        
        // Reset to a new game state
        this.gameState = new GameState();
        
        // Apply bonuses based on previous progress
        if (bonuses.startingMoney) {
            this.gameState.money += bonuses.startingMoney;
        } else {
            // Default bonus is 10% of collection size as starting money
            this.gameState.money += Math.floor(oldCollectionSize * 0.1);
        }
        
        // Save the new state
        this.gameState.saveGame();
        
        // Restart auto opener if applicable
        if (this.gameState.upgrades.autoOpener.purchased) {
            this.startAutoOpener();
        }
        
        // Update UI
        if (this.ui) {
            this.ui.updateUI();
            this.ui.logMessage('Game reset with bonuses applied.');
        }
    }
}

// Make GameManager available globally
window.GameManager = GameManager;