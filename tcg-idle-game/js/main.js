/**
 * Main entry point for the TCG Idle Game
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Display an ASCII art title
    const titleArt = `
    ████████╗ ██████╗ ███████╗    ██╗██████╗ ██╗     ███████╗
    ╚══██╔══╝██╔════╝ ██╔════╝    ██║██╔══██╗██║     ██╔════╝
       ██║   ██║      ██████╗     ██║██║  ██║██║     █████╗  
       ██║   ██║      ██╔═══╝     ██║██║  ██║██║     ██╔══╝  
       ██║   ╚██████╗ ██║         ██║██████╔╝███████╗███████╗
       ╚═╝    ╚═════╝ ╚═╝         ╚═╝╚═════╝ ╚══════╝╚══════╝
                                                              
      ██████╗  █████╗ ███╗   ███╗███████╗                    
     ██╔════╝ ██╔══██╗████╗ ████║██╔════╝                    
     ██║  ███╗███████║██╔████╔██║█████╗                      
     ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝                      
     ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗                    
      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝                    
    `;
    
    console.log(titleArt);
    
    // Initialize game manager
    const gameManager = new GameManager();
    
    // Initialize UI manager with reference to game manager
    const uiManager = new UIManager(gameManager);
    
    // Give game manager reference to UI manager
    gameManager.setUI(uiManager);
    
    // Initialize developer menu
    const devMenu = new DevMenu(gameManager);
    
    // Display welcome message
    uiManager.logMessage('Welcome to Trading Card Collector Simulator!');
    uiManager.logMessage('Start by buying and opening card packs.');
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Press 'b' to buy a pack
        if (event.key === 'b') {
            document.getElementById('buy-pack').click();
        }
        
        // Press 'o' to open a pack
        if (event.key === 'o') {
            document.getElementById('open-pack').click();
        }
    });
    
    // Add prestige button when player reaches certain milestones
    const checkForPrestige = () => {
        const stats = gameManager.gameState.getCollectionStats();
        
        // When the player has at least 500 cards or $10,000, show prestige option
        if ((stats.total >= 500 || stats.totalValue >= 10000) && !document.getElementById('prestige-button')) {
            const prestigeBtn = document.createElement('button');
            prestigeBtn.id = 'prestige-button';
            prestigeBtn.className = 'upgrade';
            prestigeBtn.textContent = 'Prestige: Reset with Bonuses';
            
            prestigeBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to prestige? You will lose your collection but gain bonuses for your next run.')) {
                    gameManager.resetGame({
                        startingMoney: Math.floor(stats.totalValue * 0.1)
                    });
                    uiManager.logMessage(`Prestiged! Started new game with ${Utils.formatCurrency(gameManager.gameState.money)}`);
                }
            });
            
            document.getElementById('upgrades').appendChild(prestigeBtn);
        }
    };
    
    // Check for prestige eligibility every minute
    setInterval(checkForPrestige, 60000);
});