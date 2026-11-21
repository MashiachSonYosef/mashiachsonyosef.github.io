# Ship 11d: the bridge check's page law said the card at a named place stands on the line's whole reading, one pill
# pressed, STEP's row behind it. That is not what the page owes: a card of a place the line reads in pieces opens on
# the place's own division with its core block pressed (core-block-rule-v1), says the place's reading above the
# pills, and the pills are the block's own. The law is written to the page's rule.
import sys, io
p = sys.argv[1]
s = io.open(p, encoding="utf-8").read()

old_head = """//   B5  on the page as a first visit opens it, in each book the pin names a
//       reading of: the line under every laid place of the book is its
//       pieces, and the card opened on a named place stands on the same
//       reading, one pill pressed, with STEP's row behind it
"""
new_head = """//   B5  on the page as a first visit opens it, in each book the pin names a
//       reading of: the line under every laid place of the book is its
//       pieces; and the card opened on a named place stands on the place's
//       own division with its core block pressed, says the place's reading
//       above its pills as the line prints it, under the pieces' credit,
//       and presses the line's own piece for the block where a pill of the
//       block reads it, the block's first pill where none does
//       (core-block-rule-v1: a piece alone is the dictionaries')
"""
assert s.count(old_head) == 1
s = s.replace(old_head, new_head)

a = s.index("      // then the card of each named place, opened by a press on its word\n")
b = s.index("    }\n  } finally { await browser.close(); await tree.close(); }\n")
new_cards = """      // then the card of each named place, opened by a press on its word. A
      // card of a place the line reads in pieces opens on the place's own
      // division with its core block pressed (core-block-rule-v1, the owner,
      // 14 November 2026): the place's reading is said above the pills, whole,
      // as what the pieces' source reads here, and the pills are the block's
      // own, the dictionaries'. So the pill pressed is the line's own piece
      // for the block where a pill of the block reads it, and the block's
      // first pill where none does (I Samuel 26:7: no dictionary reads the
      // block as STEP's piece does)
      for (const r of NAMED.filter((e) => e.book === book)) {
        const x = list.find((y) => y.place.place === r.place);
        if (!x) { faults.push(`${book} ${r.place}: the named place is not laid`); continue; }
        let cards = null;
        try { cards = await readCards(browser, tree.base, book, "rest", { from: x.found.si, to: x.found.si + 1 }); } catch (e) { faults.push(`${book} ${r.place}: ${String(e.message || e).split("\\n")[0].slice(0, 160)}`); continue; }
        const card = ((cards.sections[0] || {}).cards || []).find((c) => c.e === x.found.at);
        if (!card) { faults.push(`${book} ${r.place}: no card was read for the word`); continue; }
        const want = drawn(x.place), pcs = x.place.pieces, parts = want.split(" + ");
        const core = pcs.reduce((a, q, i) => (q.r === "core" ? (a === -1 ? i : -2) : a), -1);
        if (core < 0 || parts.length !== pcs.length) { faults.push(`${book} ${r.place}: ${core === -1 ? "none of its pieces is the core piece" : core === -2 ? "more than one of its pieces is the core piece" : `its line «${want}» does not part as its ${pcs.length} pieces do`}, and the block its card opens on cannot be told`); continue; }
        const cut = card.divisions && card.divisions.on.length === 1 ? card.divisions.of[card.divisions.on[0]] : null;
        const block = card.blocks && card.blocks.on.length === 1 ? card.blocks.on[0] : -1;
        const said = (card.here || []).filter((h) => h[0] === "here");
        const pills = card.pills || [], pressed = pills.filter((q) => q[3] === 1);
        const fold = (t) => String(t).toLowerCase();
        const own = pills.find((q) => fold(q[0]) === fold(parts[core])) || null;
        const owed = own || pills[0] || null;
        if (cut !== pcs.map((q) => q.k).join(" + ") || block !== core || ((card.blocks || {}).of || [])[core] !== pcs[core].k) faults.push(`${book} ${r.place}: the card opens on ${cut ? `the division ${cut}` : "no one division"}${block >= 0 ? `, block ${block + 1}` : ", no one block pressed"}, and the place's pieces are ${pcs.map((q) => q.k).join(" + ")}, the core piece the ${core + 1}${["st", "nd", "rd"][core] || "th"}`);
        else if (said.length !== 1 || said[0][1] !== want || said[0][2] !== CREDIT) faults.push(`${book} ${r.place}: above its pills the card says ${said.map((h) => `«${h[1]}» (${h[2] || "no credit"})`).join(" and ") || "no reading of the place"}, and the line reads «${want}» (${CREDIT})`);
        else if (owed ? pressed.length !== 1 || pressed[0] !== owed : pressed.length !== 0) faults.push(`${book} ${r.place}: the card stands on ${pressed.map((q) => `«${q[0]}»`).join(" ") || "no reading"}, and ${own ? `a pill of the block reads the line's own piece «${parts[core]}»` : owed ? `the block's first pill is «${owed[0]}», no pill of it reading the line's piece «${parts[core]}»` : "the block has no pill"}`);
        else read.cards.push(`${(readZone(book) || {}).work || book} ${x.place.ref} «${want}» said above, ${own ? `the line's piece «${own[0]}» pressed` : owed ? `the block's first «${owed[0]}» pressed, no dictionary reading the block «${parts[core]}»` : "the block without a pill"}`);
      }
"""
s = s[:a] + new_cards + s[b:]

old_title = "the line under every laid place of the book is its pieces, and the card opened on a named place stands on the same reading, one pill pressed, with STEP's row behind it\","
new_title = "the line under every laid place of the book is its pieces, and the card opened on a named place stands on the place's own division with its core block pressed, says the place's reading above its pills, and presses the line's own piece where a pill of the block reads it, the block's first where none does\","
assert s.count(old_title) == 1
s = s.replace(old_title, new_title)
old_ok = "`${read.lines} lines in ${books.length} books are their place's pieces · the cards stand on them: ${read.cards.join(\" · \")}`"
assert s.count(old_ok) == 1
s = s.replace(old_ok, "`${read.lines} lines in ${books.length} books are their place's pieces · the cards: ${read.cards.join(\" · \")}`")
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("patched", p)
