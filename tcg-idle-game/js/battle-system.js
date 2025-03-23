/**
 * Battle System for tournament gameplay
 * Handles turn-based card battles
 */

class BattleSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Battle state
        this.isActive = false;
        this.playerDeck = [];
        this.opponentDeck = [];
        this.playerActiveCard = null;
        this.opponentActiveCard = null;
        this.turnNumber = 0;
        this.playerTurn = true;
        
        // Tournament state
        this.tournamentLevel = null;
        this.currentBattle = 0;
        this.battlesRequired = 0;
        this.battleResult = null;
        
        // UI elements
        this.battleContainer = null;
        this.playerCardContainer = null;
        this.opponentCardContainer = null;
        this.battleLog = null;
        this.actionButtons = null;
    }
    
    /**
     * Start a tournament with the selected deck
     * @param {Array} playerDeck - Array of player's selected cards
     * @param {number} tournamentLevel - Tournament level index
     */
    startTournament(playerDeck, tournamentLevel) {
        if (!playerDeck) {
            // Player cancelled deck selection
            console.log('Tournament cancelled - no deck provided');
            return;
        }
        
        // Validate the player deck before proceeding
        if (!Array.isArray(playerDeck) || playerDeck.length === 0) {
            console.error('Invalid player deck format:', playerDeck);
            if (this.gameManager.ui) {
                this.gameManager.ui.logMessage('Error: Invalid deck format. Tournament cancelled.');
            }
            return;
        }
        
        // No need to deep copy again since deck-builder already creates a deep copy
        this.playerDeck = playerDeck;
        console.log('Starting tournament with player deck:', this.playerDeck);
        
        // Perform a full validation of all cards in the deck
        const invalidCards = this.playerDeck.filter(card => {
            const validation = this.validateCardForBattle(card);
            return !validation.isValid;
        });
        
        if (invalidCards.length > 0) {
            console.error('Invalid cards in player deck:', invalidCards);
            if (this.gameManager.ui) {
                this.gameManager.ui.logMessage(`Error: ${invalidCards.length} invalid cards in deck. Tournament cancelled.`);
            }
            return;
        }
        
        this.tournamentLevel = tournamentLevel;
        
        // Determine number of battles required based on tournament level
        switch(tournamentLevel) {
            case 0: // Local tournament
                this.battlesRequired = 2;
                break;
            case 1: // Regional tournament
                this.battlesRequired = 3;
                break;
            case 2: // National tournament
                this.battlesRequired = 4;
                break;
            default:
                this.battlesRequired = 2;
        }
        
        if (this.gameManager.ui) {
            this.gameManager.ui.logMessage(`Tournament started! You'll need to win ${this.battlesRequired} battles.`);
        }
        
        this.currentBattle = 0;
        this.startNextBattle();
    }
    
    /**
     * Start the next battle in the tournament
     */
    startNextBattle() {
        this.currentBattle++;
        
        // Check if tournament is complete
        if (this.currentBattle > this.battlesRequired) {
            this.endTournament(true); // Player won all battles
            return;
        }
        
        try {
            // Clear any existing strategy menu
            const strategyMenu = document.getElementById('strategy-menu');
            if (strategyMenu) {
                strategyMenu.remove();
            }
            
            // Generate opponent deck based on tournament level and battle number
            this.generateOpponentDeck();
            
            // Validate player deck
            if (!this.playerDeck || !this.playerDeck.length) {
                console.error('Invalid player deck:', this.playerDeck);
                if (this.gameManager.ui) {
                    this.gameManager.ui.logMessage('Error: Invalid player deck. Tournament cancelled.');
                }
                this.endTournament(false);
                return;
            }
            
            // Validate opponent deck
            if (!this.opponentDeck || !this.opponentDeck.length) {
                console.error('Invalid opponent deck:', this.opponentDeck);
                
                // Try to generate a new opponent deck
                this.generateOpponentDeck();
                
                // If still invalid, end the tournament
                if (!this.opponentDeck || !this.opponentDeck.length) {
                    if (this.gameManager.ui) {
                        this.gameManager.ui.logMessage('Error: Could not generate opponent deck. Tournament cancelled.');
                    }
                    this.endTournament(false);
                    return;
                }
            }
            
            // Now validate each card in both decks
            let validationFailed = false;
            
            // Validate each card in player deck
            for (let i = 0; i < this.playerDeck.length; i++) {
                const validation = this.validateCardForBattle(this.playerDeck[i]);
                if (!validation.isValid) {
                    console.error(`Invalid player card at index ${i}:`, validation.message);
                    validationFailed = true;
                    break;
                } else if (validation.message !== 'Card is valid') {
                    // Card was fixed, log the message
                    console.log(`Fixed player card at index ${i}:`, validation.message);
                }
            }
            
            // Validate each card in opponent deck
            for (let i = 0; i < this.opponentDeck.length; i++) {
                const validation = this.validateCardForBattle(this.opponentDeck[i]);
                if (!validation.isValid) {
                    console.error(`Invalid opponent card at index ${i}:`, validation.message);
                    validationFailed = true;
                    break;
                } else if (validation.message !== 'Card is valid') {
                    // Card was fixed, log the message
                    console.log(`Fixed opponent card at index ${i}:`, validation.message);
                }
            }
            
            if (validationFailed) {
                if (this.gameManager.ui) {
                    this.gameManager.ui.logMessage('Error: Card validation failed. Tournament cancelled.');
                }
                this.endTournament(false);
                return;
            }
            
            // Reset battle state
            this.isActive = true;
            this.turnNumber = 0;
            this.playerTurn = true;
            this.battleResult = null;
            
            // Set active cards
            this.playerActiveCard = this.playerDeck[0];
            this.opponentActiveCard = this.opponentDeck[0];
            
            // Final validation of active cards
            const playerActiveValidation = this.validateCardForBattle(this.playerActiveCard);
            const opponentActiveValidation = this.validateCardForBattle(this.opponentActiveCard);
            
            if (!playerActiveValidation.isValid || !opponentActiveValidation.isValid) {
                console.error('Invalid active cards:', {
                    playerActiveCard: playerActiveValidation.message,
                    opponentActiveCard: opponentActiveValidation.message
                });
                if (this.gameManager.ui) {
                    this.gameManager.ui.logMessage('Error: Invalid active cards. Tournament cancelled.');
                }
                this.endTournament(false);
                return;
            }
            
            // Create or show battle UI with standard battle controls
            if (!this.battleContainer) {
                this.createBattleUI();
            } else {
                // Remove any previous buttons and recreate the standard battle buttons
                if (this.actionButtons) {
                    this.actionButtons.innerHTML = `
                        <button id="attack-button">Attack</button>
                        <button id="switch-button">Switch Card</button>
                        <button id="skip-button">Skip Turn</button>
                    `;
                    
                    // Re-add event listeners
                    const attackBtn = this.actionButtons.querySelector('#attack-button');
                    const switchBtn = this.actionButtons.querySelector('#switch-button');
                    const skipBtn = this.actionButtons.querySelector('#skip-button');
                    
                    if (attackBtn) attackBtn.addEventListener('click', () => this.playerAttack());
                    if (switchBtn) switchBtn.addEventListener('click', () => {
                        // Toggle visibility of deck selector
                        const deckCards = this.playerDeckDisplay;
                        if (deckCards && deckCards.classList.contains('show')) {
                            deckCards.classList.remove('show');
                        } else if (deckCards) {
                            deckCards.classList.add('show');
                            this.updateDeckDisplay();
                        }
                    });
                    if (skipBtn) skipBtn.addEventListener('click', () => this.skipTurn());
                }
                
                // Show the battle container
                this.battleContainer.classList.remove('hidden');
            }
            
            // Update UI
            this.updateBattleUI();
            
            // Add battle start message
            this.logBattleMessage(`Battle ${this.currentBattle} of ${this.battlesRequired} started!`);
            this.logBattleMessage(`Your ${this.playerActiveCard.name} faces opponent's ${this.opponentActiveCard.name}!`);
            
            // Start first turn
            this.nextTurn();
        } catch (error) {
            console.error('Error in startNextBattle:', error);
            if (this.gameManager.ui) {
                this.gameManager.ui.logMessage('An error occurred starting the battle. Tournament cancelled.');
            }
            this.endTournament(false);
        }
    }
    
    /**
     * Generate opponent deck based on tournament level and battle number
     */
    generateOpponentDeck() {
        const deck = [];
        const levelMultiplier = 1 + (this.tournamentLevel * 0.2); // Higher tournaments have stronger opponents
        const battleMultiplier = 1 + ((this.currentBattle - 1) * 0.1); // Later battles are harder
        
        // Generate 3 cards for opponent
        for (let i = 0; i < 3; i++) {
            // Determine card rarity based on tournament level and battle
            let rarity;
            const rarityRoll = Math.random();
            
            if (this.tournamentLevel >= 3) { // National or World
                if (rarityRoll < 0.3) rarity = 'legendary';
                else if (rarityRoll < 0.6) rarity = 'ultra-rare';
                else rarity = 'rare';
            } else if (this.tournamentLevel >= 2) { // Regional
                if (rarityRoll < 0.1) rarity = 'legendary';
                else if (rarityRoll < 0.4) rarity = 'ultra-rare';
                else rarity = 'rare';
            } else if (this.tournamentLevel >= 1) { // City
                if (rarityRoll < 0.05) rarity = 'legendary';
                else if (rarityRoll < 0.2) rarity = 'ultra-rare';
                else if (rarityRoll < 0.6) rarity = 'rare';
                else rarity = 'uncommon';
            } else { // Local
                if (rarityRoll < 0.1) rarity = 'ultra-rare';
                else if (rarityRoll < 0.3) rarity = 'rare';
                else if (rarityRoll < 0.7) rarity = 'uncommon';
                else rarity = 'common';
            }
            
            // Generate a card of the determined rarity
            const card = this.generateOpponentCard(rarity, levelMultiplier, battleMultiplier);
            deck.push(card);
        }
        
        this.opponentDeck = deck;
    }
    
    /**
     * Generate a card for the opponent with specific rarity
     * @param {string} rarity - Card rarity
     * @param {number} levelMultiplier - Tournament level multiplier
     * @param {number} battleMultiplier - Battle number multiplier
     * @returns {Object} - Generated card
     */
    generateOpponentCard(rarity, levelMultiplier, battleMultiplier) {
        // Base stats by rarity (same as player cards)
        let hp, attack, specialAbility = null;
        
        switch(rarity) {
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
                specialAbility = CardData.specialAbilities[Utils.randomInt(0, CardData.specialAbilities.length - 1)];
                break;
            case 'ultra-rare':
                hp = Utils.randomInt(60, 80);
                attack = Utils.randomInt(15, 25);
                specialAbility = CardData.specialAbilities[Utils.randomInt(0, CardData.specialAbilities.length - 1)];
                break;
            case 'legendary':
                hp = Utils.randomInt(70, 100);
                attack = Utils.randomInt(20, 30);
                specialAbility = CardData.specialAbilities[Utils.randomInt(0, CardData.specialAbilities.length - 1)];
                break;
        }
        
        // Apply tournament difficulty multipliers
        hp = Math.floor(hp * levelMultiplier * battleMultiplier);
        attack = Math.floor(attack * levelMultiplier * battleMultiplier);
        
        // Choose random type
        const type = CardData.types[Utils.randomInt(0, CardData.types.length - 1)];
        
        // Adjust stats based on type
        if (type === 'Dragon') {
            hp = Math.floor(hp * 1.2);
            attack = Math.floor(attack * 1.2);
        } else if (type === 'Spell') {
            hp = Math.floor(hp * 0.8);
            attack = Math.floor(attack * 0.9);
            // Spells always have a special ability
            if (!specialAbility) {
                specialAbility = CardData.specialAbilities[Utils.randomInt(0, CardData.specialAbilities.length - 1)];
            }
        }
        
        // Generate opponent card name
        const prefix = CardData.namePrefixes[Utils.randomInt(0, CardData.namePrefixes.length - 1)];
        const suffix = CardData.nameSuffixes[Utils.randomInt(0, CardData.nameSuffixes.length - 1)];
        const name = 'Opponent\'s ' + prefix + ' ' + suffix;
        
        // Create and return the card
        return {
            id: 'opponent-' + Date.now() + Math.random().toString(36).substr(2, 9),
            name: name,
            type: type,
            rarity: rarity,
            hp: hp,
            maxHp: hp,
            attack: attack,
            specialAbility: specialAbility
        };
    }
    
    /**
     * Create the battle UI
     */
    createBattleUI() {
        // Create main container
        this.battleContainer = document.createElement('div');
        this.battleContainer.id = 'battle-container';
        
        // Create battle field
        const battleField = document.createElement('div');
        battleField.className = 'battle-field';
        
        // Create player card area
        const playerArea = document.createElement('div');
        playerArea.className = 'player-area';
        playerArea.innerHTML = '<h3>Your Card</h3>';
        this.playerCardContainer = document.createElement('div');
        this.playerCardContainer.className = 'active-card-container';
        playerArea.appendChild(this.playerCardContainer);
        
        // Create player deck selector
        const playerDeckSelector = document.createElement('div');
        playerDeckSelector.className = 'deck-selector';
        playerDeckSelector.innerHTML = '<h4>Your Deck</h4>';
        
        // Add placeholder for deck cards
        this.playerDeckDisplay = document.createElement('div');
        this.playerDeckDisplay.className = 'deck-cards';
        playerDeckSelector.appendChild(this.playerDeckDisplay);
        
        playerArea.appendChild(playerDeckSelector);
        
        // Create opponent card area
        const opponentArea = document.createElement('div');
        opponentArea.className = 'opponent-area';
        opponentArea.innerHTML = '<h3>Opponent\'s Card</h3>';
        this.opponentCardContainer = document.createElement('div');
        this.opponentCardContainer.className = 'active-card-container';
        opponentArea.appendChild(this.opponentCardContainer);
        
        // Add opponent deck count
        const opponentDeckInfo = document.createElement('div');
        opponentDeckInfo.className = 'opponent-deck-info';
        opponentDeckInfo.innerHTML = `<p>Opponent's Cards: <span id="opponent-card-count">0</span></p>`;
        opponentArea.appendChild(opponentDeckInfo);
        
        // Add areas to battle field
        battleField.appendChild(playerArea);
        battleField.appendChild(opponentArea);
        
        // Create battle log
        const battleLogContainer = document.createElement('div');
        battleLogContainer.className = 'battle-log-container';
        battleLogContainer.innerHTML = '<h3>Battle Log</h3>';
        this.battleLog = document.createElement('div');
        this.battleLog.className = 'battle-log';
        battleLogContainer.appendChild(this.battleLog);
        
        // Create action buttons
        this.actionButtons = document.createElement('div');
        this.actionButtons.className = 'battle-actions';
        this.actionButtons.innerHTML = `
            <button id="attack-button">Attack</button>
            <button id="switch-button">Switch Card</button>
            <button id="skip-button">Skip Turn</button>
        `;
        
        // Add event listeners to buttons
        this.actionButtons.querySelector('#attack-button').addEventListener('click', () => this.playerAttack());
        this.actionButtons.querySelector('#switch-button').addEventListener('click', () => {
            // Toggle visibility of deck selector
            const deckCards = this.playerDeckDisplay;
            if (deckCards.classList.contains('show')) {
                deckCards.classList.remove('show');
            } else {
                deckCards.classList.add('show');
                this.updateDeckDisplay();
            }
        });
        this.actionButtons.querySelector('#skip-button').addEventListener('click', () => this.skipTurn());
        
        // Assemble UI
        this.battleContainer.appendChild(battleField);
        this.battleContainer.appendChild(battleLogContainer);
        this.battleContainer.appendChild(this.actionButtons);
        
        // Add to document
        document.body.appendChild(this.battleContainer);
    }
    
    /**
     * Update the deck display for card switching
     */
    updateDeckDisplay() {
        if (!this.playerDeckDisplay) return;
        
        // Clear existing cards
        this.playerDeckDisplay.innerHTML = '';
        
        // Add each card in the player's deck
        this.playerDeck.forEach((card, index) => {
            // Skip the active card
            if (card === this.playerActiveCard) return;
            
            // Create a mini card for the deck display
            const miniCard = document.createElement('div');
            miniCard.className = `mini-card ${card.rarity}`;
            miniCard.innerHTML = `
                <div class="mini-card-name">${card.name}</div>
                <div class="mini-card-type">${card.type}</div>
                <div class="mini-card-stats">HP: ${card.hp}/${card.maxHp} | ATK: ${card.attack}</div>
            `;
            
            // Add click handler to switch cards
            miniCard.addEventListener('click', () => {
                this.switchCard(index);
                this.playerDeckDisplay.classList.remove('show');
            });
            
            this.playerDeckDisplay.appendChild(miniCard);
        });
        
        // If no other cards to switch to, show a message
        if (this.playerDeckDisplay.children.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No other cards available';
            this.playerDeckDisplay.appendChild(message);
        }
    }
    
    /**
     * Update the battle UI
     */
    updateBattleUI() {
        if (!this.battleContainer) return;
        
        // Update player card display
        this.updateCardDisplay(this.playerCardContainer, this.playerActiveCard, true);
        
        // Update opponent card display
        this.updateCardDisplay(this.opponentCardContainer, this.opponentActiveCard, false);
        
        // Update opponent deck count
        const opponentCardCount = document.getElementById('opponent-card-count');
        if (opponentCardCount) {
            opponentCardCount.textContent = this.opponentDeck.length.toString();
        }
        
        // Update action buttons based on turn - check if buttons exist first
        if (this.actionButtons) {
            const attackButton = this.actionButtons.querySelector('#attack-button');
            const switchButton = this.actionButtons.querySelector('#switch-button');
            const skipButton = this.actionButtons.querySelector('#skip-button');
            
            // Only update buttons if they exist
            if (attackButton && switchButton && skipButton) {
                if (this.playerTurn) {
                    attackButton.disabled = false;
                    switchButton.disabled = this.playerDeck.length <= 1; // Disable if only one card left
                    skipButton.disabled = false;
                } else {
                    attackButton.disabled = true;
                    switchButton.disabled = true;
                    skipButton.disabled = true;
                }
            }
            
            // Hide deck selector if it's open
            if (this.playerDeckDisplay && this.playerDeckDisplay.classList.contains('show')) {
                this.playerDeckDisplay.classList.remove('show');
            }
        }
    }
    
    /**
     * Update a card display in the battle UI
     * @param {HTMLElement} container - Card container element
     * @param {Object} card - Card data to display
     * @param {boolean} isPlayer - Whether this is the player's card
     */
    updateCardDisplay(container, card, isPlayer) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Validate card before displaying
        if (!card) {
            console.error('Attempting to display null or undefined card');
            // Create error message element
            const errorElement = document.createElement('div');
            errorElement.className = 'battle-card error';
            errorElement.innerHTML = `
                <div class="card-header">
                    <span class="card-name">Error</span>
                    <span class="card-type">Invalid Card</span>
                </div>
                <div class="card-health-bar">
                    <div class="health-bar-fill" style="width: 0%"></div>
                    <span class="health-text">0/0</span>
                </div>
                <div class="card-error-message">Card data is missing</div>
            `;
            container.appendChild(errorElement);
            return;
        }
        
        try {
            // Validate and fix card if needed
            const validation = this.validateCardForBattle(card);
            if (!validation.isValid) {
                console.error('Invalid card in updateCardDisplay:', validation.message);
                // Create error message element
                const errorElement = document.createElement('div');
                errorElement.className = 'battle-card error';
                errorElement.innerHTML = `
                    <div class="card-header">
                        <span class="card-name">Error</span>
                        <span class="card-type">Invalid Card</span>
                    </div>
                    <div class="card-health-bar">
                        <div class="health-bar-fill" style="width: 0%"></div>
                        <span class="health-text">0/0</span>
                    </div>
                    <div class="card-error-message">${validation.message}</div>
                `;
                container.appendChild(errorElement);
                return;
            }
            
            // Create card element
            const cardElement = document.createElement('div');
            cardElement.className = `battle-card active ${card.rarity || 'common'}`;
            
            // Calculate health percentage safely with fallbacks
            const hp = typeof card.hp === 'number' ? card.hp : 0;
            const maxHp = typeof card.maxHp === 'number' ? card.maxHp : 1;
            const healthPercent = Math.max(0, Math.floor((hp / maxHp) * 100));
            
            // Format special ability text if card has one
            let abilityText = '';
            if (card.specialAbility && card.specialAbility.name && card.specialAbility.description) {
                abilityText = `<div class="card-ability">${card.specialAbility.name}: ${card.specialAbility.description}</div>`;
            }
            
            // Create card content with safe fallbacks
            cardElement.innerHTML = `
                <div class="card-header">
                    <span class="card-name">${card.name || 'Unknown Card'}</span>
                    <span class="card-type">${card.type || 'Unknown Type'}</span>
                </div>
                <div class="card-health-bar">
                    <div class="health-bar-fill" style="width: ${healthPercent}%"></div>
                    <span class="health-text">${hp}/${maxHp}</span>
                </div>
                <div class="card-stats">
                    <span class="card-hp">HP: ${hp}</span>
                    <span class="card-attack">ATK: ${card.attack || 0}</span>
                </div>
                ${abilityText}
                <div class="card-rarity">${card.rarity || 'common'}</div>
            `;
            
            // Add to container
            container.appendChild(cardElement);
        } catch (error) {
            console.error('Error in updateCardDisplay:', error);
            // Create error message element as fallback
            const errorElement = document.createElement('div');
            errorElement.className = 'battle-card error';
            errorElement.innerHTML = `
                <div class="card-header">
                    <span class="card-name">Error</span>
                    <span class="card-type">Display Error</span>
                </div>
                <div class="card-health-bar">
                    <div class="health-bar-fill" style="width: 0%"></div>
                    <span class="health-text">0/0</span>
                </div>
                <div class="card-error-message">Error displaying card</div>
            `;
            container.appendChild(errorElement);
        }
    }
    
    /**
     * Add a message to the battle log
     * @param {string} message - Message to log
     * @param {string} [type] - Message type for styling (super-effective, not-effective, ability, defeat, victory)
     */
    logBattleMessage(message, type) {
        if (!this.battleLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        // Add message type class if provided
        if (type) {
            logEntry.classList.add(type);
        } else {
            // Auto-detect message type based on content for easier use
            if (message.includes('super effective')) {
                logEntry.classList.add('super-effective');
            } else if (message.includes('not very effective')) {
                logEntry.classList.add('not-effective');
            } else if (message.includes('ability') || message.includes('healed') || 
                      message.includes('shifted type') || message.includes('Strike ability')) {
                logEntry.classList.add('ability');
            } else if (message.includes('defeated')) {
                logEntry.classList.add('defeat');
            } else if (message.includes('won the battle') || message.includes('won the tournament')) {
                logEntry.classList.add('victory');
            }
        }
        
        logEntry.textContent = message;
        
        this.battleLog.appendChild(logEntry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }
    
    /**
     * Process the next turn in battle
     */
    nextTurn() {
        this.turnNumber++;
        
        try {
            // Validate active cards before the turn
            if (this.playerActiveCard && this.opponentActiveCard) {
                const playerCardValidation = this.validateCardForBattle(this.playerActiveCard);
                const opponentCardValidation = this.validateCardForBattle(this.opponentActiveCard);
                
                if (!playerCardValidation.isValid || !opponentCardValidation.isValid) {
                    console.error('Invalid cards in nextTurn:', {
                        playerCard: playerCardValidation.message,
                        opponentCard: opponentCardValidation.message
                    });
                    this.logBattleMessage('Error: Active cards are invalid. Battle will restart.');
                    this.endBattle(false);
                    return;
                }
                
                // If validation made some fixes, log them
                if (playerCardValidation.message !== 'Card is valid') {
                    console.log('Fixed player card in nextTurn:', playerCardValidation.message);
                }
                if (opponentCardValidation.message !== 'Card is valid') {
                    console.log('Fixed opponent card in nextTurn:', opponentCardValidation.message);
                }
            } else {
                // Missing active cards
                console.error('Missing active cards in nextTurn:', {
                    playerActiveCard: this.playerActiveCard,
                    opponentActiveCard: this.opponentActiveCard
                });
                this.logBattleMessage('Error: Missing active cards. Battle will restart.');
                this.endBattle(false);
                return;
            }
            
            // Apply abilities that trigger at start of turn
            this.applyStartOfTurnEffects();
            
            // Update UI
            this.updateBattleUI();
            
            if (!this.playerTurn) {
                // AI turn
                setTimeout(() => this.aiTurn(), 1000);
            }
        } catch (error) {
            console.error('Error in nextTurn:', error);
            this.logBattleMessage('An error occurred processing the turn. Battle will restart.');
            this.endBattle(false);
        }
    }
    
    /**
     * Apply card abilities that trigger at start of turn
     */
    applyStartOfTurnEffects() {
        try {
            // Apply healing ability for player card
            if (this.playerActiveCard && this.playerActiveCard.specialAbility && this.playerActiveCard.specialAbility.effect === 'heal') {
                const healAmount = this.playerActiveCard.specialAbility.value;
                const newHp = Math.min(this.playerActiveCard.maxHp, this.playerActiveCard.hp + healAmount);
                const actualHeal = newHp - this.playerActiveCard.hp;
                
                if (actualHeal > 0) {
                    this.playerActiveCard.hp = newHp;
                    this.logBattleMessage(`Your ${this.playerActiveCard.name} healed for ${actualHeal} HP!`);
                }
            }
            
            // Apply healing ability for opponent card
            if (this.opponentActiveCard && this.opponentActiveCard.specialAbility && this.opponentActiveCard.specialAbility.effect === 'heal') {
                const healAmount = this.opponentActiveCard.specialAbility.value;
                const newHp = Math.min(this.opponentActiveCard.maxHp, this.opponentActiveCard.hp + healAmount);
                const actualHeal = newHp - this.opponentActiveCard.hp;
                
                if (actualHeal > 0) {
                    this.opponentActiveCard.hp = newHp;
                    this.logBattleMessage(`Opponent's ${this.opponentActiveCard.name} healed for ${actualHeal} HP!`);
                }
            }
            
            // Apply type shift ability for player card if it's the player's turn
            if (this.playerTurn && this.playerActiveCard && this.opponentActiveCard && 
                this.playerActiveCard.specialAbility && this.playerActiveCard.specialAbility.effect === 'type_shift') {
                // Save original type for display
                const originalType = this.playerActiveCard.type;
                
                // Find a type that has advantage against opponent's type
                let bestType = this.findCounterType(this.opponentActiveCard.type);
                
                // Change player card type
                if (bestType && bestType !== originalType) {
                    this.playerActiveCard.type = bestType;
                    this.logBattleMessage(`Your ${this.playerActiveCard.name} shifted type from ${originalType} to ${bestType}!`);
                }
            }
            
            // Apply type shift ability for opponent card if it's the opponent's turn
            if (!this.playerTurn && this.opponentActiveCard && this.playerActiveCard && 
                this.opponentActiveCard.specialAbility && this.opponentActiveCard.specialAbility.effect === 'type_shift') {
                // Save original type for display
                const originalType = this.opponentActiveCard.type;
                
                // Find a type that has advantage against player's type
                let bestType = this.findCounterType(this.playerActiveCard.type);
                
                // Change opponent card type
                if (bestType && bestType !== originalType) {
                    this.opponentActiveCard.type = bestType;
                    this.logBattleMessage(`Opponent's ${this.opponentActiveCard.name} shifted type from ${originalType} to ${bestType}!`);
                }
            }
        } catch (error) {
            console.error('Error in applyStartOfTurnEffects:', error);
            // Continue with the turn even if abilities fail
        }
    }
    
    /**
     * Find a type that counters the given type
     * @param {string} targetType - The type to counter
     * @returns {string|null} - The counter type or null if none found
     */
    findCounterType(targetType) {
        // Find types that have advantage against the target type
        for (const type in CardData.typeAdvantages) {
            if (CardData.typeAdvantages[type] && 
                Array.isArray(CardData.typeAdvantages[type]) && 
                CardData.typeAdvantages[type].includes(targetType)) {
                return type;
            }
        }
        
        // If no direct counter, return Dragon (strong against most types)
        // unless the target is already Dragon
        if (targetType !== 'Dragon') {
            return 'Dragon';
        }
        
        // If target is Dragon, any other type is better than being the same type
        const otherTypes = CardData.types.filter(t => t !== 'Dragon' && t !== 'Spell');
        return otherTypes[Utils.randomInt(0, otherTypes.length - 1)];
    }
    
    /**
     * Handle player attack action
     */
    playerAttack() {
        if (!this.playerTurn || !this.isActive) return;
        
        // Validate player active card
        const playerCardValidation = this.validateCardForBattle(this.playerActiveCard);
        if (!playerCardValidation.isValid) {
            console.error('Invalid player card in playerAttack:', playerCardValidation.message);
            this.logBattleMessage('Error: Your active card is invalid. Battle will restart.');
            this.endBattle(false);
            return;
        }
        
        // Validate opponent active card
        const opponentCardValidation = this.validateCardForBattle(this.opponentActiveCard);
        if (!opponentCardValidation.isValid) {
            console.error('Invalid opponent card in playerAttack:', opponentCardValidation.message);
            this.logBattleMessage('Error: Opponent active card is invalid. Battle will restart.');
            this.endBattle(false);
            return;
        }
        
        // If cards were valid but needed fixing, log a message
        if (playerCardValidation.message !== 'Card is valid') {
            console.log('Fixed player card:', playerCardValidation.message);
        }
        if (opponentCardValidation.message !== 'Card is valid') {
            console.log('Fixed opponent card:', opponentCardValidation.message);
        }
        
        try {
            // Check if this is a double attack (the second attack in a turn)
            const isDoubleAttack = this.playerActiveCard._doubleAttackUsed;
            
            // Calculate damage based on type advantages
            const damage = this.calculateDamage(this.playerActiveCard, this.opponentActiveCard);
            
            // Add attack animation class to player card
            const playerCardElement = this.playerCardContainer.querySelector('.battle-card');
            if (playerCardElement) {
                playerCardElement.classList.add('attacking');
                setTimeout(() => {
                    playerCardElement.classList.remove('attacking');
                }, 400);
            }
            
            // Apply damage
            this.opponentActiveCard.hp = Math.max(0, this.opponentActiveCard.hp - damage);
            
            // Add damage animation class to opponent card
            const opponentCardElement = this.opponentCardContainer.querySelector('.battle-card');
            if (opponentCardElement) {
                opponentCardElement.classList.add('damaged');
                setTimeout(() => {
                    opponentCardElement.classList.remove('damaged');
                }, 500);
            }
            
            // Log attack with indication if it's a double attack
            if (isDoubleAttack) {
                this.logBattleMessage(`Your ${this.playerActiveCard.name} attacks again for ${damage} damage!`);
            } else {
                this.logBattleMessage(`Your ${this.playerActiveCard.name} attacks for ${damage} damage!`);
            }
            
            // Check if opponent card is defeated
            if (this.opponentActiveCard.hp <= 0) {
                this.logBattleMessage(`Opponent's ${this.opponentActiveCard.name} is defeated!`);
                
                // Remove opponent card from deck
                const defeatedCardIndex = this.opponentDeck.findIndex(c => c.id === this.opponentActiveCard.id);
                if (defeatedCardIndex !== -1) {
                    this.opponentDeck.splice(defeatedCardIndex, 1);
                }
                
                // Check if all opponent cards are defeated
                if (this.opponentDeck.length === 0) {
                    this.endBattle(true); // Player won
                    return;
                }
                
                // Set next opponent card
                this.opponentActiveCard = this.opponentDeck[0];
                
                // Validate the new opponent card
                const newOpponentValidation = this.validateCardForBattle(this.opponentActiveCard);
                if (!newOpponentValidation.isValid) {
                    console.error('Invalid new opponent card:', newOpponentValidation.message);
                    this.logBattleMessage('Error: Could not select next opponent card. Battle will restart.');
                    this.endBattle(false);
                    return;
                }
                
                this.logBattleMessage(`Opponent sends out ${this.opponentActiveCard.name}!`);
            }
            
            // Check if card has double attack ability and this was the first attack
            if (!isDoubleAttack && 
                this.playerActiveCard.specialAbility && 
                this.playerActiveCard.specialAbility.effect === 'double_attack') {
                
                // Mark that double attack was used
                this.playerActiveCard._doubleAttackUsed = true;
                
                // Log that double attack is being used
                this.logBattleMessage(`${this.playerActiveCard.name}'s Double Strike ability activates!`);
                
                // Update UI to show attack button still active
                this.updateBattleUI();
                
                // Keep player turn active for second attack
                return;
            }
            
            // Reset double attack flag
            if (this.playerActiveCard._doubleAttackUsed) {
                delete this.playerActiveCard._doubleAttackUsed;
            }
            
            // Toggle turn
            this.playerTurn = false;
            
            // Update UI
            this.updateBattleUI();
            
            // Start AI turn
            setTimeout(() => this.aiTurn(), 1000);
        } catch (error) {
            console.error('Error in player attack:', error);
            this.logBattleMessage('An error occurred during your attack. Battle will restart.');
            this.endBattle(false);
        }
    }
    
    /**
     * Skip the current turn
     */
    skipTurn() {
        if (!this.playerTurn || !this.isActive) return;
        
        this.logBattleMessage('You skipped your turn.');
        
        // Toggle turn
        this.playerTurn = false;
        
        // Update UI
        this.updateBattleUI();
        
        // Start AI turn
        setTimeout(() => this.aiTurn(), 1000);
    }
    
    /**
     * Switch player's active card
     * @param {number} cardIndex - Index of the card to switch to
     */
    switchCard(cardIndex) {
        if (!this.playerTurn || !this.isActive) return;
        
        // Validate index
        if (cardIndex < 0 || cardIndex >= this.playerDeck.length) {
            this.logBattleMessage('Invalid card selection.');
            return;
        }
        
        // Don't allow switching to the current active card
        if (this.playerDeck[cardIndex] === this.playerActiveCard) {
            this.logBattleMessage('That card is already active.');
            return;
        }
        
        // Store old card for message
        const oldCardName = this.playerActiveCard.name;
        
        // Switch to the new card
        this.playerActiveCard = this.playerDeck[cardIndex];
        
        // Log the switch
        this.logBattleMessage(`You switched from ${oldCardName} to ${this.playerActiveCard.name}!`, 'ability');
        
        // Count as using a turn
        this.playerTurn = false;
        
        // Update UI
        this.updateBattleUI();
        
        // Start AI turn
        setTimeout(() => this.aiTurn(), 1000);
    }
    
    /**
     * Process AI turn
     */
    aiTurn() {
        if (this.playerTurn || !this.isActive) return;
        
        // Validate player active card
        const playerCardValidation = this.validateCardForBattle(this.playerActiveCard);
        if (!playerCardValidation.isValid) {
            console.error('Invalid player card in aiTurn:', playerCardValidation.message);
            this.logBattleMessage('Error: Your active card is invalid. Battle will restart.');
            this.endBattle(false);
            return;
        }
        
        // Validate opponent active card
        const opponentCardValidation = this.validateCardForBattle(this.opponentActiveCard);
        if (!opponentCardValidation.isValid) {
            console.error('Invalid opponent card in aiTurn:', opponentCardValidation.message);
            this.logBattleMessage('Error: Opponent active card is invalid. Battle will restart.');
            this.endBattle(false);
            return;
        }
        
        // If cards were valid but needed fixing, log a message
        if (playerCardValidation.message !== 'Card is valid') {
            console.log('Fixed player card in AI turn:', playerCardValidation.message);
        }
        if (opponentCardValidation.message !== 'Card is valid') {
            console.log('Fixed opponent card in AI turn:', opponentCardValidation.message);
        }
        
        try {
            // Check if this is a double attack (the second attack in a turn)
            const isDoubleAttack = this.opponentActiveCard._doubleAttackUsed;
            
            // AI always attacks
            const damage = this.calculateDamage(this.opponentActiveCard, this.playerActiveCard);
            
            // Add attack animation class to opponent card
            const opponentCardElement = this.opponentCardContainer.querySelector('.battle-card');
            if (opponentCardElement) {
                opponentCardElement.classList.add('attacking');
                setTimeout(() => {
                    opponentCardElement.classList.remove('attacking');
                }, 400);
            }
            
            // Apply damage
            this.playerActiveCard.hp = Math.max(0, this.playerActiveCard.hp - damage);
            
            // Add damage animation class to player card
            const playerCardElement = this.playerCardContainer.querySelector('.battle-card');
            if (playerCardElement) {
                playerCardElement.classList.add('damaged');
                setTimeout(() => {
                    playerCardElement.classList.remove('damaged');
                }, 500);
            }
            
            // Log attack with indication if it's a double attack
            if (isDoubleAttack) {
                this.logBattleMessage(`Opponent's ${this.opponentActiveCard.name} attacks again for ${damage} damage!`);
            } else {
                this.logBattleMessage(`Opponent's ${this.opponentActiveCard.name} attacks for ${damage} damage!`);
            }
            
            // Check if player card is defeated
            if (this.playerActiveCard.hp <= 0) {
                this.logBattleMessage(`Your ${this.playerActiveCard.name} is defeated!`);
                
                // Remove player card from deck
                const defeatedCardIndex = this.playerDeck.findIndex(c => c.id === this.playerActiveCard.id);
                if (defeatedCardIndex !== -1) {
                    this.playerDeck.splice(defeatedCardIndex, 1);
                }
                
                // Check if all player cards are defeated
                if (this.playerDeck.length === 0) {
                    this.endBattle(false); // Player lost
                    return;
                }
                
                // Set next player card
                this.playerActiveCard = this.playerDeck[0];
                
                // Validate the new player card
                const newPlayerValidation = this.validateCardForBattle(this.playerActiveCard);
                if (!newPlayerValidation.isValid) {
                    console.error('Invalid new player card:', newPlayerValidation.message);
                    this.logBattleMessage('Error: Could not select your next card. Battle will restart.');
                    this.endBattle(false);
                    return;
                }
                
                this.logBattleMessage(`You send out ${this.playerActiveCard.name}!`);
            }
            
            // Check if card has double attack ability and this was the first attack
            if (!isDoubleAttack && 
                this.opponentActiveCard.specialAbility && 
                this.opponentActiveCard.specialAbility.effect === 'double_attack') {
                
                // Mark that double attack was used
                this.opponentActiveCard._doubleAttackUsed = true;
                
                // Log that double attack is being used
                this.logBattleMessage(`Opponent's ${this.opponentActiveCard.name}'s Double Strike ability activates!`);
                
                // Execute second attack after a short delay
                setTimeout(() => this.aiTurn(), 800);
                return;
            }
            
            // Reset double attack flag
            if (this.opponentActiveCard._doubleAttackUsed) {
                delete this.opponentActiveCard._doubleAttackUsed;
            }
            
            // Toggle turn
            this.playerTurn = true;
            
            // Move to next turn
            this.nextTurn();
        } catch (error) {
            console.error('Error in AI turn:', error);
            this.logBattleMessage('An error occurred during opponent\'s attack. Battle will restart.');
            this.endBattle(false);
        }
    }
    
    /**
     * Validate a card has all required properties for battle
     * @param {Object} card - Card to validate
     * @returns {Object} - Validation result with isValid and message properties
     */
    validateCardForBattle(card) {
        if (!card) {
            return { isValid: false, message: 'Card is undefined or null' };
        }
        
        // Check for essential properties
        if (!card.id) {
            return { isValid: false, message: 'Card is missing an ID' };
        }
        
        if (!card.name) {
            return { isValid: false, message: 'Card is missing a name' };
        }
        
        if (!card.type || !CardData.types.includes(card.type)) {
            const type = card.type || 'undefined';
            console.error(`Card has invalid type: ${type}`, card);
            
            // Attempt to fix by assigning a random valid type
            card.type = CardData.types[Utils.randomInt(0, CardData.types.length - 1)];
            console.log(`Fixed card type to: ${card.type}`);
            return { isValid: true, message: `Fixed invalid card type to ${card.type}` };
        }
        
        if (typeof card.attack !== 'number' || isNaN(card.attack)) {
            console.error('Card has invalid attack value:', card);
            // Set a default attack value if missing or invalid
            card.attack = 5;
            return { isValid: true, message: 'Fixed missing attack value to 5' };
        }
        
        if (typeof card.hp !== 'number' || isNaN(card.hp)) {
            console.error('Card has invalid HP value:', card);
            // Set a default HP value if missing or invalid
            card.hp = 30;
            card.maxHp = 30;
            return { isValid: true, message: 'Fixed missing HP value to 30' };
        }
        
        // Card has all required properties
        return { isValid: true, message: 'Card is valid' };
    }
    
    /**
     * Calculate damage based on type advantages
     * @param {Object} attackerCard - Card performing the attack
     * @param {Object} defenderCard - Card being attacked
     * @returns {number} - Calculated damage
     */
    calculateDamage(attackerCard, defenderCard) {
        // Validate attacker card
        const attackerValidation = this.validateCardForBattle(attackerCard);
        if (!attackerValidation.isValid) {
            console.error('Invalid attacker card in calculateDamage:', attackerValidation.message);
            return 1; // Return minimum damage if card is invalid
        }
        
        // Validate defender card
        const defenderValidation = this.validateCardForBattle(defenderCard);
        if (!defenderValidation.isValid) {
            console.error('Invalid defender card in calculateDamage:', defenderValidation.message);
            return 1; // Return minimum damage if card is invalid
        }
        
        let damage = attackerCard.attack;
        
        // Apply type advantage/disadvantage
        try {
            // Safely access type advantages with fallbacks
            const typeAdvantages = CardData.typeAdvantages && CardData.typeAdvantages[attackerCard.type] 
                ? CardData.typeAdvantages[attackerCard.type] 
                : [];
            
            if (attackerCard.type === 'Dragon' && defenderCard.type === 'Dragon') {
                // Dragons are weak to other dragons
                damage = Math.floor(damage * 1.5);
                this.logBattleMessage('It\'s super effective! (Dragon vs Dragon)');
            } else if (Array.isArray(typeAdvantages) && typeAdvantages.includes(defenderCard.type)) {
                // Type advantage gives 1.5x damage
                damage = Math.floor(damage * 1.5);
                this.logBattleMessage(`It's super effective! (${attackerCard.type} vs ${defenderCard.type})`);
            } else if (CardData.typeAdvantages && 
                      CardData.typeAdvantages[defenderCard.type] && 
                      Array.isArray(CardData.typeAdvantages[defenderCard.type]) &&
                      CardData.typeAdvantages[defenderCard.type].includes(attackerCard.type)) {
                // Type disadvantage gives 0.5x damage
                damage = Math.floor(damage * 0.5);
                this.logBattleMessage(`It's not very effective... (${attackerCard.type} vs ${defenderCard.type})`);
            }
        } catch (error) {
            console.error('Error calculating type advantages:', error);
            // Continue with base damage if there's an error with type advantages
        }
        
        // Apply attacker's special abilities
        try {
            if (attackerCard.specialAbility && attackerCard.specialAbility.effect === 'damage_boost') {
                damage += attackerCard.specialAbility.value;
                this.logBattleMessage(`${attackerCard.name}'s ${attackerCard.specialAbility.name} adds ${attackerCard.specialAbility.value} damage!`);
            }
        } catch (error) {
            console.error('Error applying attacker special ability:', error);
            // Continue without applying special ability if there's an error
        }
        
        // Apply defender's special abilities
        try {
            if (defenderCard.specialAbility && defenderCard.specialAbility.effect === 'damage_reduce') {
                const reduction = Math.min(damage, defenderCard.specialAbility.value);
                damage -= reduction;
                this.logBattleMessage(`${defenderCard.name}'s ${defenderCard.specialAbility.name} reduces damage by ${reduction}!`);
            }
        } catch (error) {
            console.error('Error applying defender special ability:', error);
            // Continue without applying special ability if there's an error
        }
        
        // Ensure minimum damage of 1
        return Math.max(1, damage);
    }
    
    /**
     * End the current battle
     * @param {boolean} playerWon - Whether the player won the battle
     */
    endBattle(playerWon) {
        this.isActive = false;
        this.battleResult = playerWon;
        
        if (playerWon) {
            this.logBattleMessage('You won the battle!', 'victory');
            
            // Check if tournament is complete
            if (this.currentBattle >= this.battlesRequired) {
                this.endTournament(true);
            } else {
                // Create continue and strategy buttons
                this.actionButtons.innerHTML = '';
                
                // Strategy button to heal cards or reorganize deck
                const strategyButton = document.createElement('button');
                strategyButton.textContent = 'Strategy Break';
                strategyButton.className = 'strategy-button';
                strategyButton.addEventListener('click', () => {
                    this.openStrategyMenu();
                });
                
                // Continue button
                const continueButton = document.createElement('button');
                continueButton.textContent = 'Continue to Next Battle';
                continueButton.className = 'continue-button';
                continueButton.addEventListener('click', () => {
                    // Hide strategy menu if open
                    const strategyMenu = document.getElementById('strategy-menu');
                    if (strategyMenu) {
                        strategyMenu.remove();
                    }
                    this.startNextBattle();
                });
                
                this.actionButtons.appendChild(strategyButton);
                this.actionButtons.appendChild(continueButton);
            }
        } else {
            this.logBattleMessage('You lost the battle!', 'defeat');
            this.endTournament(false);
        }
    }
    
    /**
     * Open strategy menu between battles
     */
    openStrategyMenu() {
        // Hide any existing strategy menu
        const existingMenu = document.getElementById('strategy-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create strategy menu container
        const strategyMenu = document.createElement('div');
        strategyMenu.id = 'strategy-menu';
        strategyMenu.className = 'strategy-menu';
        
        // Create options section
        const optionsSection = document.createElement('div');
        optionsSection.className = 'strategy-options';
        optionsSection.innerHTML = '<h3>Strategy Options</h3>';
        
        // Heal option - restores some HP to all player cards
        const healButton = document.createElement('button');
        healButton.textContent = 'Heal Team (20% HP Recovery)';
        healButton.addEventListener('click', () => {
            // Heal all cards by 20% of their max HP
            this.playerDeck.forEach(card => {
                const healAmount = Math.floor(card.maxHp * 0.2);
                const newHp = Math.min(card.maxHp, card.hp + healAmount);
                const actualHeal = newHp - card.hp;
                
                card.hp = newHp;
                
                if (actualHeal > 0) {
                    this.logBattleMessage(`${card.name} recovered ${actualHeal} HP!`, 'ability');
                }
            });
            
            // Close menu
            strategyMenu.remove();
            
            // Update battle log
            this.logBattleMessage('Your team has been healed and is ready for the next battle!', 'ability');
        });
        optionsSection.appendChild(healButton);
        
        // Reorganize option - lets player reorder their deck
        const reorganizeButton = document.createElement('button');
        reorganizeButton.textContent = 'Reorganize Deck Order';
        reorganizeButton.addEventListener('click', () => {
            // Hide options section and show reordering UI
            optionsSection.classList.add('hidden');
            
            // Create deck ordering section
            const reorderSection = document.createElement('div');
            reorderSection.className = 'reorder-section';
            reorderSection.innerHTML = '<h3>Drag Cards to Reorder</h3><p>The first card will be your active card in the next battle.</p>';
            
            // Create card list
            const cardList = document.createElement('div');
            cardList.className = 'reorder-card-list';
            
            // Add each card as a draggable element
            this.playerDeck.forEach((card, index) => {
                const cardElement = document.createElement('div');
                cardElement.className = `reorder-card ${card.rarity}`;
                cardElement.setAttribute('draggable', 'true');
                cardElement.dataset.index = index.toString();
                
                // Show card details
                cardElement.innerHTML = `
                    <div class="reorder-card-header">
                        <span class="reorder-card-name">${card.name}</span>
                        <span class="reorder-card-type">${card.type}</span>
                    </div>
                    <div class="reorder-card-stats">
                        <div class="reorder-card-hp">HP: ${card.hp}/${card.maxHp}</div>
                        <div class="reorder-card-attack">ATK: ${card.attack}</div>
                    </div>
                `;
                
                // Add drag functionality
                cardElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                    cardElement.classList.add('dragging');
                });
                
                cardElement.addEventListener('dragend', () => {
                    cardElement.classList.remove('dragging');
                });
                
                cardList.appendChild(cardElement);
            });
            
            // Add drag and drop functionality to the list
            cardList.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                const cards = [...cardList.querySelectorAll('.reorder-card:not(.dragging)')];
                
                const afterElement = cards.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = e.clientY - box.top - box.height / 2;
                    
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
                
                if (afterElement) {
                    cardList.insertBefore(dragging, afterElement);
                } else {
                    cardList.appendChild(dragging);
                }
            });
            
            cardList.addEventListener('drop', (e) => {
                e.preventDefault();
            });
            
            // Add confirm button
            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'Confirm New Order';
            confirmButton.addEventListener('click', () => {
                // Get new order from UI
                const newOrder = [];
                const cardElements = cardList.querySelectorAll('.reorder-card');
                
                cardElements.forEach(element => {
                    const originalIndex = parseInt(element.dataset.index);
                    newOrder.push(this.playerDeck[originalIndex]);
                });
                
                // Update deck
                this.playerDeck = newOrder;
                
                // Close menu
                strategyMenu.remove();
                
                // Update battle log
                this.logBattleMessage('Your deck has been reorganized for the next battle!', 'ability');
            });
            
            // Add cancel button
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                // Show options section again
                optionsSection.classList.remove('hidden');
                reorderSection.remove();
            });
            
            // Add buttons to reorder section
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'reorder-buttons';
            buttonContainer.appendChild(confirmButton);
            buttonContainer.appendChild(cancelButton);
            reorderSection.appendChild(cardList);
            reorderSection.appendChild(buttonContainer);
            
            // Add to menu
            strategyMenu.appendChild(reorderSection);
        });
        optionsSection.appendChild(reorganizeButton);
        
        // Skip option - just close the menu
        const skipButton = document.createElement('button');
        skipButton.textContent = 'Skip Strategy Break';
        skipButton.addEventListener('click', () => {
            strategyMenu.remove();
        });
        optionsSection.appendChild(skipButton);
        
        // Add options section to menu
        strategyMenu.appendChild(optionsSection);
        
        // Add to battle container
        this.battleContainer.appendChild(strategyMenu);
    }
    
    /**
     * End the tournament
     * @param {boolean} playerWon - Whether the player won the tournament
     */
    endTournament(playerWon) {
        // Hide battle UI
        if (this.battleContainer) {
            if (playerWon) {
                this.battleContainer.classList.add('hidden');
            } else {
                // If player lost, completely remove the battle container from the DOM
                this.battleContainer.remove();
                this.battleContainer = null;
            }
        }
        
        // Clear decks
        this.playerDeck = [];
        this.opponentDeck = [];
        
        // Process tournament results
        this.processTournamentResults(playerWon);
    }
    
    /**
     * Process tournament results, give rewards
     * @param {boolean} playerWon - Whether the player won the tournament
     */
    processTournamentResults(playerWon) {
        if (!playerWon) {
            // Player lost, no rewards
            if (this.gameManager.ui) {
                this.gameManager.ui.logMessage(`You were defeated in the tournament.`);
            }
            return;
        }
        
        // Calculate rewards based on tournament level
        let moneyReward = 0;
        let packReward = 0;
        
        switch(this.tournamentLevel) {
            case 0: // Local
                moneyReward = Utils.randomInt(15, 30);
                packReward = 1;
                break;
            case 1: // Regional
                moneyReward = Utils.randomInt(75, 150);
                packReward = 3;
                break;
            case 2: // National
                moneyReward = Utils.randomInt(150, 300);
                packReward = 5;
                break;
            default:
                moneyReward = Utils.randomInt(15, 30);
                packReward = 1;
                break;
        }
        
        // Award rewards
        this.gameManager.gameState.money += moneyReward;
        this.gameManager.gameState.packs += packReward;
        
        // Update highest tournament won if this is a new record
        if (!this.gameManager.gameState.highestTournamentWon || this.tournamentLevel > this.gameManager.gameState.highestTournamentWon) {
            this.gameManager.gameState.highestTournamentWon = this.tournamentLevel;
        }
        
        // Notify player
        if (this.gameManager.ui) {
            this.gameManager.ui.logMessage(`You won the tournament! Earned ${Utils.formatCurrency(moneyReward)} and ${packReward} card packs.`);
            this.gameManager.ui.updateUI();
        }
    }
}

// Make BattleSystem available globally
window.BattleSystem = BattleSystem;