// The chain book, held to the zone it mirrors (the review's T2 and T4; the fifth reader's findings 4, 5, 14, 15).
//  - a scribal mark is not a word: it keeps its place in the file and is counted as a mark
//  - a word written one way and read another carries its halves, each looked up under its own key
//  - the source printed beside a reading is its oldest carrier by the row's WORDING year (the store's
//    carriersOf), the rule the card credits by; the edition year, which most sources do not state, chose it before
//  - numbers print one way on every machine; the tool runs from a path with a space in it
// node 04-chain-book.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const F = join(R, "tools", "build-chain-book-v1.mjs");

edit(F, [
  // ---- one way to print a number ----
  [`const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const esc = (s) =>`,
   `const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
// a number prints one way on every machine: the pages' own sha256 is printed
// as custody, and a page that follows the builder's locale is another file
const num = (v) => Number(v).toLocaleString("en-US");
const esc = (s) =>`],
  [`  const rows = books.map((b) => \`<li>
   <a href="\${esc(b.slug)}/">\${esc(b.slug)}</a>
   <span class="c"><b>\${b.c.sections.toLocaleString()}</b> sections · <b>\${b.c.words.toLocaleString()}</b> words · <b>\${b.c.links.toLocaleString()}</b> links · <b>\${b.c.distinct_fingerprints.toLocaleString()}</b> distinct fingerprints · \${(b.carKB + b.pgKB).toFixed(0)} KB</span>`,
   `  const rows = books.map((b) => \`<li>
   <a href="\${esc(b.slug)}/">\${esc(b.slug)}</a>
   <span class="c"><b>\${num(b.c.sections)}</b> sections · <b>\${num(b.c.words)}</b> words · <b>\${num(b.c.links)}</b> links · <b>\${num(b.c.distinct_fingerprints)}</b> distinct fingerprints · \${(b.carKB + b.pgKB).toFixed(0)} KB</span>`],
  [`— \${tot.words.toLocaleString()} words of \${servedWords.total.toLocaleString()}. The rest`, `— \${num(tot.words)} words of \${num(servedWords.total)}. The rest`],
  [`near \${(Math.round((servedWords.total * (tot.kb / Math.max(1, tot.words))) / 1024 / 50) * 50).toLocaleString()} MB of files.`, `near \${num(Math.round((servedWords.total * (tot.kb / Math.max(1, tot.words))) / 1024 / 50) * 50)} MB of files.`],
  [`<p class="nums">\${books.length} book\${books.length === 1 ? "" : "s"} · \${tot.words.toLocaleString()} words · \${tot.links.toLocaleString()} links · \${(tot.kb / 1024).toFixed(1)} MB</p>`,
   `<p class="nums">\${books.length} book\${books.length === 1 ? "" : "s"} · \${num(tot.words)} words · \${num(tot.links)} links · \${(tot.kb / 1024).toFixed(1)} MB</p>`],
  [`  console.log(\`\${join(dir, "index.html")} · \${books.length} books · \${tot.words.toLocaleString()} words · \${tot.links.toLocaleString()} links · \${(tot.kb / 1024).toFixed(1)} MB on disk\`);`,
   `  console.log(\`\${join(dir, "index.html")} · \${books.length} books · \${num(tot.words)} words · \${num(tot.links)} links · \${(tot.kb / 1024).toFixed(1)} MB on disk\`);`],
  // ---- the main guard: the file this process was started on, however its path is spelled ----
  [`import { fileURLToPath } from "node:url";`, `import { fileURLToPath, pathToFileURL } from "node:url";`],
  [`import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";`, `import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, realpathSync } from "node:fs";`],
  [`if (import.meta.url === \`file://\${process.argv[1]}\`) {
  if (process.argv.includes("--index")) {`,
   `// run as a program, not imported by the check: asked of the path itself (a
// path with a space or a link in it is still this file; the string compare
// this replaced answered no, and the tool then wrote nothing and exited 0)
const startedHere = (() => { try { return !!process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } })();
if (startedHere) {
  if (process.argv.includes("--index")) {`],
  // ---- the index's "words the reading side serves": words, not marks ----
  [`    for (const z of zs) { const d = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${z}.bin\`)).toString("utf8")); for (const s of d.sections || []) total += (s.words || []).length; }`,
   `    for (const z of zs) { const d = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${z}.bin\`)).toString("utf8")); for (const s of d.sections || []) total += (s.words || []).filter((w) => !w.mark).length; }`],
  // ---- the walk ----
  [`  let words = 0, linked = 0, links = 0, bare = 0;
  const rows = [];
  for (const sec of zone.sections || []) {
    const cells = [];
    for (const w of (sec.words || [])) {
      words += 1;
      const surface = String(w.s ?? "");
      const key = String(w.k ?? "");
      const wf = keep(surface), kf = key ? keep(key) : null;
      // the readings this word's key stands on, in the order the card offers
      // them: the store's own pool, oldest first — the same call the page makes
      const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
      const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
      if (pool.length) linked += 1; else bare += 1;
      const reads = pool.map((p) => {
        links += 1;
        // WHO CARRIES IT. The pool names its carriers in \`by\` — every m id
        // whose record stands behind this reading. The chain prints the
        // OLDEST of them, because that is the one the card credits, and
        // carries the rest in the file: a link with no carrier named is a
        // link a reader cannot follow back to anybody.
        const carriers = [...(p.by || [])].filter((m) => ms[m]);
        const oldest = carriers.map((m) => ({ m, y: Number.parseInt(ms[m].sourceYear, 10) }))
          .sort((a, b) => (Number.isFinite(a.y) ? a.y : Infinity) - (Number.isFinite(b.y) ? b.y : Infinity))[0];
        return {
          r: keep(p.text),
          s: oldest ? keep(ms[oldest.m].label) : null,
          by: carriers.length > 1 ? carriers.map((m) => keep(ms[m].label)) : undefined,
          y: Number.isFinite(p.year) ? p.year : null,
        };
      });
      cells.push({ w: wf, k: kf, reads, mark: w.mark ? keep(w.mark.kind) : null });
    }
    rows.push({ label: String(sec.label ?? ""), lf: keep(String(sec.label ?? "")), cells });
  }`,
   `  let words = 0, marks = 0, linked = 0, links = 0, bare = 0, pairs = 0;
  // the readings a key stands on, in the store's own order: the store's pool
  // over every admitted row, oldest first, every source switched on (the
  // reading page's card starts from this pool and then applies the reader's
  // own switches, which a file of joins has none of)
  const readsOf = (key) => {
    const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
    const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
    return pool.map((p) => {
      links += 1;
      // WHO CARRIES IT. The pool names its carriers in \`by\` — every m id
      // whose record stands behind this reading. The chain prints the
      // OLDEST of them, because that is the one the card credits, and
      // carries the rest in the file: a link with no carrier named is a
      // link a reader cannot follow back to anybody. Oldest is the store's
      // own answer (carriersOf: by the row's wording year). Until 10
      // November 2026 it was chosen here by the source's edition year, which
      // most sources do not state, and the link named a later source than the
      // card does.
      const carriers = [...(p.by || [])].filter((m) => ms[m]);
      const oldest = store.carriersOf(rrows, p.text)[0] || null;
      return {
        r: keep(p.text),
        s: oldest ? keep(ms[oldest[3]].label) : null,
        by: carriers.length > 1 ? carriers.map((m) => keep(ms[m].label)) : undefined,
        y: Number.isFinite(p.year) ? p.year : null,
      };
    });
  };
  const rows = [];
  for (const sec of zone.sections || []) {
    const cells = [];
    for (const w of (sec.words || [])) {
      const wf = keep(String(w.s ?? ""));
      // A MARK IS NOT A WORD. The scribes' marks (the verse end, the section
      // breaks, the bar between two words) keep their place in the file, so
      // the shape is still the book's shape entry for entry, and are counted
      // as marks. Until 10 November 2026 each was counted as a word carrying
      // no reading.
      if (w.mark) { marks += 1; cells.push({ w: wf, k: null, reads: [], mark: keep(w.mark.kind) }); continue; }
      words += 1;
      // WRITTEN ONE WAY AND READ ANOTHER. The zone holds such a word as its
      // halves, each with its own letters and its own key, and the reading
      // page reads each half under that key. So does this file: the word's
      // own fingerprint, then each half with its role, its key and its links.
      // Until 10 November 2026 a pair was printed as a word with no key and
      // no reading.
      if (Array.isArray(w.w)) {
        pairs += 1;
        const halves = w.w.map((r) => {
          const hk = String((r && r.k) ?? "");
          const hw = keep(String((r && r.s) ?? "")), hkf = hk ? keep(hk) : null, role = keep(String((r && r.role) ?? ""));
          return { role, w: hw, k: hkf, reads: readsOf(hk) };
        });
        if (halves.some((h) => h.reads.length)) linked += 1; else bare += 1;
        cells.push({ w: wf, k: null, reads: [], halves, mark: null });
        continue;
      }
      const key = String(w.k ?? "");
      const kf = key ? keep(key) : null;
      const reads = readsOf(key);
      if (reads.length) linked += 1; else bare += 1;
      cells.push({ w: wf, k: kf, reads, mark: null });
    }
    rows.push({ label: String(sec.label ?? ""), lf: keep(String(sec.label ?? "")), cells });
  }`],
  [`    schema_version: "CHAIN_BOOK_V1", rule_id: CHAIN_RULE_ID, work: slug,`,
   `    schema_version: "CHAIN_BOOK_V2", rule_id: CHAIN_RULE_ID, work: slug,
    shape: "sections[].cells[] in the book's own order, one cell per entry of the book. A word: { w, k, reads }. A scribal mark: { w, mark } with no key and no reads; it is not a word and is counted in counts.marks. A word written one way and read another: { w, halves: [{ role, w, k, reads }] }, each half under its own key (V2, 10 November 2026; V1 gave a pair no key and no reads, and counted a mark as a word with none). A read: { r, s, by, y } — the reading, its oldest carrier by the wording year of the carrier's own row, every carrier where more than one, the oldest wording year.",`],
  [`        source: "the source's label as the catalog states it",`,
   `        source: "the source's label as the catalog states it",
        mark: "the kind of a scribal mark as the book's own record names it",
        role: "which half of a word written one way and read another, as the book's own record names it",`],
  [`    counts: { sections: rows.length, words, words_with_a_reading: linked, words_with_none: bare, links, distinct_fingerprints: Object.keys(full).length },`,
   `    counts: { sections: rows.length, words, words_with_a_reading: linked, words_with_none: bare, marks, words_written_one_way_and_read_another: pairs, links, distinct_fingerprints: Object.keys(full).length },`],
  // ---- the page ----
  [`      const shown = c.reads.slice(0, PAGE_SHOWS);
      const reads = shown.map((r) => \`<li><b>\${r.r}</b>\${r.s ? \`<i>\${r.s}</i>\` : ""}</li>\`).join("");
      const rest = c.reads.length - shown.length;
      const more = rest > 0 ? \`<li class="more">and \${rest.toLocaleString()} more link\${rest === 1 ? "" : "s"}, in the file</li>\` : "";
      return \`<div class="w"><p class="k">\${c.w}\${c.k ? \`<span>\${c.k}</span>\` : ""}</p>\${reads ? \`<ul>\${reads}\${more}</ul>\` : \`<p class="none">no reading</p>\`}</div>\`;`,
   `      const list = (rs) => {
        const shown = rs.slice(0, PAGE_SHOWS);
        const reads = shown.map((r) => \`<li><b>\${r.r}</b>\${r.s ? \`<i>\${r.s}</i>\` : ""}</li>\`).join("");
        const rest = rs.length - shown.length;
        const more = rest > 0 ? \`<li class="more">and \${num(rest)} more link\${rest === 1 ? "" : "s"}, in the file</li>\` : "";
        return reads ? \`<ul>\${reads}\${more}</ul>\` : \`<p class="none">no reading</p>\`;
      };
      // a mark says it is a mark; a pair prints its own fingerprint and then each half
      if (c.mark) return \`<div class="w"><p class="k">\${c.w}</p><p class="none">a scribal mark, not a word</p></div>\`;
      if (c.halves) return \`<div class="w"><p class="k">\${c.w}</p><p class="none">written one way and read another</p>\${c.halves.map((h) => \`<div class="h"><p class="k">\${h.w}\${h.k ? \`<span>\${h.k}</span>\` : ""}</p>\${list(h.reads)}</div>\`).join("")}</div>\`;
      return \`<div class="w"><p class="k">\${c.w}\${c.k ? \`<span>\${c.k}</span>\` : ""}</p>\${list(c.reads)}</div>\`;`],
  [` .w li.more { color:var(--faint); font-size:.7rem; }`,
   ` .w li.more { color:var(--faint); font-size:.7rem; }
 .w .h { margin:.25rem 0 0 .5rem; border-left:1px solid var(--line); padding-left:.45rem; }`],
  [`<p class="nums">\${c.sections.toLocaleString()} sections · \${c.words.toLocaleString()} words · \${c.words_with_a_reading.toLocaleString()} carry a reading · \${c.words_with_none.toLocaleString()} carry none · \${c.links.toLocaleString()} links · \${c.distinct_fingerprints.toLocaleString()} distinct fingerprints · route store \${esc(store.index.store_version)}</p>
<p class="nums">This page prints the first \${PAGE_SHOWS} links under each word and says how many it left out. <a href="chain-v1.json.gz">chain-v1.json.gz</a> beside it carries all \${c.links.toLocaleString()}, with every fingerprint at its full 64 digits.</p>`,
   `<p class="nums">\${num(c.sections)} sections · \${num(c.words)} words · \${num(c.words_with_a_reading)} carry a reading · \${num(c.words_with_none)} carry none · \${num(c.marks)} scribal marks, which are not words · \${num(c.links)} links · \${num(c.distinct_fingerprints)} distinct fingerprints · route store \${esc(store.index.store_version)}</p>
<p class="nums">This page prints the first \${PAGE_SHOWS} links under each word and says how many it left out. <a href="chain-v1.json.gz">chain-v1.json.gz</a> beside it carries all \${num(c.links)}, with every fingerprint at its full 64 digits.</p>`],
  [`<dt>a reading</dt><dd>the reading's English text as the card prints it. The pale number after it is the label of the oldest source carrying that reading; where more than one carries it, the file lists them all.</dd>`,
   `<dt>a reading</dt><dd>the reading's English text as the card prints it. The pale number after it is the label of the oldest source carrying that reading, oldest by the year its own words for the reading were written; where more than one carries it, the file lists them all. The links under a word are every reading the catalog holds for its key, oldest first, with every source switched on; the reading page starts from the same list and then applies the reader's own switches.</dd>
<dt>a mark</dt><dd>the scribes' marks (the end of a verse, a section break, the bar between two words) keep their place and are not words. The number is the mark as the page prints it.</dd>
<dt>a word written one way and read another</dt><dd>the number is the whole word as the page prints it; under it stand its halves, each with its own key and its own links.</dd>`],
  [`<footer>Built by <code>tools/build-chain-book-v1.mjs</code> from the same zone and the same route store the reading page is built from, at the same moment, by the same code. If this book and that one ever disagree in shape — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>`,
   `<footer>Built by <code>tools/build-chain-book-v1.mjs</code> from the same zone and the same route store the reading page is built from, in the same round. If this book and that one ever disagree in shape — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>`],
  [`  console.log(\`\${join(OUT, "index.html")} · \${c.sections} sections · \${c.words.toLocaleString()} words · \${c.links.toLocaleString()} links · \${c.distinct_fingerprints.toLocaleString()} distinct fingerprints · \${(page.length / 1024).toFixed(0)} KB\`);`,
   `  console.log(\`\${join(OUT, "index.html")} · \${c.sections} sections · \${num(c.words)} words (\${num(c.words_with_a_reading)} carry a reading, \${num(c.words_with_none)} none) · \${num(c.marks)} marks · \${num(c.links)} links · \${num(c.distinct_fingerprints)} distinct fingerprints · \${(page.length / 1024).toFixed(0)} KB\`);`],
]);
