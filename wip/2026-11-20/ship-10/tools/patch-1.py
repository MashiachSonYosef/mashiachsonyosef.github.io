import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:80])
    s = s.replace(old, new)

# A. the switch rests at "as separate words"; ?maqaf= for one load
rep('''  // ledger". Both rest at the page's own default (the chain as written, the
  // entry's own runs) until a reader moves them; the book's file is fetched
  // the first time a switch leaves the default.
  const MAQAF_JOIN_KEY = "fh.maqaf-join", RUNS_KEY = "fh.runs";
  let maqafJoin = (() => { try { return localStorage.getItem(MAQAF_JOIN_KEY) === "pieces" ? "pieces" : "maqaf"; } catch { return "maqaf"; } })();
''', '''  // ledger". Where each rests is said below (the chain as separate words,
  // the license runs off); the book's file is fetched the first time a
  // switch needs its runs.
  // RULE: words-stand-alone-rule-v1-at-rest-each-word-is-its-own-cell-and-card-and-a-joined-cell-stands-only-where-a-dictionary-that-stands-files-it
  // THE WORDS STAND ALONE AT REST (the owner, 20 November 2026, of the run
  // cards once the twelve stood alone: «part of the strip down to 12 might
  // as well just be follow their convention to not do run words at all i
  // assume and we add those when we add other dictionarys that allow it
  // carefully if it actually makes sense, vs shotgunning them all in and
  // slowly pruning out»). The twelve read word by word, so at rest the
  // stroke joins nothing here: each word of a chain is its own cell with its
  // own line and opens its own card, with every gate a word's card has; the
  // stroke stays in the text on the word that carries it. The switch rests
  // at «as separate words»; a reader may still join the chains («as
  // written»), kept on this device, and ?maqaf= sets it for one load (the
  // checks ask it). What a dictionary that stands does file over two words
  // stays one cell: a place of the span store where a row of it stands
  // (spanCardsOf). And a card that does stand on a run asks each of the
  // run's words as its own word (runWordAsked).
  const MAQAF_JOIN_KEY = "fh.maqaf-join", RUNS_KEY = "fh.runs";
  const maqafAsked = ["maqaf", "pieces"].includes(QUERY.get("maqaf")) ? QUERY.get("maqaf") : null;
  let maqafJoin = maqafAsked || (() => { try { return localStorage.getItem(MAQAF_JOIN_KEY) === "maqaf" ? "maqaf" : "pieces"; } catch { return "pieces"; } })();
''')

# B. no file asked for where no run of it is laid
rep('''      if (name) { const f = await hudTogglesReady(); cards = f ? hudCardsOf(name) : hudRunCards; }
''', '''      // with the license runs off no run of the book's file is laid (below),
      // so the file is not asked for
      if (name && runsPref !== "off") { const f = await hudTogglesReady(); cards = f ? hudCardsOf(name) : hudRunCards; }
''')

# C. a place of the span store is a cell only where a row of it stands
rep('''      const out = [], skipped = [];
      if (!SPAN_BOOK || !Array.isArray(SPAN_BOOK.placesList)) return { cards: out, skipped };
''', '''      const out = [], skipped = [], rested = [];
      if (!SPAN_BOOK || !Array.isArray(SPAN_BOOK.placesList)) return { cards: out, skipped, rested };
''')
rep('''        if (!sec) { skipped.push({ ...pl, why: "no section" }); continue; }
        const numbered = []; let n = 0;
''', '''        if (!sec) { skipped.push({ ...pl, why: "no section" }); continue; }
        // THE WORDS STAND ALONE AT REST (words-stand-alone-rule-v1): on a
        // book baked at rest, while the dictionaries that rest shut are
        // shut, a place is a cell only where a row of it stands, the row a
        // joined line reads (spanLineRow): of a dictionary that does not
        // rest shut and that no switch has off, no pointer, and not held
        // back by the place under «only this pointing». Elsewhere its words
        // are words, each its own cell and card. The place is counted
        // (rested), and is a cell again once the reader opens the
        // dictionaries that rest shut
        if (kindsHere && kindsPref === "shut" && !spanLineRow(pl.key, pl, masorah === "only")) { rested.push(pl); continue; }
        const numbered = []; let n = 0;
''')
rep('''      return { cards: out, skipped };
''', '''      return { cards: out, skipped, rested };
''')
rep('''      window.__spanStore = { places: SPAN_BOOK ? SPAN_BOOK.places : 0, cards: spans.cards.length, laid: laidSpans, skipped: spans.skipped };
''', '''      window.__spanStore = { places: SPAN_BOOK ? SPAN_BOOK.places : 0, cards: spans.cards.length, laid: laidSpans, skipped: spans.skipped, rested: spans.rested.length };
''')

# C2. the dictionaries that rest shut, opened or shut: the cells laid again, once no card stands open
rep('''  let reopenForKinds = () => {};          // the switch answered on the page (set after the sections' relay, below)
''', '''  let reopenForKinds = () => {};          // the switch answered on the page (set after the sections' relay, below)
  let lanesOwed = false;                  // the cells are to be laid again once no card stands open (payLanes)
''')
rep('''    reopenCard();
    // the focus the card's press asked for is the card's built again here,
''', '''    reopenCard();
    // THE CELLS FOLLOW THE SWITCH (words-stand-alone-rule-v1): a place the
    // span store names is a cell where a row of it stands, and which rows
    // stand moved with this switch. The lanes are laid again; the built
    // sections are laid again into them at once where no card stands open,
    // and otherwise when the reader closes the card (payLanes), so a press
    // of the card's own switch keeps its card
    if (HUD_LANES.lay) {
      const was = window.__spanStore ? window.__spanStore.rested || 0 : 0;
      HUD_LANES.lay().then(() => { if (was || (window.__spanStore && window.__spanStore.rested)) { lanesOwed = true; payLanes(); } });
    }
    // the focus the card's press asked for is the card's built again here,
''')
rep('''  HUD_LANES.relaySections = relayBuiltSections;
''', '''  HUD_LANES.relaySections = relayBuiltSections;
  payLanes = () => { if (!lanesOwed || activeEl) return; lanesOwed = false; relayBuiltSections(); };
''')
rep('''  let lanesOwed = false;                  // the cells are to be laid again once no card stands open (payLanes)
''', '''  let lanesOwed = false;                  // the cells are to be laid again once no card stands open (payLanes)
  let payLanes = () => {};                // lays them, where they are owed and no card stands open (set beside the relay)
''')
rep('''    if (hud.contains(e.target) || e.target.closest(".wb") || e.target.closest("#rail")) return;
    closeHud();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeHud(); });
''', '''    if (hud.contains(e.target) || e.target.closest(".wb") || e.target.closest("#rail")) return;
    closeHud(); payLanes();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeHud(); payLanes(); } });
''')

# D. a run's words asked as their own words
rep('''  let openName = null;                  // whether that place is a name; null where the card stands at no place of the book
''', '''  let openName = null;                  // whether that place is a name; null where the card stands at no place of the book
  let openRunWords = null;              // the words of the run the open card stands on (a chain's, a named run's), or null
''')
rep('''  const askedWord = (surface, named = null) => (named
    ? (named.s && surface && surface === named.k ? { pointed: named.s, verse: named.v ?? null, tags: named.tg ? [].concat(named.tg) : null, name: typeof named.name === "boolean" ? named.name : null } : NO_WORD)
    : (openPointed && surface && surface === openKey ? { pointed: openPointed, verse: openVerse, tags: openTags, name: openName, lemma: openByLemma }
      : surface && surface !== openKey && openPlaceWord ? { pointed: null, verse: null, tags: coreTagsAt(openPlaceWord, surface), name: openName } : NO_WORD));
''', '''  // A RUN'S WORDS ARE ASKED AS THEIR OWN WORDS (words-stand-alone-rule-v1,
  // 20 November 2026). A card standing on a run asked each word of it with
  // no pointing, and with the pressed word's tags or none, so a word's cell
  // there skipped the pointing grade, the entry gate and the names gate its
  // own card and its baked line passed: at Amos 2:11 the line read «young +
  // he will rule as God» and the run's card «Bani + Israel»
  // (check-card-opens-on-the-line-v1 C1, C2, under «masoretic» and
  // «oldest»). A word of the run is asked as its own card asks it: its own
  // pointed form, its place's entry, whether its place is a name. Two words
  // of one run with one key that differ in any of these are asked as before,
  // since the key alone does not say which is meant; so is a word that is a
  // pair or holds forms of its own
  const runWordAsked = (surface) => {
    const ws = openRunWords ? openRunWords.filter((w) => w.k === surface) : [];
    if (!ws.length) return null;
    const of = (w) => { const tags = tagsAt(w, w.k); return { pointed: String(w.s || "") || null, verse: openVerse, tags, name: isNamePlace(w), lemma: !!(tags && !w.tg && w.te) }; };
    const a = of(ws[0]);
    return ws.slice(1).every((w) => { const b = of(w); return b.pointed === a.pointed && String(b.tags) === String(a.tags) && b.name === a.name; }) ? a : null;
  };
  const askedWord = (surface, named = null) => (named
    ? (named.s && surface && surface === named.k ? { pointed: named.s, verse: named.v ?? null, tags: named.tg ? [].concat(named.tg) : null, name: typeof named.name === "boolean" ? named.name : null } : NO_WORD)
    : (openPointed && surface && surface === openKey ? { pointed: openPointed, verse: openVerse, tags: openTags, name: openName, lemma: openByLemma }
      : surface && surface !== openKey && runWordAsked(surface) ? runWordAsked(surface)
      : surface && surface !== openKey && openPlaceWord ? { pointed: null, verse: null, tags: coreTagsAt(openPlaceWord, surface), name: openName } : NO_WORD));
''')
rep('''    openName = openPlaceWord ? isNamePlace(openPlaceWord) : null;
''', '''    openName = openPlaceWord ? isNamePlace(openPlaceWord) : null;
    // the run's words, each asked as its own word (runWordAsked); a branch of a pair keeps its own asking
    openRunWords = bin === zone && opts.run && !opts.run.kqBranch && Array.isArray(opts.run.words) ? opts.run.words.filter((w) => w && w.k && w.s && !w.kq && !w.w) : null;
''')
open(p, 'w', encoding='utf-8').write(s)
print('patched')
