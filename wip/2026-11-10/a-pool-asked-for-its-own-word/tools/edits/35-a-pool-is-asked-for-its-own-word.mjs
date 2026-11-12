// A POOL IS ASKED FOR ITS OWN WORD (the review's first reader, finding 5; proven 10 November 2026 by
// probes/live-lines.mjs). poolFor and sortPool read "the word standing open" from the page's memory (openPointed,
// openKey, openVerse), whoever asked. The card is the only caller that sets them. The line a source switch repaints
// (repaintLive) and the exported file (attributionFor) ask for words the reader never opened, so their pool was gated
// by no pointing at all, or by the pointing of whichever card was opened last on the same letters. On the live build's
// Amos with four sources off, 10 of 60 live lines read another reading than the word's own card: «bases» under
// Adonai, «Domesticated» under "from the house of", «to stage» under "in the days of".
// The pool now takes the word it is asked for: opts.word names it (the live line, the export); with none it is the
// word standing open, as before, so the card's pool is the same pool.
// node 35-a-pool-is-asked-for-its-own-word.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the word a pool is asked for
  [`  let openVerse = null;                 // the label of the verse the open card stands in
  const WORD_VERSE = new WeakMap();     // a word of the zone -> its verse's label
`,
   `  let openVerse = null;                 // the label of the verse the open card stands in
  const WORD_VERSE = new WeakMap();     // a word of the zone -> its verse's label
  // THE WORD A POOL IS ASKED FOR. The card asks for the word standing open
  // (openPointed, openKey, openVerse, set as it opens). The line a source
  // switch repaints and the exported file ask for a word the reader may never
  // have opened, and they name it (opts.word: its pointed surface s, its own
  // key k, its verse v). Until 10 November 2026 the pool read the open card's
  // word from the page's memory whoever asked, so a line read live was gated
  // by no pointing at all, or by the pointing of whichever card was opened
  // last on the same letters (Amos with four sources off: «bases» under
  // Adonai, «Domesticated» under "from the house of", «to stage» under "in
  // the days of", none of them on the word's own card). The pointing is
  // asked only under the word's own key: a pool asked under a headword's key
  // holds that headword's rows.
  const NO_WORD = { pointed: null, verse: null };
  const askedWord = (surface, named = null) => (named
    ? (named.s && surface && surface === named.k ? { pointed: named.s, verse: named.v ?? null } : NO_WORD)
    : (openPointed && surface && surface === openKey ? { pointed: openPointed, verse: openVerse } : NO_WORD));
`],
  // poolFor: what its options are
  [`  // opts.everySource: the pool with the source switches lifted, for the
  // exporter only.`,
   `  // opts.word: the word the pool is asked for when it is not the one standing
  // open (askedWord): the line read live and the exporter name theirs, so the
  // pointing that gates the pool is that word's own
  // opts.everySource: the pool with the source switches lifted, for the
  // exporter only.`],
  [`    // not grade stay: unknown is not a mismatch. The same guard sortPool
    // uses — the open word's own pointed surface, and only that.
    let routes = all, withheld = 0, attested = false;
    if (pointingNow(surface === openKey ? openPointed : null) === "only") {`,
   `    // not grade stay: unknown is not a mismatch. The same guard sortPool
    // uses — the asked word's own pointed surface, and only that.
    const W = askedWord(surface, opts.word || null);
    let routes = all, withheld = 0, attested = false;
    if (pointingNow(W.pointed) === "only") {`],
  [`      const gr = latticeStore && latticeStore.grades && openPointed && surface === openKey ? latticeStore.grades[openPointed] : null;`,
   `      const gr = latticeStore && latticeStore.grades && W.pointed ? latticeStore.grades[W.pointed] : null;`],
  [`      const own = openPointed && surface === openKey && isPointed(openPointed);
      if (lat || own) {
        const fpIdx = lat ? new Map(lat.f.map((fp, i) => [fp, i])) : null;
        const gradeOf = (row) => {
          const sg = own ? gradeRow(row, openPointed) : "-";`,
   `      const own = W.pointed && isPointed(W.pointed);
      if (lat || own) {
        const fpIdx = lat ? new Map(lat.f.map((fp, i) => [fp, i])) : null;
        const gradeOf = (row) => {
          const sg = own ? gradeRow(row, W.pointed) : "-";`],
  [`    if (pointingNow(surface === openKey ? openPointed : null) === "only" && latticeStore && openPointed && surface === openKey) {
      const gr = latticeStore.grades ? latticeStore.grades[openPointed] : null;`,
   `    if (pointingNow(W.pointed) === "only" && latticeStore && W.pointed) {
      const gr = latticeStore.grades ? latticeStore.grades[W.pointed] : null;`],
  [`      const pointingOnly = attested && pointingNow(surface === openKey ? openPointed : null) === "only" && openPointed && surface === openKey && isPointed(openPointed);
      const kept = pointingOnly ? extra.filter((row) => gradeRow(row, openPointed) !== "x") : extra;`,
   `      const pointingOnly = attested && pointingNow(W.pointed) === "only" && W.pointed && isPointed(W.pointed);
      const kept = pointingOnly ? extra.filter((row) => gradeRow(row, W.pointed) !== "x") : extra;`],
  [`    const pool = sortPool([...groups.values()], surface);`,
   `    const pool = sortPool([...groups.values()], surface, W);`],
  // sortPool: sorted for the word the pool was asked for
  [`  const sortPool = (list, surface = null) => {
    const pos = DEF_POS.find((p) => p.id === defOrder) || {};
    const gr = latticeStore && latticeStore.grades && openPointed && surface && surface === openKey ? latticeStore.grades[openPointed] : null;`,
   `  const sortPool = (list, surface = null, asked = null) => {
    const pos = DEF_POS.find((p) => p.id === defOrder) || {};
    // the word this pool is sorted for: the one poolFor was asked for, else
    // the word standing open (a card sorting its own pool again)
    const W = asked || askedWord(surface);
    const gr = latticeStore && latticeStore.grades && W.pointed ? latticeStore.grades[W.pointed] : null;`],
  [`    const own = openPointed && surface && surface === openKey;
    const gradeOf = (row) => { const sg = own ? gradeRow(row, openPointed) : "-"; if (sg !== "-") return sg; const i = idxOf(row); return i >= 0 ? (gr.g[i] || "-") : "-"; };`,
   `    const own = W.pointed;
    const gradeOf = (row) => { const sg = own ? gradeRow(row, W.pointed) : "-"; if (sg !== "-") return sg; const i = idxOf(row); return i >= 0 ? (gr.g[i] || "-") : "-"; };`],
  [`    const citing = gr ? citingCards(gr, openVerse) : [];`,
   `    const citing = gr ? citingCards(gr, W.verse) : [];`],
  [`      if (pointingNow(surface === openKey ? openPointed : null) === "letters") {`,
   `      if (pointingNow(W.pointed) === "letters") {`],
  [`      || (pos.needs === "lattice" && latticeLeader(gr, pos.lattice, openVerse))`,
   `      || (pos.needs === "lattice" && latticeLeader(gr, pos.lattice, W.verse))`],
  // the exporter: an unruled line is cited from the pool its word's own card stands on
  [`  const attributionFor = async (surface, shownText, at = null, named = null, everySource = false) => {
    let pool = null;
    try { pool = await poolFor(surface, { ...(at && spanJoin(at.text) === shownText ? { place: at } : {}), everySource }); }`,
   `  const attributionFor = async (surface, shownText, at = null, named = null, everySource = false, word = null) => {
    let pool = null;
    try { pool = await poolFor(surface, { ...(at && spanJoin(at.text) === shownText ? { place: at } : {}), everySource, ...(word ? { word } : {}) }); }`],
  [`        let a = null, missed = null;
        for (const [k, every] of tries) {
          const r = await attributionFor(k, asked, at, named, every);
          if (!r.miss) { a = r; break; }`,
   `        let a = null, missed = null;
        // AN UNRULED LINE IS ASKED FIRST OF THE POOL ITS WORD'S OWN CARD STANDS
        // ON: the word is named, so its pointing gates the pool as it gates
        // the card, and the record cited is the one the card's foot shows.
        // The whole pool was asked for every word, so a reading could be
        // credited to an older record of a source that points the word
        // otherwise, one the card withholds. A reading that pool does not
        // hold is asked of the whole pool next, as before, so what the file
        // found until now it still finds; a ruled line goes straight there,
        // as a ruling outranks the pointing as it outranks a switch.
        if (!ruled && w.s) for (const k of keys) {
          const r = await attributionFor(k, asked, at, null, false, { s: w.s, k: w.k, v: sec.label ?? null });
          if (!r.miss) { a = r; break; }
        }
        if (!a) for (const [k, every] of tries) {
          const r = await attributionFor(k, asked, at, named, every);
          if (!r.miss) { a = r; break; }`],
  // the live line: each key's own pointed surface is kept with its stand, and the pool is asked for that word
  [`      GLOSS_STANDS.push({ ge, ks: regions ? regions.map((r) => r.k) : (word.k ? [word.k] : []),
        word: regions && regions.length > 1 ? null : word });`,
   `      GLOSS_STANDS.push({ ge, ks: regions ? regions.map((r) => r.k) : (word.k ? [word.k] : []),
        // each key's own pointed surface, and the verse: a line read live asks
        // the pool for the word itself (repaintLive, askedWord)
        ss: regions ? regions.map((r) => r.s || null) : (word.k ? [word.s || null] : []), v: WORD_VERSE.get(word) ?? null,
        word: regions && regions.length > 1 ? null : word });`],
  [`        try { pool = await poolFor(k, { storeOnly: true }); } catch {`,
   `        // asked for this word itself, under its own key, so its pointing
        // gates the pool as it gates the word's card
        const own = st.ss && st.ss[i] && k === st.ks[i] ? { s: st.ss[i], k, v: st.v } : null;
        try { pool = await poolFor(k, { storeOnly: true, ...(own ? { word: own } : {}) }); } catch {`],
]);
