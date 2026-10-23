# TCG Idle Game: Story and Design Notes

Working design document for the story expansion. Nothing here is built yet.
Sections marked **Open** still need a decision.

## Vision

The journey of a card collector, from buying single packs at a vending
machine to the top of the hobby. The feel is close to Candy Box: a near-empty
screen at the start, plain text and ASCII art, and new places and mechanics
that appear one at a time as the player earns them.

- Text and ASCII only. Each location has its own ASCII scene.
- The interface starts with almost nothing and grows: a new location, panel,
  or verb should feel like a discovery.
- Each act changes what the player does, not just the size of the numbers.
  Earlier mechanics either get automated or gain a new purpose, so the early
  game never becomes redundant.
- A full playthrough takes several hours, much of it idle.
- Being kind in the hobby is a core rule. Being a scalper ends the game.

## Acts

| Act | Location | New verbs | Unlocked by |
|---|---|---|---|
| 1 | Vending machine | Buy one pack, open it, sell duplicates to a classmate | Start |
| 2 | Hobby store | Choose a set, binder, first trades, Friday locals | **Open** (e.g. 30 cards, or the kid mentions the store) |
| 3 | Online store and deck building | Preorders, shipping, building real decks, regionals | **Open** |
| 4 | Card shows | Rent a table, haggle, hunt specific cards, nationals | **Open** |
| 5 | Your own shop | Stock shelves, host tournaments, refill the vending machine | **Open** |

Act 5 closes the loop: the player ends up stocking the vending machine from
Act 1, and the kid from the vending machine line comes back as a teenager
entering the player's tournaments.

### Starting money

A weekly allowance that ticks up slowly, plus selling duplicates to a
classmate for a few coins. The first packs should feel earned.

## Locations and ASCII scenes

Every location has its own scene that replaces the main view while the player
is there. A first sketch of the vending machine:

```
 .-----------------------.
 |  CARD-O-MATIC   (o)   |
 |-----------------------|
 | [##] [##] [##] [**]   |
 |  A1   A2   A3   A4    |
 | [##] [##] [  ] [##]   |
 |  B1   B2   B3   B4    |
 |-----------------------|
 |  INSERT COINS  [ $ ]  |
 |  .-----------------.  |
 |  |   PUSH  [   ]   |  |
 |  '-----------------'  |
 '-----------------------'
```

- `[##]` is a normal pack, `[**]` a special pack, and `[  ]` an empty slot
  that waits for the next restock.
- Other scenes to draw: hobby store counter, the player's doorstep (packages
  arriving), the tournament table, a card show floor, and the player's own shop.

## Cards

- **Common cards are randomly generated** (as they are now), so packs keep
  their surprise and duplicates keep flowing.
- **Powerful cards come from a fixed, named list.** Each one has a name, a
  short flavour line, and a known source. These drive set completion, trades,
  chase cards, and the endings.
- Sets release over time (Set 1, Set 2, ...). A new set is what makes
  preorders matter.
- The binder shows completion for the fixed cards in each set
  (e.g. "Set 1: 41/60").
- **Open:** how many fixed cards per set, and how many sets in a full game.

## Where packs come from

No source should be strictly better than the others. Each has something only
it offers.

| Source | Price | Speed | Only here | Drawback |
|---|---|---|---|---|
| Vending machine | Cheapest single pack | Instant | Special packs, vending-only promo cards, kindness events | Limited stock until restock; strike risk |
| Hobby store | Markup | Instant | Choose the set, tournaments, owner holds new sets for regulars | Costs more |
| Online store | Cheapest in bulk | Arrives at a set clock time | Booster boxes with a guaranteed hit, preorders | Waiting, minimum order |
| Tournaments | Entry fee | After winning | Prize-only promo cards, prize money, prize packs | Must win |
| Card shows | Market price | Instant | The exact card you want | Haggling, fakes, expensive |

The main reason to use every source is that some fixed cards can only be
found in one of them.

Automation follows the theme. Buying automatically at the vending machine
would be scalping, so it is never allowed. Automation unlocks online instead,
as subscriptions and auto-preorders.

## Clock time instead of timers

Timed events are based on the real clock, not on countdowns that only run
while the page is open:

- An online order shows an arrival time ("Arrives 3:40 PM"). If the player is
  away when it arrives, the package is waiting on the doorstep when they return.
- The vending machine restocks at fixed clock times (e.g. on the hour).
- Card shows and Friday locals run on a schedule of real clock times.
- New set releases have a release time, and preorders arrive then.
- Everything is stored as timestamps in the save, so closing the page never
  loses progress.
- **Open:** how often scheduled events happen, so a player who visits a few
  times a day still sees them.

## The kindness code: three strikes

Unkind behaviour in the hobby earns strikes. Strikes never go away. Three
strikes is game over: the save is wiped and the player starts again.

Strike sources (each is always a clear, deliberate choice, never something
automation or a misclick can trigger):

- Keep buying at the vending machine while a kid waits behind you.
- Fleece someone who doesn't know what their cards are worth.
- Knowingly sell a fake card.
- Price-gouge customers in your own shop.

Escalation:

1. **First strike:** someone notices. A stranger glares; the kid looks at
   the empty slot and walks away.
2. **Second strike:** a strong, ominous warning that the next one ends
   everything. Draft:

   > The store owner doesn't look up when you come in anymore.
   > Someone has written your name on the corkboard by the door.
   > People are starting to talk.
   >
   > One more, and you're done here.

3. **Third strike:** the shame ending. Draft: security tells the player to
   stop hanging around the vending machine, and they quit the hobby out of
   shame.

Kindness is rewarded but never removes strikes. For example, letting the kid
go first earns a thank-you, and over time the kid becomes a friend who offers
a card the player needs, and later a rival.

## Tournaments

A short, easy minigame that rewards better cards, with a small
rock-paper-scissors decision.

- Three core types in a loop (e.g. Fire beats Nature beats Water beats Fire).
  Some fixed cards are wildcard types.
- A match is best of 3 rounds. Each round both players play one card; type
  advantage gives a large bonus, then card power decides.
- The decision is reading the opponent: opponents have tells ("Riley mostly
  plays Water", "always leads with their best card").
- Tiers: Friday locals, regionals, nationals, and a final championship. At
  locals a good read beats raw power; at the top tiers both matter, which
  pushes the player to collect and trade for stronger cards.
- After beating a tier, the player can auto-play it.
- Prizes: money, prize packs, and tournament-only fixed cards.
- This replaces the current HP-and-turns battle system, which is slower and
  more complex than this design needs.

## Trading and side quests

Trades are short encounters with recurring characters. Ideas so far:

- **The kid from the vending machine:** grows up over the game; trades,
  rivalry, and the Act 5 return.
- **The confident trader:** offers suspiciously shiny cards. Can the player
  spot the fakes?
- **The dad with his kid's binder:** has no idea what's in it. An honesty
  test; fleecing him is a strike.
- **The obsessive collector:** will trade almost anything for one specific
  common card.
- **The trade-up chain** (required for the collector ending): start with a
  worthless card and trade up, one card show at a time, until it becomes a
  specific legendary. Each step is a different person who wants exactly what
  the player has.

## Card shows

Card shows are scheduled events (see clock time) where the player can:

- rent a table and set prices for their cards;
- watch NPC buyers browse and haggle;
- browse other tables for specific fixed cards;
- risk buying fakes if they don't check carefully.

Pricing far above market means no sales. Knowingly selling a fake is a strike.

## Endings

The game has several endings. Reaching one shows its end screen.

| Ending | Condition | Required story beat |
|---|---|---|
| **Greatest Collector** | Own every fixed card | Finish the trade-up chain for the last legendary |
| **TCG Champion** | Win every tournament tier, ending with the championship | Assemble the overpowered championship deck |
| **TCG Businessperson** | Earn a target amount of money | Turn down the dishonest offers |
| **Bad end: Scalper / Counterfeiter** | Accept a dishonest business offer | The offer itself |
| **Shame** | Third strike | Any strike source |

### Champion deck

The championship needs a specific overpowered deck built from fixed
legendaries. Each piece should come from a different source (a vending promo,
the trade-up chain, a tournament prize, a card show find), so the champion
path touches every system.

### Business offers

On the business path, the player is offered dishonest deals:

- buy out every store's stock of a hot new set and resell at a markup;
- print counterfeit cards and sell them.

Accepting gives the bad ending. Refusing is required for the good
business ending.

## Open questions

- Is an ending final, or can the player keep playing afterwards to reach the
  others?
- Do endings already found carry over to the next run, including after a
  shame game over (an "endings found" list kept outside the save)?
- Act unlock conditions and the money target for the business ending.
- Fixed cards per set and number of sets.
- Is the current prestige system replaced by the endings, or kept?
- Character names and recurring cast.

## Brain dump

Add new side quests, storylines, characters, and scene ideas here.

-
