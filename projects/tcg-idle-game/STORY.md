# TCG Idle Collector: Story and Design Notes

Working design document for the story expansion. Sections marked **Open**
still need a decision.

## Status

- **Built:** Act 1, spring (the shoebox opening, the allowance, the hybrid
  day job and the office, the vending machine, Pip, strikes and the Shame ending, Benny, the storage, the
  secrets, and Gus telling you to come back in summer).
- **Next:** Act 2, at Gus's Games & Grub (see Act 2 below): the store
  opens in spring, and summer brings Set 2.

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
- A full playthrough to the first ending takes about 6 days of wall-clock
  time and about 8 hours of active play (see Pacing).
- Being kind in the hobby is a core rule. Being a scalper ends the game.

## Voice and style guide

Every line in the game follows this. Text lives in `js/content/text/`, one
file per topic.

- **Deadpan and absurd, like Candy Box.** Short, flat sentences. Silly
  things are stated as plain fact. Never sad, never sappy.
  ("Benny counts out three dollars in nickels and leaves without saying
  goodbye.")
- **Never explain a mechanic.** No tutorial lines. A new button just appears.
  Characters may hint at things in their own words ("They have packs ALL THE
  TIME").
- **Meta humour is welcome, often:**
  - jokes about idle games ("You have been watching the number go up for
    3 minutes. It is going up. Well done.");
  - reactions to the real clock ("It is 2:13 AM. The machine is always open.");
  - the narrator talking to the player, especially about strikes;
  - occasional notes from "the developer".
- **The world shows the player's history.** Choices leave marks in the ASCII
  art (Pip's sticker, the BE NICE note, dents from kicks), and storage grows
  with the collection. Strikes have no counter on screen.
- **The log is quiet.** It sits to the right of the game, newest first, with
  older lines fading out; on phones it shrinks to the newest line at the top.
  Feedback that the scene already shows (a slot emptying) doesn't need a line.
- **Things in the art can be pressed.** The vending machine's slots and coin
  return are buttons on the machine itself, not a row of buttons under it.
  Opened cards stay with the place they were opened in.
- **Pack opening is a moment.** The pack tears, cards flip one at a time, and
  the last card waits a beat.

## Player and time

- **The player is an adult returning to the hobby.** It starts when they find
  their childhood shoebox of cards: it's worth $0.43, because they chewed the
  corner off the one valuable card when they were seven. Benny offers $3 for
  it. Selling buys the first pack sooner; keeping it holds on to a misprint
  "Wet Sock Gobln" that later starts Mildred's trade-up chain.
- **Money:** a self-given allowance ("You are a responsible adult"), plus
  answering emails at the day job.
- **The day job is hybrid,** by the player's real weekday: Tuesday to
  Thursday they have to go to the office (a place of its own), Monday and
  Friday they work from the kitchen table at home, and weekends are off.
  At the office, the desk fills up as the hobby takes over (a card under the
  monitor, then a binder, then a playmat for a mousepad), packs can be
  opened under the desk, and the inbox count only goes up.
- **Quitting the job comes later.** When the player opens their own shop
  (Act 5), the shop's income replaces the salary, and quitting is the moment
  that starts the act.
- **Time passes in seasons.** Spring is Act 1 and the start of Act 2;
  summer comes with Set 2, then autumn, winter, and spring again. Scenes can
  change a little with the season. Characters don't age.
- **Separate days count.** The game counts the days (by the player's clock)
  on which they have played. Some things wait for a later day, so that the
  game is played over several days rather than in one sitting: Gus's store
  opens on the second day, and summer comes on the third at the earliest.
- **Storage grows:** a shoebox, a binder, two binders, a bookshelf of
  binders, and finally the card room (formerly the guest room). Each one
  goes on sale when the collection outgrows the one before ("The shoebox lid
  no longer closes"), and costs money: $10, $25, $60, and $200. Each step
  organises the collection better: the shoebox is a pile in the order cards
  were thrown in; a binder has nine-pocket pages, best cards first; two
  binders split the good ones from the commons; the bookshelf has a binder
  per type.

## Cast and names

| Name | Who | Notes |
|---|---|---|
| **Critter Clash** | The trading card game itself | The in-game TCG everyone collects |
| **Pebbleton** | The town | |
| **CARD-O-MATIC 3000** | The vending machine | Has a personality; occasionally eats a coin |
| **Pip** | The kid in the vending machine line | The kindness test, then the player's loyal little sidekick: tips about where to find cards, cheering at tournaments, and the first customer at the player's shop in Act 5 |
| **Benny** | The neighbour's kid, age 9 | A ruthless little businessman. Buys the shoebox and later the player's duplicates, with a 25% "finder's fee". Pays in nickels. |
| **Gus** | Owner of *Gus's Games & Grub*, the hobby store | Sells packs at a markup and singles from the glass case, sends cards off to be graded, runs locals, and invites regulars to the pre-release. Lives in the back, so the store is always open |
| **Linda** | The player's boss | Only ever speaks in email subject lines ("Quick question", "No rush"). Walks past when packs are opened at the desk; never a strike, always a reply-all. May collect in secret. |
| **Marcus from IT** | A coworker | Collects in secret. Notices the card under the player's monitor, then asks them to lunch ("Bring the binder"). An after-work regular at Gus's on Thursday and Friday evenings and all weekend: the first trading partner in Act 2 |
| **Gus's regulars** | Locals opponents | Brenda (Water, head to toe), Grandpa Joe (Nature is the only real type), Hank (hot sauce, Fire), Dev, age 11 (copies whatever you just played), and Kayla (plays whatever beats it). Their tells are in how they're described, never stated |
| **Officer Dale** | Mall security | Eats pretzels. Writes down every kick at the vending machine and reads the count out in the Shame ending |
| **PackDrop.com** | The online store | Shipping arrives at clock times |
| **Mint Condition Co.** | The card grading company | Grades cards 1-10. Gus sends cards off to them |
| **Card-a-Palooza** | The card show at the community center | Scheduled events |
| **Trust-Me Trevor** | Trader with suspiciously shiny cards | Sells fakes |
| **Doug** | A dad with his kid's binder | Honesty test |
| **Mildred** | Obsessive collector | Will trade anything for a *Wet Sock Goblin* |
| **Riley** | Regionals rival | Mostly plays Water (a tell) |
| **Flip Resellington** | The shady businessman | First seen in Act 1 as the scalper behind the player at the vending machine, with an empty duffel bag. Gets more annoyed each time he's bought out, and says they "should talk business some time". Later makes the dishonest offers |
| **Terry** | Waits at the vending machine for the drop | Folding chair, thermos of soup. Splits the drop with a player who asks, then texts them when a mega pack turns up |
| **xX_K3V1N_Xx** | The reigning world champion and final rival | Real name Kevin, 34. Has been world champion for 11 years. Wears a cape. Plays the netdeck everyone calls "The Meta". Says "skill issue" when he wins and "lag" when he loses, even though it's a card game. |

Named cards so far (the full list is in `js/content/catalog.js`):

- **Wet Sock Goblin**: Base Set common #1, which Mildred is obsessed with.
- **Absolutely Massive Dragon**: a legendary, found at a card show.
- **Golden Paperclip Phoenix**: the legendary at the end of the trade-up chain.
- **CARD-O-MATIC Prime**: a vending-machine promo, only in special packs.
- **Champion's Crown**: the nationals prize card.
- **Pip's Favourite**: a gift from Pip, only if the player was kind to Pip.

## Acts

| Act | Location | New verbs | Unlocked by |
|---|---|---|---|
| 1 (spring) | Vending machine, the office | Buy one pack, open it, sell duplicates to Benny, answer emails | Start |
| 2 (spring, then summer) | Hobby store | Buy packs at a markup and singles, grade cards, trade with Marcus, locals, the pre-release; Set 2 | Gus's store appears after 40 cards opened with Pip's tip, or 60 without. It opens on the second day of play. |
| 3 | Online store and deck building | Preorders, shipping, building real decks, regionals | Summer: Set 2 sells out everywhere (Gus mentions PackDrop.com) |
| 4 | Card shows | Rent a table, haggle, hunt specific cards, nationals | First booster box delivered |
| 5 | Your own shop | Stock shelves, host tournaments, refill the vending machine; quit the day job | A money target, after the first card show |

Act 5 closes the loop: the player ends up stocking the vending machine from
Act 1 (with the key from its coin return), and Pip is the first customer
through the door of the player's shop.

### The vending machine

- **The stock varies.** Each restock fills the 8 slots: mostly normal packs
  ($3), and sometimes a bundle of three packs ($8, about 6% of slots), a
  special pack ($6, 3%), or a mega pack ($10, 15 cards with a guaranteed rare
  or better, 2%). Set 2 and Set 3 packs join the mix once those sets release.
- **Other people buy it up.** The rarer the pack, the sooner it goes: mega
  packs within 2 to 8 minutes of the drop, special packs 3 to 10, bundles 5
  to 15, normal packs 10 to 60. About half the normal packs are left when the
  driver comes back. Being there on the dot gets the good stuff; checking in
  now and then still finds some packs.
- **It runs on the wall clock.** When the driver restocks, each pack is given
  the time someone else will buy it, so the machine at any moment is whatever
  hasn't gone yet. Every restock the player missed is played out when they
  return, so the machine is the same whether they watched or not.
- **The scalper.** Once the player has met Pip and bought 8 packs, Flip
  Resellington lines up behind them (always the first time, then about 1 restock in 4),
  sometimes with a kid behind him. The player can buy everything they can
  afford (fair, and Flip gets more annoyed each time; a strike if a kid was
  waiting), buy everything but leave one pack for the kid, or let him have
  the rest. Whatever they can't afford, Flip takes.
- **Terry, waiting for the drop.** If the player is at the machine in the
  minute before a drop, Terry is already there (always the first time, then
  sometimes). Asking him to split it: he takes row B, they take row A, and he
  becomes a friend who texts when a mega pack turns up while they're away.
  Letting him go first: he takes the best pack. Shoving him aside: a strike,
  and Dale counts it in the Shame ending.

- **In summer,** Set 2 packs fill about half the slots at the same price as
  the Base Set's. The game is popular now and $3 is cheap for the new set,
  so they go two and a half times as fast, and the scalper lines up about 2
  restocks in 5. Special packs stay Base Set packs.

### Act 2: Gus's Games & Grub

- **The store opens on the second day.** The sign appears in Act 1 (after
  40 cards opened with Pip's tip, or 60 without). On the first day it says
  GRAND OPENING TOMORROW, and Gus says so through the door. From the second
  day of play it's open, always (Gus lives in the back).
- **Packs at a markup.** Gus sells Base Set packs for $4.50, more than the
  machine's $3, but he never runs out and nobody else buys them first. The
  machine stays the cheap, contested source; Gus is the sure thing.
- **Singles.** A glass case of six single cards (two commons, two uncommons,
  a rare, and a rare or ultra-rare), restocked every 4 hours, at twice each
  card's value (25 cents at least). It's the way to hunt a specific card
  instead of opening another pack.
- **Grading.** Gus sends a card to Mint Condition Co. for $5 and it comes
  back a day later, graded (see Card grading).
- **Marcus trades.** On Thursday and Friday from 6 PM, and all day Saturday
  and Sunday, Marcus is at the table by the window with his trade binder. Each
  visit he offers up to three trades, one card for one: a card the player
  doesn't have, for a spare copy of one they do, of the same rarity. If the
  player met him at the office, he pretends not to know them.
- **Locals.** Once an hour (Gus calls it Friday Night Locals no matter what
  day it is). Entry is buying two packs from Gus, which the player keeps.
  The player plays their own cards (see Tournaments). Prizes are packs:
  three for winning every match, one for winning two.
- **The pre-release.** After the player first wins locals, Gus says they're
  a regular now and invites them to the Set 2 pre-release: a kit of four
  Set 2 packs for $30, opened at the table, playing with only those cards.
  Everyone who plays gets the pre-release promo, The Early Bird, and each
  match won earns a Set 2 pack. It's the first look at Set 2, and it can be
  played once.
- **Summer, and Set 2.** Summer comes on the third day of play at the
  earliest, once the player has played the pre-release. Set 2, Backyard
  Brawl, is out: Critter Clash got popular, so Gus charges $7.50 a pack for
  it, and the vending machine, still at $3, is cleared out faster (see The
  vending machine). Locals entry and prizes become Set 2 packs.

### Act 1 secrets

- **Smell the pack:** pointless, with escalating lines. The 50th sniff makes
  special packs restock more often.
- **The coin return:** usually nothing, sometimes a quarter (at most once per
  restock), and once, the machine's key. The key does nothing until Act 5.
- **Kicking the machine:** never a strike, but Officer Dale writes it down,
  the machine gets dents, and the Shame ending reads out the total.

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

## Pacing

Target: about **8 hours of active play spread over about 6 days**, reaching
the first ending on day 6. The other endings can be chased afterwards.

### Principles

- **The first session hooks hard.** Act 1 is fully active and short
  (about 30 minutes), with no waiting. The first session should find the
  hobby store's sign and end with a reason to come back the next day: the
  grand opening.
- **One new system per day.** Each day of play introduces something new, so
  the game keeps changing.
- **Every check-in follows the same loop: collect, decide, send off.** Collect
  what arrived (packages, graded cards, shop income), make a few decisions
  (trades, deck, a tournament), then send something off that will arrive
  later (an order, a card to grade).
- **Never make an active player wait with nothing to do.** While packages
  and grading are pending, there is always a pack to open, a trade, or a
  tournament to play.
- **Never punish being away.** Offline income accrues while away, capped at
  8 hours, so checking in matters but sleeping is never a loss. The cap is
  shown in-world ("Your piggy bank is full!").
- **Clock-time gates set the minimum length; money and cards set the
  difficulty.** Days of play and set releases are the hard gates (see below), so a very active
  player can't finish in one day. Everything else is a soft gate the player
  can push through faster by playing well.
- **Waits get longer as the game goes on.** Minutes on day 1, hours from
  day 2.

### Day by day

| Day | Active time | Acts | Main beats | Reason to come back |
|---|---|---|---|---|
| 1 | about 1 h | 1 | Vending machine (0:00), first Pip event (about 0:30, at the first restock), Gus's sign (about 0:30), the binder | Gus's grand opening is tomorrow |
| 2 | about 1.5 h | 2 | Gus's store opens: packs and singles, the first card sent off to be graded, first locals win, Marcus (on his days), the pre-release | A card comes back from grading; summer and Set 2 tomorrow |
| 3 | about 1.5 h | 2 -> 3 | Summer: Set 2 releases (prices spike; Flip's first offer: buy out every store), Set 2 locals, PackDrop.com unlocks | First online order arrives the next morning |
| 4 | about 1.5 h | 3 -> 4 | First booster box, real deck building, regionals vs Riley, first Card-a-Palooza, trade-up chain step 1, nationals | Preorder boxes, the next card show |
| 5 | about 1.5 h | 4 -> 5 | First table at a card show, trade-up steps 2-4, open your own shop, Flip's second offer (print counterfeits), Set 3 announced | The shop runs overnight; Set 3 release |
| 6 | about 1 h | 5 | Set 3 releases, the last legendaries, the championship vs xX_K3V1N_Xx, first ending | Post-game: chase the other endings |

Rough active time per act: Act 1 0.5 h, Act 2 2 h, Act 3 2 h, Act 4 2 h,
Act 5 1.5 h.

### Clock schedule

All times come from the real clock and are saved as timestamps.

| Event | Schedule | Notes |
|---|---|---|
| Vending machine restock | Every 25 to 35 minutes, at a random time; the machine shows when the next one is | Fills all 8 slots with a mix of packs, which other people buy up before the next one (see The vending machine) |
| Pip in line | Not before the first restock, then about 1 in 3 restocks, once you've bought 3 since it | Not after you've already let Pip go first that restock |
| Gus's store opens | The second day of play | The sign appears in Act 1 |
| Gus's glass case | Restocked every 4 hours (00:00, 04:00, ...) | Six singles |
| Marcus at Gus's | Thursday and Friday from 6 PM, all day Saturday and Sunday | Up to three trades each visit |
| Locals at Gus's | Every hour, on the hour | One entry per hour. Gus calls it "Friday Night Locals" no matter what day it is. |
| Grading, sent by Gus | Back 24 hours after sending | |
| Summer, and Set 2 | The third day of play at the earliest, once the player has played the pre-release | |
| Regionals | Every 6 hours (00:00, 06:00, 12:00, 18:00) | One entry per block |
| Nationals | Once per calendar day | One entry per day |
| Championship | Opens once Set 3 has released and you've won nationals | One-time event, can be retried daily |
| Card-a-Palooza | Starts every 4 hours (00:00, 04:00, ...) and runs 3 hours | Covers 75% of the day, so a few check-ins a day will usually catch one. One trade-up step per show. |
| PackDrop.com shipping | Standard: 4 hours. Express: 1 hour for a fee. Slow free shipping: 12 hours | Slow shipping is cheapest and arrives overnight |
| Set 3 release | Two days after summer starts, rounded up to the hour | Shown as a date and time ("Releases Thu 6:00 PM"); to be settled with Act 4 |

### Rough numbers (to be tuned)

| Thing | Starting value |
|---|---|
| Allowance | $1.20 per minute (built) |
| Answering an email | $0.50, then a 20 second rest, on work days (built) |
| Vending machine pack | $3; special pack $6; 8 slots per restock (built) |
| Hobby store pack | Base Set $4.50 (50% markup); Set 2 $7.50 in summer |
| Singles at Gus's | Twice the card's value, at least $0.25 |
| Locals entry | Two packs from Gus; prizes of three packs (every match won) or one (two won) |
| Pre-release kit | Four Set 2 packs for $30; a Set 2 pack for each match won |
| Grading | $5 a card; Gus buys graded cards for half their value |
| PackDrop.com booster box | 24 packs for $60 ($2.50 a pack) with one guaranteed legendary-tier hit |
| A common's value | $0.05 to $0.15 (Benny pays 75% for duplicates) |
| Business ending target | About $250,000 earned in total (to be tuned once shop income is known) |
| Cards | 100 to 150 per set across 3 sets (the Base Set has 120), plus about 12 promos |

## Cards

- **Every card is on a fixed, named list,** in a set, like a real card game.
  Each one has a name, a number in its set, a short flavour line, and a known
  source. Nothing is made up on the spot.
- **Packs work like real packs.** A normal pack is 3 commons, 1 uncommon, and
  a hit: an uncommon (65%), a rare (30%), or an ultra-rare (5%). A special
  pack is 2 commons, 1 uncommon, and two hits at better odds (rare 55%,
  ultra-rare 15%), each with a 5% chance of the CARD-O-MATIC Prime promo. The
  odds are printed on the back of the checklist.
- **Sets are big, like real ones:** 100 to 150 cards each. The Base Set
  (Set 1) has 120: 60 commons, 36 uncommons, 18 rares, and 6 ultra-rares,
  40 of each type. A first session of about 16 packs finds about half of it;
  completing it from packs alone takes about 300, so trading, booster boxes,
  and later acts matter.
- **Promos** are legendaries that never come in packs; each comes from one
  place (the vending machine's special packs, the card show, the trade-up
  chain, tournaments, Pip). Their checklist appears once the first is found.
- **The shoebox cards** (the misprint and the chewed dragon) are on no
  checklist at all.
- **The checklist teaches the goal.** It falls out of the first pack, goes on
  the fridge, and shows on Home: every card numbered, one rarity per tab,
  with the missing ones as ???. Each pack says how many new cards it
  brought, with their flavour lines, and completing each rarity and the
  whole set gets a line.
- **Set 2, Backyard Brawl,** comes out in summer: 102 cards (51 commons, 30
  uncommons, 15 rares, and 6 ultra-rares, 34 of each type), about the
  backyard in summer. Its checklist appears with the first Set 2 card. Each
  pack is from one set; at Gus's the player picks which.
- **Every copy has a condition from 1 to 10,** decided when it comes out of
  the pack and saved with it: a 10 one time in 10, 9 or 8 three times in 10
  each, 7 two in 10, and 6 one in 10. The shoebox cards are worse. The
  player only sees it by eye, as Gus reads it ("looks perfect" for a 9 or
  a 10, "a little off-centre", "a soft corner", "a scuff on the back");
  grading reveals the number.
- Sets release over time (Set 1, Set 2, ...). A new set is what makes
  preorders matter.
- 100 to 150 cards per set across 3 sets, plus promos (see Pacing).

## Where packs come from

No source should be strictly better than the others. Each has something only
it offers.

| Source | Price | Speed | Only here | Drawback |
|---|---|---|---|---|
| Vending machine | Cheapest single pack | Instant | Special packs, vending-only promo cards, kindness events | Limited stock until restock; strike risk |
| Hobby store | Markup | Instant | Choose the set, singles, grading, Marcus's trades, tournaments, the pre-release for regulars | Costs more |
| Online store | Cheapest in bulk | Arrives at a set clock time | Booster boxes with a guaranteed hit, preorders | Waiting, minimum order |
| Tournaments | Entry fee | After winning | Prize-only promo cards, prize money, prize packs | Must win |
| Card shows | Market price | Instant | The exact card you want | Haggling, fakes, expensive |

The main reason to use every source is that some cards (the promos) can only be
found in one of them.

Automation follows the theme. Buying automatically at the vending machine
would be scalping, so it is never allowed. Automation unlocks online instead,
as subscriptions and auto-preorders.

## Clock time instead of timers

Timed events are based on the real clock, not on countdowns that only run
while the page is open:

- An online order shows an arrival time ("Arrives 3:40 PM"). If the player is
  away when it arrives, the package is waiting on the doorstep when they return.
- The vending machine restocks every half hour or so, and shows the time of
  the next restock. Other people buy its packs at times decided when it
  restocks.
- Card shows and tournaments run on a schedule of real clock times.
- New set releases have a release time, and preorders arrive then.
- Everything is stored as timestamps in the save, so closing the page never
  loses progress.
- The full schedule is in Pacing > Clock schedule.

## The kindness code: three strikes

Unkind behaviour in the hobby earns strikes. Strikes never go away. Three
strikes is game over: the save is wiped and the player starts again.

Strike sources (each is always a clear, deliberate choice, never something
automation or a misclick can trigger):

- Keep buying at the vending machine while a kid waits behind you.
- Buy the machine out from under the scalper while a kid waits behind him.
- Shove Terry aside before a drop.
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
go first earns a thank-you and a sticker on the machine, and over time Pip
becomes a sidekick who offers cards the player needs.

As built in Act 1: there is no strike counter. The first strike gets a
reaction from Dale; the second tapes a BE NICE note to the machine and the
narrator addresses the player directly; the third is the Shame ending, where
Dale counts the kids made sad, the times Terry was shoved, and the times the
machine was kicked.

## Tournaments

A short, easy minigame that rewards better cards, with a small
rock-paper-scissors decision.

- Three core types in a loop (e.g. Fire beats Nature beats Water beats Fire).
  Some promos are wildcard types.
- A match is best of 3 rounds. Each round both players play one card; type
  advantage gives a large bonus, then card power decides.
- The decision is reading the opponent: opponents have tells ("Riley mostly
  plays Water", "always leads with their best card").
- Tiers: Friday locals, regionals, nationals, and a final championship. At
  locals a good read beats raw power; at the top tiers both matter, which
  pushes the player to collect and trade for stronger cards.
- **As built for Act 2:** a tournament is three matches against Gus's
  regulars. Type advantage is worth 3 power; a Wild card has no advantage
  and gives none. Each round the player picks a type and plays their
  strongest unplayed card of it. At locals their deck is the three
  strongest cards of each type in their collection; at the pre-release it
  is the same, from only the cards in their kit. Graded cards can't be
  played. A tied round is settled with a coin.
- After beating a tier, the player can auto-play it.
- Prizes: money, prize packs, and tournament-only promos.
- This replaces the current HP-and-turns battle system, which is slower and
  more complex than this design needs.

## Trading and side quests

Trades are short encounters with recurring characters. Ideas so far:

- **Pip:** the loyal sidekick. Tips, the occasional free card, cheering at
  tournaments, and the first customer at the player's shop.
- **Marcus from IT:** the coworker who collects in secret. In Act 2 he
  trades at Gus's on his evenings and weekends (see Act 2).
- **The confident trader:** offers suspiciously shiny cards. Can the player
  spot the fakes?
- **The dad with his kid's binder:** has no idea what's in it. An honesty
  test; fleecing him is a strike.
- **The obsessive collector:** will trade almost anything for one specific
  common card.
- **The trade-up chain** (required for the collector ending): start with the
  "Wet Sock Gobln" misprint from the childhood shoebox (or, if the shoebox
  was sold, some other worthless card) and trade up, one card show at a time,
  until it becomes a specific legendary. Each step is a different person who
  wants exactly what the player has.

## Card shows

Card shows are scheduled events (see clock time) where the player can:

- rent a table and set prices for their cards;
- watch NPC buyers browse and haggle;
- browse other tables for specific cards;
- risk buying fakes if they don't check carefully.

Pricing far above market means no sales. Knowingly selling a fake is a strike.

## Card grading

Unlocks in Act 2, at Gus's. Gus mails a card to Mint Condition Co. for the
player, and it comes back a day later in a sealed plastic case with a grade
from 1 to 10: its condition, which it has had since it came out of the
pack. Grading reveals it; it never rolls anything. Gus reads each card by
eye first, so the player can tell which cards are worth sending, but a
"looks perfect" may come back a 9 or a 10.

```
 .------------------------.
 | MINT CONDITION CO.  10 |
 | ABSOLUTELY MASSIVE     |
 | DRAGON      GEM MINT   |
 |------------------------|
 |  .------------------.  |
 |  |      /\_/\       |  |
 |  |     ( o.o )      |  |
 |  |      > ^ <       |  |
 |  '------------------'  |
 '------------------------'
```

- Every card has a hidden condition (see Cards). Cards straight from a
  fresh pack are in the best shape; cards that have been traded around a
  lot are worse.
- The grade multiplies the card's value. For example: 10 Gem Mint ×10,
  9 ×3, 8 ×1.5, 6 or lower ×0.8.
- **The main trade-off: a graded card is sealed and can't be played.** Do you
  grade your best legendary for money and collector prestige, or keep it in
  your deck for the championship? The player can crack the case open to play
  the card, but loses the grade.
- Gus buys graded cards for half their value. Graded cards sell best at
  card shows (Act 4), so grading feeds the business path.
- The binder has a "Gem Mint shelf" for 10s, as a collector side goal.
- Another dishonest offer for the business path: Flip offers to "reseal"
  low-grade cards into 10 cases. Accepting it gives the bad ending.

## Endings

The game has several endings. Reaching one shows its end screen, then the
player can keep playing to chase the others. The shame and bad endings are
the exception: those end the run.

| Ending | Condition | Required story beat |
|---|---|---|
| **Greatest Collector** | Own every card in every set, and every promo | Finish the trade-up chain for the last legendary |
| **TCG Champion** | Win every tournament tier, ending with the championship | Assemble the overpowered championship deck |
| **TCG Businessperson** | Earn a target amount of money | Turn down the dishonest offers |
| **Bad end: Scalper / Counterfeiter** | Accept a dishonest business offer | The offer itself |
| **Shame** | Third strike | Any strike source |

The list of endings found is stored separately from the save, so it
survives a shame game over or a bad ending and carries over to every new run.

There is no prestige system; the endings are the long-term goals.

### Champion deck

The championship against xX_K3V1N_Xx needs a specific overpowered deck. Each
piece comes from a different source, so the champion path touches every
system:

| Card | Source |
|---|---|
| CARD-O-MATIC Prime | A special pack from the vending machine |
| Golden Paperclip Phoenix | The end of the trade-up chain |
| Champion's Crown | Winning nationals |
| Absolutely Massive Dragon | A card show find |
| Pip's Favourite | A gift from Pip, only if the player was kind to Pip |

So the kindness code matters for the champion ending too: being unkind to Pip
makes the champion deck impossible.

### Business offers

On the business path, the player is offered dishonest deals:

- buy out every store's stock of a hot new set and resell at a markup;
- print counterfeit cards and sell them.

Accepting gives the bad ending. Refusing is required for the good
business ending.

## Open questions

- Final balance for the rough numbers above, after Act 1 is playable.

## Brain dump

Add new side quests, storylines, characters, and scene ideas here.

-
