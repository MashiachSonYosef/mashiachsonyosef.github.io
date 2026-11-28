import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
def sub(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:90], s.count(old)); s = s.replace(old, new)

# 1. presses open the card they always opened
lines = s.split("\n")
a = next(i for i, l in enumerate(lines) if l.startswith("    // THE PLACE CARD FOR A WORD OF THE BOOK (27 November 2026)."))
z = next(i for i, l in enumerate(lines) if l.startswith("    // A PAIR OPENS ON THE HALF ITS LINE READS FROM"))
assert "const openPlace = () => {" in "\n".join(lines[a:z]) and z - a < 20
lines[a:z] = []
s = "\n".join(lines)
sub("        if (placeHere()) { openPlace(); return; }\n", "", 2)
sub("      if (placeHere()) { openPlace(); return; }\n", "")

# 2. the pool's one source switch: poolFor asks the place answers for a card's pills while the place card stands
sub('''  const PLACE_ROWS = new WeakSet();
  const poolFor = async (surface, opts = {}) => {''', '''  const PLACE_ROWS = new WeakSet();
  // THE PLACE ANSWERS' PILLS (27 November 2026; the owner, on the card of Genesis 1:3 word 5: «you dont get to skip
  // R pills and compspan and selectable gloss just because we can play around with how the cards list off D/M»). On
  // a book that has place answers, with the older card's switch off (placeCardOn), the card is this card, frame and
  // all, and the pills a cell draws are what each source reads on that part of the word by its own address
  // (PLACE.pillsAt: THE PILLS, in placeCardOf), never rows matched by the cell's letters. This is the one place the
  // source of the pills changes: poolFor answers a card's asking (opts.pills) from the place answers of the word the
  // card stands on (placeOpen, set by openHud) and asks nothing else. A pill is one reading, credited to every source
  // that gives it, in the place answers' order (STEP, MACULA, UBS, the two BDB files, then the others); a source the
  // reader switched off gives none, and the card says so as it says it of any pool. A cell no source reads by its
  // own address has no pills, and the card says that in plain words (pool.placeWhy).
  const PLACE_PILLS = new WeakMap();   // a pill's row -> the place answers' pill it stands for (its source and address)
  const placePillM = (src) => (src === "step" ? (readingOfPiece("tahot") || {}).mId : src === "macula" ? (readingOfPiece("macula") || {}).mId
    : Object.keys((index && index.m_sources) || {}).find((id) => index.m_sources[id] && index.m_sources[id].key === src)) || null;
  const placePool = async (surface, opts) => {
    const pp = opts.piecePlace || null;
    let got = null;
    if (pp && placeOpen && placeOpen.doc) got = await PLACE.pillsAt(placeOpen.doc, pp.ref, pp.n, pp.reading, pp.a, pp.b, Number.isInteger(pp.t) ? pp.t : pp.b + 1);
    const groups = new Map(); let off = 0;
    for (const [i, x] of ((got && got.pills) || []).entries()) {
      const mId = placePillM(x.src);
      if (!mId || !index.m_sources[mId]) continue;
      if (sourcesOff.has(mId)) { off += 1; continue; }
      const row = [i, x.text, x.text, mId, null, null, []];
      PLACE_PILLS.set(row, x);
      // STEP's and MACULA's words at this place are the place's own reading, credited as the line credits them
      if (x.src === "step" || x.src === "macula") PLACE_ROWS.add(row);
      const key = readingKey(x.text); const g = groups.get(key);
      if (g) g.records.push(row); else groups.set(key, { text: x.text, year: Infinity, ledger: i, records: [row] });
    }
    return Object.assign([...groups.values()], {
      withheld: 0, withheldUnpointed: 0, withheldBySources: off, withheldByStem: 0, stems: [], rows: ((got && got.pills) || []).length,
      withheldByEntry: 0, entry: null, entryByLemma: false, withheldByName: 0, namesHeld: false, withheldHere: 0,
      withheldBySense: 0, sensesShown: 0, withheldByKind: [], kindsShown: 0, notes: [], signsLast: false, spanHeld: { otherwise: 0, silent: 0 }, spanAt: null,
      placeAnswers: true,
      // a cell the card asks for once though its letters stand twice in the division, or a cell of several words,
      // has no place of its own to read
      placeWhy: got ? got.why : pp ? "The card’s files did not answer here." : "No source reads this part by itself here: its letters stand twice in this division, or it spans several words, and the card asks for it once.",
    });
  };
  const poolFor = async (surface, opts = {}) => {
    if (opts.pills && placeOpen && placeOpen.gen === hudGen && (opts.bin || zone) === zone && placeCardOn()) return placePool(surface, opts);''')
sub('''    to.inParts = from.inParts;
    // and what a span place held back''', '''    to.inParts = from.inParts;
    // and whether the pool is the place answers', and what a cell of no reading says (THE PLACE ANSWERS' PILLS)
    to.placeAnswers = from.placeAnswers; to.placeWhy = from.placeWhy;
    // and what a span place held back''')
# the empty cell says why in plain words
sub('''          : pool && pool.inParts ? "No dictionary on this shelf gives this form whole. The readings of its parts are a press away."
          : pool ? "No displayable route in the catalog for this form." : "No exact route in the catalog for this form.";''',
'''          : pool && pool.inParts ? "No dictionary on this shelf gives this form whole. The readings of its parts are a press away."
          : pool && pool.placeAnswers ? pool.placeWhy || "No source reads this part by itself here."
          : pool ? "No displayable route in the catalog for this form." : "No exact route in the catalog for this form.";''')

# 3. openHud: the card is today's card; its place answers are fetched before its frame, its listing stands under it
sub('''    const placeT0 = opts.place ? performance.now() : 0;
    hud.classList.toggle("place", !!opts.place);''', '''    const placeOn = (opts.bin || zone) === zone && !!(opts.word || region) && !(opts.word || region).mark && placeCardOn();
    const placeT0 = placeOn ? performance.now() : 0;
    placeOpen = null;
    hud.classList.toggle("place", placeOn);''')
lines = s.split("\n")
a = next(i for i, l in enumerate(lines) if l.startswith("    // THE PLACE CARD'S BODY. The head above is this page's"))
z = next(i for i, l in enumerate(lines) if l.startswith("    const span = spanOf(bin, region.k) || (bin === zone ? placeSpan(opts.word || word, region.k) : null);"))
old = "\n".join(lines[a:z])
assert "if (opts.place) {" in old and "PLACE.draw(body, doc, at.v, at.e" in old
new = '''    // THE PLACE ANSWERS UNDER TODAY'S CARD (27 November 2026). On a book that has place answers, with the older
    // card's switch off, the card is today's card in every part of its frame, and its pills come from the place
    // answers (poolFor's placePool), so the chapter's file is fetched before the frame asks for a cell. Under the
    // frame stands the listing (placeCardOf's draw): what each source says at this very word and each dictionary's
    // own entry, the record of where each pill comes from. The word's place is named as the card's files name it:
    // this book, the chapter its section stands in, the verse's label, and the word's place among the verse's
    // entries with the marks counted (wordPos, as every tool of the tree counts them).
    let placeAt = null;
    if (placeOn) {
      const sec = el && el.closest ? el.closest("section.seg") : null;
      const s = sec && sec.__sec ? sec.__sec : null;
      const node = s && Array.isArray(zone.nodes) ? zone.nodes[s.node] : null;
      const chapterNo = node && Number.isInteger(node.num) ? node.num : s ? Number(String(s.label).split(":")[0]) : NaN;
      window.__placeCard.open = { label: s ? s.label : null, i: wordPos, chapter: chapterNo, drawn: false };
      let doc = null;
      try { doc = await PLACE.chapter(BOOK, chapterNo); }
      catch (e) {
        window.__placeCard.faults.push(String((e && e.message) || e));
        if (myGen === hudGen) { status.textContent = "What the sources say here did not arrive. Press the word again to ask once more."; placeHud(); }
        return;
      }
      if (myGen !== hudGen) return;
      placeOpen = { doc, gen: myGen };
      placeAt = s && wordPos != null ? PLACE.entryAt(doc, s.label, wordPos) : null;
      if (s && wordPos != null && !placeAt) window.__placeCard.faults.push(`no word at ${s.label} entry ${wordPos}`);
    }
'''
lines[a:z] = new.split("\n")
s = "\n".join(lines)
sub('''    hud.replaceChildren(...(opts.back ? [backButton(opts.back)] : []), head, now, rows, dSlot, partsSlot, hohSlot, volSlot, prov);''',
'''    hud.replaceChildren(...(opts.back ? [backButton(opts.back)] : []), head, now, rows, dSlot, partsSlot, hohSlot, volSlot, prov);
    // the listing under the frame (THE PLACE ANSWERS UNDER TODAY'S CARD, above)
    if (placeAt) {
      const listing = document.createElement("div"); listing.className = "place-card";
      hud.append(listing);
      PLACE.draw(listing, placeOpen.doc, placeAt.v, placeAt.e, () => myGen === hudGen);
      window.__placeCard.open.drawn = true;
      window.__placeCard.times.push({ label: window.__placeCard.open.label, i: wordPos, ms: performance.now() - placeT0 });
    }''')
# a card on a book with place answers is built again under the reader as today's card is
sub('''    // a place card draws nothing from a file that lands (the pointer map, the default sources): it is not built
    // again under the reader, so an entry opened in it stays open and the sheet does not move
    if (hud.classList.contains("place")) return;
''', "")
# the sheet: the frame keeps its own size, the listing takes what is left and scrolls inside itself
sub('''  #hud > .place-card { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding-bottom: 0.6rem; }''',
'''  #hud > .place-card { flex: 1 1 0; min-height: min(8rem, 18vh); overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding-bottom: 0.6rem; border-top: 1px solid var(--bronze-dim); margin-top: 0.4rem; padding-top: 0.3rem; }
  #hud.place > .rows { flex-grow: 0; }''')
open(p, "w", encoding="utf-8").write(s)
