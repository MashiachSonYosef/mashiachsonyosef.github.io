# RULE: answers v1 (relay v194)

14 November 2026 AD. Corpus lane (Moses). Written before the scripts, so a second count can be made from these words alone. Nothing served is changed: everything here is a list or a count for the serving lane and the owner to read.

## Where the figures come from

Earlier on 14 November a seat of the lane investigated each question, and a second seat tried to refute the first. Their folders are named here by their own names: `A3b-steps-letters-on-strongs-numbers` (STEP's letters), `C4-names-rows-not-listed-and-unread-sources` (names), `D8-jastrow-stem-names-without-family` (stems), each with a `-verify` folder beside it. Every figure the letter uses is read from a file of those folders, or from the serving lane's own letters (`../inputs-r1-13nov/`, `../inputs-r1/`), or counted here. No figure is typed. Where the second seat corrected the first, the corrected figure is the one used, and the evidence file says which file it came from.

A file is named in every record by its folder and file name, with its sha256. A file of this machine is named by a placeholder: `<the Tabernacle>/...` or `<999 footsteps>/...` for the two working folders, `<given> <folder>/<file>` for a seat's file or a copy. No record holds a path of this machine or the name of its home folder.

## 1. The evidence (`evidence-v1.json`)

Each figure has an id, a value, the file it came from and that file's sha256. The gatherer stops when:
- a file is missing, or a figure is not where it is read from;
- two files that measure the same thing disagree. The pairs held: the first seat's and the second seat's ruling-6 measure; the first seat's and the second seat's count of TBESH's G entries and the 166 numbers; the first seat's and the second seat's stem footprint for each draft; the names seat's hold against the store and the second seat's.

**Terms for STEP's letters.** A TBESH entry is a line of STEP's brief lexicon that starts with H and four digits. Its first column is its OpenScriptures number (small letters after the digits are OpenScriptures' own scheme); its second column, before " =", is STEP's own number, where a capital after the digits is STEP's own letter. "Lettered H to Z" means STEP's own letter is a capital from H to Z, or a small letter (STEP's run past its capitals: H2148v to z, H4918y, H5838w to z). Its relation is the words after "=" in that column ("a Meaning of", "a Name of", and so on). STEP's own early lines are the entries whose STEP letter is A to F and is not the capital of the OpenScriptures small letter on the same line (14 lines). Each is classed by its gloss and relation: a relation "a Meaning of" is a verb meaning; the gloss Helech is a place; the glosses Zechariah and Shemaiah are people. The gatherer stops if any of the 14 is left unclassed.

**TBESH wins its own definition** where the live route of a TBESH pair names M19 as its credited source. The pair is **shared** when the catalog holds more than one source for that key and text.

**The bare row of 3.6** is TAHOT's row under המלאכים whose entries carry H4397 with no letter. Its own line is the one place where TAHOT tags H4397 with no letter; the gatherer finds it in the lattice of 2 Samuel and stops unless it is one place, 11:1, under that key.

**Terms for names.** A source **marks names** when its own data says, row by row, that an entry is a name (a part of speech, a grammar code, a class). A source **marks no names** when it has no such field at all; its rows are **unmarked**. The sources that mark no names are those whose every row in the names seat's tally is unmarked: ConceptNet (both licences), PanLex (both files), MUSE, the Wikipedia titles, Lexibank and Kethoneth. The gatherer stops if any of these has a row of another class, or if another source has only unmarked rows. TBESH's gentilic rows are its served rows whose own part of speech is a name code ending in G. *(This sentence is replaced by the second amendment, section 6.)*

**Terms for stems.** The map is the page's stem family map as the seat copied it (31 names). A **head** is a name the map points at. A **pair** is a row and a verb place of the 39 books whose lattice v12 position offers the row's key; it moves from "another stem" to "same family" under a draft when the two sides share no family now and share one under the draft. Pairs are counted once each, by source, key, rank, book and place.

**The stem-name rows** are the Jastrow overlay rows whose English is only a stem's name. The seat's file holds 441; four route texts its pattern caught are words, not stem names (Ithra, Ithi, Ishtitha, Nithza), and their rows are left out.

## 2. The names addendum (`names-v177-addendum-v1.jsonl`)

**What it is.** The names gate v1 (relay v177) counted 26 rows it did not list: 22 rows that are partly a name (their own source gives some of the entries they reach as a name and some not) and 4 rows it did not reach (rows the row strikes landed, which the catalog does not hold). The serving lane can hold its own counts against them. The gate's rule for them does not change: such a row is not a name row, so it stands where it stands now.

**Each line** is the seat's line in the shape of `name-rows-v1.jsonl` (`k`, `rank`, `m`, `sha`, `entries`) with: `kind` (`partly a name` or `not reached`); `name_part` and `not_name_part`, as the source's own marks; `catalog_rows`; `route` and `definition`, the row's two texts as the store serves them now; and `held_on_store_now`.

**Reading clause, the M23 rows.** In five lines of the dictionary of classical Hebrew (M23) the other side is a record whose part of speech is empty. The seat wrote it as `part_of_speech  (record:...)`. Here it is written `no part of speech given (record:...)`: the source says nothing of those records, so they are not common words. The builder stops unless exactly five lines change, all of M23.

**Held on the store now.** A line is held when the store copy of store_version 4d1357b26ca5 has, under the line's key, a row with the line's rank and m id, whose route text's sha256, first 16 hex characters, is the line's `sha`, and whose route text is the seat's text, or begins with it where the seat cut its text at 120 characters. A line not held stops the build. The status written is `same key, rank, m and text`.

## 3. The made-spaces count (`made-spaces-v188-count-v1.json`)

**The landed texts** of a source are the distinct texts over the route and the definition of v188's landing lines of that source (M9, M5, M46, M14). **A list now** is that source's made-spaces list: M9 `openscriptures_strongs.made-spaces-v1.jsonl`, M5 `openscriptures_bdb_1906.made-spaces-v1.jsonl`, M46 `unabridged_bdb_1906.made-spaces-v2.jsonl`; M14 has none yet *(these words are replaced by the second amendment, section 6: M14 has no list because none of its definitions holds a made space)*. A text is **in a list** when it equals, byte for byte, the `text` of a line of its source's list; that is text membership only. The lists' own rule (a space where the provider's file holds a tag and no space) is not run here: it needs the provider's fields, and the addendum will run it.

Two things are counted beside membership, each named as what it is:
- **a part on a close**: a route text in no list that stands inside its own line's definition text, where that definition is in the list and one of its closes falls inside the route's stretch. By the lists' own part rule such a route takes those closes, so it holds a made space and is in no list.
- **the sign**: a text in no list that holds a space before , ; . : ? ! ) ] or after ( [. Made spaces leave this sign; so do some of the provider's own spaces. It is a sign, not the rule.

`made-spaces-v188-texts-in-no-list-v1.jsonl` lists each text in no list, by source, with its fields, the sign, and the part test.

## 4. The stem amendment (`stem-family-amendment-v1.txt`)

The seat's draft lines, with the second seat's corrections: the map holds 31 names pointing at 8 heads; ittaphal and nittaphal are a well-grounded reading and not certain, so five lines are certain and six are readings; the counts are after duplicated pairs are removed; option B's pairs are named by place. The figures in it are read from `evidence-v1.json` by its writer.

**Amended after the first run, 14 November 2026 AD.** Three reading clauses were added for figures the first run showed the letter needs; no figure already counted moved:
- *An ittaphal entry gives an Af.* when one of its senses is filed under the stem Af., or a sense's text names "Af.". The entries are those the rows naming ittaphal cite in the seat's line file.
- *A pair brings a reading of an Aramaic entry onto a Hebrew place* when the row's entry, as the seat's line file cites it, is read as Aramaic in the seat's entries file, and the place stands outside the Aramaic chapters: Daniel 2:4 to 7:28, Ezra 4:8 to 6:18 and 7:12 to 26, Jeremiah 10:11.
- *The stem-name examples* are the two route texts most rows of the stem-name rows print.

## 5. Checks, each a hard stop

1. Every input file exists and its sha256 is recorded.
2. Every figure is found where the evidence says, and every pair of files that measure the same thing agree (section 1).
3. Every one of the 26 rows is held on the store now; exactly five M23 lines change their wording.
4. The made-spaces count adds up: per source, landed texts = in a list + in no list.
5. No file written holds a path of this machine (a drive letter and Users) or the home folder's name.
6. The second count (`verify-answers-v1.mjs`) agrees: the 26 rows from the seat's earlier files and the store read by each key's own shard; the stem pairs of draft A from the seat's pair file with duplicates removed, by the map lines as the amendment file writes them; the made-spaces count by another loop; STEP's letters from the seats' tables. It writes `agree` true or exits with an error.
7. Two runs with the same inputs give the same bytes.

## 6. The second amendment

**Amended after the second seat's check, 14 November 2026 AD.** A second seat checked this build and found four things to mend. Each changes a term or a reading clause, written here. The words they replace stay above, marked.

- *TBESH's gentilic rows* are its served rows whose own part of speech carries LG or PG, as TBESH's own key says: "LG/PG=Gentilic, T=Title". This replaces "a name code ending in G". TBESH's rows coded TG are counted apart, as **TG rows**. Its key does not name that code; the rows are groups, such as the Rephaim. The gatherer stops unless the gentilic rows and the TG rows, together, are the rows whose name code ends in G (the first run's count), and unless TBESH's head holds those words.
- *M14, the Wikisource Strong's,* has no made-spaces list because the lane's v2 receipt (relay v178) found no made space in any of its definitions: `fields_with_a_made_space` is 0 of the fields read, and `list` is null. This replaces "M14 has none yet". So none of M14's landed texts holds a made space, and **the texts the addendum judges** are the texts in no list of M9, M5 and M46 only. The gatherer takes the v2 receipt and relay v178 as inputs and stops unless both say so.
- *MACULA's letters are counted on two axes.* **Word pairs** are the first seat's count: words where MACULA and STEP both carry an early letter, as pairs that agree or differ. **Once each side** is the second seat's count: each word read once on MACULA's side and once on STEP's. The kinds of difference (MACULA's own headword is the form of STEP's letter; of MACULA's letter; the form cannot tell; neither form; the number has no OpenScriptures letters) are kinds of the once-each count only, and the relay says so. The gatherer stops unless the five kinds add up to the words that differ, read once each side.
- *The sign* is named in the relay as section 3 has it: a space before a stop or a closing bracket, or after an opening one.

The relay also says plainly that the row entries rule's sentence on small letters was the lane's error, and its opening map names where items 1 and 4 of the made-spaces letter stand. The relay's generator stops unless the serving lane's letters hold the places and items it names. The second count (check 6) also recounts TBESH's gentilic and TG rows, by splitting each served TBESH row's name code at its dashes and reading the last part.
