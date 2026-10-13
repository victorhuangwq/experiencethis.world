/**
 * Tournament system for the TCG Idle Game
 */

class TournamentSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Tournament levels - limited to just 3 tournaments as requested
        this.tournamentLevels = [
            { name: 'Local Club', minCards: 20, entry: 10, reward: { min: 15, max: 30 }, difficulty: 0.3 },
            { name: 'Regional Tournament', minCards: 60, entry: 50, reward: { min: 75, max: 150 }, difficulty: 0.6 },
            { name: 'National Championship', minCards: 100, entry: 100, reward: { min: 150, max: 300 }, difficulty: 0.7 }
        ];
    }
    
    /**
     * Get available tournaments based on player's collection and progression
     * @returns {Array} - Array of available tournament objects
     */
    getAvailableTournaments() {
        const collectionSize = this.gameManager.gameState.collection.length;
        const highestTournamentWon = this.gameManager.gameState.highestTournamentWon || -1;
        
        // Filter tournaments based on collection size and progression
        // Each tournament unlocks the next one after winning
        return this.tournamentLevels.filter((t, index) => {
            return collectionSize >= t.minCards && index <= highestTournamentWon + 1;
        });
    }
    
    /**
     * Enter a tournament
     * @param {number} levelIndex - Index of the tournament level
     * @returns {Object|null} - Result object or null if entry failed
     */
    enterTournament(levelIndex) {
        const tournament = this.tournamentLevels[levelIndex];
        
        // Check if player meets requirements
        if (this.gameManager.gameState.collection.length < tournament.minCards) {
            return { success: false, message: `You need at least ${tournament.minCards} cards to enter this tournament.` };
        }
        
        // Check if player can afford entry fee
        if (this.gameManager.gameState.money < tournament.entry) {
            return { success: false, message: `You need ${Utils.formatCurrency(tournament.entry)} to enter this tournament.` };
        }
        
        // Pay entry fee
        this.gameManager.gameState.money -= tournament.entry;
        
        // Initialize deck builder and battle system if they don't exist yet
        if (!this.gameManager.deckBuilder) {
            this.gameManager.deckBuilder = new DeckBuilder(this.gameManager);
        }
        
        if (!this.gameManager.battleSystem) {
            this.gameManager.battleSystem = new BattleSystem(this.gameManager);
        }
        
        // Determine deck size based on tournament level
        let deckSize = 3; // Default
        if (levelIndex >= 3) { // National/World tournaments
            deckSize = 5;
        } else if (levelIndex >= 1) { // City/Regional tournaments
            deckSize = 4;
        }
        
        // Open deck builder to let player choose cards
        try {
            // First check if we need to recreate the deck builder
            if (!this.gameManager.deckBuilder) {
                this.gameManager.deckBuilder = new DeckBuilder(this.gameManager);
            }
        
            this.gameManager.deckBuilder.open(deckSize, levelIndex, (selectedDeck, tournamentLevel) => {
                try {
                    if (selectedDeck) {
                        // Player confirmed deck, start tournament
                        this.gameManager.battleSystem.startTournament(selectedDeck, tournamentLevel);
                    } else {
                        console.log('Tournament cancelled by player');
                        // Player cancelled, refund entry fee
                        this.gameManager.gameState.money += tournament.entry;
                        if (this.gameManager.ui) {
                            this.gameManager.ui.logMessage(`Tournament entry cancelled. Entry fee refunded.`);
                            this.gameManager.ui.updateUI();
                        }
                    }
                } catch (error) {
                    console.error('Error in tournament callback:', error);
                    // Make sure to refund entry fee on error
                    this.gameManager.gameState.money += tournament.entry;
                    if (this.gameManager.ui) {
                        this.gameManager.ui.logMessage(`Tournament entry cancelled due to an error. Entry fee refunded.`);
                        this.gameManager.ui.updateUI();
                    }
                }
            });
        } catch (error) {
            console.error('Error opening deck builder:', error);
            // Make sure to refund entry fee on error
            this.gameManager.gameState.money += tournament.entry;
            if (this.gameManager.ui) {
                this.gameManager.ui.logMessage(`Tournament entry cancelled due to an error. Entry fee refunded.`);
                this.gameManager.ui.updateUI();
            }
        }
        
        // Return a temporary result
        return {
            success: true,
            tournamentName: tournament.name,
            entryFee: tournament.entry,
            message: `Entering ${tournament.name}. Select your cards!`
        };
    }
    
    /**
     * Calculate player's strength based on their collection
     * @returns {number} - Player strength value
     */
    calculatePlayerStrength() {
        const collection = this.gameManager.gameState.collection;
        
        // Base strength is collection size
        let strength = collection.length;
        
        // Add bonus for rare cards
        const rarityMultipliers = {
            'common': 1,
            'uncommon': 2,
            'rare': 5,
            'ultra-rare': 10,
            'legendary': 25
        };
        
        for (const card of collection) {
            strength += rarityMultipliers[card.rarity] || 1;
        }
        
        return strength;
    }
    
    /**
     * Generate ASCII art for tournament result
     * @param {Object} result - Tournament result object
     * @returns {string} - ASCII art representation
     */
    generateTournamentResultArt(result) {
        if (result.isWin) {
            return `
    .-*^*-._.-*^*-.
    |             |
    |   WINNER!   |
    |             |
    '-.,_,.-.,,_,'
                    
     ${result.tournamentName}
     Prize: ${Utils.formatCurrency(result.reward)}
            `;
        } else {
            return `
    .--------------.
    |   DEFEATED   |
    '--------------'
                    
     ${result.tournamentName}
     Better luck next time!
            `;
        }
    }
}

// Make TournamentSystem available globally
window.TournamentSystem = TournamentSystem;