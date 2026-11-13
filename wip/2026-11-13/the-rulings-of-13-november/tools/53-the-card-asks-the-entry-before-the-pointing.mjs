// The entry gate on the page (entry-gate-rule-v1; the owner's rulings 1 and 6 of 13 November 2026).
// Under "only this pointing" the card asks, before the pointing, which entry stands at the place (the tag the
// lattice gives the word's core piece, on the word as tg) and which entry each row's own source files it under (the
// row's facts slot). A row of another entry is withheld and counted; a row of the place's entry stands whatever its
// headword's points; a row with no number goes to the pointing as before. The line under "only" reads the leaders
// the projector baked for the place's entry. The card says the count and names the entry.
// node 53-the-card-asks-the-entry-before-the-pointing.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the gate's own functions, the same as tools/entry-gate-v1.mjs
  [`  window.__stemFamily = stemFamily;
`,
   `  window.__stemFamily = stemFamily;
  // THE ENTRY GATE (entry-gate-rule-v1; the owner, 13 November 2026: «1-5.
  // agree go ahead», ruling 1, and «1-3. ok agree», ruling 6). The store keys
  // a row by bare letters, and several words share a key: the verb "he
  // created", the verb "he ate", an Aramaic noun for a field. Every source
  // that numbers its entries knows which of them a row is, and the corpus
  // lane read that out of each source onto the row (its facts slot, row[10]:
  // n its Strong's numbers, t its STEP tags that carry a letter, b BDB's own
  // entries). The lattice gives each place the entry that stands there: the
  // tag of the word's core piece, on the word as tg. At a place with such a
  // tag, under "only": a row whose numbers hold the place's number is THIS
  // entry and stands whatever its headword's points; a row with numbers, none
  // of them the place's, is ANOTHER and is withheld and counted; a row with
  // no number is left to the pointing as before. Two partings beside it:
  // where both the row's tags and the place's carry STEP's letter and none
  // agrees, the row is another entry though the number is the same; and a
  // row with no number that names BDB's own entry is another where the key's
  // BDB rows of the place's number name entries and this is none of them.
  // These are the functions of tools/entry-gate-v1.mjs, name for name, and
  // check-entry-gate-v1 runs the two side by side.
  const numberOf = (tag) => { const x = /^[HA]?0*(\\d+)/u.exec(String(tag)); return x && x[1] !== "0" ? \`H\${x[1]}\` : null; };
  const tagOf = (tag) => String(tag).replace(/^H0*/u, "H");
  const placeEntry = (coreTags) => {
    const tags = (coreTags || []).filter(Boolean).map(tagOf);
    const numbers = [...new Set(tags.map(numberOf).filter(Boolean))];
    if (!numbers.length) return null;
    return { tags, numbers, lettered: tags.every((t) => /[A-Za-z]$/u.test(t)) };
  };
  const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
  const bdbEntriesAt = (place, factsOfRows) => {
    const out = new Set();
    for (const f of factsOfRows) if (f && Array.isArray(f.b) && Array.isArray(f.n) && f.n.some((x) => place.numbers.includes(x))) for (const e of f.b) out.add(e);
    return out;
  };
  const entryVerdict = (facts, place, bdbHere) => {
    const nums = facts && Array.isArray(facts.n) ? facts.n : [];
    if (!nums.length) {
      const b = facts && Array.isArray(facts.b) ? facts.b : [];
      return b.length && bdbHere.size && !b.some((e) => bdbHere.has(e)) ? "other" : "none";
    }
    if (!nums.some((x) => place.numbers.includes(x))) return "other";
    const t = facts && Array.isArray(facts.t) ? facts.t : [];
    return t.length && place.lettered && !t.some((x) => place.tags.includes(x)) ? "other" : "this";
  };
  window.__entryGate = { numberOf, tagOf, placeEntry, factsOf, bdbEntriesAt, entryVerdict };
`],
  // the open card's place and its tags
  [`  let openVerse = null;                 // the label of the verse the open card stands in
`,
   `  let openVerse = null;                 // the label of the verse the open card stands in
  let openPlaceWord = null;             // the word of the book the open card stands at
  let openTags = null;                  // the core tags of that place, where the form standing open is the one they tag
`],
  [`  const NO_WORD = { pointed: null, verse: null };
  const askedWord = (surface, named = null) => (named
    ? (named.s && surface && surface === named.k ? { pointed: named.s, verse: named.v ?? null } : NO_WORD)
    : (openPointed && surface && surface === openKey ? { pointed: openPointed, verse: openVerse } : NO_WORD));
`,
   `  // THE ENTRY AT A PLACE, FOR THE FORM ASKED (entry-gate-rule-v1). A word
  // carries the tags of its core piece (tg), or at a place written one way
  // and read another the half the pieces spell carries them. They speak for
  // the whole form of that key, and for the core piece's own cell on the
  // card, whose key is the core piece's letters: the tag is that piece's. A
  // prefix's or a suffix's cell, and the written half of a pair, take none.
  const tagHolder = (word) => (!word ? null : word.tg ? word : (word.w || word.kqw || []).find((r) => r && r.tg) || null);
  const tagsAt = (word, key) => { const h = tagHolder(word); return h && key && h.k === key ? [].concat(h.tg) : null; };
  const coreTagsAt = (word, key) => {
    const h = tagHolder(word);
    const cores = h && Array.isArray(word.pg) ? word.pg.filter((x) => x && x.r === "core") : [];
    return h && key && cores.length === 1 && cores[0].k === key ? [].concat(h.tg) : null;
  };
  const NO_WORD = { pointed: null, verse: null, tags: null };
  const askedWord = (surface, named = null) => (named
    ? (named.s && surface && surface === named.k ? { pointed: named.s, verse: named.v ?? null, tags: named.tg ? [].concat(named.tg) : null } : NO_WORD)
    : (openPointed && surface && surface === openKey ? { pointed: openPointed, verse: openVerse, tags: openTags }
      : surface && surface !== openKey && openPlaceWord ? { pointed: null, verse: null, tags: coreTagsAt(openPlaceWord, surface) } : NO_WORD));
  // THE LEADERS UNDER "ONLY" AT A PLACE: the place's entry's own, where the
  // gate makes them other than the surface's (the sidecar's grades[s].e, by
  // the place's core tags as the lattice writes them), else the surface's.
  const onlyLeaders = (gr, tags) => {
    const own = gr && gr.e && tags ? gr.e[[].concat(tags).join(" ")] : null;
    return own ? { l: own.l || null, la: own.la || null, nl: !!own.nl } : { l: (gr && gr.o && gr.o.l) || null, la: (gr && gr.o && gr.o.la) || null, nl: !!(gr && gr.nl) };
  };
`],
  [`    openVerse = openSite ? openSite.ref : null;
`,
   `    openVerse = openSite ? openSite.ref : null;
    // the entry at the open word's place, for the gate (entry-gate-rule-v1)
    openPlaceWord = openSite ? openSite.wordOf || null : null;
    openTags = tagsAt(openPlaceWord, openKey);
    // the tags this card is gated by, for a check to read
    window.__cardEntry = openTags ? openTags.join(" ") : "";
`],
  // the pool: the entry, then the pointing
  [`    const W = askedWord(surface, opts.word || null);
    let routes = all, withheld = 0, attested = false;
    if (pointingNow(W.pointed) === "only") {
`,
   `    const W = askedWord(surface, opts.word || null);
    let routes = all, withheld = 0, attested = false;
    // THE ENTRY AT THE PLACE, BEFORE THE POINTING (entry-gate-rule-v1). Under
    // "only", at a place the lattice tags: a row its own source files under
    // another entry than the place's never enters the pool, and the card
    // says how many; a row of the place's entry is kept here and passes the
    // pointing below whatever its headword's points (the dictionary's form
    // of a verb is seldom pointed as the verse's is); a row with no number
    // is neither, and the pointing speaks for it as before. The overlays'
    // rows carry no entry and are not asked.
    let withheldByEntry = 0, entryHere = null;
    const ofThisEntry = new Set();
    if (pointingNow(W.pointed) === "only" && W.tags) {
      const place = placeEntry(W.tags);
      if (place) {
        const bdbHere = bdbEntriesAt(place, all.map(factsOf));
        const verdicts = all.map((row) => entryVerdict(factsOf(row), place, bdbHere));
        routes = all.filter((row, i) => verdicts[i] !== "other");
        withheldByEntry = all.length - routes.length;
        all.forEach((row, i) => { if (verdicts[i] === "this") ofThisEntry.add(row); });
        entryHere = place.numbers;
      }
    }
    if (pointingNow(W.pointed) === "only") {
`],
  [`        attested = grades.includes("m");
        if (attested) {
          routes = all.filter((row, i) => grades[i] !== "x");
          withheld = all.length - routes.length;
        }
`,
   `        attested = grades.includes("m");
        if (attested) {
          // of the rows the entry left: a row of the place's own entry stays whatever its points
          const gradeOfRow = new Map(all.map((row, i) => [row, grades[i]]));
          const kept = routes.filter((row) => ofThisEntry.has(row) || gradeOfRow.get(row) !== "x");
          withheld = routes.length - kept.length;
          routes = kept;
        }
`],
  [`    pool.withheld = withheld; pool.withheldBySources = withheldBySources; pool.withheldByStem = withheldByStem; pool.stems = stemsHere; pool.rows = asked;
    return pool;
  };
`,
   `    pool.withheld = withheld; pool.withheldBySources = withheldBySources; pool.withheldByStem = withheldByStem; pool.stems = stemsHere; pool.rows = asked;
    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere;
    return pool;
  };
`],
  [`    to.withheld = from.withheld; to.withheldBySources = from.withheldBySources; to.withheldByStem = from.withheldByStem; to.stems = from.stems; to.rows = from.rows;
`,
   `    to.withheld = from.withheld; to.withheldBySources = from.withheldBySources; to.withheldByStem = from.withheldByStem; to.stems = from.stems; to.rows = from.rows;
    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry;
`],
  // the name yields to the gate's leader at this place
  [`      || (masorah === "only" && gr && gr.o && gr.o.l && !gr.nl)
`,
   `      || (masorah === "only" && gr && gr.o && onlyLeaders(gr, W.tags).l && !onlyLeaders(gr, W.tags).nl)
`],
  // the card says it
  [`        if (pool && (pool.withheld || pool.withheldByStem || pool.withheldBySources)) {
          const bits = [];
          if (pool.withheldBySources) bits.push(`,
   `        if (pool && (pool.withheld || pool.withheldByEntry || pool.withheldByStem || pool.withheldBySources)) {
          const bits = [];
          if (pool.withheldByEntry) bits.push(\`\${pool.withheldByEntry} record\${pool.withheldByEntry === 1 ? "" : "s"} withheld by the entry — their own source files them under another entry than \${(pool.entry || []).join(" or ")}, which stands here\`);
          if (pool.withheldBySources) bits.push(`],
  [`        pills.dataset.stemWithheld = String(pool.withheldByStem || 0);
`,
   `        pills.dataset.stemWithheld = String(pool.withheldByStem || 0);
        pills.dataset.entryWithheld = String(pool.withheldByEntry || 0);
        pills.dataset.entry = (pool.entry || []).join("|");
`],
  [`        if (pool.withheld || pool.withheldByStem || pool.withheldBySources) {
          if (!wLine) { wLine = document.createElement("p"); wLine.className = "kq-role withheld-line"; readRow.append(wLine); }
          wLine.replaceChildren();
          const parts = [];
`,
   `        if (pool.withheld || pool.withheldByEntry || pool.withheldByStem || pool.withheldBySources) {
          if (!wLine) { wLine = document.createElement("p"); wLine.className = "kq-role withheld-line"; readRow.append(wLine); }
          wLine.replaceChildren();
          const parts = [];
          if (pool.withheldByEntry) parts.push(Object.assign(document.createElement("span"), { className: "entry-withheld", textContent: \`\${pool.withheldByEntry} of another entry than \${(pool.entry || []).join(" or ")}, withheld\` }));
`],
  // the line under "only" reads the place's own leaders
  [`        if (gr.nl && nonamesPref === "lead" && word.k && zone.gloss_names && Object.prototype.hasOwnProperty.call(zone.gloss_names, word.k)
          && zone.gloss[word.k] === zone.gloss_names[word.k] && !(gm && allOff(gm.by))) return null;
        const l = gr.o.l;
`,
   `        // at this place: the leaders under its own entry where the gate moves them (entry-gate-rule-v1)
        const here = onlyLeaders(gr, word.tg || null);
        if (here.nl && nonamesPref === "lead" && word.k && zone.gloss_names && Object.prototype.hasOwnProperty.call(zone.gloss_names, word.k)
          && zone.gloss[word.k] === zone.gloss_names[word.k] && !(gm && allOff(gm.by))) return null;
        const l = here.l;
`],
  [`        const la = gr.o.la;
        if (la && !allOff(la[4])) return`,
   `        const la = here.la;
        if (la && !allOff(la[4])) return`],
  // the callers that name the word they ask for name its tags too
  [`          const r = await attributionFor(k, asked, at, null, false, { s: w.s, k: w.k, v: sec.label ?? null });
`,
   `          const r = await attributionFor(k, asked, at, null, false, { s: w.s, k: w.k, v: sec.label ?? null, tg: w.tg ?? null });
`],
  [`        ss: regions ? regions.map((r) => r.s || null) : (word.k ? [word.s || null] : []), v: WORD_VERSE.get(word) ?? null,
`,
   `        ss: regions ? regions.map((r) => r.s || null) : (word.k ? [word.s || null] : []), v: WORD_VERSE.get(word) ?? null,
        // and each key's own core tags, where the lattice gives its place any (entry-gate-rule-v1)
        ts: regions ? regions.map((r) => r.tg || null) : (word.k ? [word.tg || null] : []),
`],
  [`        const own = st.ss && st.ss[i] && k === st.ks[i] ? { s: st.ss[i], k, v: st.v } : null;
`,
   `        const own = st.ss && st.ss[i] && k === st.ks[i] ? { s: st.ss[i], k, v: st.v, tg: st.ts ? st.ts[i] : null } : null;
`],
]);
