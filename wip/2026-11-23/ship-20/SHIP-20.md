# Ship 20: the name marks (relays v213 and v219) and the spelling bridge v1.2 (relay v220)

Page lane, 23 November 2026. Built by a helper in the sandbox `S/s12` (from main 7f6c862105, ship 18), from the brief `S/s29w/BRIEF.md`; applied by `S/s29w/apply-20.sh`, proven to apply on main and after ship 19 (19, then 20, then 20 again writing nothing). It goes on top of ship 19, with its own round, gate and suite (`S/s31w`). **Shipped 23 November 2026: main 8c53c71284d8aafc3d86cc5ea8df79e2123c73f8, gh-pages 0bfcfb215bf39c950f8f5da3048ee86585dd12cd.**

## What it lands

- **v213's 22 name marks** (v200's 18 rows, v202's 4), laid as `name: 1` as names v2 was, and **v219's place-list addition** with them: Ezekiel 27:6 word 11 («Kittim») added on TAHOT's own mark, and TAHOT named beside MACULA at 6 places. The addition is kept as its own file beside names v1's list (`data/names/places-at-bridge-v1/`, with v219's rule and receipt), laid as v219 section 1 says by one module (`tools/name-lists-v1.mjs`) that the projection and the names check read; names v1's file is not rewritten. The list holds 34,578 places, 33,847 with TAHOT: v219's figures.
- **v219's name list for the translation tables**: 6 rows («Tigris», «Lebanon», «Lord» twice, «Christ», «April»), each found once in the store by key, m and the route's sha, all landed by ships 16 and 18. M51's list (832 rows) is named as not laid: its lines wait on the owner.
- **The spelling bridge v1.2** in place of v1.1. The class held for STEP's «}+» tag is gone: of its 42 places, 40 are places call 4 holds as they rest («|») and 2 are places where STEP's reading stands (Numbers 33:35 word 4, 33:36 word 2), so the pin's counts move from 6 to 46 and from 724 to 726. 211 places laid before and after, 0 newly laid, 0 pieces changed.
- Rows marked `name: 1`: 21,320 (28 new).

## What it moves, measured on the sandbox (`measures/what-moves.tsv.gz`)

- **Resting lines: 0 move** in 40 works; **commentary lines: 0**.
- **Ezekiel 27:6 word 11**: live prints «Kittim» (the bridge's own pieces), and so does the new build. Its card's held-back line goes from «2 given as a name … · 4 of 8 pointed otherwise» to «6 of 8 pointed otherwise»: MACULA's «Kittim» and «Cyprus» now pass the names gate and are held back by the pointing gate instead. The line moves zero times, not once.
- **Name verdicts that move** (stands → withheld): 2,209 placings at 1,371 places; «Shem» 1,838 (the name row under שם, now held back where the word is «there» or «name»), Baal 70, Kir 65, Beer 56, Migdal 47, Iphtah 43, «Lord» 43, Gur 28, and a few more. At 2,166 placings the entry gate held the row back already, so nothing shows. The translation tables' «Lord» (M78, under מרי) moves at 27 places: at rest its card gains «1 given as a name by its source, withheld»; with the shut dictionaries opened its pill goes at 12. 28 cards change in all.
- Checks after the sandbox's round: the names gate (12 laws), the bridge (B1 to B6, B5 in a browser), held places, the entry gate (25), landings, and 18 more, all pass; deliberate faults failed N1 to N5, N7, B1, B3 and B6, each undone.

## The round on the real tree (`S/s31w`, 23 November 2026)

On ship 19 as shipped (418d69e93f), ship 20 applied first (zone.html 98832b01999ec895, unchanged by it). Started 16:46:52 UTC; apply 76 s, the round 1,193 s, every step exit 0; done 17:28:03 UTC. The store after the apply: 2882324f8ff3, 653,353 routes under 122,601 keys.

Measured against live (ship 19, `S/old`), in `measures/real-tree/`:

- **Every resting line: 0 move in 40 works** (`lines-diff.json`).
- **The commentaries: 0 lines move.** All 21 commentary zones differ only in the store version their record names. The 39 Bible zones and the Tikkunei Zohar differ the same way, except Ezekiel: its word 11 at 27:6 gains its name-place mark (`np: 1`) and nothing else. The 39 lattice sidecars differ in their names (the 28 newly marked rows). That accounts for all 100 zone files that differ (`zones-differ.txt`).
- **The cards on the page** at the sandbox's 40 places (`probe-places.json`; read on both trees, at rest and with the shut dictionaries opened):
  - At rest: 0 lines move and 0 pill lists change. 28 held-back lines change, exactly the sandbox's 28: Ezekiel 27:6 word 11 («2 given as a name by their source, withheld · 4 of 8 pointed otherwise» becomes «6 of 8 pointed otherwise»), and 27 places of the tables' «Lord» (M78), each gaining «1 given as a name by its source, withheld». Where the pointing gate held that row already, its count drops by one, for example «23 of 68» becomes «22 of 68».
  - Opened: the same 28, and at 12 of them the «Lord» pill leaves the card. At Judges 18:25, another source's «lord» stays.
  - Ezekiel 27:6 word 11 prints «Kittim» on both trees.
- **The gate** against live (418d69e93f), 17:28 to 17:39 UTC: 30,945 lines compared on 18 pages, 0 differ; S1 and S2 ok; 0 cards written to the diff.
- **The whole suite** (206 checks, two lanes, to 19:14 UTC): 204 pass, among them the names gate (12 laws), the bridge (6), held places (5), the entry gate (25) and landings (5). Red, as on every ship: check-nothing-unlanded-v1 (229 owed until the push) and check-reading-rows-v1 R1 (the small phone's nine short rows, the same on live).

## Shipped

- main 8c53c71284, gh-pages 0bfcfb215b ("gh-pages follows main"), one commit each; the message is `COMMIT-MESSAGE.txt` beside this record.
- After the push, check-nothing-unlanded-v1 on the tree: 2,621 files identical on the branch, 451 sources all landed, all checks passed.
- The live tree for comparison (`S/old`) moved to 8c53c71284.

