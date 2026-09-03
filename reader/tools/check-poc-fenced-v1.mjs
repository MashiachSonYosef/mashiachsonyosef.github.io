#!/usr/bin/env node
// GUARDS: poc-demonstration-rule-v1-hand-authored-never-served-always-fenced
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// One page on this site is hand-authored, and this is the fence around it.
//
// The serve law is that the pipeline decides, gates are the only judges, and
// nothing is hand-picked. The owner suspended it for /demonstrations/ and said
// plainly why: the books carrying written/read, the section marks and the
// inverted nun are held — HTML bled into their text — and nobody holds the
// end-of-book masorah at all. So a reader could see none of what the frame is
// for. Six drawings answer that, and every glyph in them was typed.
//
// A suspended rule with nothing around it is an absent rule. So:
//
//   L1  the record exists and says, in its own words, that it is typed
//   L2  every Hebrew string the page prints is one the record declares.
//       Not "looks like corpus text" — literally on the list. A seventh
//       demonstration cannot be added by editing HTML.
//   L3  the page says what it is before it says anything else
//   L4  no demonstration wears a licence chip. This is the one that matters:
//       a licence chip means a record stands behind this reading, and there is
//       no record behind a typed string. It would be the only lie on a site
//       whose first line is that every reading traces to the record carrying
//       it.
//   L5  the fence holds nowhere else. No other served page prints a string
//       that appears only in this record.
//   L6  a demonstration whose Hebrew is CARRIED from a record (the record
//       says so, names the ledger and two 64-hex hashes, and lists its
//       strings apart) wears the credit its source requires, verbatim, and
//       is the only place on the page a licence may be named; every other
//       demonstration is typed and wears none.
//
// The carried exception, 2026-09-03. The owner asked for the maqaf
// demonstration cut from a real verse of Ruth. Its Hebrew comes from the
// corpus lane's candidate split stream, countersigned by this lane, so a
// record does stand behind it, and the licence of that record must be shown.
// L4 keeps its rule for typed strings; L6 holds the carried one to the
// opposite duty. L5 checks the typed list only: a carried string is corpus
// text and may lawfully appear wherever its work is served.
//
// L5 constrains what a demonstration may typeset, and that is deliberate. This
// check cannot tell a leak from a coincidence: a served page carrying a string
// this record declares looks identical either way. So the record must stay
// clear of ordinary words. The masorah demonstration first drew its card on
// "the book", which 48 served pages print in their own titles, and L5 refused
// it — correctly, because a declared common word would let a typed string
// alias real corpus text anywhere on the site. It draws on "by verses"
// instead, which the corpus does not use, and demonstrates the same prefix.
//
// Run: node tools/check-poc-fenced-v1.mjs [--out deploy-root]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const OUT = arg("out", join(K3, "deploy-root"));
const RECORD = join(K3, "data", "poc-demonstration-v1.json");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(RECORD)) { console.log("SKIPPED — no demonstration record on this disk"); process.exit(3); }
const page = join(OUT, "demonstrations", "index.html");
if (!existsSync(page)) { console.log(`SKIPPED — no demonstrations page at ${page}`); process.exit(3); }

const rec = JSON.parse(readFileSync(RECORD, "utf8"));
const html = readFileSync(page, "utf8");
const body = html.slice(html.indexOf("<body"));

// L1 — the record admits what it is
check("L1  the record says in its own words that it is hand-typed",
  /typed by hand/i.test(String(rec.WHAT_THIS_IS || "")) && Array.isArray(rec.every_hebrew_string_in_this_record),
  `${(rec.demonstrations || []).length} demonstrations · ${(rec.every_hebrew_string_in_this_record || []).length} typed strings declared` + ((rec.every_hebrew_string_carried_from_a_record || []).length ? ` · ${(rec.every_hebrew_string_carried_from_a_record || []).length} carried strings listed apart` : ""));

// L2 — every glyph on the page is a declared one.
// Hebrew runs are pulled out of the rendered body and matched against the
// declared list. A run is a maximal stretch of Hebrew-block characters plus
// the spaces and braces that belong inside a declared string.
const HEB = /[֐-׿יִ-ﭏ]/;
const typed = new Set(rec.every_hebrew_string_in_this_record || []);
const carriedStrings = new Set(rec.every_hebrew_string_carried_from_a_record || []);
const declared = new Set([...typed, ...carriedStrings]);
// the carried demonstrations, as the record and the page each name them
const carriedDemos = (rec.demonstrations || []).filter((d) => d && d.carried_from);
const articles = [...body.matchAll(/<article class="pc" data-id="([^"]*)"([^>]*)>([\s\S]*?)<\/article>/g)]
  .map((m) => ({ id: m[1], carried: /data-carried="1"/.test(m[2]), html: m[3] }));
const typedBody = articles.filter((a) => !a.carried).map((a) => a.html).join("\n")
  + body.replace(/<article class="pc"[\s\S]*?<\/article>/g, "");
// what a declared string can be found as, after HTML escaping strips nothing
// but the tags around it
// EVERY HEBREW CHARACTER THE PAGE PRINTS COMES FROM A DECLARED STRING.
//
// Two earlier versions tried to cut the page into "runs" and both were
// wrong, in opposite directions. Breaking a run at every tag split a word in
// half where an underline sat inside it, and reported each half as an
// undeclared string that nobody typed. Breaking at none glued a Hebrew cell
// to the English beside it and reported that. The page was right both times;
// the idea of a run was wrong both times.
//
// There is no need for runs. The claim is about characters: strip the markup,
// walk the text, and at every Hebrew character require that some declared
// string starts there and covers it. Longest match first, so a short string
// cannot shadow a longer one it sits inside. What survives uncovered is a
// glyph on the page that the record does not account for, which is the only
// thing this law was ever about.
const HEBREW_CH = /[\u0590-\u05ff\ufb1d-\ufb4f]/;
const flat = body.replace(/<[^>]+>/g, "");
// Mark every position any declared string occupies, then require that every
// Hebrew character sits inside one. Coverage rather than anchoring: a
// declared string may begin with a character that is not Hebrew — the section
// marks are a Hebrew letter inside braces — so a match anchored at the letter
// would never find the string that contains it.
const covered = new Uint8Array(flat.length);
for (const str of declared) {
  if (!str) continue;
  for (let at = flat.indexOf(str); at !== -1; at = flat.indexOf(str, at + 1))
    covered.fill(1, at, at + str.length);
}
const uncovered = [];
for (let i = 0; i < flat.length; i += 1) {
  if (covered[i] || !HEBREW_CH.test(flat[i])) continue;
  const from = Math.max(0, i - 12);
  uncovered.push(flat.slice(from, i + 12).replace(/\s+/g, " ").trim());
}
check("L2  every Hebrew character on the page comes from a declared string",
  uncovered.length === 0,
  uncovered.length
    ? `${uncovered.length} not accounted for \u2014 ${[...new Set(uncovered)].slice(0, 3).map((x) => JSON.stringify(x)).join(" \u00b7 ")}`
    : `every one covered by the ${declared.size} strings the record declares`);

// L3 — it says what it is, up front
const firstProse = body.replace(/<[^>]+>/g, "\n").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 6).join(" ");
check("L3  the page says what it is before it says anything else",
  /came from a book|typed by hand|not corpus text/i.test(firstProse),
  /came from a book/i.test(firstProse) ? "\"Nothing on this page came from a book.\"" : firstProse.slice(0, 70));

// L4 — no licence chip on any typed demonstration, nor anywhere outside the articles
const chip = /class="[^"]*\bchip\b[^"]*"/.test(body) || /CC[ -]BY|Public Domain|CC0/i.test(typedBody.replace(/<[^>]+>/g, " "));
check("L4  no typed demonstration wears a licence",
  chip === false,
  chip ? "a licence appears on a typed string — the one lie this site cannot afford" : `${articles.filter((a) => !a.carried).length} typed demonstrations claim no record behind them`);

// L6 — the carried demonstration wears its credit, and is the only one that may
const HEX64 = /^[0-9a-f]{64}$/;
const why6 = [];
for (const d of carriedDemos) {
  const cf = d.carried_from, a = articles.find((x) => x.id === d.id);
  if (!a) { why6.push(`${d.id}: no article on the page`); continue; }
  if (!a.carried) why6.push(`${d.id}: the record says carried, the article does not`);
  if (!(cf.ledger && cf.credit && cf.credit.line && cf.credit.licence)) why6.push(`${d.id}: the record names no ledger or no credit`);
  if (!(HEX64.test(String(cf.surface_sha256)) && HEX64.test(String(cf.normalized_sha256)))) why6.push(`${d.id}: the stream is not named by two 64-hex hashes`);
  const flatA = a.html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
  if (cf.credit && cf.credit.line && !flatA.includes(String(cf.credit.line).replace(/\s+/g, " "))) why6.push(`${d.id}: the credit line is not printed verbatim`);
  if (cf.ledger && !flatA.includes(cf.ledger)) why6.push(`${d.id}: the ledger is not named on the page`);
  // every Hebrew token on the carried article is inside a carried string
  const hebrewOfIt = flatA.split(/\s+/).filter((t) => /[\u0590-\u05ff\ufb1d-\ufb4f]/.test(t));
  const stray = hebrewOfIt.filter((h) => ![...carriedStrings].some((c) => c.includes(h)));
  if (stray.length) why6.push(`${d.id}: Hebrew on it outside the carried list — ${stray.slice(0, 2).join(" · ")}`);
}
for (const a of articles.filter((x) => x.carried)) if (!carriedDemos.some((d) => d.id === a.id)) why6.push(`${a.id}: the article says carried, the record does not`);
check("L6  a carried demonstration wears its source's credit verbatim, and only it may",
  why6.length === 0,
  why6.length ? why6.slice(0, 3).join(" · ") : (carriedDemos.length ? `${carriedDemos.map((d) => `${d.id} from ${d.carried_from.ledger}`).join(", ")}` : "none carried; every demonstration is typed"));

// L5 — and the fence holds nowhere else
const others = [];
if (existsSync(OUT)) for (const d of readdirSync(OUT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === "demonstrations") continue;
  const f = join(OUT, d.name, "index.html");
  if (!existsSync(f)) continue;
  const t = readFileSync(f, "utf8");
  for (const s of typed) if (s.length > 3 && t.includes(s)) { others.push(`${d.name} prints ${JSON.stringify(s)}`); break; }
  if (others.length > 4) break;
}
check("L5  no other page prints a typed string that exists only in this record",
  others.length === 0,
  others.length ? others.slice(0, 3).join(" · ") : "the suspension reaches one page and no further");

console.log("\n  what this does not say: that any drawing here is correct Hebrew. It says");
console.log("  only that nothing on the page pretends to be carried, and that the rule");
console.log("  suspended for it is suspended nowhere else.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
