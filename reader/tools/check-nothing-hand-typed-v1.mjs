#!/usr/bin/env node
// hand-typing-rule-v1-plain-english-descriptors-and-nothing-else
//
// What may be typed into these files by hand is plain English that names a
// thing — "book title", "export", "right to left" — the way a search box is
// labelled "search". Everything else the page shows is corpus text and arrives
// from the chain: the zones, the route store, the commentary sidecars.
//
// The rule has been broken three times, each time by me, each time with a
// string that happened to be correct: a title copied into a link, a title
// copied onto the front door, a Hebrew letter used as an icon meaning
// "Hebrew". Correct is not the point. A copy is not a source, and on the page
// a copy is indistinguishable from something the chain carried — which makes
// it the one string with nothing behind it.
//
// Two rules, because two kinds of file:
//
//   Served files — the reader and the pages around it — carry no character of
//   any script the corpus is written in, anywhere, for any reason. Where the
//   page must draw one (the maqaf between two regions of a word) it takes it
//   off the word it just split, and names the codepoint rather than typing the
//   glyph.
//
//   Tools may reason about those scripts in their comments, because an
//   argument about the corpus is not a copy standing in for it. They may not
//   put a glyph in a string literal: a literal can become output, a comment
//   cannot. Character classes are written as codepoints.
//
// Reads the files off disk. Takes no URL.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// Hebrew, Hebrew presentation forms, Arabic, Syriac, Samaritan — every script
// the corpus is or may be written in. Latin and the punctuation English shares
// with it are ours to type.
const isCorpusScript = (cp) =>
  (cp >= 0x0590 && cp <= 0x05ff) || (cp >= 0x0600 && cp <= 0x06ff) ||
  (cp >= 0x0700 && cp <= 0x074f) || (cp >= 0x0800 && cp <= 0x083f) ||
  (cp >= 0xfb1d && cp <= 0xfb4f);

/**
 * Every glyph of a corpus script that sits inside a string literal.
 *
 * A real scanner rather than a regex, because a comment may contain quotes and
 * a string may contain slashes, and guessing either way makes the rule either
 * unenforceable or a nuisance.
 */
const glyphsInLiterals = (src, isJson) => {
  const out = [];
  let i = 0, line = 1;
  const push = (ch) => out.push({ ch, line });
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") { line += 1; i += 1; continue; }
    if (!isJson && c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (!isJson && c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line += 1; i += 1; }
      i += 2;
      continue;
    }
    if (!isJson && c === "#" && line === 1) {           // a shebang
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === '"' || c === "'" || (!isJson && c === "`")) {
      const quote = c; i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "\n") line += 1;
        const cp = src.codePointAt(i);
        if (isCorpusScript(cp)) push(String.fromCodePoint(cp));
        i += cp > 0xffff ? 2 : 1;
      }
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
};

// ---- served files: nothing beyond what the zones carry -----------------
// A page may print no character of the text that somebody typed. The door
// carries each book's own title verbatim from its zone — the ledger's word,
// generated, never typed — so a carried title is scrubbed before the scan and
// anything left is a typed character. zone.html carries none at all: its text
// arrives from data at runtime, and the scrub removes nothing from it.
const SERVED = ["zone.html"];
{
  // Every address page the door emits, found by walking, never by naming —
  // a stub added for a new work or a republished address joins the scan the
  // moment it exists.
  const dr = join(K3, "deploy-root");
  if (existsSync(dr)) {
    if (existsSync(join(dr, "index.html"))) SERVED.push("deploy-root/index.html");
    for (const d of readdirSync(dr, { withFileTypes: true })) {
      if (d.isDirectory() && existsSync(join(dr, d.name, "index.html")))
        SERVED.push(`deploy-root/${d.name}/index.html`);
    }
  }
}
{
  // The publication itself: the door and every address page at the repository
  // root — what is actually served, present on every checkout, scanned
  // whether or not a build has run here. Before this walk, a fresh checkout
  // scanned exactly one file, and the pages people actually read were
  // scanned by nothing.
  const root = join(K3, "..");
  if (existsSync(join(root, "index.html"))) SERVED.push("../index.html");
  for (const d of readdirSync(root, { withFileTypes: true })) {
    if (d.isDirectory() && !d.name.startsWith(".") && d.name !== basename(K3)
        && existsSync(join(root, d.name, "index.html")))
      SERVED.push(`../${d.name}/index.html`);
  }
}
// The count and a few names, not the whole shelf. This line used to print
// every served path, which on a four-thousand-work shelf is sixty kilobytes of
// one line in every suite log — enough to push the laws below it out of a
// reader's view, which is the opposite of what a check is for.
check("there are served files to read", SERVED.length > 0,
  SERVED.length ? `${SERVED.length.toLocaleString()} files · ${SERVED.slice(0, 3).join(" ")}${SERVED.length > 3 ? " …" : ""}` : "none found");
const { gunzipSync } = await import("node:zlib");
const carriedTitles = [];
const owedWords = new Map();          // surface → how many places the data owes it
const owedKeys = new Set();           // route keys the tokens carry
const zoneNames = new Set();          // the shelf's own addresses
const oweWord = (s) => owedWords.set(s, (owedWords.get(s) || 0) + 1);
const zonesDir = join(K3, "data", "zones");
if (existsSync(zonesDir)) {
  for (const zf of readdirSync(zonesDir).filter((x) => x.endsWith(".bin") && !x.endsWith(".commentary.bin"))) {
    try {
      const z = JSON.parse(gunzipSync(readFileSync(join(zonesDir, zf))).toString("utf8"));
      zoneNames.add(zf.replace(/\.bin$/, ""));
      if (z.work_he) carriedTitles.push(z.work_he);
      if (Array.isArray(z.work_he_tokens)) for (const t of z.work_he_tokens) {
        oweWord(t.s);
        if (t.k) owedKeys.add(t.k);
        if (Array.isArray(t.w)) for (const c of t.w) if (c.k) owedKeys.add(c.k);
      }
    } catch { /* a bin the walk cannot read is someone else's problem, not a licence to skip the scan */ }
  }
  // demo-verse-rule-v1, re-derived independently of the door: the working
  // verse on the door is the first ten words of the first section of the
  // first zone in shelf order — each owed on the door once, its key an owed
  // key, like every other data word. A hand-swapped verse is a word the
  // data does not owe, and fails here.
  const firstZone = readdirSync(zonesDir)
    .filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-") && !x.endsWith(".commentary.bin"))
    .sort()[0];
  if (firstZone) {
    try {
      const z = JSON.parse(gunzipSync(readFileSync(join(zonesDir, firstZone))).toString("utf8"));
      for (const w of ((z.sections || [])[0]?.words || []).slice(0, 10)) {
        if (w.s) oweWord(w.s);
        const k = w.k || (Array.isArray(w.w) && w.w[0] && w.w[0].k) || null;
        if (k) owedKeys.add(k);
      }
    } catch { /* the door will have failed to build from it too */ }
  }
}
// zone.html has no place for any title: its titles arrive from data at
// runtime, so nothing is scrubbed from it at all. The door's title law is
// below, at the door's own grain — the .fw word multiset.
// The door now prints the atlas: recorded work ids, some carrying the work's
// own Hebrew title inside them. Those are records too, and they are scrubbed
// FIRST, longest first — a carried zone title can stand inside a recorded id
// (Genesis inside a Ben-Yehuda essay named for it), and counting or cutting
// the title before the ids would miscount its places and orphan fragments.
let ATLAS_NAMES = [];
{
  const ap = join(K3, "data", "corpus-atlas-v1.json");
  if (existsSync(ap)) {
    const A = JSON.parse(readFileSync(ap, "utf8"));
    for (const fam of Object.values(A.families)) for (const w of fam.works) {
      const nm = String(w.id).split("/").pop();
      if (/[\u0590-\u05FF]/.test(nm))
        ATLAS_NAMES.push(nm.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"));
    }
    ATLAS_NAMES.sort((a, b) => b.length - a.length);
  }
  // and the family ledger's Hebrew names — records of the synthesis lane's
  // own ledger, verified against the store by check-family-ledger-v1
  const lp = join(K3, "data", "family-ledger-v1.json");
  if (existsSync(lp)) {
    const L = JSON.parse(readFileSync(lp, "utf8"));
    for (const lf of L.families || []) if (lf.he) for (const t of lf.he_tokens || []) { ATLAS_NAMES.push(t.s); oweWord(t.s); if (t.k) owedKeys.add(t.k); }
    ATLAS_NAMES.sort((a, b) => b.length - a.length);
  }
}
// ONE PAGE IS GOVERNED BY A DIFFERENT RULE, AND THIS IS A DELEGATION, NOT AN
// THE DEMONSTRATIONS ARE NO LONGER HAND-AUTHORED (2026-09-03). The exemption
// this block used to record is gone with the page it covered. /demonstrations/
// was a drawing of the reader's card with typed Hebrew in it, suspended from
// the serve law and fenced by a list of declared strings. It is now an index
// that prints no Hebrew at all, linking to eight pages that ARE the reader,
// each opening a zone the ordinary builder built. So the index needs no
// exemption from this check — it has nothing to exempt — and the passages are
// governed where they belong, in
// rule-demonstration-rule-v1 (check-demonstrations-v1), which holds every
// one of them to naming what it carried and hashing what it carried it from.
//
// What is checked here is that the handover is real: the record must exist and
// must name every page under /demonstrations/. Delete the record and those
// pages fall straight back under this rule, which is what makes the handover
// safe to write down.
const DEMO_DIR = "demonstrations/";
const DEMO_RECORD = join(K3, "data", "rule-demonstrations-v1.json");
const demoPages = new Set();
for (const f of SERVED) if (f.includes(DEMO_DIR)) demoPages.add(f);
if (demoPages.size) {
  const held = existsSync(DEMO_RECORD);
  const ids = held ? (JSON.parse(readFileSync(DEMO_RECORD, "utf8")).rules || []).map((r) => r.id) : [];
  const unnamed = [...demoPages].filter((f) => {
    const rest = f.slice(f.indexOf(DEMO_DIR) + DEMO_DIR.length).replace(/\/?index\.html$/u, "");
    return rest !== "" && !ids.includes(rest);
  });
  check(`  ${demoPages.size} page(s) under /demonstrations/ are governed by rule-demonstration-rule-v1 instead`,
    held && unnamed.length === 0,
    !held
      ? "the record is gone, so nothing governs them — they must be removed or the record restored"
      : unnamed.length
        ? `${unnamed.length} page(s) the record does not name: ${unnamed.slice(0, 3).join(", ")}`
        : `the record names all ${ids.length} rules and check-demonstrations-v1 holds each to its source`);
}


for (const f of SERVED) {
  // the demonstration pages are the reader itself, governed by
  // rule-demonstration-rule-v1 and handed over above
  if (demoPages.has(f)) continue;
  let src = readFileSync(join(K3, f), "utf8");
  const isDoor = f === "deploy-root/index.html" || f === "../index.html";
  const isEmitted = f.startsWith("deploy-root/") || f.startsWith("../");
  if (isDoor) {
    // The door prints a title word by word \u2014 each word a pressable route
    // button \u2014 so a contiguous title string is not what the door carries,
    // and counting titles as strings charged every common word with every
    // row that shares it. The door's law at the door's own grain: the
    // multiset of .fw words IS the multiset the data owes \u2014 every zone's
    // title tokens once, every family's ledger tokens once \u2014 no word more,
    // no word fewer. A scrub alone would launder a typed duplicate of a
    // real word; the count cannot: a typed duplicate is one occurrence
    // over what the data owes, and a word from nowhere owes zero.
    const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const fwWords = [...src.matchAll(/class="fw(?: inert)?"[^>]*>([^<]+)</g)].map((m) => unesc(m[1]));
    const doorHas = new Map();
    for (const w of fwWords) doorHas.set(w, (doorHas.get(w) || 0) + 1);
    const diffs = [];
    for (const [w, owed] of owedWords) {
      const has = doorHas.get(w) || 0;
      if (has !== owed) diffs.push(`${w}: door ${has}, data owes ${owed}`);
    }
    for (const [w, has] of doorHas) if (!owedWords.has(w)) diffs.push(`${w}: door ${has}, data owes 0`);
    check("  the door's title words are the data's, word for word, count for count",
      diffs.length === 0,
      diffs.length ? `${diffs.length} words off \u2014 ${diffs.slice(0, 3).join(" \u00b7 ")}` : `${fwWords.length} words, every one owed`);
    // The buttons' own attributes are data too: the key is the token's
    // route key, the address names a zone on the shelf, and the book name
    // is that address spaced \u2014 verified against the data, then blanked,
    // so the residual scan judges only what stands outside them.
    const tagBad = [];
    for (const m of src.matchAll(/<(?:button|span)[^>]*class="fw(?: inert)?"[^>]*>/g)) {
      const tag = m[0];
      const at = (n) => { const mm = tag.match(new RegExp(`${n}="([^"]*)"`)); return mm ? unesc(mm[1]) : null; };
      const k = at("data-k"), book = at("data-book"), bn = at("data-bookname");
      if (k && !owedKeys.has(k)) tagBad.push(`key ${k} owed by no token`);
      if (book && !zoneNames.has(book.replace(/^\//, ""))) tagBad.push(`address ${book} names no zone`);
      if (bn && /[\u0590-\u05ff]/u.test(bn) && book
          && bn.replace(/ /g, "-") !== book.replace(/^\//, "").replace(/_/g, "-"))
        tagBad.push(`book name "${bn}" is not its address spaced`);
    }
    check("  the buttons' keys, addresses and book names are the data's own",
      tagBad.length === 0, tagBad.slice(0, 3).join(" \u00b7 ") || "verified");
    src = src.replace(/<(button|span)[^>]*class="fw(?: inert)?"[^>]*>/g, '<$1 class="fw">');
    src = src.replace(/(class="fw"[^>]*>)[^<]+</g, "$1<");
  }
  if (isEmitted) for (const nm of ATLAS_NAMES) src = src.split(nm).join("");
  for (const t of carriedTitles) {
    if (isEmitted) src = src.split(t).join("");
  }
  const hits = [];
  for (let i = 0; i < src.length; i += 1) {
    const cp = src.codePointAt(i);
    if (isCorpusScript(cp)) hits.push(`line ${src.slice(0, i).split("\n").length}`);
    if (hits.length > 5) break;
  }
  check(`  ${f} types no character of the text, anywhere`, hits.length === 0,
    hits.length ? `${hits.length}${hits.length > 5 ? "+" : ""} at ${hits.slice(0, 3).join(", ")}` : "clean");
}

// ---- tools: none in anything that can become output -------------------
const TOOLS = join(K3, "tools");
if (existsSync(TOOLS)) {
  const offenders = [];
  for (const f of readdirSync(TOOLS).filter((x) => /\.(mjs|js|json|sh)$/.test(x))) {
    const src = readFileSync(join(TOOLS, f), "utf8");
    const hits = glyphsInLiterals(src, f.endsWith(".json"));
    if (hits.length) offenders.push(`${f}: ${hits.length} (line ${hits[0].line})`);
  }
  check("  no tool puts a glyph of the text in a string literal",
    offenders.length === 0, offenders.join(" · ") || "clean");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
