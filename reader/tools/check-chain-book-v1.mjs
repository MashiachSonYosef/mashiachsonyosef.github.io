#!/usr/bin/env node
// GUARDS: chain-book-rule-v1-the-same-book-with-the-meaning-taken-out-so-only-the-joins-are-left
//
// THE EVIDENCE PAGE, HELD TO WHAT IT CLAIMS.
//
// The chain is the one page on this site whose whole worth is that a stranger
// need not believe us. It republishes a book with every visible thing replaced
// by the fingerprint of its own bytes, so the shape of the real book can be
// walked without reading a sentence of our prose. A page like that is worth
// nothing the moment one number in it is wrong, and it is exactly the kind of
// page that rots quietly: nobody reads it, so nobody notices.
//
// So this recomputes it. Every hash below is taken here, with node's own
// sha256 over UTF-8 bytes — this check never imports the builder's hash
// function, because a check that hashes the way the builder hashes proves only
// that one function agrees with itself.
//
//   K0  the rule this check guards is the rule the builder declares, taken
//       from the builder rather than typed here, so the two cannot drift
//   K1  the chain's shape is the book's shape: same sections, same labels,
//       same words, same order — re-derived from the zone the reading page is
//       built from, never from the chain's own counts block
//   K2  every word and key fingerprint is sha256 of the zone's own string,
//       recomputed here, for every word of every chained book
//   K3  the readings are the store's own pool for that key, in the order the
//       card offers them, and each reading and source fingerprint recomputes —
//       walked in full on the smallest chained book, which is named in the
//       output rather than left to be guessed at
//   K4  the page prints the first twelve of a number the file carries at
//       sixty-four, every short on the page resolves in the file, and the
//       counts the page prints are what a walk of the file actually finds
//   K5  the index's sha256 of each file is the sha256 of that file on disk —
//       the one number a reader checks first, and the root of the whole tree
//   K6  the index names every book that has a chain and no book that does not
//   K7  and the meaning really is taken out: no Hebrew of the corpus and no
//       reading of a dictionary is printed anywhere on a chain page
//
// SKIPS by name when no chain is on the shelf.
//
// Run: node tools/check-chain-book-v1.mjs [--dir ../chain]
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { CHAIN_RULE_ID, CHAIN_SHORT, PAGE_SHOWS } from "./build-chain-book-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const n = (v) => Number(v).toLocaleString();
const few = (a, k = 3) => a.slice(0, k).join(" · ") + (a.length > k ? ` … and ${a.length - k} more` : "");

// THIS CHECK'S OWN HASH, taken from node and not from the thing under test.
const sha = (s) => createHash("sha256").update(String(s), "utf8").digest("hex");
const short = (s) => sha(s).slice(0, CHAIN_SHORT);

const DIR = arg("--dir", join("..", "chain"));
const STORE = arg("--store", "data/route-store");
if (!existsSync(DIR)) { console.log(`SKIPPED — no chain on the shelf at ${DIR}`); process.exit(3); }
const books = readdirSync(DIR).filter((b) => existsSync(join(DIR, b, "chain-v1.json.gz"))).sort();
if (!books.length) { console.log(`SKIPPED — ${DIR} holds no chained book`); process.exit(3); }
console.log(`— ${DIR} · ${books.length} chained book(s) —`);

// K0 — the rule, from the builder
check("K0  the rule this check guards is the rule the builder declares",
  typeof CHAIN_RULE_ID === "string" && CHAIN_RULE_ID.startsWith("chain-book-rule-v1-") && CHAIN_SHORT === 12,
  `${CHAIN_RULE_ID} · printed at ${CHAIN_SHORT} digits · ${PAGE_SHOWS} links shown per word`);

const car = (b) => JSON.parse(gunzipSync(readFileSync(join(DIR, b, "chain-v1.json.gz"))).toString("utf8"));
const zoneOf = (b) => JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.bin`)).toString("utf8"));
const haveZone = (b) => existsSync(`data/zones/${b}.bin`);

// ── K1 / K2 · the shape and the corpus fingerprints, every word of every book ─
{
  const shapeOff = [], fpOff = [], noZone = [];
  let walked = 0;
  for (const b of books) {
    if (!haveZone(b)) { noZone.push(b); continue; }
    const s = car(b), z = zoneOf(b);
    const zs = z.sections || [];
    if (s.sections.length !== zs.length) { shapeOff.push(`${b}: ${s.sections.length} sections, the book has ${zs.length}`); continue; }
    for (let i = 0; i < zs.length; i += 1) {
      const zw = zs[i].words || [], cs = s.sections[i].cells;
      if (String(zs[i].label ?? "") !== String(s.sections[i].label)) { shapeOff.push(`${b} section ${i}: label "${s.sections[i].label}" for "${zs[i].label}"`); break; }
      if (short(String(zs[i].label ?? "")) !== s.sections[i].lf) { fpOff.push(`${b} section ${i}: the label's own fingerprint`); break; }
      if (cs.length !== zw.length) { shapeOff.push(`${b} section ${i}: ${cs.length} words, the book has ${zw.length}`); break; }
      for (let j = 0; j < zw.length; j += 1) {
        walked += 1;
        const surface = String(zw[j].s ?? ""), key = String(zw[j].k ?? "");
        if (cs[j].w !== short(surface)) { fpOff.push(`${b} ${zs[i].label} word ${j}: the word`); break; }
        const wantK = key ? short(key) : null;
        if ((cs[j].k ?? null) !== wantK) { fpOff.push(`${b} ${zs[i].label} word ${j}: the key`); break; }
      }
    }
  }
  check("K1  the chain's shape is the book's shape — same sections, same labels, same words, same order",
    shapeOff.length === 0 && noZone.length === 0,
    shapeOff.length ? few(shapeOff) : noZone.length ? `no zone on disk for ${few(noZone)} — a chain of a book this site does not build is a chain of nothing` : `${books.length} book(s) against their own zones`);
  check("K2  every word and key fingerprint is sha256 of the zone's own string, recomputed here",
    fpOff.length === 0, fpOff.length ? few(fpOff) : `${n(walked)} word positions walked, each hashed again from the corpus`);
}

// ── K3 · the readings, walked in full on the smallest chained book ────────────
{
  const sized = books.filter(haveZone).map((b) => [b, car(b).counts.words]).sort((a, b) => a[1] - b[1]);
  const [pick] = sized;
  if (!pick) check("K3  the readings are the store's own pool, and each reading and source fingerprint recomputes", false, "no chained book has a zone to re-derive from");
  else if (!existsSync(join(STORE, "index.json"))) console.log(`  --  K3  no route store at ${STORE}; the reading half cannot be re-derived`);
  else {
    const [b] = pick;
    const s = car(b), z = zoneOf(b), store = openRouteStore(STORE), ms = store.index.m_sources;
    const off = [];
    let links = 0;
    outer: for (let i = 0; i < (z.sections || []).length; i += 1) {
      const zw = z.sections[i].words || [], cs = s.sections[i].cells;
      for (let j = 0; j < zw.length; j += 1) {
        const key = String(zw[j].k ?? "");
        const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
        const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
        const got = cs[j].reads;
        if (got.length !== pool.length) { off.push(`${z.sections[i].label} word ${j}: ${got.length} links, the store offers ${pool.length}`); break outer; }
        for (let r = 0; r < pool.length; r += 1) {
          links += 1;
          if (got[r].r !== short(pool[r].text)) { off.push(`${z.sections[i].label} word ${j} link ${r}: the reading`); break outer; }
          const carriers = [...(pool[r].by || [])].filter((m) => ms[m]);
          const oldest = carriers.map((m) => ({ m, y: Number.parseInt(ms[m].sourceYear, 10) }))
            .sort((a, c) => (Number.isFinite(a.y) ? a.y : Infinity) - (Number.isFinite(c.y) ? c.y : Infinity))[0];
          const wantS = oldest ? short(ms[oldest.m].label) : null;
          if ((got[r].s ?? null) !== wantS) { off.push(`${z.sections[i].label} word ${j} link ${r}: the source that carries it`); break outer; }
        }
      }
    }
    check("K3  the readings are the store's own pool in the card's own order, and each reading and source fingerprint recomputes",
      off.length === 0, off.length ? `${b}: ${few(off)}` : `${b}, the smallest chained book: ${n(links)} links re-derived from ${store.index.store_version} and hashed again`);
  }
}

// ── K4 · the page against the file it stands on ───────────────────────────────
{
  const off = [], countOff = [];
  for (const b of books) {
    const s = car(b), page = readFileSync(join(DIR, b, "index.html"), "utf8");
    // every short the page prints must resolve to a full 64 in the file, and
    // the full must actually begin with the short — a table that maps a short
    // onto an unrelated 64 is worse than no table
    // THE FINGERPRINTS THE PAGE DRAWS, and only those. A bare scan for twelve
    // hex characters also catches the route store's version in the header
    // line, which is a store id and not a fingerprint of anything, and this
    // check then called the page a liar about a number it never claimed. So
    // the scan is scoped to the elements the builder puts fingerprints in:
    // the section heading, the word, its key, and each reading and source.
    const drawn = [...page.matchAll(/<h2>([0-9a-f]+)<i>|<p class="k">([0-9a-f]+)(?:<span>([0-9a-f]+)<\/span>)?|<li><b>([0-9a-f]+)<\/b>(?:<i>([0-9a-f]+)<\/i>)?/gu)]
      .flatMap((m) => m.slice(1)).filter(Boolean);
    const shorts = new Set(drawn);
    const lost = [...shorts].filter((h) => !s.full_by_short[h]);
    const wrong = [...shorts].filter((h) => s.full_by_short[h] && !String(s.full_by_short[h]).startsWith(h));
    if (lost.length) off.push(`${b}: ${lost.length} printed that the file does not carry`);
    if (wrong.length) off.push(`${b}: ${wrong.length} whose full 64 does not begin with the short`);
    // and the counts the page prints are what a walk of the file finds
    let words = 0, links = 0, linked = 0, bare = 0;
    for (const sec of s.sections) for (const c of sec.cells) { words += 1; links += c.reads.length; if (c.reads.length) linked += 1; else bare += 1; }
    const c = s.counts;
    if (!(c.words === words && c.links === links && c.words_with_a_reading === linked && c.words_with_none === bare
      && c.sections === s.sections.length && c.distinct_fingerprints === Object.keys(s.full_by_short).length))
      countOff.push(`${b}: says ${n(c.words)}/${n(c.links)}, a walk finds ${n(words)}/${n(links)}`);
    for (const v of [c.words, c.links, c.sections]) if (!page.includes(Number(v).toLocaleString())) countOff.push(`${b}: the page does not print ${n(v)}`);
  }
  check("K4  the page prints the first twelve of a number the file carries at sixty-four, and every short resolves",
    off.length === 0, off.length ? few(off) : `${books.length} page(s), every printed fingerprint resolved in its own file`);
  check("  and the counts the page prints are what a walk of the file finds",
    countOff.length === 0, countOff.length ? few(countOff) : `${books.length} page(s) recounted from their own sections`);
}

// ── K5 / K6 · the index, which is the root of the tree ────────────────────────
{
  const idx = join(DIR, "index.html");
  if (!existsSync(idx)) check("K5  the index's sha256 of each file is the sha256 of that file on disk", false, `no ${idx} — the door carries a tab for it`);
  else {
    const page = readFileSync(idx, "utf8");
    // one row per book: the name, then the two files and their sixty-four
    const rows = [...page.matchAll(/<a href="([^"/]+)\/">[\s\S]*?chain-v1\.json\.gz\s*(?:&nbsp;|\s)\s*([0-9a-f]{64})[\s\S]*?index\.html\s*(?:&nbsp;|\s)\s*([0-9a-f]{64})/gu)]
      .map((m) => ({ b: m[1], car: m[2], page: m[3] }));
    const off = [];
    for (const r of rows) {
      const cf = createHash("sha256").update(readFileSync(join(DIR, r.b, "chain-v1.json.gz"))).digest("hex");
      const pf = createHash("sha256").update(readFileSync(join(DIR, r.b, "index.html"))).digest("hex");
      if (cf !== r.car) off.push(`${r.b}: the file beside the page is not the file the index names`);
      if (pf !== r.page) off.push(`${r.b}: the page is not the page the index names`);
    }
    check("K5  the index's sha256 of each file is the sha256 of that file on disk, byte for byte as served",
      rows.length === books.length && off.length === 0,
      off.length ? few(off) : rows.length !== books.length ? `the index prints ${rows.length} row(s) for ${books.length} chained book(s)` : `${rows.length} book(s) · ${rows.length * 2} files re-hashed from disk`);
    const named = new Set(rows.map((r) => r.b)), have = new Set(books);
    const unlisted = books.filter((b) => !named.has(b)), phantom = [...named].filter((b) => !have.has(b));
    check("K6  the index names every book that has a chain and no book that does not",
      unlisted.length === 0 && phantom.length === 0,
      unlisted.length || phantom.length
        ? `${unlisted.length ? `on disk and not listed: ${few(unlisted)}` : ""}${unlisted.length && phantom.length ? " · " : ""}${phantom.length ? `listed and not on disk: ${few(phantom)}` : ""}`
        : `${books.length} on disk, ${named.size} named, and they are the same set`);
  }
}

// ── K7 · the meaning really is taken out ──────────────────────────────────────
{
  // THE LOAD-BEARING CLAIM. "Strip the language away and only the joins are
  // left" is not a figure of speech: a chain page that carried one Hebrew word
  // or one English reading would be a page that CAN hide something, and the
  // whole argument of it rests on its not being able to. So both are looked
  // for, and the readings are looked for as the store's own strings rather
  // than as a guess at what English looks like.
  const HEBREW = /[֐-׿]/u;
  const hebrew = [], leaked = [];
  const store = existsSync(join(STORE, "index.json")) ? openRouteStore(STORE) : null;
  for (const b of books) {
    const page = readFileSync(join(DIR, b, "index.html"), "utf8");
    if (HEBREW.test(page)) hebrew.push(b);
    if (store && haveZone(b)) {
      // a sample of this book's own readings — the ones that WOULD be on the
      // page if the meaning had not been taken out
      const z = zoneOf(b), ms = store.index.m_sources;
      let looked = 0;
      for (const sec of (z.sections || [])) {
        for (const w of (sec.words || [])) {
          const key = String(w.k ?? ""); if (!key || looked >= 40) continue;
          const rr = (store.routesFor(key) || []).filter((r) => ms[r[3]]);
          const pool = rr.length ? store.readingPool(rr, "oldest") : [];
          for (const p of pool.slice(0, 2)) {
            looked += 1;
            const t = String(p.text || "");
            if (t.length > 6 && page.includes(t)) { leaked.push(`${b}: "${t.slice(0, 40)}"`); break; }
          }
        }
        if (looked >= 40) break;
      }
    }
  }
  check("K7  no Hebrew of the corpus is printed on a chain page — the letters are gone, only their fingerprints stand",
    hebrew.length === 0, hebrew.length ? `${few(hebrew)} print Hebrew` : `${books.length} page(s), not one letter of the corpus`);
  check("  and no reading of a dictionary is printed either, looked for as the store's own strings",
    leaked.length === 0, leaked.length ? few(leaked) : store ? `${books.length} page(s) searched for the readings their own words stand on` : "no route store here to take the readings from");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
