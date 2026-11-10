#!/usr/bin/env node
// Synthesis lane · chain-book-rule-v1-the-same-book-with-the-meaning-taken-out-so-only-the-joins-are-left
// LEDGER: -
// no frame letter. This serves no reading, changes no letter and decides
// nothing. It republishes a book this site already serves with every visible
// thing replaced by the fingerprint of its own bytes.
//
// THE POINT, WHICH IS NOT DECORATION. This project's whole claim is that a
// particular English is attached to a particular Hebrew by a stated rule, and
// that nothing in between was written, edited or chosen by us. Ordinarily a
// reader has to take that on trust: the page is in our typeface, our words
// sit beside theirs, and the join happens somewhere they cannot see.
//
// Take the meaning out and only the join is left. A word becomes a number. A
// reading becomes a number. The line between them is then a line between two
// fixed things, and a stranger can walk the whole book without reading a
// sentence of our prose or believing a word of it. If the shape here is the
// shape of the real book — same sections, same words, same order, same links
// — then the real book has nothing hidden in it, because this one could not
// hide anything: there is nothing here BUT structure.
//
// WHAT A FINGERPRINT IS COMPUTED FROM, exactly, so anyone can recompute it
// without asking us. Every hash below is sha256 over UTF-8 bytes, with no
// normalisation, no trimming and no case folding, printed as its first 12 hex
// digits and carried in full in the sidecar beside the page:
//
//   the word        the Hebrew AS THE PAGE PRINTS IT, vowels, cantillation
//                   and all — the licensed text, untouched
//   the key         the consonantal key that word is looked up under
//   a reading       the reading's English text as the card prints it
//   a source        the source's label as the catalog states it
//
// WHAT IT PROVES AND WHAT IT DOES NOT. It proves custody: that the bytes we
// serve are the bytes we received, and that the line from a word to a reading
// goes where we say it goes. It cannot prove a dictionary was right. A
// fingerprint is a fact about a file, never about the truth of what the file
// says, and a page that claimed otherwise would be worth nothing.
//
// Run: node tools/build-chain-book-v1.mjs --zone data/zones/amos.bin --out ../chain/amos
//      node tools/build-chain-book-v1.mjs --index --dir ../chain
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startedAs } from "./main-guard-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";

export const CHAIN_RULE_ID = "chain-book-rule-v1-the-same-book-with-the-meaning-taken-out-so-only-the-joins-are-left";
export const CHAIN_SHORT = 12;
/** how many links the PAGE prints per word; the file beside it carries them all */
export const PAGE_SHOWS = 6;
/** the one function, stated in the page and used nowhere else: sha256 over the UTF-8 bytes, untouched */
export const fp = (s) => createHash("sha256").update(String(s), "utf8").digest("hex");
export const shortFp = (s) => fp(s).slice(0, CHAIN_SHORT);

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
// a number prints one way on every machine: the pages' own sha256 is printed
// as custody, and a page that follows the builder's locale is another file
const num = (v) => Number(v).toLocaleString("en-US");
const esc = (s) => String(s).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

/** ONE STYLESHEET FOR BOTH PAGES, because the index and the books it lists are
 *  the same publication and a reader who follows a link from one to the other
 *  should not be able to tell they were built by different code paths. */
export const CHAIN_CSS = `
 :root { --ink:#642460; --faint:#753c6d; --muted:#753c6d; --line:#a06c10; --paper:#ebdec3; --sel:#642460; --tekhelet:#23558a; }
 /* one face, linen, since 2026-09-10; the dark face came off this sheet 2026-10-02.
    The reader's own values since 2026-10-10 (the owner: "personally i dont see a
    gain from more than 2/2/2/2 and 3 linen"; "my main point is uniform coloring
    between logo and site"): the page's ground, the purple regular for titles
    and the dim for text and links, the dim gold for every rule. The paler paper,
    the faint label purple and the gold used as a title's ink are folded in. */
 * { box-sizing: border-box; }
 body { margin:0; padding:1rem 16px 4rem; background:var(--paper); color:var(--ink);
   font:15px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
 .wrap { max-width: 58rem; margin: 0 auto; }
 h1 { font-size: 1rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin:0 0 .3rem; }
 .lede { font-size:.82rem; color:var(--muted); line-height:1.6; max-width:44rem; margin:0 0 .6rem; }
 .lede b { color: var(--ink); font-weight:600; }
 details.recipe { border:1px solid var(--line); border-radius:.5rem; padding:.5rem .7rem; margin:.8rem 0 1.2rem; }
 details.recipe > summary { cursor:pointer; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
 details.recipe dl { margin:.6rem 0 0; font-size:.76rem; }
 details.recipe dt { color:var(--sel); }
 details.recipe dd { margin:0 0 .45rem; color:var(--muted); }
 .nums { font-size:.74rem; color:var(--faint); margin:.2rem 0 0; }
 section { border-top:1px solid var(--line); padding:.7rem 0 .2rem; }
 h2 { font-size:.72rem; color:var(--sel); margin:0 0 .5rem; font-weight:600; letter-spacing:.04em; }
 h2 i { font-style:normal; color:var(--faint); padding-left:.5rem; }
 .ws { display:grid; grid-template-columns:repeat(auto-fill,minmax(14.5rem,1fr)); gap:.5rem .9rem; }
 .w { border-left:1px solid var(--line); padding:0 0 .35rem .5rem; }
 .w .k { margin:0; font-size:.8rem; color:var(--ink); }
 .w .k span { color:var(--faint); padding-left:.45rem; font-size:.74rem; }
 .w ul { list-style:none; margin:.15rem 0 0; padding:0; }
 .w li { font-size:.74rem; color:var(--tekhelet); line-height:1.45; }
 .w li b { font-weight:400; }
 .w li i { font-style:normal; color:var(--faint); padding-left:.4rem; font-size:.7rem; }
 .w .none { margin:.15rem 0 0; font-size:.72rem; color:var(--faint); }
 .w li.more { color:var(--faint); font-size:.7rem; }
 .w .h { margin:.25rem 0 0 .5rem; border-left:1px solid var(--line); padding-left:.45rem; }
 footer { margin-top:2rem; font-size:.72rem; color:var(--faint); line-height:1.6; max-width:44rem; }
 a { color:var(--muted); }
 ul.books { list-style:none; margin:.2rem 0 0; padding:0; }
 ul.books li { border-top:1px solid var(--line); padding:.55rem 0; display:flex; flex-wrap:wrap; gap:.15rem .7rem; align-items:baseline; }
 ul.books li a { font-size:.9rem; text-decoration:none; }
 ul.books li a:hover { text-decoration:underline; }
 ul.books .c { font-size:.72rem; color:var(--faint); }
 ul.books .c b { font-weight:400; color:var(--muted); }
 ul.books .fp { font-size:.72rem; color:var(--tekhelet); width:100%; word-break:break-all; }
 p.away { font-size:.76rem; color:var(--muted); line-height:1.6; max-width:44rem; margin:1.4rem 0 0; border-top:1px solid var(--line); padding-top:.8rem; }
`;

/** THE INDEX IS ITSELF A CUSTODY RECORD, not a table of contents.
 *
 *  A list of links would be this site talking about its own chain, which is
 *  the one thing the chain exists to make unnecessary. So the index prints,
 *  beside each book, the sha256 OF THAT BOOK'S CHAIN FILE — the whole 64,
 *  over the bytes as served. A reader downloads the file, hashes it, and
 *  compares; if it matches, everything inside it is the copy this page
 *  stands behind, and every fingerprint in it can be recomputed from there
 *  without ever running our code. The index is the root of the tree and the
 *  only number on it that a reader has to take from us is the first one they
 *  check for themselves.
 *
 *  It also names what is NOT here. A chain of the whole shelf is about half
 *  a gigabyte — the links outnumber the words by sixty to one — so this
 *  carries a stated subset and says which books it left out and why, in
 *  words, with the arithmetic. A silent subset is a claim of completeness. */
export function writeIndex(dir, servedWords = null) {
  const books = [];
  for (const slug of (existsSync(dir) ? readdirSync(dir) : []).sort()) {
    const car = join(dir, slug, "chain-v1.json.gz"), pg = join(dir, slug, "index.html");
    if (!existsSync(car) || !existsSync(pg)) continue;
    const carBytes = readFileSync(car), pgBytes = readFileSync(pg);
    const s = JSON.parse(gunzipSync(carBytes).toString("utf8"));
    books.push({ slug, c: s.counts, store: (s.store || {}).store_version || "—",
      car: createHash("sha256").update(carBytes).digest("hex"),
      pgfp: createHash("sha256").update(pgBytes).digest("hex"),
      carKB: carBytes.length / 1024, pgKB: pgBytes.length / 1024 });
  }
  const tot = books.reduce((a, b) => ({ words: a.words + b.c.words, links: a.links + b.c.links, kb: a.kb + b.carKB + b.pgKB }), { words: 0, links: 0, kb: 0 });

  const rows = books.map((b) => `<li>
   <a href="${esc(b.slug)}/">${esc(b.slug)}</a>
   <span class="c"><b>${num(b.c.sections)}</b> sections · <b>${num(b.c.words)}</b> words · <b>${num(b.c.links)}</b> links · <b>${num(b.c.distinct_fingerprints)}</b> distinct fingerprints · ${(b.carKB + b.pgKB).toFixed(0)} KB</span>
   <span class="fp">chain-v1.json.gz &nbsp;${b.car}</span>
   <span class="fp">index.html &nbsp;${b.pgfp}</span>
  </li>`).join("\n");

  // said only while books are away: chained whole, the shelf has nothing to
  // name as left out, and the paragraph would have claimed a subset of itself
  const away = servedWords && servedWords.total && books.length < servedWords.books
    ? `<p class="away">This is ${books.length} book${books.length === 1 ? "" : "s"} of the ${servedWords.books} the reading side serves — ${num(tot.words)} words of ${num(servedWords.total)}. The rest are not here and the reason is size, not doubt: a word here costs about ${Math.round((tot.kb * 1024) / Math.max(1, tot.words))} bytes once its links are written out, because the links outnumber the words roughly ${Math.round(tot.links / Math.max(1, tot.words))} to one, so chaining the whole shelf would be near ${num(Math.round((servedWords.total * (tot.kb / Math.max(1, tot.words))) / 1024 / 50) * 50)} MB of files. Every book that is here was built by the same command from the same zone and the same route store as the page that reads it. Nothing was chosen for being clean.</p>`
    : "";

  const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>the chain</title>
${canon("/chain/")}
<style>${CHAIN_CSS}</style></head><body><div class="wrap">
<h1>the chain</h1>
<p class="lede">These are books this site serves, with the meaning taken out. Every word is the fingerprint of its own bytes, every reading is the fingerprint of its own text, and the line between them is the line a reader is shown on the reading page. <b>Nothing in them is written by this project.</b> Strip the language away and only the joins are left, so a stranger can walk a whole book without reading a sentence of our prose or believing any of it.</p>
<p class="lede">The two numbers under each book are the sha256 of the files themselves, as served. Download one, hash it, compare. If it matches, everything inside it is the copy this page stands behind — and every fingerprint inside it can be recomputed the same way, with a tool that is not ours.</p>
<p class="nums">${books.length} book${books.length === 1 ? "" : "s"} · ${num(tot.words)} words · ${num(tot.links)} links · ${(tot.kb / 1024).toFixed(1)} MB</p>
<details class="recipe"><summary>how to recompute any number on this page</summary>
<dl>
<dt>the function</dt><dd>sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding. A book's pages print the first ${CHAIN_SHORT} hex digits; all 64 for every one of them are in that book's chain-v1.json.gz. The two numbers on this page are sha256 over the FILES, byte for byte as served.</dd>
<dt>a word</dt><dd>the Hebrew as the reading page prints it — vowels, cantillation and all, the licensed text untouched.</dd>
<dt>a reading</dt><dd>the reading's English text as the card prints it, joined to the word by the same rule the reading page joins them by.</dd>
<dt>what it proves</dt><dd>custody: the bytes served are the bytes received, and the line from a word to a reading goes where this site says it goes.</dd>
<dt>what it does not prove</dt><dd>that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.</dd>
</dl></details>
<ul class="books">
${rows}
</ul>
${away}
<footer>Built by <code>tools/build-chain-book-v1.mjs</code> from the same zones and the same route store the reading pages are built from, by the same code. If a book here and the book it mirrors ever disagree in shape — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>
</div></body></html>`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page);
  console.log(`${join(dir, "index.html")} · ${books.length} books · ${num(tot.words)} words · ${num(tot.links)} links · ${(tot.kb / 1024).toFixed(1)} MB on disk`);
  return { books: books.length, words: tot.words, links: tot.links };
}

// THE PAGE NAMES ITS OWN ADDRESS (Search Console, 2026-10-08: pages with no
// canonical were filed as duplicates of each other). The host is the one the
// site answers at, read from CNAME beside the site root as the door reads it;
// a checkout with no CNAME writes no canonical rather than a guessed one.
const SITE_HOST = (() => { try { return readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "CNAME"), "utf8").trim(); } catch { return ""; } })();
const canon = (path) => (SITE_HOST ? `<link rel="canonical" href="https://${SITE_HOST}${path}">` : "");

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  if (process.argv.includes("--index")) {
    const DIR = arg("--dir", join("..", "chain"));
    // what the reading side serves, asked of the shelf rather than typed here
    const { zonesServed } = await import("./zones-on-disk-v1.mjs");
    const zs = zonesServed();
    let total = 0;
    for (const z of zs) { const d = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")); for (const s of d.sections || []) total += (s.words || []).filter((w) => !w.mark).length; }
    writeIndex(DIR, { books: zs.length, total });
    process.exit(0);
  }
  const ZONE = arg("--zone"), STORE = arg("--store", "data/route-store");
  if (!ZONE) { console.error("missing --zone data/zones/<slug>.bin"); process.exit(2); }
  const slug = ZONE.split("/").pop().replace(/\.bin$/u, "");
  const OUT = arg("--out", join("..", "chain", slug));
  const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
  const store = openRouteStore(STORE);
  const ms = store.index.m_sources;

  const full = {};                      // short -> the whole 64, so nothing is only truncated
  const keep = (s) => { const h = fp(s); full[h.slice(0, CHAIN_SHORT)] = h; return h.slice(0, CHAIN_SHORT); };

  let words = 0, marks = 0, linked = 0, links = 0, bare = 0, pairs = 0;
  // the readings a key stands on, in the store's own order: the store's pool
  // over every admitted row, oldest first, every source switched on (the
  // reading page's card starts from this pool and then applies the reader's
  // own switches, which a file of joins has none of)
  const readsOf = (key) => {
    const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
    const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
    return pool.map((p) => {
      links += 1;
      // WHO CARRIES IT. The pool names its carriers in `by` — every m id
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
  }

  const sidecar = {
    schema_version: "CHAIN_BOOK_V2", rule_id: CHAIN_RULE_ID, work: slug,
    shape: "sections[].cells[] in the book's own order, one cell per entry of the book. A word: { w, k, reads }. A scribal mark: { w, mark } with no key and no reads; it is not a word and is counted in counts.marks. A word written one way and read another: { w, halves: [{ role, w, k, reads }] }, each half under its own key (V2, 10 November 2026; V1 gave a pair no key and no reads, and counted a mark as a word with none). A read: { r, s, by, y } — the reading, its oldest carrier by the wording year of the carrier's own row, every carrier where more than one, the oldest wording year.",
    recipe: {
      function: "sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding",
      printed: `the first ${CHAIN_SHORT} hex digits; the whole 64 for every one of them is in full_by_short below`,
      inputs: {
        word: "the Hebrew as the page prints it — vowels, cantillation and all, the licensed text untouched",
        key: "the consonantal key the word is looked up under",
        reading: "the reading's English text as the card prints it",
        source: "the source's label as the catalog states it",
        mark: "the kind of a scribal mark as the book's own record names it",
        role: "which half of a word written one way and read another, as the book's own record names it",
        section: "the section's label as the page prints it",
      },
      recompute: "take the string, sha256 it, compare the first 12 hex digits. Nothing here needs this site's code to check.",
    },
    what_this_proves: "custody: that the bytes served are the bytes received, and that the line from a word to a reading goes where this site says it goes",
    what_this_does_not_prove: "that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.",
    store: { dir: STORE, store_version: store.index.store_version, schema: store.index.schema_version },
    counts: { sections: rows.length, words, words_with_a_reading: linked, words_with_none: bare, marks, words_written_one_way_and_read_another: pairs, links, distinct_fingerprints: Object.keys(full).length },
    full_by_short: full,
    sections: rows,
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "chain-v1.json.gz"), gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));

  // ── the page ──────────────────────────────────────────────────────────────
  const body = rows.map((sec) => {
    const cells = sec.cells.map((c) => {
      // THE PAGE IS A WINDOW ON THE FILE, and says so. A word can carry a
      // hundred and sixty-five readings; printing every one of them for every
      // word makes a four-megabyte page nobody opens on a phone. So the page
      // shows the first few and names how many it did not show, and the file
      // beside it carries every link with no window at all. The auditor wants
      // the file; the page is for seeing what shape the file is in.
      const list = (rs) => {
        const shown = rs.slice(0, PAGE_SHOWS);
        const reads = shown.map((r) => `<li><b>${r.r}</b>${r.s ? `<i>${r.s}</i>` : ""}</li>`).join("");
        const rest = rs.length - shown.length;
        const more = rest > 0 ? `<li class="more">and ${num(rest)} more link${rest === 1 ? "" : "s"}, in the file</li>` : "";
        return reads ? `<ul>${reads}${more}</ul>` : `<p class="none">no reading</p>`;
      };
      // a mark says it is a mark; a pair prints its own fingerprint and then each half
      if (c.mark) return `<div class="w"><p class="k">${c.w}</p><p class="none">a scribal mark, not a word</p></div>`;
      if (c.halves) return `<div class="w"><p class="k">${c.w}</p><p class="none">written one way and read another</p>${c.halves.map((h) => `<div class="h"><p class="k">${h.w}${h.k ? `<span>${h.k}</span>` : ""}</p>${list(h.reads)}</div>`).join("")}</div>`;
      return `<div class="w"><p class="k">${c.w}${c.k ? `<span>${c.k}</span>` : ""}</p>${list(c.reads)}</div>`;
    }).join("");
    return `<section><h2>${sec.lf}<i>${esc(sec.label)}</i></h2><div class="ws">${cells}</div></section>`;
  }).join("\n");

  const c = sidecar.counts;
  const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(slug)} · the same book with the meaning taken out</title>
${canon(`/chain/${slug}/`)}
<style>${CHAIN_CSS}</style></head><body><div class="wrap">
<h1><a href="../">the chain</a> · ${esc(slug)}</h1>
<p class="lede">This is the same book this site serves, with the meaning taken out. Every word is the fingerprint of its own bytes, every reading is the fingerprint of its own text, and the line between them is the line the reader is shown. <b>Nothing here is written by this project.</b> Strip the language away and only the joins are left, so you can walk the whole book without reading a sentence of our prose or believing any of it.</p>
<p class="nums">${num(c.sections)} sections · ${num(c.words)} words · ${num(c.words_with_a_reading)} carry a reading · ${num(c.words_with_none)} carry none · ${num(c.marks)} scribal marks, which are not words · ${num(c.links)} links · ${num(c.distinct_fingerprints)} distinct fingerprints · route store ${esc(store.index.store_version)}</p>
<p class="nums">This page prints the first ${PAGE_SHOWS} links under each word and says how many it left out. <a href="chain-v1.json.gz">chain-v1.json.gz</a> beside it carries all ${num(c.links)}, with every fingerprint at its full 64 digits.</p>
<details class="recipe"><summary>how to recompute any number on this page</summary>
<dl>
<dt>the function</dt><dd>sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding. Printed as the first ${CHAIN_SHORT} hex digits; all 64 for every one of them are in <a href="chain-v1.json.gz">chain-v1.json.gz</a> beside this page.</dd>
<dt>a word</dt><dd>the Hebrew as the page prints it — vowels, cantillation and all, the licensed text untouched. The pale number beside it is its consonantal key.</dd>
<dt>a reading</dt><dd>the reading's English text as the card prints it. The pale number after it is the label of the oldest source carrying that reading, oldest by the year its own words for the reading were written; where more than one carries it, the file lists them all. The links under a word are every reading the catalog holds for its key, oldest first, with every source switched on; the reading page starts from the same list and then applies the reader's own switches.</dd>
<dt>a mark</dt><dd>the scribes' marks (the end of a verse, a section break, the bar between two words) keep their place and are not words. The number is the mark as the page prints it.</dd>
<dt>a word written one way and read another</dt><dd>the number is the whole word as the page prints it; under it stand its halves, each with its own key and its own links.</dd>
<dt>what it proves</dt><dd>custody: the bytes served are the bytes received, and the line from a word to a reading goes where this site says it goes.</dd>
<dt>what it does not prove</dt><dd>that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.</dd>
</dl></details>
${body}
<footer>Built by <code>tools/build-chain-book-v1.mjs</code> from the same zone and the same route store the reading page is built from, in the same round. If this book and that one ever disagree in shape — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>
</div></body></html>`;
  writeFileSync(join(OUT, "index.html"), page);
  console.log(`${join(OUT, "index.html")} · ${c.sections} sections · ${num(c.words)} words (${num(c.words_with_a_reading)} carry a reading, ${num(c.words_with_none)} none) · ${num(c.marks)} marks · ${num(c.links)} links · ${num(c.distinct_fingerprints)} distinct fingerprints · ${(page.length / 1024).toFixed(0)} KB`);
}
