/**
 * Shop system for the TCG Idle Game
 * Allows players to run their own card shop
 */

class ShopSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Shop stats
        this.isOpen = false;
        this.reputation = 0;
        this.customers = 0;
        this.customerRate = 1; // Customers per minute
        this.customerInterval = null;
        this.salesHistory = [];
        
        // Shop upgrades
        this.upgrades = {
            advertising: { level: 0, cost: 100, effect: 0.5, description: "Increase customer rate" },
            displays: { level: 0, cost: 150, effect: 0.1, description: "Improve chance of sales" },
            location: { level: 0, cost: 500, effect: 0.2, description: "Better location, more premium customers" }
        };
    }
    
    /**
     * Open the card shop
     * @returns {boolean} - Whether the shop was successfully opened
     */
    openShop() {
        if (this.isOpen) {
            return false;
        }
        
        // Check if player meets requirements
        if (this.gameManager.gameState.phase !== 'Shop Owner' && 
            this.gameManager.gameState.collection.length < 100) {
            return false;
        }
        
        this.isOpen = true;
        this.startCustomerFlow();
        return true;
    }
    
    /**
     * Close the card shop
     */
    closeShop() {
        if (!this.isOpen) {
            return;
        }
        
        this.isOpen = false;
        if (this.customerInterval) {
            clearInterval(this.customerInterval);
            this.customerInterval = null;
        }
    }
    
    /**
     * Start the flow of customers to the shop
     */
    startCustomerFlow() {
        if (this.customerInterval) {
            clearInterval(this.customerInterval);
        }
        
        // Calculate interval based on customer rate
        const interval = Math.floor(60000 / this.customerRate);
        
        this.customerInterval = setInterval(() => {
            if (this.isOpen) {
                this.generateCustomer();
            }
        }, interval);
    }
    
    /**
     * Generate a customer with random interests
     */
    generateCustomer() {
        // Create a customer
        const customer = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: this.generateCustomerName(),
            interests: this.generateCustomerInterests(),
            budget: Utils.randomInt(5, 200),
            isPremium: Math.random() < 0.1 + (this.upgrades.location.level * this.upgrades.location.effect)
        };
        
        // If premium customer, increase budget
        if (customer.isPremium) {
            customer.budget *= 3;
        }
        
        this.customers++;
        
        // Process customer purchase attempt
        const sale = this.processPurchaseAttempt(customer);
        
        // Return the customer and sale result
        return { customer, sale };
    }
    
    /**
     * Generate a random customer name
     * @returns {string} - Generated name
     */
    generateCustomerName() {
        const firstNames = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Skyler', 'Dakota'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Miller', 'Davis', 'Garcia', 'Wilson', 'Lee'];
        
        const firstName = firstNames[Utils.randomInt(0, firstNames.length - 1)];
        const lastName = lastNames[Utils.randomInt(0, lastNames.length - 1)];
        
        return `${firstName} ${lastName}`;
    }
    
    /**
     * Generate random card interests for a customer
     * @returns {Object} - Customer interests
     */
    generateCustomerInterests() {
        // Select random rarities and types the customer is interested in
        const rarities = [];
        const types = [];
        
        // Add at least one rarity and one type
        rarities.push(CardData.rarities[Utils.randomInt(0, CardData.rarities.length - 1)].name);
        types.push(CardData.types[Utils.randomInt(0, CardData.types.length - 1)]);
        
        // Possibly add more interests
        if (Math.random() < 0.3) {
            const additionalRarity = CardData.rarities[Utils.randomInt(0, CardData.rarities.length - 1)].name;
            if (!rarities.includes(additionalRarity)) {
                rarities.push(additionalRarity);
            }
        }
        
        if (Math.random() < 0.3) {
            const additionalType = CardData.types[Utils.randomInt(0, CardData.types.length - 1)];
            if (!types.includes(additionalType)) {
                types.push(additionalType);
            }
        }
        
        return { rarities, types };
    }
    
    /**
     * Process a purchase attempt by a customer
     * @param {Object} customer - Customer object
     * @returns {Object|null} - Sale information or null if no purchase
     */
    processPurchaseAttempt(customer) {
        // Find cards that match customer interests
        const matchingCards = this.gameManager.gameState.collection.filter(card => {
            const rarityMatch = customer.interests.rarities.includes(card.rarity);
            const typeMatch = customer.interests.types.includes(card.type);
            return rarityMatch || typeMatch;
        });
        
        if (matchingCards.length === 0) {
            return null; // No matching cards
        }
        
        // Sort by value (customers prefer lower value cards that match their interests)
        matchingCards.sort((a, b) => a.value - b.value);
        
        // Find cards the customer can afford
        const affordableCards = matchingCards.filter(card => {
            // Apply a markup for shop sales (50-100% markup)
            const markup = 1.5 + (Math.random() * 0.5);
            const price = card.value * markup;
            return price <= customer.budget;
        });
        
        if (affordableCards.length === 0) {
            return null; // No affordable cards
        }
        
        // Calculate purchase probability
        const baseChance = 0.4; // 40% base chance
        const displayBonus = this.upgrades.displays.level * this.upgrades.displays.effect;
        let purchaseChance = baseChance + displayBonus;
        
        // Increase chance if it's a perfect match
        const perfectMatch = affordableCards.some(card => {
            return customer.interests.rarities.includes(card.rarity) && 
                   customer.interests.types.includes(card.type);
        });
        
        if (perfectMatch) {
            purchaseChance += 0.2;
        }
        
        // Check if purchase happens
        if (Math.random() < purchaseChance) {
            // Select a random card from affordable matches
            const selectedCardIndex = Utils.randomInt(0, affordableCards.length - 1);
            const selectedCard = affordableCards[selectedCardIndex];
            
            // Apply markup for shop price
            const markup = 1.5 + (Math.random() * 0.5);
            const price = selectedCard.value * markup;
            
            // Process the sale
            const saleResult = this.sellCard(selectedCard.id, price);
            
            if (saleResult) {
                // Add to sales history
                this.salesHistory.push({
                    customerName: customer.name,
                    cardName: selectedCard.name,
                    price: price,
                    profit: price - selectedCard.value,
                    timestamp: Date.now()
                });
                
                // Increase reputation
                this.reputation += Utils.randomInt(1, 3);
                
                return {
                    card: selectedCard,
                    price: price,
                    profit: price - selectedCard.value
                };
            }
        }
        
        return null;
    }
    
    /**
     * Sell a card from the collection to a customer
     * @param {string} cardId - ID of the card to sell
     * @param {number} price - Price to sell the card for
     * @returns {boolean} - Whether the sale was successful
     */
    sellCard(cardId, price) {
        const value = this.gameManager.sellCard(cardId);
        if (value !== null) {
            // Add the markup profit
            this.gameManager.gameState.money += price - value;
            return true;
        }
        return false;
    }
    
    /**
     * Purchase a shop upgrade
     * @param {string} upgradeName - Name of the upgrade to purchase
     * @returns {boolean} - Whether the purchase was successful
     */
    purchaseUpgrade(upgradeName) {
        const upgrade = this.upgrades[upgradeName];
        if (!upgrade) {
            return false;
        }
        
        const cost = upgrade.cost * Math.pow(2, upgrade.level);
        
        if (this.gameManager.gameState.money >= cost) {
            this.gameManager.gameState.money -= cost;
            upgrade.level++;
            
            // If it's an advertising upgrade, update customer rate
            if (upgradeName === 'advertising') {
                this.customerRate = 1 + (upgrade.level * upgrade.effect);
                this.startCustomerFlow(); // Restart with new rate
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get shop statistics
     * @returns {Object} - Shop statistics
     */
    getShopStats() {
        // Calculate total profit
        const totalProfit = this.salesHistory.reduce((sum, sale) => sum + sale.profit, 0);
        
        // Calculate sales in the last hour
        const oneHourAgo = Date.now() - 3600000;
        const recentSales = this.salesHistory.filter(sale => sale.timestamp > oneHourAgo);
        const recentProfit = recentSales.reduce((sum, sale) => sum + sale.profit, 0);
        
        return {
            isOpen: this.isOpen,
            reputation: this.reputation,
            totalCustomers: this.customers,
            customerRate: this.customerRate,
            totalSales: this.salesHistory.length,
            totalProfit: totalProfit,
            recentSales: recentSales.length,
            recentProfit: recentProfit,
            upgrades: this.upgrades,
            salesHistory: this.salesHistory
        };
    }
    
    /**
     * Generate ASCII art for the shop
     * @returns {string} - ASCII art representation
     */
    generateShopArt() {
        return `
         .-------------------------------.
         |    YOUR CARD SHOP             |
         |                               |
         | Reputation: ${this.reputation.toString().padEnd(15)} |
         | Customers: ${this.customers.toString().padEnd(16)} |
         | Customer Rate: ${this.customerRate.toFixed(1)}/min       |
         | Sales: ${this.salesHistory.length.toString().padEnd(20)} |
         '-------------------------------'
        `;
    }
}

// Make ShopSystem available globally
window.ShopSystem = ShopSystem;