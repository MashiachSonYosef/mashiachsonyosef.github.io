// THE NAMES GATE ON THE PAGE (names-gate-rule-v1; the owner, 13 November 2026: «1-3. ok agree», ruling 8). At a
// place that is not a name, a row its own source gives as a name is withheld and counted; at a place that is a
// name, it stands. The row's half is on the row (its facts carry name), the place's half on the word (np). The
// page asks it with the entry, before the pointing, counts it on the card, and reads the leaders under "only" at
// the word's own kind of place (its entry's tags, and whether it is a name), as tools/place-leaders-v1.mjs keys
// them. A book whose places were not read for names is not asked.
// Applies after edit 53.
// node 63-the-card-asks-whether-the-place-is-a-name.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`  window.__entryGate = { numberOf, tagOf, placeEntry, factsOf, bdbEntriesAt, entryVerdict };
`,
   `  window.__entryGate = { numberOf, tagOf, placeEntry, factsOf, bdbEntriesAt, entryVerdict };
  // THE NAMES GATE (names-gate-rule-v1; the owner, 13 November 2026: «1-3. ok
  // agree», ruling 8). «Bara», a man's name from one inscription, stood on
  // the card of the verb "he created": pointed as the verb is and carrying
  // no Strong's number, so neither the pointing nor the entry parts it. Its
  // own source says what it is. The corpus lane listed the served rows whose
  // every entry their source marks a name (the row's facts carry name), and
  // the word places of the thirty-nine books that are a name (the word
  // carries np, projected with the lattice). At a place that is not a name,
  // a row its source gives as a name is withheld and counted; at a place
  // that is a name, it stands (isNamePlace, below the zone, says which a
  // place is). nameWithheld is the function of tools/names-gate-v1.mjs, name
  // for name.
  const nameWithheld = (facts, placeIsAName) => !!(facts && facts.name) && !placeIsAName;
`],
  [`  let zone, index;
`,
   `  let zone, index;
  // WHETHER A PLACE IS A NAME (names-gate-rule-v1): its word carries np where
  // the corpus lane's list names the place. A book whose places were not read
  // for names (its projection's receipt names no list) has none marked, and
  // every place of it is read as a name: its names stand as they did before
  // the gate.
  const namesMarked = () => !!(zone && zone.emitted_from && zone.emitted_from.toggles && zone.emitted_from.toggles.lattice && zone.emitted_from.toggles.lattice.names);
  const isNamePlace = (word) => !namesMarked() || !!(word && word.np);
`],
  [`  let openTags = null;                  // the core tags of that place, where the form standing open is the one they tag
`,
   `  let openTags = null;                  // the core tags of that place, where the form standing open is the one they tag
  let openName = null;                  // whether that place is a name; null where the card stands at no place of the book
`],
  [`  const NO_WORD = { pointed: null, verse: null, tags: null };
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
`,
   `  // name: whether the asked word's place is a name (true where the book's
  // places were not read for names), as the one who names the word says it
  // (isNamePlace); null where no place is known, and the names gate is then
  // not asked
  const NO_WORD = { pointed: null, verse: null, tags: null, name: null };
  const askedWord = (surface, named = null) => (named
    ? (named.s && surface && surface === named.k ? { pointed: named.s, verse: named.v ?? null, tags: named.tg ? [].concat(named.tg) : null, name: typeof named.name === "boolean" ? named.name : null } : NO_WORD)
    : (openPointed && surface && surface === openKey ? { pointed: openPointed, verse: openVerse, tags: openTags, name: openName }
      : surface && surface !== openKey && openPlaceWord ? { pointed: null, verse: null, tags: coreTagsAt(openPlaceWord, surface), name: openName } : NO_WORD));
  // THE LEADERS UNDER "ONLY" AT A PLACE (tools/place-leaders-v1.mjs, name for
  // name): the place's own where its gates make them other than the
  // surface's, else the surface's. The sidecar keeps them in grades[s].e by
  // the kind of place: the core tags as the lattice writes them, joined by a
  // space (none where the place carries no tag), with "|n" after them where
  // the place is a name. A place with no tag that is a name reads the
  // surface's own.
  const PLACE_IS_A_NAME = "|n";
  const leadersKey = (tags, isName) => \`\${tags ? [].concat(tags).join(" ") : ""}\${isName ? PLACE_IS_A_NAME : ""}\`;
  const onlyLeaders = (gr, tags, isName) => {
    const own = gr && gr.e ? gr.e[leadersKey(tags, isName)] : null;
    return own ? { l: own.l || null, la: own.la || null, nl: !!own.nl } : { l: (gr && gr.o && gr.o.l) || null, la: (gr && gr.o && gr.o.la) || null, nl: !!(gr && gr.nl) };
  };
`],
  [`        entryHere = place.numbers;
      }
    }
    if (pointingNow(W.pointed) === "only") {
      // the grade has to be here before the pool is built, not after: a
`,
   `        entryHere = place.numbers;
      }
    }
    // WHETHER THE PLACE IS A NAME, WITH THE ENTRY (names-gate-rule-v1). Under
    // "only", at a place that is not a name: a row its own source gives as a
    // name never enters the pool, and the card says how many. A row the
    // entry already withheld is counted there and not again. Where no place
    // is known, and in a book whose places were not read for names, nothing
    // is asked. The overlays' rows carry no such mark.
    let withheldByName = 0;
    if (pointingNow(W.pointed) === "only" && W.name === false) {
      const kept = routes.filter((row) => !nameWithheld(factsOf(row), false));
      withheldByName = routes.length - kept.length;
      routes = kept;
    }
    if (pointingNow(W.pointed) === "only") {
      // the grade has to be here before the pool is built, not after: a
`],
  [`    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere;
    return pool;
`,
   `    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere; pool.withheldByName = withheldByName;
    return pool;
`],
  [`    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry;
    return to;
`,
   `    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry; to.withheldByName = from.withheldByName;
    return to;
`],
  [`      || (masorah === "only" && gr && gr.o && onlyLeaders(gr, W.tags).l && !onlyLeaders(gr, W.tags).nl)`,
   `      || (masorah === "only" && gr && gr.o && onlyLeaders(gr, W.tags, W.name !== false).l && !onlyLeaders(gr, W.tags, W.name !== false).nl)`],
  [`    openTags = tagsAt(openPlaceWord, openKey);
    // the tags this card is gated by, for a check to read
    window.__cardEntry = openTags ? openTags.join(" ") : "";
`,
   `    openTags = tagsAt(openPlaceWord, openKey);
    // and whether that place is a name, for the names gate (names-gate-rule-v1)
    openName = openPlaceWord ? isNamePlace(openPlaceWord) : null;
    // the tags this card is gated by, and what it takes its place for, for a check to read
    window.__cardEntry = openTags ? openTags.join(" ") : "";
    window.__cardName = openName === null ? "" : openName ? "a name" : "not a name";
`],
  [`        if (pool && (pool.withheld || pool.withheldByEntry || pool.withheldByStem || pool.withheldBySources)) {
          const bits = [];
          if (pool.withheldByEntry) bits.push(\`\${pool.withheldByEntry} record\${pool.withheldByEntry === 1 ? "" : "s"} withheld by the entry — their own source files them under another entry than \${(pool.entry || []).join(" or ")}, which stands here\`);
`,
   `        if (pool && (pool.withheld || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources)) {
          const bits = [];
          if (pool.withheldByEntry) bits.push(\`\${pool.withheldByEntry} record\${pool.withheldByEntry === 1 ? "" : "s"} withheld by the entry — their own source files them under another entry than \${(pool.entry || []).join(" or ")}, which stands here\`);
          if (pool.withheldByName) bits.push(\`\${pool.withheldByName} record\${pool.withheldByName === 1 ? "" : "s"} withheld as a name — their own source gives \${pool.withheldByName === 1 ? "it" : "them"} as a name, and the word here is not one\`);
`],
  [`        pills.dataset.entryWithheld = String(pool.withheldByEntry || 0);
`,
   `        pills.dataset.entryWithheld = String(pool.withheldByEntry || 0);
        pills.dataset.nameWithheld = String(pool.withheldByName || 0);
`],
  [`        if (pool.withheld || pool.withheldByEntry || pool.withheldByStem || pool.withheldBySources) {`,
   `        if (pool.withheld || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources) {`],
  [`          if (pool.withheldByEntry) parts.push(Object.assign(document.createElement("span"), { className: "entry-withheld", textContent: \`\${pool.withheldByEntry} of another entry than \${(pool.entry || []).join(" or ")}, withheld\` }));
`,
   `          if (pool.withheldByEntry) parts.push(Object.assign(document.createElement("span"), { className: "entry-withheld", textContent: \`\${pool.withheldByEntry} of another entry than \${(pool.entry || []).join(" or ")}, withheld\` }));
          if (pool.withheldByName) parts.push(Object.assign(document.createElement("span"), { className: "name-withheld", textContent: \`\${pool.withheldByName} given as a name by \${pool.withheldByName === 1 ? "its" : "their"} source, withheld\` }));
`],
  [`        // at this place: the leaders under its own entry where the gate moves them (entry-gate-rule-v1)
        const here = onlyLeaders(gr, word.tg || null);
`,
   `        // at this place: the leaders its own gates leave, by its entry and whether it is a name (entry-gate-rule-v1, names-gate-rule-v1)
        const here = onlyLeaders(gr, word.tg || null, isNamePlace(word));
`],
  [`{ s: w.s, k: w.k, v: sec.label ?? null, tg: w.tg ?? null });`,
   `{ s: w.s, k: w.k, v: sec.label ?? null, tg: w.tg ?? null, name: isNamePlace(w) });`],
  [`        ts: regions ? regions.map((r) => r.tg || null) : (word.k ? [word.tg || null] : []),
`,
   `        ts: regions ? regions.map((r) => r.tg || null) : (word.k ? [word.tg || null] : []),
        // and whether the place is a name (names-gate-rule-v1)
        name: isNamePlace(word),
`],
  [`{ s: st.ss[i], k, v: st.v, tg: st.ts ? st.ts[i] : null } : null;`,
   `{ s: st.ss[i], k, v: st.v, tg: st.ts ? st.ts[i] : null, name: st.name } : null;`],
]);
