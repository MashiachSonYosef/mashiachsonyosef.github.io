#!/usr/bin/env node
// RUN: tree
// GUARDS: chain-book-rule-v2-the-same-book-with-the-meaning-taken-out-and-the-links-under-a-word-are-what-its-card-prints-read-off-the-page
//
// THE EVIDENCE PAGE, HELD TO WHAT IT CLAIMS.
//
// The chain is the one page on this site whose whole worth is that a stranger
// need not believe us. It republishes a book with every visible thing replaced
// by the fingerprint of its own bytes, and says the links under a word are
// what that word's card prints. A page like that is worth nothing the moment
// one number in it is wrong, and it is exactly the kind of page that rots
// quietly: nobody reads it, so nobody notices.
//
// It did rot. Until 13 November 2026 the links were the route store's pool
// for the word's key, taken by the builder with the store reader's own
// function, and the check before this one (check-chain-book-v1, K3)
// recomputed each link with that same function. An outside reader opened the
// cards instead (12 November): of 1,915 pills 171 were no link. The check
// had held the builder to itself and never to the page.
//
// So this one opens the cards. Every hash below is taken here, with node's
// own sha256 over UTF-8 bytes: this check never imports the builder's hash
// function, because a check that hashes the way the builder hashes proves
// only that one function agrees with itself.
//
//   K0  the rule this check guards is the rule the builder declares
//   K1  the chain's shape is the book's shape: same sections, same labels,
//       same entries, same order, re-derived from the zone the reading page
//       is built from, never from the chain's own counts
//   K2  every word and key fingerprint is sha256 of the zone's own string,
//       recomputed here, for every word of every chained book; a scribal
//       mark carries its kind and no card; a word written one way and read
//       another carries its halves, each with its role, its letters and its
//       key; every other word carries its card in both states
//   K3  each file is of this tree: the page and every file it names stand
//       as it names them, so the cards it holds are the cards this tree
//       prints; and the two states are the states it says: lifted is every
//       withholding switch lifted, and at rest is the state the resting
//       lines of the same book were read in
//   K4  each file hangs together: every list of pills a card names is in
//       the file and every list in the file is named; a pressed pill and a
//       pressed button are ones the card has; every fingerprint is carried
//       at its full sixty-four digits and begins with its twelve
//   K5  the counts are what a walk of the file finds, the page prints them,
//       the page prints under each word the first links a first visit is
//       shown, in the file's order, and they are the book's own counts of
//       words and marks, off the zone's receipt
//   K6  the index's sha256 of each file is the sha256 of that file on disk
//   K7  the index names every book that has a chain and no book that does not
//   K8  and the meaning really is taken out: no Hebrew of the corpus and no
//       reading of a dictionary is printed anywhere on a chain page
//
// AND IN A BROWSER, on one chapter of every chained book (the middle one),
// the cards themselves, as the outside reader read them:
//
//   C1  at rest, as a first visit finds the page: every word of the chapter
//       is pressed, its card read, hashed here, and it is the card the chain
//       holds under that word: the rows of buttons, the lines above the
//       pills, every pill in order with its source, its year and the sources
//       behind it, and the one pressed. No pill that is no link, no link
//       that is no pill.
//   C2  the same with every switch that withholds a reading lifted
//   C3  and by a second road at rest: the page's own account of the pool it
//       offered (the list it exposes for a check to ask) is, pill for pill,
//       what the chain holds, wherever a pill prints its reading alone
//
// A BROWSER THAT STOPS ANSWERING IS SAID, AND THE CHAPTER READ AGAIN: each
// book's chapter is given a time (CARD_STALL_MS, 240 s); past it the browser
// is closed whole and opened again and the chapter read once more; a chapter
// unread twice is a failure in words.
//
// SKIPS by name when no chain is on the shelf.
//
// Run: node tools/check-chain-book-v2.mjs [--dir ../chain]
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { CHAIN_RULE_ID, CHAIN_SCHEMA, CHAIN_FILE, CHAIN_SHORT, PAGE_SHOWS, chainedBooks } from "./build-chain-book-v2.mjs";
import { STATES, readCards, labelsFor, saidOf } from "./card-readings-v1.mjs";
import { readRecord, recordPath, whyNotOfThisTree } from "./resting-lines-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const n = (v) => Number(v).toLocaleString("en-US");
const few = (a, k = 3) => a.slice(0, k).join(" · ") + (a.length > k ? ` … and ${a.length - k} more` : "");

// THIS CHECK'S OWN HASH, taken from node and not from the thing under test.
const sha = (s) => createHash("sha256").update(String(s), "utf8").digest("hex");
const short = (s) => sha(s).slice(0, CHAIN_SHORT);

const READER = ".";
const DIR = arg("--dir", join("..", "chain"));
const STORE = arg("--store", "data/route-store");
if (!existsSync(DIR)) { console.log(`SKIPPED — no chain on the shelf at ${DIR}`); process.exit(3); }
const books = chainedBooks(DIR);
if (!books.length) { console.log(`SKIPPED — ${DIR} holds no chained book`); process.exit(3); }
console.log(`— ${DIR} · ${books.length} chained book(s) —`);

// K0 — the rule, from the builder
check("K0  the rule this check guards is the rule the builder declares",
  typeof CHAIN_RULE_ID === "string" && CHAIN_RULE_ID.startsWith("chain-book-rule-v2-") && CHAIN_SHORT === 12,
  `${CHAIN_RULE_ID} · printed at ${CHAIN_SHORT} digits · ${PAGE_SHOWS} links shown per word`);

const cars = new Map();
const car = (b) => { if (!cars.has(b)) cars.set(b, JSON.parse(gunzipSync(readFileSync(join(DIR, b, CHAIN_FILE))).toString("utf8"))); return cars.get(b); };
const zones = new Map();
const zoneOf = (b) => { if (!zones.has(b)) zones.set(b, JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.bin`)).toString("utf8"))); return zones.get(b); };
const haveZone = (b) => existsSync(`data/zones/${b}.bin`);
const isCard = (c) => !!c && typeof c === "object" && "pool" in c && "on" in c;

// ── K1 / K2 · the shape and the corpus fingerprints, every word of every book ─
{
  const shapeOff = [], fpOff = [], noZone = [];
  let walked = 0;
  for (const b of books) {
    if (!haveZone(b)) { noZone.push(b); continue; }
    const s = car(b), z = zoneOf(b);
    const zs = z.sections || [];
    if (s.work !== b || s.schema_version !== CHAIN_SCHEMA || s.rule_id !== CHAIN_RULE_ID) { shapeOff.push(`${b}: the file calls itself ${s.work}, ${s.schema_version}, ${String(s.rule_id).slice(0, 24)}…`); continue; }
    if (s.sections.length !== zs.length) { shapeOff.push(`${b}: ${s.sections.length} sections, the book has ${zs.length}`); continue; }
    for (let i = 0; i < zs.length; i += 1) {
      const zw = zs[i].words || [], cs = s.sections[i].cells;
      if (String(zs[i].label ?? "") !== String(s.sections[i].label)) { shapeOff.push(`${b} section ${i}: label "${s.sections[i].label}" for "${zs[i].label}"`); break; }
      if (short(String(zs[i].label ?? "")) !== s.sections[i].lf) { fpOff.push(`${b} section ${i}: the label's own fingerprint`); break; }
      if (cs.length !== zw.length) { shapeOff.push(`${b} section ${i}: ${cs.length} entries, the book has ${zw.length}`); break; }
      for (let j = 0; j < zw.length; j += 1) {
        walked += 1;
        const surface = String(zw[j].s ?? ""), key = String(zw[j].k ?? "");
        if (cs[j].w !== short(surface)) { fpOff.push(`${b} ${zs[i].label} entry ${j}: the word`); break; }
        // a mark: its kind, no key, no card, and never a pair
        if (zw[j].mark) {
          if (cs[j].mark !== short(zw[j].mark.kind) || "k" in cs[j] || "rest" in cs[j] || "lifted" in cs[j] || cs[j].halves) { fpOff.push(`${b} ${zs[i].label} entry ${j}: the mark`); break; }
          continue;
        }
        if ((cs[j].mark ?? null) !== null) { fpOff.push(`${b} ${zs[i].label} entry ${j}: a word is printed as a mark`); break; }
        if (!isCard(cs[j].rest) || !isCard(cs[j].lifted)) { fpOff.push(`${b} ${zs[i].label} entry ${j}: a word without its card in both states`); break; }
        // a pair: its halves, each by its own role, letters and key
        if (Array.isArray(zw[j].w)) {
          const hs = cs[j].halves;
          const ok = Array.isArray(hs) && hs.length === zw[j].w.length && !("k" in cs[j])
            && zw[j].w.every((r, x) => hs[x].w === short(String(r.s ?? "")) && (hs[x].k ?? null) === (r.k ? short(String(r.k)) : null) && hs[x].role === short(String(r.role ?? "")));
          if (!ok) { fpOff.push(`${b} ${zs[i].label} entry ${j}: the halves of a word written one way and read another`); break; }
          continue;
        }
        if (cs[j].halves) { fpOff.push(`${b} ${zs[i].label} entry ${j}: halves on a word the book holds whole`); break; }
        const wantK = key ? short(key) : null;
        if ((cs[j].k ?? null) !== wantK) { fpOff.push(`${b} ${zs[i].label} entry ${j}: the key`); break; }
      }
    }
  }
  check("K1  the chain's shape is the book's shape — same sections, same labels, same entries, same order",
    shapeOff.length === 0 && noZone.length === 0,
    shapeOff.length ? few(shapeOff) : noZone.length ? `no zone on disk for ${few(noZone)} — a chain of a book this site does not build is a chain of nothing` : `${books.length} book(s) against their own zones`);
  check("K2  every word and key fingerprint is sha256 of the zone's own string, recomputed here, and every word carries its card in both states",
    fpOff.length === 0, fpOff.length ? few(fpOff) : `${n(walked)} entries walked, each hashed again from the corpus`);
}

// ── K3 · each file is of this tree, and its two states are the states it says ─
{
  const off = [], stateOff = [], seen = new Map();
  let files = 0;
  for (const b of books) {
    const s = car(b);
    const why = whyNotOfThisTree(READER, s, seen, CHAIN_SCHEMA);
    if (why.length) off.push(`${b}: ${few(why, 2)}`);
    files += Object.keys((s.read_off && s.read_off.files) || {}).length;
    const st = (s.read_off && s.read_off.states) || {};
    const lifted = st.lifted && st.lifted.page, rest = st.rest && st.rest.page;
    const want = STATES.lifted.holds;
    if (!lifted || lifted.pointing !== want.pointing || lifted.signs !== want.signs || JSON.stringify(lifted.sources_off) !== JSON.stringify(want.sources_off)) stateOff.push(`${b}: lifted is said as ${JSON.stringify(lifted)}`);
    const lines = readRecord(recordPath(READER, b));
    if (!rest || !lines || JSON.stringify(rest) !== JSON.stringify(lines.read_off.state)) stateOff.push(`${b}: at rest is said as ${JSON.stringify(rest)} and the resting lines were read as ${lines ? JSON.stringify(lines.read_off.state) : "(no record)"}`);
  }
  check("K3  each file is of this tree: the page and every file it names stand as it names them",
    off.length === 0, off.length ? few(off) : `${books.length} file(s) · ${n(files)} file fingerprints taken again`);
  check("  and its two states are the states it says: lifted withholds nothing, and at rest is the state the book's resting lines were read in",
    stateOff.length === 0, stateOff.length ? few(stateOff) : `${books.length} book(s)`);
}

// ── K4 · each file hangs together ─────────────────────────────────────────────
// every fingerprint a file prints, gathered once for K4 and K5
const shortsOf = (s) => {
  const out = [];
  for (const sec of s.sections) {
    out.push(sec.lf);
    for (const c of sec.cells) {
      out.push(c.w);
      if (c.k) out.push(c.k);
      if (c.mark) out.push(c.mark);
      for (const h of c.halves || []) { out.push(h.role, h.w); if (h.k) out.push(h.k); }
      for (const card of [c.rest, c.lifted]) {
        if (!card) continue;
        for (const k of ["forms", "chain", "chain_words", "divisions", "blocks"]) if (card[k]) out.push(...card[k].of);
        for (const h of card.here || []) { out.push(h.r); if (h.s) out.push(h.s); }
      }
    }
  }
  for (const p of s.pools) for (const l of p) { out.push(l.r, l.s, ...(l.by || [])); if (l.ym) out.push(l.ym); }
  return out;
};
{
  const off = [];
  for (const b of books) {
    const s = car(b);
    const named = new Set();
    let odd = "";
    for (const sec of s.sections) for (const c of sec.cells) for (const card of [c.rest, c.lifted]) {
      if (!card) continue;
      if (card.pool !== null) {
        if (!Number.isInteger(card.pool) || !s.pools[card.pool]) { odd = odd || `${sec.label}: a card names list ${card.pool}, which the file does not hold`; continue; }
        named.add(card.pool);
        if (card.on !== null && !(Number.isInteger(card.on) && card.on >= 0 && card.on < s.pools[card.pool].length)) odd = odd || `${sec.label}: pill ${card.on} is said pressed in a list of ${s.pools[card.pool].length}`;
      } else if (card.on !== null) odd = odd || `${sec.label}: a pill is said pressed on a card that prints none`;
      for (const k of ["forms", "chain", "chain_words", "divisions", "blocks"]) {
        const r = card[k];
        if (r && !(Array.isArray(r.of) && r.of.length && (r.on === null || (Number.isInteger(r.on) && r.on >= 0 && r.on < r.of.length)))) odd = odd || `${sec.label}: a row of buttons (${k}) with button ${r.on} pressed of ${(r.of || []).length}`;
      }
      if (card.over && !(card.over.length === 2 && card.over[0] >= 1 && card.over[1] > card.over[0])) odd = odd || `${sec.label}: a card said to stand on words ${JSON.stringify(card.over)}`;
    }
    if (odd) off.push(`${b} ${odd}`);
    if (named.size !== s.pools.length) off.push(`${b}: ${s.pools.length} lists of pills in the file and ${named.size} named by a card`);
    if (s.pools.some((p) => !p.length)) off.push(`${b}: an empty list of pills`);
    if (new Set(s.pools.map((p) => JSON.stringify(p))).size !== s.pools.length) off.push(`${b}: one list of pills written twice`);
    const all = new Set(shortsOf(s));
    const lost = [...all].filter((h) => !s.full_by_short[h]);
    const wrong = Object.entries(s.full_by_short).filter(([h, f]) => !/^[0-9a-f]{64}$/u.test(f) || !f.startsWith(h) || h.length !== CHAIN_SHORT);
    const idle = Object.keys(s.full_by_short).filter((h) => !all.has(h));
    if (lost.length) off.push(`${b}: ${lost.length} fingerprints the file prints and does not carry in full`);
    if (wrong.length) off.push(`${b}: ${wrong.length} whose full 64 does not begin with the short`);
    if (idle.length) off.push(`${b}: ${idle.length} carried in full that nothing in the file prints`);
  }
  check("K4  each file hangs together: every list of pills named is held and every list held is named, what is pressed is there to press, and every fingerprint is carried in full",
    off.length === 0, off.length ? few(off) : `${books.length} file(s) · ${n(books.reduce((a, b) => a + car(b).pools.length, 0))} lists of pills · ${n(books.reduce((a, b) => a + Object.keys(car(b).full_by_short).length, 0))} fingerprints`);
}

// ── K5 · the counts, and the page against the file it stands on ───────────────
{
  const off = [], countOff = [], bookOff = [], listOff = [];
  let booksHeld = 0;
  for (const b of books) {
    const s = car(b), page = readFileSync(join(DIR, b, "index.html"), "utf8");
    // THE FINGERPRINTS THE PAGE DRAWS, and only those: a bare scan for twelve
    // hex characters also catches the route store's version in the header
    // line, which is a store id and not a fingerprint of anything. So the
    // scan is scoped to the elements the builder puts fingerprints in.
    const drawn = [...page.matchAll(/<h2>([0-9a-f]+)<i>|<p class="k">([0-9a-f]+)(?:<span>([0-9a-f]+)<\/span>)?|<li><b>([0-9a-f]+)<\/b><i>([0-9a-f]+)<\/i>/gu)].flatMap((m) => m.slice(1)).filter(Boolean);
    const lost = [...new Set(drawn)].filter((h) => !s.full_by_short[h]);
    if (lost.length) off.push(`${b}: ${lost.length} printed that the file does not carry`);
    // the counts, walked
    const walk = () => ({ words_whose_card_prints_a_reading: 0, words_whose_card_prints_none: 0, words_in_a_run_one_card_joins: 0, links: 0, links_that_print_what_another_link_of_their_card_prints: 0, lines_above_the_pills: 0, buttons_a_press_away: 0, words_with_a_button_a_press_away: 0 });
    const got = { sections: s.sections.length, words: 0, marks: 0, words_written_one_way_and_read_another: 0, at_rest: walk(), lifted: walk() };
    const want = [];   // what the page should print under the words, in order: [reading, source]
    for (const sec of s.sections) for (const c of sec.cells) {
      if (c.mark) { got.marks += 1; continue; }
      got.words += 1;
      if (c.halves) got.words_written_one_way_and_read_another += 1;
      for (const [name, card] of [["at_rest", c.rest], ["lifted", c.lifted]]) {
        const t = got[name], list = card.pool === null ? [] : s.pools[card.pool];
        if (list.length) t.words_whose_card_prints_a_reading += 1; else t.words_whose_card_prints_none += 1;
        t.links += list.length;
        t.links_that_print_what_another_link_of_their_card_prints += list.length - new Set(list.map((l) => l.r)).size;
        t.lines_above_the_pills += (card.here || []).length;
        if (card.over) t.words_in_a_run_one_card_joins += 1;
        let away = 0;
        for (const k of ["forms", "chain", "chain_words", "divisions", "blocks"]) if (card[k]) away += card[k].of.length - (card[k].on === null ? 0 : 1);
        t.buttons_a_press_away += away;
        if (away) t.words_with_a_button_a_press_away += 1;
      }
      for (const l of (c.rest.pool === null ? [] : s.pools[c.rest.pool]).slice(0, PAGE_SHOWS)) want.push(`${l.r} ${l.s}`);
    }
    got.pools = s.pools.length; got.distinct_fingerprints = Object.keys(s.full_by_short).length;
    if (JSON.stringify(got) !== JSON.stringify(s.counts)) countOff.push(`${b}: the file says ${JSON.stringify(s.counts).slice(0, 160)}… and a walk finds ${JSON.stringify(got).slice(0, 160)}…`);
    const c = s.counts;
    for (const v of [c.sections, c.words, c.marks, c.at_rest.links, c.at_rest.words_whose_card_prints_a_reading, c.at_rest.words_whose_card_prints_none, c.lifted.links, c.lifted.words_whose_card_prints_a_reading, c.lifted.words_whose_card_prints_none, c.distinct_fingerprints, c.at_rest.buttons_a_press_away, c.at_rest.words_with_a_button_a_press_away]) if (!page.includes(n(v))) countOff.push(`${b}: the page does not print ${n(v)}`);
    // the links the page prints, in the file's order
    const printed = [...page.matchAll(/<li><b>([0-9a-f]+)<\/b><i>([0-9a-f]+)<\/i><\/li>/gu)].map((m) => `${m[1]} ${m[2]}`);
    if (printed.length !== want.length || printed.some((x, i) => x !== want[i])) listOff.push(`${b}: the page prints ${n(printed.length)} links and the file's first ${PAGE_SHOWS} at rest under each word are ${n(want.length)}${printed.length === want.length ? `, and link ${printed.findIndex((x, i) => x !== want[i]) + 1} differs` : ""}`);
    // the book's own counts, off the zone's receipt
    if (haveZone(b)) {
      const zc = zoneOf(b).counts || {};
      const wantBook = { words: zc.c0_on, marks: zc.c0_off };
      if (Object.values(wantBook).some((v) => !Number.isInteger(v))) bookOff.push(`${b}: the zone's receipt does not carry its words and marks`);
      else {
        const diff = Object.entries(wantBook).filter(([k, v]) => c[k] !== v).map(([k, v]) => `${k} ${n(c[k])}, the book has ${n(v)}`);
        if (diff.length) bookOff.push(`${b}: ${diff.join("; ")}`); else booksHeld += 1;
      }
    }
  }
  check("K5  the page prints the first twelve of a number the file carries at sixty-four, and every one resolves",
    off.length === 0, off.length ? few(off) : `${books.length} page(s), every printed fingerprint resolved in its own file`);
  check("  and the counts the file states are what a walk of it finds, and the page prints them",
    countOff.length === 0, countOff.length ? few(countOff) : `${books.length} file(s) recounted from their own sections`);
  check(`  and under each word the page prints the first ${PAGE_SHOWS} links a first visit is shown, in the file's order`,
    listOff.length === 0, listOff.length ? few(listOff) : `${books.length} page(s) against their files`);
  check("  and they are the book's own counts of words and scribal marks, off the zone's receipt",
    bookOff.length === 0 && booksHeld > 0, bookOff.length ? few(bookOff) : `${booksHeld} book(s) against their zones' own counts`);
}

// ── K6 / K7 · the index, which is the root of the tree ────────────────────────
{
  const idx = join(DIR, "index.html");
  if (!existsSync(idx)) check("K6  the index's sha256 of each file is the sha256 of that file on disk", false, `no ${idx} — the door carries a tab for it`);
  else {
    const page = readFileSync(idx, "utf8");
    // one row per book: the name, then the two files and their sixty-four
    const rows = [...page.matchAll(/<a href="([^"/]+)\/">[\s\S]*?chain-v1\.json\.gz\s*(?:&nbsp;|\s)\s*([0-9a-f]{64})[\s\S]*?index\.html\s*(?:&nbsp;|\s)\s*([0-9a-f]{64})/gu)]
      .map((m) => ({ b: m[1], car: m[2], page: m[3] }));
    const off = [];
    for (const r of rows) {
      if (!existsSync(join(DIR, r.b, CHAIN_FILE))) { off.push(`${r.b}: named and not on disk`); continue; }
      const cf = createHash("sha256").update(readFileSync(join(DIR, r.b, CHAIN_FILE))).digest("hex");
      const pf = createHash("sha256").update(readFileSync(join(DIR, r.b, "index.html"))).digest("hex");
      if (cf !== r.car) off.push(`${r.b}: the file beside the page is not the file the index names`);
      if (pf !== r.page) off.push(`${r.b}: the page is not the page the index names`);
      const c = car(r.b).counts;
      const row = page.slice(page.indexOf(`<a href="${r.b}/">`), page.indexOf(r.car));
      for (const v of [c.sections, c.words, c.at_rest.links, c.lifted.links, c.distinct_fingerprints]) if (!row.includes(`<b>${n(v)}</b>`)) off.push(`${r.b}: the index does not print ${n(v)} in its row`);
    }
    check("K6  the index's sha256 of each file is the sha256 of that file on disk, byte for byte as served, and its row prints the book's counts",
      rows.length === books.length && off.length === 0,
      off.length ? few(off) : rows.length !== books.length ? `the index prints ${rows.length} row(s) for ${books.length} chained book(s)` : `${rows.length} book(s) · ${rows.length * 2} files re-hashed from disk`);
    const named = new Set(rows.map((r) => r.b)), have = new Set(books);
    const unlisted = books.filter((b) => !named.has(b)), phantom = [...named].filter((b) => !have.has(b));
    check("K7  the index names every book that has a chain and no book that does not",
      unlisted.length === 0 && phantom.length === 0,
      unlisted.length || phantom.length
        ? `${unlisted.length ? `on disk and not listed: ${few(unlisted)}` : ""}${unlisted.length && phantom.length ? " · " : ""}${phantom.length ? `listed and not on disk: ${few(phantom)}` : ""}`
        : `${books.length} on disk, ${named.size} named, and they are the same set`);
  }
}

// ── K8 · the meaning really is taken out ──────────────────────────────────────
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
  check("K8  no Hebrew of the corpus is printed on a chain page — the letters are gone, only their fingerprints stand",
    hebrew.length === 0, hebrew.length ? `${few(hebrew)} print Hebrew` : `${books.length} page(s), not one letter of the corpus`);
  check("  and no reading of a dictionary is printed either, looked for as the store's own strings",
    leaked.length === 0, leaked.length ? few(leaked) : store ? `${books.length} page(s) searched for the readings their own words stand on` : "no route store here to take the readings from");
}

// ── C1 / C2 / C3 · the cards themselves, opened here ──────────────────────────
// A verse label's chapter is what stands before its colon; a label with no
// colon is a chapter of its own.
const chOf = (l) => (String(l).includes(":") ? String(l).split(":")[0] : String(l));
/** The stretch of sections that is the middle chapter of a book. */
const middleChapter = (z) => {
  const labels = (z.sections || []).map((s) => String(s.label ?? ""));
  const chs = [...new Set(labels.map(chOf))];
  const ch = chs[Math.floor(chs.length / 2)];
  return { ch, from: labels.findIndex((l) => chOf(l) === ch), to: labels.length - [...labels].reverse().findIndex((l) => chOf(l) === ch) };
};
/** A card as the chain should hold it, from what a card says, hashed HERE. */
const cardHere = (said) => {
  const card = {};
  for (const [k, r] of Object.entries(said.rows)) if (r) card[k] = { of: r.of.map(short), on: r.on };
  if (said.here.length) card.here = said.here.map((h) => ({ is: h.is, r: short(h.text), s: h.label === null ? null : short(h.label) }));
  const list = said.pills.map((x) => ({ r: short(x.text), s: short(x.label), y: x.year, ...(x.by.length > 1 ? { by: x.by.map(short) } : {}), ...(x.mark ? { ym: short(x.mark) } : {}) }));
  return { card, list, on: said.on, over: said.over[1] > said.over[0] ? said.over : null };
};
/** Where a card read here and the card the chain holds part, in words; "" where they do not. */
const partsAt = (here, kept, pools) => {
  const { pool, on, over = null, ...rest } = kept;
  if (JSON.stringify(here.card) !== JSON.stringify(rest)) {
    const k = ["forms", "chain", "chain_words", "divisions", "blocks", "here"].find((x) => JSON.stringify(here.card[x] ?? null) !== JSON.stringify(rest[x] ?? null));
    return `its ${k === "here" ? "lines above the pills" : `row of ${String(k).replace("_", " ")}`} read ${JSON.stringify(here.card[k] ?? null).slice(0, 110)} on the card and ${JSON.stringify(rest[k] ?? null).slice(0, 110)} in the chain`;
  }
  const list = pool === null ? [] : pools[pool];
  if (here.list.length !== list.length) {
    const links = new Set(list.map((l) => l.r)), pills = new Set(here.list.map((l) => l.r));
    return `the card prints ${here.list.length} pills and the chain holds ${list.length} links (${here.list.filter((l) => !links.has(l.r)).length} pills are no link, ${list.filter((l) => !pills.has(l.r)).length} links are no pill)`;
  }
  const x = here.list.findIndex((l, i) => JSON.stringify(l) !== JSON.stringify(list[i]));
  if (x >= 0) return `pill ${x + 1} is ${JSON.stringify(here.list[x])} on the card and ${JSON.stringify(list[x])} in the chain`;
  if (here.on !== on) return `pill ${here.on === null ? "none" : here.on + 1} stands pressed on the card and ${on === null ? "none" : on + 1} in the chain`;
  if (JSON.stringify(here.over) !== JSON.stringify(over)) return `the card says it stands on words ${JSON.stringify(here.over)} and the chain says ${JSON.stringify(over)}`;
  return "";
};
/** IN THE PAGE, this check's own walk and not the builder's: each word of
 *  sections [from, to) pressed, and the page asked for the pool it says it
 *  offered (window.__pool, which the page keeps "so a check can ask the page
 *  what it offered rather than read it off the pills"), with which pills
 *  print more than their reading (a pointer, a read word named). */
const offeredInPage = async ([from, to]) => {
  const hud = document.getElementById("hud");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const secs = [...document.querySelectorAll("section.seg")];
  const out = [];
  for (let i = from; i < Math.min(to, secs.length); i += 1) {
    const cards = [];
    const wbs = [...secs[i].querySelectorAll(".he-text .wb")];
    for (let e = 0; e < wbs.length; e += 1) {
      if (wbs[e].classList.contains("mark")) continue;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      window.__pool = null;
      (wbs[e].querySelector(".w span") || wbs[e].querySelector(".w") || wbs[e]).click();
      // the page's own account has arrived, or the card says it has nothing to offer
      const t0 = performance.now();
      let none = false;
      while (!Array.isArray(window.__pool) && performance.now() - t0 < 15000) {
        const read = hud.querySelector(":scope > .rows > .b-read");
        if (read && read.children.length && !read.querySelector(".r-wait") && !read.querySelector(".r-pills")) { none = true; break; }
        await wait(5);
      }
      const plain = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")].map((x) => !("pointer" in x.dataset));
      cards.push({ e, pool: Array.isArray(window.__pool) ? [...window.__pool] : null, none, plain });
    }
    out.push({ i, cards });
  }
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return out;
};

const CARD_MS = Number(process.env.CARD_STALL_MS) || 240000;
const labels = labelsFor(READER);
const tree = await serveTree(READER);
const pw = await loadPlaywright();
let browser = await pw.chromium.launch(launchOptions());
const within = async (work) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let timer = null;
    const late = new Promise((_, no) => { timer = setTimeout(() => no(new Error("STALLED")), CARD_MS); });
    try { return { got: await Promise.race([work(), late]) }; }
    catch (e) {
      const why = String((e && e.message) || e).split("\n")[0];
      if (why !== "STALLED") return { why };
      await Promise.race([browser.close(), new Promise((q) => setTimeout(q, 5000))]).catch(() => {});
      browser = await pw.chromium.launch(launchOptions());
    } finally { clearTimeout(timer); }
  }
  return { why: `the browser stopped answering twice (${CARD_MS / 1000} s each)` };
};
const T = { rest: { off: [], unread: [], words: 0, pills: 0, buttons: 0, lines: 0 }, lifted: { off: [], unread: [], words: 0, pills: 0, buttons: 0, lines: 0 } };
const road = { off: [], unread: [], words: 0, pills: 0, more: 0 };
const read = [];
try {
  for (const b of books.filter(haveZone)) {
    const s = car(b), z = zoneOf(b);
    const { ch, from, to } = middleChapter(z);
    read.push(`${b} ${ch}`);
    for (const name of ["rest", "lifted"]) {
      const t = T[name];
      const r = await within(() => readCards(browser, tree.base, b, name, { from, to }));
      if (!r.got) { t.unread.push(`${b} ${ch}: ${r.why}`); continue; }
      for (const sec of r.got.sections) {
        const cells = s.sections[sec.i].cells;
        for (const raw of sec.cards) {
          t.words += 1;
          let here;
          try { here = cardHere(saidOf(raw, labels)); } catch (e) { t.off.push(`${b} ${s.sections[sec.i].label}, entry ${raw.e}: ${String((e && e.message) || e)}`); continue; }
          t.pills += here.list.length;
          t.lines += (here.card.here || []).length;
          for (const k of ["forms", "chain", "chain_words", "divisions", "blocks"]) if (here.card[k]) t.buttons += here.card[k].of.length;
          const kept = cells[raw.e] && cells[raw.e][name];
          const why = kept ? partsAt(here, kept, s.pools) : "the chain holds no card for it";
          if (why) t.off.push(`${b} ${s.sections[sec.i].label}, entry ${raw.e}: ${why}`);
        }
        const wordsOf = cells.filter((c) => !c.mark).length;
        if (sec.cards.length !== wordsOf) t.off.push(`${b} ${s.sections[sec.i].label}: ${sec.cards.length} cards read for ${wordsOf} words`);
      }
    }
    // the second road, at rest: the page's own account of what it offered
    const r2 = await within(async () => {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        await p.goto(`${tree.base}/zone.html?b=${b}`, { waitUntil: "networkidle" });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        await p.evaluate(([a, c]) => window.__materialise(a, c), [from, to]);
        await p.waitForFunction(() => !!(window.__latticeStore || window.__latticeRefused) || !(window.__zone && window.__zone.emitted_from && window.__zone.emitted_from.toggles && window.__zone.emitted_from.toggles.lattice), null, { timeout: 30000 });
        await p.waitForTimeout(700);
        return await p.evaluate(offeredInPage, [from, to]);
      } finally { await ctx.close(); }
    });
    if (!r2.got) road.unread.push(`${b} ${ch}: ${r2.why}`);
    else for (const sec of r2.got) for (const c of sec.cards) {
      road.words += 1;
      const kept = s.sections[sec.i].cells[c.e].rest;
      const list = kept.pool === null ? [] : s.pools[kept.pool];
      const where = `${b} ${s.sections[sec.i].label}, entry ${c.e}`;
      if (c.pool === null) { if (list.length || !c.none) road.off.push(`${where}: the page gave no account of a pool and the chain holds ${list.length} links`); continue; }
      if (c.pool.length !== list.length) { road.off.push(`${where}: the page says it offered ${c.pool.length} and the chain holds ${list.length}`); continue; }
      c.pool.forEach((text, x) => {
        if (!c.plain[x]) { road.more += 1; return; }
        road.pills += 1;
        if (short(text) !== list[x].r) road.off.push(`${where}: reading ${x + 1} of the page's own account is not link ${x + 1}`);
      });
    }
  }
} finally { await browser.close().catch(() => {}); await tree.close(); }
const said = (t) => `${read.length} chapter(s) (${few(read, 4)}) · ${n(t.words)} words pressed · ${n(t.pills)} pills, each a link under its word, and no link without its pill · ${n(t.buttons)} buttons · ${n(t.lines)} lines above the pills`;
check("C1  at rest, every word's card, opened here and hashed here, is the card the chain holds under that word",
  T.rest.off.length === 0 && T.rest.unread.length === 0 && T.rest.words > 0, T.rest.unread.length ? `not read: ${few(T.rest.unread)}` : T.rest.off.length ? `${n(T.rest.off.length)} of ${n(T.rest.words)}: ${few(T.rest.off)}` : said(T.rest));
check("C2  and with every switch that withholds a reading lifted",
  T.lifted.off.length === 0 && T.lifted.unread.length === 0 && T.lifted.words > 0, T.lifted.unread.length ? `not read: ${few(T.lifted.unread)}` : T.lifted.off.length ? `${n(T.lifted.off.length)} of ${n(T.lifted.words)}: ${few(T.lifted.off)}` : said(T.lifted));
check("C3  and by a second road at rest: the pool the page itself says it offered is, pill for pill, what the chain holds",
  road.off.length === 0 && road.unread.length === 0 && road.pills > 0, road.unread.length ? `not read: ${few(road.unread)}` : road.off.length ? `${n(road.off.length)}: ${few(road.off)}` : `${n(road.words)} words · ${n(road.pills)} readings of the page's own account against their links · ${n(road.more)} pills that print more than their reading (a pointer, a read word named) are left to C1`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
