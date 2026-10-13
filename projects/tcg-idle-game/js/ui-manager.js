/**
 * UI Manager
 * Handles all UI updates and interactions
 */

class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.initElements();
        this.initEventListeners();
        this.updateUI();
    }
    
    /**
     * Initialize DOM element references
     */
    initElements() {
        // Resource displays
        this.moneyDisplay = document.getElementById('money-value');
        this.incomeDisplay = document.getElementById('income-value');
        this.packsDisplay = document.getElementById('packs-value');
        
        // Action buttons
        this.buyPackButton = document.getElementById('buy-pack');
        this.openPackButton = document.getElementById('open-pack');
        
        // Tournament elements
        this.tournamentsContainer = document.getElementById('tournaments');
        this.tournamentList = document.getElementById('tournament-list');
        
        // Shop elements
        this.shopContainer = document.getElementById('shop');
        this.toggleShopButton = document.getElementById('toggle-shop');
        this.shopStatusContainer = document.getElementById('shop-status');
        this.shopStatusDisplay = document.getElementById('shop-status-value');
        this.shopReputationDisplay = document.getElementById('shop-reputation');
        this.shopCustomersDisplay = document.getElementById('shop-customers');
        this.customerRateDisplay = document.getElementById('customer-rate');
        this.shopUpgradesContainer = document.getElementById('shop-upgrades');
        this.recentSalesContainer = document.getElementById('recent-sales');
        this.salesListContainer = document.getElementById('sales-list');
        
        // Shop upgrade buttons
        this.upgradeAdvertisingButton = document.getElementById('upgrade-advertising');
        this.upgradeDisplaysButton = document.getElementById('upgrade-displays');
        this.upgradeLocationButton = document.getElementById('upgrade-location');
        
        // Upgrade buttons
        this.upgradesContainer = document.getElementById('upgrades');
        this.autoOpenerButton = document.getElementById('auto-opener');
        this.autoBuyerButton = document.getElementById('auto-buyer');
        this.autoSellerButton = document.getElementById('auto-seller');
        this.betterPacksButton = document.getElementById('better-packs');
        this.incomeBoostButton = document.getElementById('income-boost');
        
        // Collection display
        this.collectionContainer = document.getElementById('collection-content');
        
        // Game log
        this.gameLog = document.getElementById('game-log');
        
        // Game status displays
        this.phaseDisplay = document.getElementById('phase-value');
        this.autoStatusContainer = document.getElementById('auto-status');
        this.autoStatusDisplay = document.getElementById('auto-status-value');
    }
    
    /**
     * Initialize event listeners for buttons and interactions
     */
    initEventListeners() {
        // Buy pack button
        this.buyPackButton.addEventListener('click', () => {
            const success = this.gameManager.buyPack();
            if (success) {
                this.logMessage('You bought a card pack for $5.00');
                this.updateUI();
            } else {
                this.logMessage('Not enough money to buy a pack!');
            }
        });
        
        // Open pack button
        this.openPackButton.addEventListener('click', () => {
            const cards = this.gameManager.openPack();
            if (cards) {
                this.displayOpenedPack(cards);
                this.updateUI();
            } else {
                this.logMessage('No packs to open!');
            }
        });
        
        // Auto opener upgrade button
        this.autoOpenerButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseUpgrade('autoOpener');
            if (success) {
                this.logMessage('Purchased Auto Opener upgrade for $30.00');
                this.gameManager.startAutoOpener();
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        // Auto buyer upgrade button
        this.autoBuyerButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseUpgrade('autoBuyer');
            if (success) {
                this.logMessage('Purchased Auto Buyer upgrade for $50.00');
                this.gameManager.startAutoBuyer();
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        // Auto seller upgrade button
        this.autoSellerButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseUpgrade('autoSeller');
            if (success) {
                this.logMessage('Purchased Auto Seller upgrade for $75.00');
                this.gameManager.startAutoSeller();
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        // Better packs upgrade button
        this.betterPacksButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseUpgrade('betterPacks');
            if (success) {
                this.logMessage('Purchased Better Packs upgrade for $100.00');
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        // Income boost upgrade button
        this.incomeBoostButton.addEventListener('click', () => {
            const level = this.gameManager.gameState.upgrades.incomeBoost.level;
            const cost = 25 * Math.pow(2, level);
            const success = this.gameManager.purchaseUpgrade('incomeBoost');
            if (success) {
                const newLevel = this.gameManager.gameState.upgrades.incomeBoost.level;
                const multiplier = this.gameManager.gameState.upgrades.incomeBoost.multiplier;
                this.logMessage(`Upgraded Income Boost to level ${newLevel} (${multiplier.toFixed(2)}x) for ${Utils.formatCurrency(cost)}`);
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        // Toggle shop button
        this.toggleShopButton.addEventListener('click', () => {
            const isOpen = this.gameManager.toggleShop();
            if (isOpen) {
                this.logMessage('You opened your card shop!');
                this.toggleShopButton.textContent = 'Close Shop';
                this.shopStatusDisplay.textContent = 'Open';
                this.shopStatusContainer.classList.remove('hidden');
                this.shopUpgradesContainer.classList.remove('hidden');
                this.recentSalesContainer.classList.remove('hidden');
                
                // Set up shop update interval
                this.shopUpdateInterval = setInterval(() => {
                    this.updateShopUI();
                }, 5000); // Update every 5 seconds
            } else {
                this.logMessage('You closed your card shop.');
                this.toggleShopButton.textContent = 'Open Shop';
                this.shopStatusDisplay.textContent = 'Closed';
                
                // Clear shop update interval
                if (this.shopUpdateInterval) {
                    clearInterval(this.shopUpdateInterval);
                    this.shopUpdateInterval = null;
                }
            }
            this.updateShopUI();
        });
        
        // Shop upgrade buttons
        this.upgradeAdvertisingButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseShopUpgrade('advertising');
            if (success) {
                const shopStats = this.gameManager.getShopStats();
                const level = shopStats.upgrades.advertising.level;
                this.logMessage(`Upgraded advertising to level ${level}`);
                this.updateShopUI();
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        this.upgradeDisplaysButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseShopUpgrade('displays');
            if (success) {
                const shopStats = this.gameManager.getShopStats();
                const level = shopStats.upgrades.displays.level;
                this.logMessage(`Upgraded display cases to level ${level}`);
                this.updateShopUI();
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
        
        this.upgradeLocationButton.addEventListener('click', () => {
            const success = this.gameManager.purchaseShopUpgrade('location');
            if (success) {
                const shopStats = this.gameManager.getShopStats();
                const level = shopStats.upgrades.location.level;
                this.logMessage(`Upgraded shop location to level ${level}`);
                this.updateShopUI();
                this.updateUI();
            } else {
                this.logMessage('Not enough money for this upgrade!');
            }
        });
    }
    
    /**
     * Update all UI elements based on current game state
     */
    updateUI() {
        const gameState = this.gameManager.gameState;
        
        // Update resource displays
        this.moneyDisplay.textContent = gameState.money.toFixed(2);
        
        // Calculate and update income rate display
        const baseRate = gameState.incomeRate;
        const multiplier = gameState.upgrades.incomeBoost && gameState.upgrades.incomeBoost.purchased ? 
            gameState.upgrades.incomeBoost.multiplier : 1;
        const phaseBonus = gameState.phases[gameState.phase].index * 0.05 + 1;
        const totalRate = baseRate * multiplier * phaseBonus;
        this.incomeDisplay.textContent = totalRate.toFixed(2);
        
        this.packsDisplay.textContent = gameState.packs;
        
        // Update phase display
        this.phaseDisplay.textContent = gameState.phase;
        
        // Update button states
        this.openPackButton.disabled = gameState.packs <= 0;
        
        // Show/hide upgrades based on collection size
        if (gameState.collection.length >= 10 && this.upgradesContainer.classList.contains('hidden')) {
            this.upgradesContainer.classList.remove('hidden');
        }
        
        // Show/hide tournaments based on phase
        if (gameState.phase === 'Competitor' || gameState.collection.length >= 20) {
            if (this.tournamentsContainer.classList.contains('hidden')) {
                this.tournamentsContainer.classList.remove('hidden');
                this.updateTournamentList();
            }
        }
        
        // Show/hide shop based on phase
        if (gameState.phase === 'Shop Owner' || gameState.collection.length >= 100) {
            if (this.shopContainer.classList.contains('hidden')) {
                this.shopContainer.classList.remove('hidden');
                this.updateShopUI();
            }
        }
        
        // Update upgrade buttons
        if (gameState.upgrades.autoOpener.purchased) {
            this.autoOpenerButton.disabled = true;
            this.autoOpenerButton.textContent = 'Auto Opener (Purchased)';
            this.autoStatusContainer.classList.remove('hidden');
            this.autoStatusDisplay.textContent = 'Active';
        }
        
        if (gameState.upgrades.autoBuyer.purchased) {
            this.autoBuyerButton.disabled = true;
            this.autoBuyerButton.textContent = 'Auto Buyer (Purchased)';
        }
        
        if (gameState.upgrades.autoSeller.purchased) {
            this.autoSellerButton.disabled = true;
            this.autoSellerButton.textContent = 'Auto Seller (Purchased)';
        }
        
        if (gameState.upgrades.betterPacks.purchased) {
            this.betterPacksButton.disabled = true;
            this.betterPacksButton.textContent = 'Better Packs (Purchased)';
        }
        
        // Update income boost button (can be purchased multiple times)
        if (gameState.upgrades.incomeBoost && gameState.upgrades.incomeBoost.purchased) {
            const level = gameState.upgrades.incomeBoost.level;
            const cost = 25 * Math.pow(2, level);
            const multiplier = gameState.upgrades.incomeBoost.multiplier;
            this.incomeBoostButton.textContent = `Income Boost Lvl ${level} (${Utils.formatCurrency(cost)})`;
        }
        
        // Update collection display
        this.updateCollectionDisplay();
    }
    
    /**
     * Update the shop UI elements
     */
    updateShopUI() {
        const shopStats = this.gameManager.getShopStats();
        
        // Update shop status displays
        this.shopReputationDisplay.textContent = shopStats.reputation;
        this.shopCustomersDisplay.textContent = shopStats.totalCustomers;
        this.customerRateDisplay.textContent = shopStats.customerRate.toFixed(1);
        
        // Update shop upgrade buttons
        this.updateShopUpgradeButtons(shopStats.upgrades);
        
        // Update recent sales list
        this.updateRecentSalesList(shopStats);
        
        // If a customer has made a purchase, notify the player
        if (this.lastCustomerCount && shopStats.totalSales > this.lastSalesCount) {
            const newSales = shopStats.totalSales - this.lastSalesCount;
            if (newSales > 0) {
                this.logMessage(`${newSales} new customer(s) made purchases!`);
            }
        }
        
        // Store current counts for comparison next time
        this.lastCustomerCount = shopStats.totalCustomers;
        this.lastSalesCount = shopStats.totalSales;
    }
    
    /**
     * Update the shop upgrade buttons
     * @param {Object} upgrades - Shop upgrades object
     */
    updateShopUpgradeButtons(upgrades) {
        // Update advertising upgrade button
        const adCost = upgrades.advertising.cost * Math.pow(2, upgrades.advertising.level);
        this.upgradeAdvertisingButton.textContent = `Advertising (${Utils.formatCurrency(adCost)}) - Level ${upgrades.advertising.level}`;
        
        // Update displays upgrade button
        const displayCost = upgrades.displays.cost * Math.pow(2, upgrades.displays.level);
        this.upgradeDisplaysButton.textContent = `Display Cases (${Utils.formatCurrency(displayCost)}) - Level ${upgrades.displays.level}`;
        
        // Update location upgrade button
        const locationCost = upgrades.location.cost * Math.pow(2, upgrades.location.level);
        this.upgradeLocationButton.textContent = `Better Location (${Utils.formatCurrency(locationCost)}) - Level ${upgrades.location.level}`;
    }
    
    /**
     * Update the recent sales list
     * @param {Object} shopStats - Shop statistics
     */
    updateRecentSalesList(shopStats) {
        // Clear the sales list
        this.salesListContainer.innerHTML = '';
        
        // Get the 5 most recent sales
        const recentSales = shopStats.salesHistory ? 
            shopStats.salesHistory.slice(-5).reverse() : [];
        
        if (recentSales.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No sales yet. Open your shop to attract customers!';
            this.salesListContainer.appendChild(message);
            return;
        }
        
        // Add each sale to the list
        for (const sale of recentSales) {
            const saleElement = document.createElement('div');
            saleElement.className = 'sale';
            
            saleElement.innerHTML = `
                <div class="sale-info">
                    <span>${sale.customerName}</span>
                    <span>${Utils.formatCurrency(sale.price)}</span>
                </div>
                <div>Card: ${sale.cardName}</div>
                <div>Profit: ${Utils.formatCurrency(sale.profit)}</div>
            `;
            
            this.salesListContainer.appendChild(saleElement);
        }
    }
    
    /**
     * Update the tournament list display
     */
    updateTournamentList() {
        // Clear the tournament list
        this.tournamentList.innerHTML = '';
        
        // Get available tournaments
        const tournaments = this.gameManager.tournamentSystem.getAvailableTournaments();
        
        if (tournaments.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No tournaments available yet. Collect more cards!';
            this.tournamentList.appendChild(message);
            return;
        }
        
        // Add each tournament to the list
        tournaments.forEach((tournament, index) => {
            const tournamentElement = document.createElement('div');
            tournamentElement.className = 'tournament';
            
            tournamentElement.innerHTML = `
                <div class="tournament-info">
                    <span>${tournament.name}</span>
                    <span>Entry: ${Utils.formatCurrency(tournament.entry)}</span>
                </div>
                <div>Min Cards: ${tournament.minCards} | Reward: ${Utils.formatCurrency(tournament.reward.min)} - ${Utils.formatCurrency(tournament.reward.max)}</div>
                <button class="enter-tournament" data-index="${index}">Enter Tournament</button>
            `;
            
            // Add enter tournament event listener
            tournamentElement.querySelector('.enter-tournament').addEventListener('click', () => {
                const result = this.gameManager.enterTournament(index);
                if (result.success) {
                    // Display tournament result
                    const resultArt = this.gameManager.tournamentSystem.generateTournamentResultArt(result);
                    this.logMessage(resultArt);
                    this.logMessage(result.message);
                    this.updateUI();
                } else {
                    this.logMessage(result.message);
                }
            });
            
            this.tournamentList.appendChild(tournamentElement);
        });
    }
    
    /**
     * Update the collection display
     */
    updateCollectionDisplay() {
        const gameState = this.gameManager.gameState;
        const stats = gameState.getCollectionStats();
        
        // Clear the collection container
        this.collectionContainer.innerHTML = '';
        
        // Add stats at the top
        const statsElement = document.createElement('div');
        statsElement.innerHTML = `
            <p>Total Cards: ${stats.total} | Total Value: ${Utils.formatCurrency(stats.totalValue)}</p>
            <p>
                Common: ${stats.byRarity.common || 0} | 
                Uncommon: ${stats.byRarity.uncommon || 0} | 
                Rare: ${stats.byRarity.rare || 0} | 
                Ultra-Rare: ${stats.byRarity.ultraRare || 0} | 
                Legendary: ${stats.byRarity.legendary || 0}
            </p>
        `;
        this.collectionContainer.appendChild(statsElement);
        
        // If there are too many cards, just show the summary
        if (gameState.collection.length > 20) {
            const messageElement = document.createElement('p');
            messageElement.textContent = 'You have many cards in your collection. Here are your most valuable:';
            this.collectionContainer.appendChild(messageElement);
            
            // Sort cards by value (descending) and take the top 10
            const sortedCards = [...gameState.collection].sort((a, b) => b.value - a.value).slice(0, 10);
            
            // Add each of the most valuable cards
            for (const card of sortedCards) {
                this.addCardToDisplay(card);
            }
        } else {
            // Show all cards if there are fewer than 20
            for (const card of gameState.collection) {
                this.addCardToDisplay(card);
            }
        }
    }
    
    /**
     * Add a single card to the collection display
     * @param {Object} card - Card object to display
     */
    addCardToDisplay(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.rarity}`;
        
        cardElement.innerHTML = `
            <div class="card-info">
                <span>${card.name} (${card.type})</span>
                <span>${Utils.formatCurrency(card.value)}</span>
            </div>
            <div>Rarity: ${card.rarity}</div>
            <button class="sell-card" data-id="${card.id}">Sell</button>
        `;
        
        // Add sell button event listener
        cardElement.querySelector('.sell-card').addEventListener('click', () => {
            const value = this.gameManager.sellCard(card.id);
            if (value !== null) {
                this.logMessage(`Sold ${card.name} for ${Utils.formatCurrency(value)}`);
                this.updateUI();
            }
        });
        
        this.collectionContainer.appendChild(cardElement);
    }
    
    /**
     * Display a newly opened pack of cards
     * @param {Array} cards - Array of card objects from the opened pack
     */
    displayOpenedPack(cards) {
        this.logMessage('You opened a pack and found:');
        
        // Create ASCII art pack opening animation
        const packArt = `
        .-------.
        |       |
        | CARDS |
        |       |
        '-------'
        `;
        this.logMessage(packArt);
        
        // Display each card from the pack
        for (const card of cards) {
            const cardMessage = `${card.name} (${card.rarity}) - ${Utils.formatCurrency(card.value)}`;
            this.logMessage(cardMessage);
        }
    }
    
    /**
     * Add a message to the game log
     * @param {string} message - Message to log
     */
    logMessage(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        // Add to log and scroll to bottom
        this.gameLog.appendChild(logEntry);
        this.gameLog.scrollTop = this.gameLog.scrollHeight;
    }
}

// Make UIManager available globally
window.UIManager = UIManager;