# Builder P: the places — STEP and MACULA at every word of our text, derived fresh

Read `S/s42w/FRAME.md` first (the why, the rule, the house rules, where the sources are). `S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`.

**Your sandbox:** `S/s14` (a git worktree at live `main`, ea6e1ad08e, clean). Your tools go in `reader/tools/` there, your output in `reader/data/place-answers-v1/places/`, your own scratch, downloads and logs in `S/s43w/`.

## What you make

For every word of the 39 books as our text writes it, what the two sources that read the Bible word by word say there, by their own address. Nothing comes from today's store, lattices, bridge lists or read-word lists: only from our zones (for the text and its addresses), STEP's files and MACULA's table.

1. **Meet the two editions.** Our text (the zones) and STEP's text (TAHOT, the latest revision in `S/s38w/dl-step-latest/`) are two editions of the same verses. Pair every word of ours with STEP's row or rows, verse by verse, and name how they meet, by a rule you state and count:
   - the same letters, one to one;
   - the same word spelled otherwise (a letter more or less; name the letters);
   - one word of ours is two rows of STEP's, or two words of ours are one row of STEP's (name where STEP's own marks give the seam: its «//», «/ /», «\» and maqaf marks);
   - a place written one way and read another: our text gives both forms; STEP's row is of a type (L, Q(K), K and the rest) and its variants column gives the other form with its own reading («K= … "if"»). Pair the read form with the row STEP reads, the written form with what STEP gives for the written, and say which is which; a word written and not read takes what STEP's variants column says of the written word, marked as written and not read; a word read and not written likewise;
   - verses the two editions number otherwise (STEP's reference gives both numbers);
   - no row of STEP's at all (name each).
   Where our spelling differs, STEP's cut is carried onto our letters only where that is certain (the difference is a letter the pairing names and falls inside one part); otherwise the parts are given with STEP's own letters and the word is marked so.
2. **STEP at the word.** For each word: STEP's reference of each row; each part in order with its English exactly as STEP writes it (brackets, angle brackets, «¿», «!», spaces), STEP's tag for that part, which part is the root; the row's grammar; the row's text type; the variants column whole. Hold STEP's structure as STEP gives it; cut nothing, join nothing, hide nothing: what prints is another layer's business.
3. **MACULA at the word.** Fetch MACULA's table (record the revision and sha256; say how it compares with the sha256 the tree's receipts name, 965cb059…, if you fetch a newer one). MACULA's text is the same Leningrad text as STEP's: pair its morph rows with our words through the same meeting. For each word: each morph with its text, its English, its second gloss column, its Strong number as MACULA writes it, its lemma, part of speech, stem, and the SDBH sense and domains it marks the word with. Hold it whole.
4. **Write it compactly**: `places/<book>.json.gz`, one record per word addressed by section index and entry index (the zone's own), with a small header saying the shape; strings that repeat can be tabled. Aim for under 40 MB for the 39 books; say what you chose and why.
5. **`PIN.json` entries for your sources** and a tool that makes all of it again from the source files in one command, and a check (`reader/tools/check-place-answers-places-v1.mjs`) that holds: every word of every book has a record; every STEP string is byte for byte a cell of the pinned file; the counts of each way of meeting.

## Prove it

1. **Counts for the 39 books:** words; words by how the editions meet; words with STEP's parts; words with MACULA's morphs; words with neither (each named). Our 305,431 words must all be accounted for.
2. **Against today's site** (`S/base/reader/data/resting-lines/<book>.json.gz` is the line the live page prints under each word, with its credit). Join STEP's parts by « + » and compare with today's line, word by word: the same; the same but for signs today's page hides; different. Every different word is listed with both and its cause. Expected from the passes: about 130 words where today's line is not STEP's, 14 words with no line today, 4 Psalms places STEP has since changed. If you find more, that is a finding; say what each class is.
3. **Read by hand** 60 words chosen from the hard classes (a letter more or less; one for two; two for one; written and read; written not read; read not written; verses numbered otherwise), each against STEP's own row as a person reads it, and say whether the record says what STEP says.
4. **As words:** a script that prints, for any verse, each word of ours with STEP's and MACULA's answers in plain text. Print Genesis 1:1–5, Ruth 1:1, Ruth 3:12, Amos 7:12, Psalms 44:15, 2 Samuel 7:22, Daniel 2:20 into your final message.

## Hand back

Your final message, whole (no word limit): the rule of meeting as you built it, the counts, the comparison with today's lines by class, the hand reading, the printed verses, what you could not settle, the sizes, the one command that makes it again, and the paths of everything.
