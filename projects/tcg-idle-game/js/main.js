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
});