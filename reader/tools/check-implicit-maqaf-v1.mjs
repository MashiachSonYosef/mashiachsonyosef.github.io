#!/usr/bin/env node
// GUARDS: implicit-maqaf-rule-v1-a-joiner-is-not-a-word-and-not-a-Q
//
// MAM marks 103 places where the accents join two words that the consonantal
// text writes apart. It marks them by INSERTING the joiner character itself,
// U+05BE, wrapped in a span of its own:
//
//     <span class="mam-implicit-maqaf">U+05BE</span>
//
// The span holds no word. Its whole surface is the joiner. That one fact is
// what this gate is about, and it cuts two ways.
//
// First, the ruling already recorded in the frame: an implicit maqaf is NOT a
// Q. Q points at a mark, and a joiner is not a mark — it is a statement that
// the two words on either side of it are read as one. That belongs to W and
// the COMPspan lattice, where a span of atoms is exactly the thing we have
// vocabulary for. Routing it to Q would put a pointer on a character that is
// not there in the book.
//
// Second, and this is the one that damages a page: if a build takes the span
// at face value and tokenizes on spaces, the joiner arrives as a token of its
// own. Then a punctuation mark sits at a word position — counted as a word of
// the book when it is not one, and offered to the catalog as a lexical key
// when there is nothing to look up. It is the weld's mirror image. The weld
// fused two things into one token; this splits one thing into a token that is
// nothing.
//
// The rule, in one line: the joiner may live inside a token or between two of
// them, and may never be a token.
//
// The three books that carry these sites — job, proverbs, psalms — are not on
// this shelf yet. That is said out loud at the end of every run, because a
// pass here today proves the shelf clean and proves nothing about the 103.
// The gate is written first on purpose, the same way the weld gate was.
//
// Run: node tools/check-implicit-maqaf-v1.mjs [--zones data/zones]
//                                             [--census build/mam-apparatus-census-v1.json]
//                                             [--frame data/frame-record-v1.js]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const CENSUS = arg("census", join(K3, "build", "mam-apparatus-census-v1.json"));
const FRAME = arg("frame", join(K3, "data", "frame-record-v1.js"));

// Named by codepoint, never typed — the tree's standing rule. A check may
// reason about the script and may not carry a glyph of it.
const MAQAF = "\u05be";
const CLASS = "mam-implicit-maqaf";
const HEBREW_LETTER = /[\u05d0-\u05ea]/u;
// The joiner alone, with any amount of surrounding whitespace and nothing else.
const JOINER_ALONE = new RegExp(`^[\\s\\u00a0]*${MAQAF}+[\\s\\u00a0]*$`, "u");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ── the record ────────────────────────────────────────────────────────────
// The frame record is a browser global. Reading it by evaluating the file is
// how this lane quotes a ruling instead of retyping one.
const readFrame = () => {
  if (!existsSync(FRAME)) return null;
  const src = readFileSync(FRAME, "utf8");
  const win = {};
  new Function("window", src)(win);
  return win.FRAME_RECORD_V1 || null;
};

const frame = readFrame();
if (!frame) {
  console.log(`SKIPPED — no frame record at ${FRAME}, so the ruling this gate enforces cannot be quoted`);
  process.exit(3);
}

const qRules = frame.q_rules_2026_08_31 || {};
const kinds = Object.keys(qRules.kinds || {});
const shared = (qRules.shared || []).join("\n");

// L1 — the ruling still says what this gate assumes it says. A gate whose
// premise has been edited out from under it is worse than no gate.
check("the record still rules that an implicit maqaf is not a Q",
  /implicit maqaf is not a Q/i.test(shared),
  /implicit maqaf is not a Q/i.test(shared)
    ? "quoted from q_rules_2026_08_31.shared"
    : "the ruling is gone from the record — this gate has no authority until it is back");

// L2 — and no Q kind has since been opened for it.
const kindNamesIt = kinds.filter((k) => JSON.stringify(qRules.kinds[k]).includes(CLASS) || /implicit.maqaf/i.test(k));
check("no Q kind names the implicit maqaf",
  kindNamesIt.length === 0,
  kindNamesIt.length ? `opened as a Q kind: ${kindNamesIt.join(", ")}` : `${kinds.length} kinds: ${kinds.join(", ")}`);

// ── what MAM actually wrote ───────────────────────────────────────────────
// L3 — every surface the census recorded under this class is the joiner and
// nothing else. If MAM ever wraps a word in it, the whole reading above is
// wrong and this gate must be rewritten, not quietly passed.
let censusSeen = 0, censusTotal = null;
const carryingWords = [];
if (existsSync(CENSUS)) {
  const c = JSON.parse(readFileSync(CENSUS, "utf8"));
  censusTotal = ((c.totals || {})[CLASS]) ?? null;
  for (const row of c.ledger || []) {
    for (const s of row.sites || []) {
      if (s.cls !== CLASS) continue;
      censusSeen += 1;
      const t = String(s.text || "");
      if (!JOINER_ALONE.test(t)) carryingWords.push(`${row.work} ${s.unit} ${JSON.stringify(t).slice(0, 40)}`);
    }
  }
  check("every recorded implicit-maqaf surface is the joiner alone, holding no word",
    carryingWords.length === 0,
    carryingWords.length
      ? `${carryingWords.length} carry more: ${carryingWords.slice(0, 4).join(" · ")}`
      : `${censusSeen} surface(s) read of ${censusTotal ?? "?"} sites the census counted`);
} else {
  console.log(`  --  no census at ${CENSUS}; MAM's own surfaces went unread this run`);
}

// ── what a build could do with it ─────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`\nSKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("\nSKIPPED — no zones on this disk"); process.exit(3); }

const asToken = [], asKey = [];
let zonesRead = 0, wordsRead = 0, joinerInsideAWord = 0;
const zonesNamed = new Set();
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  zonesNamed.add(String(z.work || f.replace(/\.bin$/, "")));
  for (const sec of z.sections || []) {
    for (const w of sec.words || []) {
      wordsRead += 1;
      const s = String(w.s || ""), k = String(w.k || "");
      if (s.includes(MAQAF) || k.includes(MAQAF)) {
        // L4 — the joiner is a token unto itself: a word position holding a
        // punctuation mark, counted as a word of the book.
        if (JOINER_ALONE.test(s)) {
          if (asToken.length < 12) asToken.push(`${z.work} ${sec.label}`);
          else asToken.push(null);
        } else if (HEBREW_LETTER.test(s)) joinerInsideAWord += 1;
        // L5 — and the same at the catalog's door. A key that is the joiner
        // asks the catalog to define a hyphen.
        if (JOINER_ALONE.test(k)) {
          if (asKey.length < 12) asKey.push(`${z.work} ${sec.label}`);
          else asKey.push(null);
        }
      }
    }
  }
}

console.log(`\n— ${zonesRead} zones · ${wordsRead.toLocaleString()} words —`);
check("the joiner is never the whole of a token",
  asToken.length === 0,
  asToken.length
    ? `${asToken.length} position(s) hold a joiner and no word — ${asToken.filter(Boolean).slice(0, 4).join(" · ")}`
    : `${joinerInsideAWord.toLocaleString()} token(s) carry a joiner inside a word, which is where it belongs`);
check("the joiner is never the whole of a lexical key",
  asKey.length === 0,
  asKey.length
    ? `${asKey.length} key(s) are a joiner — ${asKey.filter(Boolean).slice(0, 4).join(" · ")}`
    : "no key on this shelf asks the catalog to define a joiner");

// ── what this run did not see ─────────────────────────────────────────────
// The three books carrying all 103 sites. Named, not counted, because a
// pass over a shelf that does not hold them is not coverage of them.
const CARRIERS = ["job", "proverbs", "psalms"];
const absent = CARRIERS.filter((b) => ![...zonesNamed].some((w) => w === b || w.endsWith(`/${b}`) || w.endsWith(`-${b}`)));
if (absent.length) {
  console.log(`\n  note: every implicit-maqaf site the census found is in ${CARRIERS.join(", ")}, and`);
  console.log(`  ${absent.length === CARRIERS.length ? "none of them are" : absent.join(", ") + " is not"} on this shelf. This run proves the shelf clean of stray`);
  console.log("  joiners and proves nothing about the 103. The gate stands here first so that");
  console.log("  the books cannot arrive and pass without meeting it.");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
