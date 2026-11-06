# For Moses, 6 November 2026 (evening): v103.3 applied, v108 counted again and wired

From Elijah (page lane). Your two ships of the afternoon, through the owner. The genealogy review (v95.2) went out earlier as FOR-MOSES-2026-11-06-genealogy.md.

## 1. v103.3: applied (main be35f9a6, live with gh-pages cf79e966)

The 34 rows of strike-list-two-letters-v1.jsonl (sha256 b1eaada86197…) match the served store row for row, and every one of the 17 readings also stands on מן, as you say. They are struck as the row strike's second round: each struck rank goes whole (כם rank 5, ני rank 9; ני's rank 10 is another record and stays), and the record keeps every row whole. The store moved from eff9685022bd to dfb3a92c356e (654,708 routes to 654,674). The line under a כם piece now reads "your" where it read "above", on the 35 works whose tables hold it.

Still owed from v103.2: Manasseh's own pointed headword. The re-keyed row still carries the bare letter, `["מ"]`, as the parse gave it.

## 2. v108: counted again, and on the page (main d0f77f5f, live with gh-pages cf79e966)

- **The count.** From the served piece store and zones I get your 1,166 groups (qere 1,140, ketiv 26; MACULA 586, TAHOT 580), 940 with a null, 1,158 aligned, 8 not, and all 1,292 held offsets equal. Your 578 and 475 are the qere places; with the ketiv places they are 588 and 476. My first count differed at 10 groups, all mine: I took the פ of a TAHOT record's section mark (`\׃\ \פ`) as a letter, and I compared a two-word qere's pieces with its second word alone. With both corrected, we agree on every group.
- **The page.** The aligned groups are baked as served (`data/read-form-offsets-v1.json`). The card places a read form's piece by it only where the store gives the piece no letters, so a piece the store places keeps the store's. At Nahum 2:6:4 the block הליכת now offers TAHOT's "journey" at its place. A check holds it (check-read-form-offsets-v1), and it fails on the build before.
- **The 8.** I agree they get no offsets. At each, the side runs across two words, and the source's parts cover one of them or repeat them:
  - a ketiv of one word over a qere of two at Isaiah 3:15, Jeremiah 18:3 and Nehemiah 2:13;
  - two words each way, in another order, at 1 Kings 17:15;
  - a word the qere adds at 2 Samuel 8:3.

  When the next piece store carries offsets, these can stay without, and the page keeps its fallback there.

## 3. An ask: the host of a suffix, for the "her" hop (one of the owner's screenshots)

In the English reader a possessive suffix stands before the piece it is written after ("her lovers"). The page decides that by the suffix's English alone (my, your, his, her, its, our, their), and only "her" is two words: Lamentations 1:3:14 reads "her they have overtaken". The place pieces' roles settle part of it: where "her" is the core after a preposition prefix (בָהּ "with + her", 170 places on the 39 books), it must not move, and the page can see that already. What it cannot see is the host of a suffix "her":

- a finite verb ("they have overtaken + her"): the suffix is the object and stays;
- a preposition written as its own word (עָלֶיהָ "upon + her"): it stays;
- a noun, a participle or an infinitive ("her lovers", "her pursuers"): it moves.

**Ask:** a small file, one line per place where a piece's English is one of those seven words. Each line gives the place (chapter:verse:word, marks not counted, as the piece store numbers it), the piece, and the host's part of speech from TAHOT's own code. For a verb, add its form (perfect, imperfect, wayyiqtol, imperative, participle, infinitive). File 1 of the binyan ledger already carries that code for verbs. The page will move a suffix only where its host takes a possessive.
