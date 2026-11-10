// The chain's check, held to the zone and not to the builder's own walk (the fifth reader's findings 4 and 5:
// "check-chain-book-v1 copies the same walk", "the check agrees with the bug").
//  - K2 reads a mark as a mark and a pair by its halves
//  - K3 asks the store who the oldest carrier is, and a new law holds the first link's source to the source
//    the zone itself credits for the line, on every chained book
//  - K4 holds the counts to the zone's own counts, which the builder never reads
// node 05-chain-check.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-chain-book-v1.mjs"), [
  [`//   K2  every word and key fingerprint is sha256 of the zone's own string,
//       recomputed here, for every word of every chained book
//   K3  the readings are the store's own pool for that key, in the order the
//       card offers them, and each reading and source fingerprint recomputes —
//       walked in full on the smallest chained book, which is named in the
//       output rather than left to be guessed at
//   K4  the page prints the first twelve of a number the file carries at
//       sixty-four, every short on the page resolves in the file, and the
//       counts the page prints are what a walk of the file actually finds`,
   `//   K2  every word and key fingerprint is sha256 of the zone's own string,
//       recomputed here, for every word of every chained book; a scribal
//       mark carries its kind and no key; a word written one way and read
//       another carries its halves, each with its role, its letters and its key
//   K3  the readings are the store's own pool for that key, oldest first, and
//       each reading and source fingerprint recomputes — walked in full on the
//       smallest chained book, which is named in the output rather than left
//       to be guessed at; the source is the oldest carrier by the store's own
//       rule (carriersOf: the row's wording year)
//   K3b on every chained book, wherever a word's first link is the reading
//       the zone prints on its line, the link's source is the source the
//       zone itself credits for that line (gloss_m): the chain and the
//       reading page name one source for one reading
//   K4  the page prints the first twelve of a number the file carries at
//       sixty-four, every short on the page resolves in the file, and the
//       counts the page prints are what a walk of the file actually finds
//   K4b and they are the BOOK's counts, read off the zone's own receipt,
//       which the builder never reads: its words, its scribal marks, its
//       words that carry a reading. (Until 10 November 2026 the builder
//       counted a mark as a word with no reading and gave a pair none, and
//       this check recounted the builder's file and agreed with it: Amos's
//       page said 184 words carry no reading where the zone says 3.)`],
  [`const n = (v) => Number(v).toLocaleString();`, `const n = (v) => Number(v).toLocaleString("en-US");`],
  // ---- K2: marks and pairs ----
  [`      for (let j = 0; j < zw.length; j += 1) {
        walked += 1;
        const surface = String(zw[j].s ?? ""), key = String(zw[j].k ?? "");
        if (cs[j].w !== short(surface)) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: the word\`); break; }
        const wantK = key ? short(key) : null;
        if ((cs[j].k ?? null) !== wantK) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: the key\`); break; }
      }`,
   `      for (let j = 0; j < zw.length; j += 1) {
        walked += 1;
        const surface = String(zw[j].s ?? ""), key = String(zw[j].k ?? "");
        if (cs[j].w !== short(surface)) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: the word\`); break; }
        // a mark: its kind, no key, no links, and never a pair
        if (zw[j].mark) {
          if (cs[j].mark !== short(zw[j].mark.kind) || (cs[j].k ?? null) !== null || (cs[j].reads || []).length || cs[j].halves) { fpOff.push(\`\${b} \${zs[i].label} entry \${j}: the mark\`); break; }
          continue;
        }
        if ((cs[j].mark ?? null) !== null) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: a word is printed as a mark\`); break; }
        // a pair: its halves, each by its own role, letters and key
        if (Array.isArray(zw[j].w)) {
          const hs = cs[j].halves;
          const ok = Array.isArray(hs) && hs.length === zw[j].w.length && (cs[j].k ?? null) === null
            && zw[j].w.every((r, x) => hs[x].w === short(String(r.s ?? "")) && (hs[x].k ?? null) === (r.k ? short(String(r.k)) : null) && hs[x].role === short(String(r.role ?? "")));
          if (!ok) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: the halves of a word written one way and read another\`); break; }
          continue;
        }
        if (cs[j].halves) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: halves on a word the book holds whole\`); break; }
        const wantK = key ? short(key) : null;
        if ((cs[j].k ?? null) !== wantK) { fpOff.push(\`\${b} \${zs[i].label} word \${j}: the key\`); break; }
      }`],
  // ---- K3: the store's own oldest carrier; halves walked too ----
  [`    outer: for (let i = 0; i < (z.sections || []).length; i += 1) {
      const zw = z.sections[i].words || [], cs = s.sections[i].cells;
      for (let j = 0; j < zw.length; j += 1) {
        const key = String(zw[j].k ?? "");
        const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
        const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
        const got = cs[j].reads;
        if (got.length !== pool.length) { off.push(\`\${z.sections[i].label} word \${j}: \${got.length} links, the store offers \${pool.length}\`); break outer; }
        for (let r = 0; r < pool.length; r += 1) {
          links += 1;
          if (got[r].r !== short(pool[r].text)) { off.push(\`\${z.sections[i].label} word \${j} link \${r}: the reading\`); break outer; }
          const carriers = [...(pool[r].by || [])].filter((m) => ms[m]);
          const oldest = carriers.map((m) => ({ m, y: Number.parseInt(ms[m].sourceYear, 10) }))
            .sort((a, c) => (Number.isFinite(a.y) ? a.y : Infinity) - (Number.isFinite(c.y) ? c.y : Infinity))[0];
          const wantS = oldest ? short(ms[oldest.m].label) : null;
          if ((got[r].s ?? null) !== wantS) { off.push(\`\${z.sections[i].label} word \${j} link \${r}: the source that carries it\`); break outer; }
        }
      }
    }`,
   `    // one key's links against the store's own pool; false stops the walk
    const linksAgree = (key, got, where) => {
      const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
      const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
      if ((got || []).length !== pool.length) { off.push(\`\${where}: \${(got || []).length} links, the store offers \${pool.length}\`); return false; }
      for (let r = 0; r < pool.length; r += 1) {
        links += 1;
        if (got[r].r !== short(pool[r].text)) { off.push(\`\${where} link \${r}: the reading\`); return false; }
        // the oldest carrier is the store's own answer, by the row's wording year
        const oldest = store.carriersOf(rrows, pool[r].text)[0] || null;
        const wantS = oldest ? short(ms[oldest[3]].label) : null;
        if ((got[r].s ?? null) !== wantS) { off.push(\`\${where} link \${r}: the source that carries it\`); return false; }
        const wantBy = [...(pool[r].by || [])].filter((m) => ms[m]);
        const gotBy = got[r].by || [];
        if (wantBy.length > 1 ? !(gotBy.length === wantBy.length && wantBy.every((m, x) => gotBy[x] === short(ms[m].label))) : gotBy.length !== 0) { off.push(\`\${where} link \${r}: its carriers\`); return false; }
      }
      return true;
    };
    outer: for (let i = 0; i < (z.sections || []).length; i += 1) {
      const zw = z.sections[i].words || [], cs = s.sections[i].cells;
      for (let j = 0; j < zw.length; j += 1) {
        const where = \`\${z.sections[i].label} word \${j}\`;
        if (zw[j].mark) continue;
        if (Array.isArray(zw[j].w)) {
          for (let x = 0; x < zw[j].w.length; x += 1) if (!linksAgree(String(zw[j].w[x].k ?? ""), ((cs[j].halves || [])[x] || {}).reads, \`\${where} half \${x}\`)) break outer;
          continue;
        }
        if (!linksAgree(String(zw[j].k ?? ""), cs[j].reads, where)) break outer;
      }
    }`],
  [`    check("K3  the readings are the store's own pool in the card's own order, and each reading and source fingerprint recomputes",
      off.length === 0, off.length ? \`\${b}: \${few(off)}\` : \`\${b}, the smallest chained book: \${n(links)} links re-derived from \${store.index.store_version} and hashed again\`);
  }
}`,
   `    check("K3  the readings are the store's own pool, oldest first, and each reading, its oldest carrier and its carriers recompute",
      off.length === 0, off.length ? \`\${b}: \${few(off)}\` : \`\${b}, the smallest chained book: \${n(links)} links re-derived from \${store.index.store_version} and hashed again\`);
  }
}

// ── K3b · the chain and the reading page name one source for one reading ──────
{
  // The zone credits the reading on its line in gloss_m (the M the page's chip
  // prints). Wherever a word's first link IS that reading, the link's source
  // must be that source. Read off the zone, on every chained book: no store
  // is opened and nothing of the builder's is re-run.
  const off = [];
  let held = 0, lineIsNotFirst = 0, noCredit = 0;
  for (const b of books.filter(haveZone)) {
    const s = car(b), z = zoneOf(b), gloss = z.gloss || {}, gm = z.gloss_m || {};
    const one = (key, reads, where) => {
      if (!key || !reads || !reads.length || gloss[key] === undefined) return;
      if (reads[0].r !== short(gloss[key])) { lineIsNotFirst += 1; return; }   // a name leads the line, or an order moved it: another reading's credit
      if (!gm[key] || !gm[key].m) { noCredit += 1; return; }
      held += 1;
      if (reads[0].s !== short(gm[key].m)) off.push(\`\${b} \${where}\`);
    };
    for (let i = 0; i < (z.sections || []).length; i += 1) {
      const zw = z.sections[i].words || [], cs = s.sections[i].cells;
      for (let j = 0; j < zw.length; j += 1) {
        if (zw[j].mark) continue;
        if (Array.isArray(zw[j].w)) { zw[j].w.forEach((r, x) => one(String(r.k ?? ""), ((cs[j].halves || [])[x] || {}).reads, \`\${z.sections[i].label} word \${j} half \${x}\`)); continue; }
        one(String(zw[j].k ?? ""), cs[j].reads, \`\${z.sections[i].label} word \${j}\`);
      }
    }
  }
  check("K3b  wherever a word's first link is the reading on its line, its source is the source the zone credits for that line",
    off.length === 0 && held > 0, off.length ? \`\${n(off.length)} of \${n(held)} name another source: \${few(off)}\` : \`\${n(held)} first links against their zones' own credits · \${n(lineIsNotFirst)} words whose line is another reading (a name leads it) and \${n(noCredit)} with no credit on the zone, not held\`);
}`],
  // ---- K4: the walk of the file, and the zone's own counts ----
  [`    let words = 0, links = 0, linked = 0, bare = 0;
    for (const sec of s.sections) for (const c of sec.cells) { words += 1; links += c.reads.length; if (c.reads.length) linked += 1; else bare += 1; }
    const c = s.counts;
    if (!(c.words === words && c.links === links && c.words_with_a_reading === linked && c.words_with_none === bare
      && c.sections === s.sections.length && c.distinct_fingerprints === Object.keys(s.full_by_short).length))
      countOff.push(\`\${b}: says \${n(c.words)}/\${n(c.links)}, a walk finds \${n(words)}/\${n(links)}\`);
    for (const v of [c.words, c.links, c.sections]) if (!page.includes(Number(v).toLocaleString())) countOff.push(\`\${b}: the page does not print \${n(v)}\`);
  }`,
   `    let words = 0, marks = 0, links = 0, linked = 0, bare = 0;
    for (const sec of s.sections) for (const c of sec.cells) {
      if (c.mark) { marks += 1; continue; }
      words += 1;
      const mine = c.halves ? c.halves.reduce((a, h) => a + h.reads.length, 0) : c.reads.length;
      links += mine; if (mine) linked += 1; else bare += 1;
    }
    const c = s.counts;
    if (!(c.words === words && c.marks === marks && c.links === links && c.words_with_a_reading === linked && c.words_with_none === bare
      && c.sections === s.sections.length && c.distinct_fingerprints === Object.keys(s.full_by_short).length))
      countOff.push(\`\${b}: says \${n(c.words)} words, \${n(c.marks)} marks, \${n(c.links)} links; a walk finds \${n(words)}, \${n(marks)}, \${n(links)}\`);
    for (const v of [c.words, c.words_with_a_reading, c.words_with_none, c.marks, c.links, c.sections]) if (!page.includes(n(v))) countOff.push(\`\${b}: the page does not print \${n(v)}\`);
    // K4b: the book's own counts, off the zone's receipt
    if (haveZone(b)) {
      const zc = zoneOf(b).counts || {};
      const want = { words: zc.c0_on, marks: zc.c0_off, words_with_a_reading: zc.glossed_words };
      if (Object.values(want).some((v) => !Number.isInteger(v))) bookOff.push(\`\${b}: the zone's receipt does not carry its words, marks and glossed words\`);
      else {
        const diff = Object.entries(want).filter(([k, v]) => c[k] !== v).map(([k, v]) => \`\${k.replace(/_/gu, " ")} \${n(c[k])}, the book has \${n(v)}\`);
        if (diff.length) bookOff.push(\`\${b}: \${diff.join("; ")}\`);
        else booksHeld += 1;
      }
    }
  }`],
  [`  const off = [], countOff = [];
  for (const b of books) {
    const s = car(b), page = readFileSync(join(DIR, b, "index.html"), "utf8");`,
   `  const off = [], countOff = [], bookOff = [];
  let booksHeld = 0;
  for (const b of books) {
    const s = car(b), page = readFileSync(join(DIR, b, "index.html"), "utf8");`],
  [`  check("  and the counts the page prints are what a walk of the file finds",
    countOff.length === 0, countOff.length ? few(countOff) : \`\${books.length} page(s) recounted from their own sections\`);`,
   `  check("  and the counts the page prints are what a walk of the file finds",
    countOff.length === 0, countOff.length ? few(countOff) : \`\${books.length} page(s) recounted from their own sections\`);
  check("K4b  and they are the book's own counts: its words, its scribal marks and its words that carry a reading, off the zone's receipt",
    bookOff.length === 0 && booksHeld > 0, bookOff.length ? few(bookOff) : \`\${booksHeld} book(s) against their zones' own counts\`);`],
]);
