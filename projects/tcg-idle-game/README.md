# TCG Simulator

A minimalist ASCII-inspired idle game where you evolve from a casual Trading Card Game (TCG) collector to a successful shop owner.

## Game Overview

In this simulator, you start as a casual TCG collector opening card packs. You'll earn passive income, automate your operations, enter tournaments, trade cards, and eventually open your own card shop.

## Game Phases

1. **Collector Phase**: Open packs to build your collection
2. **Competitor Phase**: Enter tournaments to win prizes (unlocks at 30 cards)
3. **Trader Phase**: Trade cards to improve your collection (unlocks at 75 cards, $150)
4. **Shop Owner Phase**: Open and manage your own card shop (unlocks at 150 cards, $750)
5. **Influencer Phase**: Host tournaments and become a community figure (unlocks at 300 cards, $3000)

## Core Mechanics

- **Passive Income**: Earn money automatically over time
- **Pack Opening**: Open packs to get random cards with varying rarities
- **Automation**: Purchase upgrades to automate buying packs, opening them, and selling duplicates
- **Collection Management**: Build your collection and sell duplicates
- **Tournaments**: Compete in turn-based battles with your cards to win prizes
- **Shop Management**: Run your own card shop with customers and upgrades
- **Prestige System**: Reset with bonuses for long-term progression

## Tournament & Battle System

The TCG Simulator includes a strategic battle system where your cards compete against opponents:

- **Progressive Tournament Structure**: Three tournament tiers that unlock sequentially:
  - **Local Club**: Entry-level tournament with 2 battles (unlocked by default)
  - **Regional Tournament**: Mid-tier tournament with 3 battles (unlocked after winning Local)
  - **National Championship**: High-tier tournament with 4 battles (unlocked after winning Regional)

- **Type Advantages**: Fire > Nature > Water > Electric > Fire, with Dragon being strong against all (but weak to itself)

- **Strategic Gameplay Elements**:
  - **Mid-Battle Card Switching**: Switch to a different card during battle to gain type advantage
  - **Strategy Breaks**: Between battles, heal your team and reorganize your deck order
  - **Deck Building**: Select your best cards strategically for your tournament deck

- **Special Abilities**: Cards can have special abilities such as:
  - **Heal**: Recover HP each turn
  - **Damage Boost**: Increase attack damage
  - **Type Shift**: Change type to counter the opponent
  - **Shield**: Reduce incoming damage
  - **Double Strike**: Attack twice in one turn

- **Battle UI Features**:
  - **Visual Effects**: Attack and damage animations with colored battle messages
  - **Drag-and-Drop Deck Reordering**: Easily reorganize your deck between battles
  - **Colored Battle Log**: Different colors for super effective attacks, abilities, and critical events

## How to Play

1. You automatically earn money over time
2. Use your money to buy card packs
3. Open packs to collect cards of different rarities
4. Purchase upgrades to automate your operations:
   - Auto Opener: Automatically opens packs
   - Auto Buyer: Automatically buys packs when you can afford them
   - Auto Seller: Automatically sells duplicate cards
   - Better Packs: Improves the odds of finding rare cards
   - Income Boost: Increases your passive income rate
5. Enter tournaments when you have enough cards
   - Select your best cards for your battle deck
   - Use type advantages and special abilities to win
   - Switch cards during battle for strategic advantage
   - Use strategy breaks between battles to heal and reorganize
6. Win tournaments to unlock higher tournament tiers
7. Open your shop when you reach the required collection size and money
8. Prestige when you've accumulated enough wealth and cards

## Keyboard Shortcuts

- `B`: Buy a pack
- `O`: Open a pack
- In battle:
  - Use mouse to click Attack, Switch Card, or Skip Turn buttons

## Tournament Tips

- **Card Selection**: Choose cards with complementary types to cover each other's weaknesses
- **Card Order**: Your first card is your starting card in battle; arrange them strategically
- **Type Advantage**: Prioritize switching to cards that have type advantage against your opponent
- **Healing Strategy**: Use the strategy break between battles to heal your cards (20% HP recovery)
- **Card Preservation**: Switch out low-health cards to preserve your stronger cards for later battles

## Developer Options

Press Shift+D+E+V or click in the invisible area at the bottom-right corner to access developer options:

- **Game Speed**: Adjust the speed multiplier (1x to 10x)
- **Collection Boost**: Add 100 random cards or $10,000 instantly
- **Save Management**: Delete your save file and start over

## Recent Improvements

- **Enhanced Battle System**: Robust error handling and card validation to prevent game-breaking issues
- **Progressive Tournament Structure**: Tournaments now unlock sequentially as you win lower tiers
- **Mid-Battle Strategy**: Switch cards during battle for strategic advantage
- **Between-Battle Strategy**: Heal your team and reorganize your deck order between battles
- **Battle Animations**: Visual feedback for attacks, damage, and special abilities
- **Type Shift & Double Strike Abilities**: New abilities that add strategic depth
- **Drag-and-Drop Deck Management**: Easily reorder your deck between battles
- **Improved Tournament UI**: Better visual feedback and clearer tournament progression
- **Tournament Cleanup**: Battle UI properly closes after losing a tournament

## Technical Details

The game is built with pure HTML, CSS, and JavaScript. It uses local storage to save your progress automatically. The battle system includes comprehensive validation and error handling to ensure a smooth experience even if card data becomes corrupted.

Enjoy the game and happy collecting!