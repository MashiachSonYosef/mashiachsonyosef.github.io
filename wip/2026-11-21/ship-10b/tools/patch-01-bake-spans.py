# Ship 10b, patch 1: tools/bake-default-picks-v1.mjs lays each source's units of the corpus lane's spans list (relay
# v209) in the book's file, each proved against the picks the bake has just read, and says them in its receipt.
import sys, io
p = sys.argv[1] + "/tools/bake-default-picks-v1.mjs"
s = io.open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80])
    s = s.replace(a, b)

rep('''import { printedForm, routePrinted, signsOff } from "./gloss-store-v1.mjs";
''', '''import { printedForm, routePrinted, signsOff } from "./gloss-store-v1.mjs";
import { readDefaultSpans, unitsOfBook, SPAN_SOURCES, DEFAULT_SPANS_RULE_ID, DEFAULT_SPANS_HOME } from "./default-spans-v1.mjs";
''')

# the header: what is written
rep('''//     bdb_words: [ each BDB record's highlighted words, once per record ],
//     places: [ for WORD_N n at places[n - 1]: null at a mark or where no
//               source picks, else [step, macula, ubs, bdb] ] }
''', '''//     bdb_words: [ each BDB record's highlighted words, once per record ],
//     places: [ for WORD_N n at places[n - 1]: null at a mark or where no
//               source picks, else [step, macula, ubs, bdb] ],
//     spans: { rule_id, macula: [...], ubs: [...], bdb: [...] }: where the
//               tree pins the corpus lane's spans list (relay v209,
//               data/default-picks/spans-v1/PIN.json), each source's units
//               of two or more words its first pick's line reads, as
//               [[n, ...the unit's words], [n, ...where the line is filed]]
//               in the order of their first word (tools/default-spans-v1.mjs
//               says which lines land); absent where the tree pins none }
''')

# the spans are read once, before the books
rep('''  // per first source, its pills and its second's where the line is theirs, by what prints their words
  const picksPrinted = Object.fromEntries(IDS.map((x) => [x, {}]));
  const books = [];
''', '''  // per first source, its pills and its second's where the line is theirs, by what prints their words
  const picksPrinted = Object.fromEntries(IDS.map((x) => [x, {}]));
  const books = [];
  // THE WORDS A SOURCE'S LINE READS (default-spans-rule-v1): the corpus lane's spans list, where this tree pins it,
  // read beside the default picks only as the bytes its pin names
  const spansPin = join(dirname(pinPath), "spans-v1", "PIN.json");
  let spansRead = null;
  try { spansRead = readDefaultSpans(spansPin, ledger); } catch (e) { if (e instanceof PinFault) throw new Refused(`the spans list: ${e.message}`); throw e; }
  const spanCount = Object.fromEntries(SPAN_SOURCES.map((x) => [x, { lines: 0, units: 0, words: 0, nested: 0, filed_beside: 0, filed_with_a_line: 0 }]));
''')

# per place: the first pick of each source, by its own id
rep('''    const lineBits = new Uint8Array(entries.length);
    const stepWordsAt = new Uint8Array(entries.length);
''', '''    const lineBits = new Uint8Array(entries.length);
    // each source's first pick at a place, by the id its ledger gives it (a span line is proved to be that pick)
    const firstPick = new Array(entries.length).fill(null);
    const stepWordsAt = new Uint8Array(entries.length);
''')
rep('''      const slots = [stepSlot.length ? stepSlot : 0, macWords || 0, ubsPicks.length ? [ubsLine || 0, ubsPicks] : 0, bdbSlot.length ? bdbSlot : 0];
      places[n - 1] = slots.every((s) => s === 0) ? null : slots;
''', '''      const slots = [stepSlot.length ? stepSlot : 0, macWords || 0, ubsPicks.length ? [ubsLine || 0, ubsPicks] : 0, bdbSlot.length ? bdbSlot : 0];
      places[n - 1] = slots.every((s) => s === 0) ? null : slots;
      firstPick[n - 1] = {
        macula: !!mac,
        ubs: new Map(pieces.filter((pc) => Array.isArray(pc) && Array.isArray(pc[2]) && Array.isArray(pc[2][0])).map((pc) => [pc[0], pc[2][0][1]])),
        bdb: Array.isArray(b[0]) ? [b[0][1], b[0][2]] : null,
      };
''')

# the book's units, each line proved, laid by WORD_N
rep('''    const labels = placeAt.map((i) => entries[i].label);
    const bookFile = {
      schema_version: "DEFAULT_PICKS_BOOK_V1",
      rule_id: DEFAULT_PICKS_RULE_ID,
      book,
      zone: { entries: entries.length, places: placeAt.length, places_sha256: sha256(Buffer.from(labels.join("\\n"), "utf8")) },
      ledger: { file: o.file, sha256: o.sha256, mend_places: mendPlaces, store_read: ((in12.page_store || {}).store_version) || null, store_resolved: storeIx.store_version || null },
      bdb_words: bdbWords,
      places,
    };
''', '''    const labels = placeAt.map((i) => entries[i].label);
    // THE UNITS OF THE SPANS LIST (default-spans-rule-v1), by WORD_N. Every line that lands is proved to be the pick
    // this bake has just read at its place: MACULA's pick, UBS's first pick of the piece the line names by that
    // meaning's id, BDB's first pick by its record and meaning. A line that is not refuses the book
    let spansOut = null;
    if (spansRead) {
      const nOf = new Map(placeAt.map((i) => [entries[i].label, i + 1]));
      const spanLines = spansRead.byBook.get(book) || [];
      for (const r of spanLines) {
        const n = nOf.get(r.p), fp = n ? firstPick[n - 1] : null;
        if (!fp) { refuse(`${book} ${r.p}: the spans list files a line of ${r.source} at a place the zone does not hold`); continue; }
        const ok = r.source === "macula" ? fp.macula
          : r.source === "ubs" ? typeof r.piece === "string" && fp.ubs.get(r.piece) === r.id
            : Array.isArray(r.id) && Array.isArray(fp.bdb) && fp.bdb[0] === r.id[0] && fp.bdb[1] === r.id[1];
        if (!ok) refuse(`${book} ${r.p}: the spans list's line of ${r.source} (${JSON.stringify(r.id)}) is not that source's first pick at the place as the default picks give it`);
      }
      let units = null;
      try { units = unitsOfBook(book, spanLines, nOf); } catch (e) { if (!(e instanceof PinFault)) throw e; refuse(e.message); }
      if (units) {
        spansOut = { rule_id: DEFAULT_SPANS_RULE_ID };
        for (const x of SPAN_SOURCES) {
          spansOut[x] = units[x].units.map((u) => [u.places.map((p) => nOf.get(p)), u.filed.map((p) => nOf.get(p))]);
          const c = spanCount[x];
          c.lines += units[x].lines; c.units += units[x].units.length; c.nested += units[x].nested; c.filed_beside += units[x].filed_beside;
          c.words += units[x].units.reduce((a, u) => a + u.places.length, 0);
          c.filed_with_a_line += units[x].units.filter((u) => u.filed.some((p) => has1(nOf.get(p), x))).length;
        }
      }
    }
    const bookFile = {
      schema_version: "DEFAULT_PICKS_BOOK_V1",
      rule_id: DEFAULT_PICKS_RULE_ID,
      book,
      zone: { entries: entries.length, places: placeAt.length, places_sha256: sha256(Buffer.from(labels.join("\\n"), "utf8")) },
      ledger: { file: o.file, sha256: o.sha256, mend_places: mendPlaces, store_read: ((in12.page_store || {}).store_version) || null, store_resolved: storeIx.store_version || null },
      bdb_words: bdbWords,
      places,
      ...(spansOut ? { spans: spansOut } : {}),
    };
''')

# the receipt says them
rep('''    hebrew_in_carried_texts: C.hebrew_in_texts,
    books: perBook,
''', '''    hebrew_in_carried_texts: C.hebrew_in_texts,
    ...(spansRead ? { spans: {
      rule_id: DEFAULT_SPANS_RULE_ID,
      what: "the words each source's line reads, from the corpus lane's spans list (relay v209), laid in each book's file as spans: per source, the units of two or more words its first pick's line reads, each with the words it is filed at, by WORD_N. Every line that lands was proved to be the pick the bake read at its place. filed_with_a_line counts the units some filed place of which has a line of the source, which are the units the page can print; the others are laid and inert",
      pin: { file: `${DEFAULT_SPANS_HOME}/PIN.json`, sha256: sha256(readFileSync(spansPin)), relay: spansRead.pin.relay, list: { file: spansRead.pin.spans.file, bytes: spansRead.pin.spans.bytes, sha256: spansRead.pin.spans.sha256, lines: spansRead.pin.spans.lines } },
      lines_by_class: spansRead.classes,
      by_source: spanCount,
    } } : {}),
    books: perBook,
''')
io.open(p, "w", encoding="utf-8").write(s)
print("patched", p)
