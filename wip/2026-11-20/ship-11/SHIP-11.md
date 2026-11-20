# Ship 11: Moses's relays land, names v2 first (20 November 2026 AD)

Page lane (Elijah). Begun the hour ship 10a went live (`main` 501a8b3bbb). Tree `S/s11` (branch `ship11` from 501a8b3bbb); `S/old` now holds 501a8b3bbb as the live reference (8914). Scripts and logs in `S/s11w`.

## 1. Names v2 (relay v198) takes the place of names v1's list of name rows

Moses, v198: «`name-rows-v2.jsonl` takes the place of `names-v1/name-rows-v1.jsonl` for the gate: lay `name: 1` from it, as before. The places stay v1's.» It answers this lane's ask 2 of 15 November, on the owner's rule that a row is set apart only on what its own source says of it. The gate itself is the owner's ruling 8 of 13 November and does not change: at a place that is not a name, a row its source gives as a name is withheld and counted; at a place that is a name it stands.

**Taken (read-only) and matched to the letter's hashes:** `RULE.md` 25dd42e3…, `receipt-v2.json` 33110941…, `name-rows-v2.jsonl` a04e4c60… (21,292 lines), and the three smaller lists not kept in the tree (partly a name c972601f…, peoples' names a85898de…, another mark or none a88d0c5b…).

**Against names v1, counted here from the two lists:** 7,377 rows kept, 13,915 added, 35 leave (all the UBS dictionary's, as the letter says). None of the 26 rows of the v194 addendum is in the new list, so the addendum's law stands.

**The pin** (`reader/data/names/PIN.json`): the name rows, their rule and receipt are names v2's (`names-v2/`); the name places stay in `names-v1/` with their own rule and receipt, named under `place_names`; names v1's list of rows is named as superseded and no tool reads it. The projector reads the places from the folder the pin gives them (`tools/project-lattice-v12-v1.mjs`), and still says relay v177 of them, so the zones' own receipts do not move for the reshaping.

**Rehearsed without writing** (`node tools/apply-name-rows-v1.mjs --dry`): 21,292 rows listed, read from the store at 54416ff5785b, which is the store as served; every line finds exactly one row of the store's 651,752; no round since has moved a row it names; **13,950 rows move** (13,915 gain the mark, 35 lose it), in all 256 shards.

**Running:** `S/s11w/pipeline-11a.sh` (pass `pipe1`, begun 19:08 UTC): the store step, the whole round, the form-of record baked again (it reads the name rows), the lines, the chain books, the door, the switches page, every resting line against live. The lines that move are read one by one before anything ships.

**Owed before it ships:** `check-names-gate-v1` reads names v1's receipt in several laws (the sources read, the rows by source, the addendum's counts); it is to read the rows' laws from names v2's receipt and the places' from names v1's. Then the suite and the gate.

## 2. After it, in order

The entry ledgers (v203 English Wiktionary 54,261 rows, v204 Classical Hebrew Words and Hebrew Wiktionary 9,192 rows): facts lists in the shape of v190's, to be laid by a tool written beside `apply-row-entries-v1.mjs`. Then v199, v207, v200, v201, v208, v192.1, v197.

**The store step ran** (19:08 UTC, 6 s): the rows carry the mark as the list names them; the store's version moves on from 54416ff5785b. The round follows it in the same pass.

**The names check, taught the two relays** (`tools/patch-check-names.py`, not yet run on the finished round): the pin may give the list of places its own folder, rule and receipt; N1 holds each list to the receipt of its own relay; the sources read and the rows by source are read from whichever shape the rows' receipt has (names v1's `rows.m_ids_read` and `rows.name_rows`, names v2's `m_ids_read` and `by_m[m].name`); N7's addendum is counted against names v1's receipt, the one beside the places.
