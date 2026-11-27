## H2, the ‡ fix: done (nothing committed, pushed or shipped)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

The ‡ sentence now names STEP's number and BDB's numeral separately. At Exodus 30:33 it reads «‡ BDB files this verse under another word of the same letters (II. «kinsman»); STEP's number H5971A is BDB's I.»

**What changed**
- **The card:** in `S/s16/reader/tools/place-card-v1.mjs` the sentence ends `STEP's number ${b[9]} is BDB's ${b[15].entry}.`. `b[9]` is the number the line stands under, which the card already holds. I carried the block to `place.html` and `zone.html`.
- **The check:** in `check-place-card-one-place-v1.mjs`, P11 now names the new wording in its law and in the sentence it expects.
- **My own scripts:** the walk script's expected sentence and the P11 spoil (`S/s46w/scripts/h2-walk.mjs`, `h2-spoil.py`) use the new wording too.
- **No gloss for the entry.** STEP's number reaches its numeral from the Open Scriptures entry. To give that entry a gloss, the projection would have to pick which unabridged paragraph is the entry's, and there can be several or none. G6's rebuilding of the line would have to change with it. That is not a small change, so I left the gloss out.
- **Not touched:** the projection, so no make or comparison was needed. The «**» label stays as the file gives it.

**The check's result:** `check-place-card-one-place-v1` exits 0, with all 17 results ok.
- P11 now reads «… then «STEP's number <the line's number> is BDB's <the numeral BDB gives the entry that number reaches>.»» and reports «106 lines marked ‡». Its example is Genesis 3:5 entry 12: «… (III. «a good thing. benefit, welfare»); STEP's number H2896A is BDB's II.»
- **The spoil still fails:** with the two numerals swapped, P11 fails with 104 found wrong (P2 and P3 fail too, because the pages then differ from the module). I restored the module and confirmed it with `cmp`.
- Logs: `S/s46w/logs/one-place-cut8-fix.log` and `S/s46w/logs/spoiled-p11-fix.log`.

**The two pictures, retaken**
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s46w/shots-cut8/13-exodus-30-33-word-11-from-his-people-double-dagger.png` shows the new sentence.
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s46w/shots-cut8/13b-exodus-30-33-word-11-from-his-people-its-dictionary-row.png` is unchanged in content, because that row has no ‡ sentence.
