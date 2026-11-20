# Ship 11c, the landings that need no ruling: v201, v200, v202's form rows (prepared, 20 November 2026 AD)

Page lane (Elijah). Begun in the sandbox (`S/s12w/sb`) while ship 11's second pass ran. Nothing here is in a tree that ships.

## The three lists (each fetched read-only and matched to its letter's hashes)

| list | relay | lines | what |
|---|---|---|---|
| `whole-renderings-v1` | v201 | 15 | Strong's two whole renderings whose halves are withheld («make (1 Kings 22:48 marg)» under 13 keys, «whereby (Psalm 45:8 (defective plural))» under 2), each at the rank of its record's other renderings |
| `call5-returns-v1` | v200 | 1,296 | call 5's rows whose words only another source held under the plain key, back under the plain key each with its own source (TAHOT 593, Hebrew Wiktionary's form tables 504, and others), and two of v188's lines reissued under the plain key |
| `bridge-form-rows-v1` | v202 | 167 | STEP's own rows under our text's spelling, for 220 places |

**v202's form rows name the five places names v2 moved** (`ship-11/SHIP-11.md` section 3): «tent/ his» for Genesis 13:3 (and 9:21, 12:8, 35:21), «multitude/ his» for Ezekiel 32:31 (and 31:18, 32:32, 39:11), «hands/ his» for Leviticus 9:22 and 16:21, «hands/ its» for Ezekiel 43:26. Those words are places where our text spells otherwise than the Leningrad text STEP follows, which is why no row of STEP's stood under our letters and MACULA's name led. After this landing each reads STEP's own words for the place.

## The tool (`tools/derive-landings-v1.mjs`, new; landings-rule-v1)

One pin for all such lists (`data/landings/PIN.json`, written by `tools/make-landings-pin.py`), in the order they land. Each list is derived on the store as it stands when its turn comes:

- a line whose own source already prints its words under its key is named as not landed; another source printing them is no hold (a source's records stay its own, the owner, 7 November);
- a line that names its rank lands there, after its own source's rows at that rank, and such rows must stand there;
- a line with no rank takes the highest rank under its key plus one, in the list's order (Moses's words in v200 and v202);
- the facts a line names (n, t, b) go with it.

Rehearsed on the sandbox's store for the first list: 15 land under 15 keys, all with their facts, none refused. The second and third refuse until the one before has landed, as they should.

## Still to build (item 1 is done in the sandbox)

1. **`strike-rows-v1`'s landing writes the facts its line names.** Today a landing writes none (which is why v188's landed rows waited for row entries v1.2).
2. **The tools that lay the lane's facts leave a landed row's facts to its landing.** `apply-row-entries-v1` gives a row landed since the ledger was read nothing, so it would take the landing's facts off again; it has to give such a row what its landing line names, read from the row-strikes record. The same holds for the name mark: none of these lines carries one, so a name among them stands unmarked until the next names list reads it (to say to Moses).
3. A check for the landings (each derived list is its pin's bytes, each landed line stands as a row with its facts, each line not landed is printed by its own source).
4. Then the round, the lines read one by one (the five above are expected), gate, suite, ship.

## Rehearsed to the end in a sandbox (20:45 UTC)

On a second copy of the store with ship 11's entries applied (`S/s13w/sb`; `tools/rehearse-landings.sh`), each list derived when its turn came and landed by `strike-rows-v1` with the facts patch (`tools/patch-strike-rows-facts.py`: a landing writes the facts its line names, and the row-strikes record keeps them with the row):

| list | lines | rows landed | keys | new keys | with facts | not landed |
|---|---|---|---|---|---|---|
| `whole-renderings-v1` (v201) | 15 | 15 | 15 | 0 | 15 | 0 |
| `call5-returns-v1` (v200) | 1,296 | 1,296 | 658 | 0 | 603 | 0 |
| `bridge-form-rows-v1` (v202) | 167 | 164 | 149 | 46 | 164 | 0 |

The store goes from 651,752 rows to 653,227 (+1,475). Moses's own counts hold: 658 plain keys for v200, 149 keys for v202.

**One rule the rehearsal added.** Three of v202's lines name words another of its lines already lands for the same source under the same key: «hands/ his» is one line for Leviticus 9:22 (STEP's tag H3027S) and another for Leviticus 16:21 (H3027G). The store holds one row of a source for a key and its words, and the landing counts a second as already held, so the second line's tag would have been lost and the row withheld by its letter at Leviticus 16:21. Such lines now land as one row carrying every line's facts and headwords, each once, in the lines' order, and the row names the lines it gathers. As landed in the sandbox: «hands/ his» at rank 36 under the letters of «his hand», with both tags; «tent/ his» at rank 16 with its four pointed forms.

## The entries tool leaves a landed row's entries to its landing (item 2, done in the sandbox, 21:00 UTC)

Measured first on the sandbox with the three lists landed: as the tool stood, it would have taken the entries off **782 rows** it had no line for (15 of v201, 603 of v200, 164 of v202: the landed rows of the fifteen sources the ledger reads). With `tools/patch-entries-landed.py` a row a round landed since the ledger or a list was read carries exactly what its landing named, read from the row-strikes record: the same run moves **0 rows**, and counts 782 landed rows carrying their landing's facts, every one with a number.

Still to build for this ship: a check for the landings; a new version of the strike rule's name, since a landing now writes facts; then the round. (The check's side of the clause is done, below.)

## The check follows, and a row brought back is its struck row's twin (22:30 UTC)

`tools/patch-check-entry-gate-landed.py` gives `check-entry-gate-v1` the tool's clause: a row landed since carries what its landing named (E2, E3, E4, E5, E16). Run on the sandbox it left one law red, the twin law under E3, and the fault was real:

- Call 5 struck a row under a key that ends in a maqaf, and the entries tool has always given such a row's entries to its twin: the row of its own source and words under the plain key. Until now a twin was a row the ledger has a line for. v200 lands 603 of the struck rows back under their plain keys, each with the facts it carried at the store v189 was read at (4d1357b26ca5). The check finds twins by walking the store, so it counted them (4,664 struck rows with a twin; the tool said 4,061), and at two of them the returned row carries fewer of STEP's letters than the ledger's line for the struck row gave:

| row | struck under | the ledger's line for the struck row | v200's facts |
|---|---|---|---|
| STEP's «under» | the key with the maqaf, rank 2 | H8478G (13 places), H8478K (2), H8478H (1) | t: H8478G, H8478H |
| STEP's «put» | the key with the maqaf, rank 2 | H5414Q (1), H5414H (1) | t: H5414Q |

- So a row landed back under the key a struck row's words stand under is that row's twin, and takes what the struck row's line alone said, as a twin with a line does (`tools/patch-landed-twin.py`, the tool and the check together). The two rows gain H8478K and H5414H; the pair is recorded in `followed.entries_given_to_a_twin` with `landed_since`. Without it «under» would be judged another entry's at the two places STEP tags H8478K.
- After it, on the sandbox (`check-entry-gate-in-the-sandbox.txt`): E1 to E5, E14 and E16 pass; 4,664 struck rows have a twin; 4 twins given entries (two with a line, as before, and these two). The page laws are skipped there by design (the sandbox holds no zones).
- For Moses: v200's facts at these two rows are the store's of 15 November, older than ledger v1.1's line. Nothing is asked; it is said so he can read it.
