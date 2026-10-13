/**
 * Developer Menu functionality
 * Allows for game testing and debugging
 */

class DevMenu {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.speedMultiplier = 1;
        this.devMenuOpen = false;
        
        // Initialize elements and event listeners when UI is ready
        this.init();
    }
    
    /**
     * Initialize developer menu
     */
    init() {
        // Wait for DOM to be loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initElements());
        } else {
            this.initElements();
        }
    }
    
    /**
     * Initialize menu elements and event listeners
     */
    initElements() {
        // Get menu elements
        this.devMenuToggle = document.getElementById('dev-menu-toggle');
        this.devMenu = document.getElementById('dev-menu');
        this.speedMultiplierSelect = document.getElementById('speed-multiplier');
        this.add100CardsButton = document.getElementById('add-100-cards');
        this.add10kMoneyButton = document.getElementById('add-10k-money');
        this.deleteSaveButton = document.getElementById('delete-save');
        
        // Add event listeners
        this.devMenuToggle.addEventListener('click', () => this.toggleDevMenu());
        this.speedMultiplierSelect.addEventListener('change', () => this.updateGameSpeed());
        this.add100CardsButton.addEventListener('click', () => this.addRandomCards(100));
        this.add10kMoneyButton.addEventListener('click', () => this.addMoney(10000));
        this.deleteSaveButton.addEventListener('click', () => this.deleteSaveData());
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (this.devMenuOpen && 
                !this.devMenu.contains(event.target) && 
                event.target !== this.devMenuToggle) {
                this.closeDevMenu();
            }
        });
        
        // Add keyboard shortcut: press Shift+D+E+V to open the menu
        let keySequence = [];
        document.addEventListener('keydown', (event) => {
            // Add the key to the sequence
            keySequence.push(event.key.toLowerCase());
            
            // Keep only the last 4 keys
            if (keySequence.length > 4) {
                keySequence.shift();
            }
            
            // Check if the sequence is Shift+D+E+V (shift would be true in event)
            if (event.shiftKey && 
                keySequence.join('') === 'dev') {
                this.toggleDevMenu();
                keySequence = []; // Reset sequence
            }
        });
    }
    
    /**
     * Toggle developer menu open/closed
     */
    toggleDevMenu() {
        if (this.devMenuOpen) {
            this.closeDevMenu();
        } else {
            this.openDevMenu();
        }
    }
    
    /**
     * Open developer menu
     */
    openDevMenu() {
        this.devMenu.classList.remove('hidden');
        this.devMenuOpen = true;
    }
    
    /**
     * Close developer menu
     */
    closeDevMenu() {
        this.devMenu.classList.add('hidden');
        this.devMenuOpen = false;
    }
    
    /**
     * Update game speed based on multiplier selection
     */
    updateGameSpeed() {
        const newMultiplier = parseFloat(this.speedMultiplierSelect.value);
        
        // Only update if value has changed
        if (newMultiplier !== this.speedMultiplier) {
            this.speedMultiplier = newMultiplier;
            
            // Update passive income rate
            this.gameManager.gameState.incomeRate = 0.1 * this.speedMultiplier;
            
            // Update intervals for automation
            this.updateAutomationIntervals();
            
            // Log the change
            if (this.gameManager.ui) {
                this.gameManager.ui.logMessage(`Game speed set to ${this.speedMultiplier}x`);
                this.gameManager.ui.updateUI();
            }
        }
    }
    
    /**
     * Update all automation intervals based on speed multiplier
     */
    updateAutomationIntervals() {
        const gameState = this.gameManager.gameState;
        
        // Restart passive income with new rate
        this.gameManager.startPassiveIncome();
        
        // Restart auto opener if purchased
        if (gameState.upgrades.autoOpener.purchased) {
            gameState.upgrades.autoOpener.speed = 5000 / this.speedMultiplier;
            this.gameManager.startAutoOpener();
        }
        
        // Restart auto buyer if purchased
        if (gameState.upgrades.autoBuyer.purchased) {
            gameState.upgrades.autoBuyer.speed = 5000 / this.speedMultiplier;
            this.gameManager.startAutoBuyer();
        }
        
        // Restart auto seller
        if (gameState.upgrades.autoSeller.purchased) {
            this.gameManager.startAutoSeller(10000 / this.speedMultiplier);
        }
    }
    
    /**
     * Add random cards to collection
     * @param {number} count - Number of cards to add
     */
    addRandomCards(count) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            cards.push(CardData.generateCard(true));
        }
        
        this.gameManager.gameState.addCardsToCollection(cards);
        this.gameManager.gameState.checkPhaseProgression();
        
        // Log the change
        if (this.gameManager.ui) {
            this.gameManager.ui.logMessage(`Added ${count} random cards to your collection`);
            this.gameManager.ui.updateUI();
        }
    }
    
    /**
     * Add money to player
     * @param {number} amount - Amount of money to add
     */
    addMoney(amount) {
        this.gameManager.gameState.money += amount;
        this.gameManager.gameState.checkPhaseProgression();
        
        // Log the change
        if (this.gameManager.ui) {
            this.gameManager.ui.logMessage(`Added ${Utils.formatCurrency(amount)} to your account`);
            this.gameManager.ui.updateUI();
        }
    }
    
    /**
     * Delete save data and reload the page
     */
    deleteSaveData() {
        if (confirm('Are you sure you want to delete your save data? This cannot be undone.')) {
            localStorage.removeItem('tcgIdleGameSave');
            alert('Save data deleted. The page will now reload.');
            location.reload();
        }
    }
}

// Make DevMenu available globally
window.DevMenu = DevMenu;