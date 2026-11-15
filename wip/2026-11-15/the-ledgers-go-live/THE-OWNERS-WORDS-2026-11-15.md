# The ledgers go live: the owner's words of 15 November 2026, in order

1. «my other agent still says nothing has changed but i thought you said we pushed.» What had shipped that morning was the palette alone, which moves no text.
2. «"independent review of the last round of fixes, which needs the helper agents, and those are blocked until November 19 at 8pm UTC." not true bro please do it now» The session's model had changed; the helpers started at once (workflow toggles-review-3).
3. «toggles is good but the checker from the other bot i am using is going to be for accuracy and whether we agree with him or not he said it was 48% and hasnt gone up at all yet meaning the red flag im taking away is you havent actually pushed anything live» Answered with the other agent's own fourteen cards read again from the live build (`../the-accuracy-question/GENESIS-1-VERB-CARDS-12-NOV-AND-NOW.md`): 291 pills on 12 November, 264 now, all 132 called right still there, 51 of the 159 called not right gone since the ship of 13 November; nothing shipped since 14 November changes which readings a card holds, and the default toggles do not either.
4. «just push the ledgers we did live bro i cant check everyone before we push stuff» and «same thing with if we have some more toggles worth bringing back in we can start thinking about it. i know we have a ton of them sidelined as placeholders on /toggles/».

## What the page lane does with word 4

- The corpus lane's eleven relays of 14 November land ship by ship on the page lane's own proofs (the round, the suite, the gate, the live check), without waiting for the owner to answer each question: every recommendation of `../../2026-11-14/the-relays-v185-2-to-v195/OWNER-QUESTIONS-2026-11-14.md` stands as taken, but question 3, which stays held. An independent review no longer holds a ship back: it runs beside the ship and what it confirms is fixed in the next one.
- The first of them goes now as one ship: the card numbers in silver, the default toggles (the landing plan's ship 3) and ship 1 (row entries v1.1, pointer map v1.4, word senses v2). The separate ship of the silver numbers was folded into it to save a whole suite and gate.
- Then the rest in the landing plan's order: ship 2 (the read words, v192), ship 4 (the store round: call 5, v188 with v188.1, call 6, call 2, the names addendum), ship 5 (calls 7, 4 and 3: the phrases switch, STEP's words as the line, runs resting word by word), ship 6 (v187's retexts).
- The switches sidelined on /toggles/: a short list of the ones worth bringing back is put to the owner, and built after the ledgers.

## The work, as it runs (15 November, from 06:15 UTC)

- **The first ship** (silver numbers, default toggles, ship 1): scratch `rt`, branch `ship-wip` (ec1c8a6764, the silver work merged with the toggles tree). One pipeline: the whole round, the switches page, four fast checks, the suite, the gate. It ships when those are read.
- **The independent review of the toggles' third fix round** (workflow toggles-review-3) reads the frozen toggles tree beside the ship. What its skeptics confirm is fixed before the commit if it blocks and is in time, in the next ship if not.
- **The next two ships are being built in parallel** (workflow ledgers-build-ships-2-and-4), in two scratch trees cut from ec1c8a6764:
  - `b4c`, branch `ledgers-build-ship2`: ship 2, the read words (v192), then an independent reader who tries to break it, then the fixes.
  - `b4`, branch `ledgers-build`: ship 4's store side (the pins, strike-rows v6, the derived landing list, the made spaces by the second road, check-audit-calls-v1, the landing check, and a rehearsal of steps 1 to 5 with every figure of the plan compared), then the follower and the facts (steps 6 to 8).
  - Each builder commits what it authors and leaves what a step generates uncommitted. Each writes its steps as one script that runs dry, compares the plan's figures, stops at the first that differs, runs for real and prints the sha256 of every file it changed. The lead takes the authored commits onto the shipped tree and runs the scripts again there: the sha256 tables of the rehearsal and of the real run must be the same.
  - Their notes: `build/ship-2-read-words/`, `build/ship-4-store/`, `build/ship-4-facts/`.
- **The switches**: `../the-switches-to-bring-back/SHORT-LIST.md`.
