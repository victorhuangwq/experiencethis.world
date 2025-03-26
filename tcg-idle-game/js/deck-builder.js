/**
 * Deck Builder for tournament battles
 * Allows player to select cards for their battle deck
 */

class DeckBuilder {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.deckSize = 3; // Default deck size for tournaments
        this.selectedCards = []; // Currently selected cards
        this.isOpen = false;
        
        // Initialize DOM elements
        this.deckBuilderContainer = null;
        this.cardListContainer = null;
        this.selectedDeckContainer = null;
        
        // Tournament callback
        this.tournamentCallback = null;
        this.tournamentLevel = null;
    }
    
    /**
     * Open the deck builder
     * @param {number} deckSize - Number of cards to include in deck
     * @param {number} tournamentLevel - Tournament level index
     * @param {function} callback - Function to call when deck is built
     */
    open(deckSize, tournamentLevel, callback) {
        this.deckSize = deckSize || 3;
        this.selectedCards = [];
        this.tournamentCallback = callback;
        this.tournamentLevel = tournamentLevel;
        this.isOpen = true;
        
        // Create UI if it doesn't exist yet
        if (!this.deckBuilderContainer) {
            this.createUI();
        }
        
        // Show the deck builder
        this.deckBuilderContainer.classList.remove('hidden');
        
        // Update displays
        this.updateCardList();
        this.updateSelectedDeck();
    }
    
    /**
     * Close the deck builder
     */
    close() {
        if (this.deckBuilderContainer) {
            // Remove the container from the DOM completely instead of just hiding it
            this.deckBuilderContainer.remove();
            this.deckBuilderContainer = null;
            this.cardListContainer = null;
            this.selectedDeckContainer = null;
        }
        this.isOpen = false;
        this.selectedCards = [];
        this.tournamentCallback = null;
        this.tournamentLevel = null;
    }
    
    /**
     * Create the deck builder UI
     */
    createUI() {
        // Create main container
        this.deckBuilderContainer = document.createElement('div');
        this.deckBuilderContainer.id = 'deck-builder';
        this.deckBuilderContainer.className = 'hidden';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'deck-builder-header';
        header.innerHTML = `
            <h2>Build Your Battle Deck</h2>
            <p>Select <span id="deck-size">${this.deckSize}</span> cards for your tournament deck.</p>
            <p>Selected: <span id="selected-count">0</span>/${this.deckSize}</p>
        `;
        
        // Create card list section
        const cardListSection = document.createElement('div');
        cardListSection.className = 'deck-builder-section';
        cardListSection.innerHTML = '<h3>Your Collection</h3>';
        this.cardListContainer = document.createElement('div');
        this.cardListContainer.className = 'card-list';
        cardListSection.appendChild(this.cardListContainer);
        
        // Create selected deck section
        const selectedDeckSection = document.createElement('div');
        selectedDeckSection.className = 'deck-builder-section';
        selectedDeckSection.innerHTML = '<h3>Selected Deck</h3>';
        this.selectedDeckContainer = document.createElement('div');
        this.selectedDeckContainer.className = 'selected-deck';
        selectedDeckSection.appendChild(this.selectedDeckContainer);
        
        // Create buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'deck-builder-buttons';
        
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm Deck';
        confirmButton.id = 'confirm-deck';
        confirmButton.disabled = true;
        confirmButton.addEventListener('click', () => this.confirmDeck());
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => this.cancel());
        
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        
        // Assemble UI
        this.deckBuilderContainer.appendChild(header);
        this.deckBuilderContainer.appendChild(cardListSection);
        this.deckBuilderContainer.appendChild(selectedDeckSection);
        this.deckBuilderContainer.appendChild(buttonsContainer);
        
        // Add to document
        document.body.appendChild(this.deckBuilderContainer);
    }
    
    /**
     * Update the card list display
     */
    updateCardList() {
        if (!this.cardListContainer) return;
        
        // Clear existing cards
        this.cardListContainer.innerHTML = '';
        
        // Get player's collection
        const collection = this.gameManager.gameState.collection;
        
        if (collection.length === 0) {
            this.cardListContainer.innerHTML = '<p>No cards in your collection yet.</p>';
            return;
        }
        
        // Group by type for easier selection
        const cardsByType = {};
        for (const type of CardData.types) {
            cardsByType[type] = [];
        }
        
        // Fill groups with cards
        for (const card of collection) {
            // Skip cards already in deck
            if (this.selectedCards.some(c => c.id === card.id)) continue;
            
            cardsByType[card.type].push(card);
        }
        
        // Create sections for each type
        for (const type of CardData.types) {
            const cards = cardsByType[type];
            if (cards.length === 0) continue;
            
            // Create type section
            const typeSection = document.createElement('div');
            typeSection.className = 'card-type-section';
            typeSection.innerHTML = `<h4>${type} Cards (${cards.length})</h4>`;
            
            // Sort cards by rarity (best first)
            cards.sort((a, b) => {
                const rarityOrder = {
                    'legendary': 0,
                    'ultra-rare': 1,
                    'rare': 2,
                    'uncommon': 3,
                    'common': 4
                };
                return rarityOrder[a.rarity] - rarityOrder[b.rarity];
            });
            
            // Add each card
            for (const card of cards) {
                const cardElement = this.createCardElement(card, true);
                typeSection.appendChild(cardElement);
            }
            
            this.cardListContainer.appendChild(typeSection);
        }
    }
    
    /**
     * Update the selected deck display
     */
    updateSelectedDeck() {
        if (!this.selectedDeckContainer) return;
        
        // Clear existing cards
        this.selectedDeckContainer.innerHTML = '';
        
        // Add selected cards
        if (this.selectedCards.length === 0) {
            this.selectedDeckContainer.innerHTML = '<p>No cards selected yet.</p>';
        } else {
            for (const card of this.selectedCards) {
                const cardElement = this.createCardElement(card, false);
                this.selectedDeckContainer.appendChild(cardElement);
            }
        }
        
        // Update selected count
        const selectedCountElement = document.getElementById('selected-count');
        if (selectedCountElement) {
            selectedCountElement.textContent = this.selectedCards.length;
        }
        
        // Update confirm button state
        const confirmButton = document.getElementById('confirm-deck');
        if (confirmButton) {
            confirmButton.disabled = this.selectedCards.length !== this.deckSize;
        }
    }
    
    /**
     * Create a card element for display
     * @param {Object} card - Card data
     * @param {boolean} isSelectable - Whether the card can be selected
     * @returns {HTMLElement} - Card element
     */
    createCardElement(card, isSelectable) {
        const cardElement = document.createElement('div');
        cardElement.className = `battle-card ${card.rarity}`;
        cardElement.dataset.cardId = card.id;
        
        // Format special ability text if card has one
        let abilityText = '';
        if (card.specialAbility) {
            abilityText = `<div class="card-ability">${card.specialAbility.name}: ${card.specialAbility.description}</div>`;
        }
        
        // Create card content
        cardElement.innerHTML = `
            <div class="card-header">
                <span class="card-name">${card.name}</span>
                <span class="card-type">${card.type}</span>
            </div>
            <div class="card-stats">
                <span class="card-hp">HP: ${card.hp}</span>
                <span class="card-attack">ATK: ${card.attack}</span>
            </div>
            ${abilityText}
            <div class="card-rarity">${card.rarity}</div>
        `;
        
        // Add selection functionality
        if (isSelectable) {
            cardElement.classList.add('selectable');
            cardElement.addEventListener('click', () => this.selectCard(card));
        } else {
            cardElement.classList.add('selected');
            cardElement.addEventListener('click', () => this.unselectCard(card));
        }
        
        return cardElement;
    }
    
    /**
     * Select a card for the deck
     * @param {Object} card - Card to select
     */
    selectCard(card) {
        // Check if deck is already full
        if (this.selectedCards.length >= this.deckSize) {
            return;
        }
        
        // Add to selected cards
        this.selectedCards.push(card);
        
        // Update displays
        this.updateCardList();
        this.updateSelectedDeck();
    }
    
    /**
     * Remove a card from the deck
     * @param {Object} card - Card to unselect
     */
    unselectCard(card) {
        // Remove from selected cards
        this.selectedCards = this.selectedCards.filter(c => c.id !== card.id);
        
        // Update displays
        this.updateCardList();
        this.updateSelectedDeck();
    }
    
    /**
     * Confirm the deck and start the tournament
     */
    confirmDeck() {
        if (this.selectedCards.length !== this.deckSize) {
            return; // Deck not complete
        }
        
        try {
            // Make deep copy of the selected cards to prevent reference issues
            const selectedDeckCopy = this.selectedCards.map(card => {
                // Create a new object with all the properties of the original card
                return {
                    ...card,
                    // Ensure these crucial battle properties are included and are numbers
                    hp: Number(card.hp) || 50,
                    maxHp: Number(card.maxHp) || 50,
                    attack: Number(card.attack) || 10,
                    // Preserve type and other properties
                    type: card.type || 'Nature',
                    rarity: card.rarity || 'common',
                    name: card.name || 'Unknown Card',
                    id: card.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    // Preserve special ability if it exists
                    specialAbility: card.specialAbility ? { ...card.specialAbility } : null
                };
            });
            
            console.log('Confirmed deck with cards:', selectedDeckCopy);
            
            // Store callback and arguments
            const callback = this.tournamentCallback;
            const tournamentLevel = this.tournamentLevel;
            const deck = selectedDeckCopy;
            
            // Close the deck builder first
            this.close();
            
            // Call the tournament callback with selected deck and level using setTimeout 
            // to ensure UI is updated before proceeding to battle
            if (callback) {
                setTimeout(() => {
                    try {
                        callback(deck, tournamentLevel);
                    } catch (error) {
                        console.error('Error in tournament callback execution:', error);
                    }
                }, 50);
            }
        } catch (error) {
            console.error('Error confirming deck:', error);
            // Make sure to close the deck builder even if there's an error
            this.close();
        }
    }
    
    /**
     * Cancel deck building
     */
    cancel() {
        console.log('Cancelling deck selection');
        
        // First call the tournament callback with null to indicate cancellation
        if (this.tournamentCallback) {
            this.tournamentCallback(null, this.tournamentLevel);
        }
        
        // Then close the deck builder UI
        this.close();
    }
}

// Make DeckBuilder available globally
window.DeckBuilder = DeckBuilder;