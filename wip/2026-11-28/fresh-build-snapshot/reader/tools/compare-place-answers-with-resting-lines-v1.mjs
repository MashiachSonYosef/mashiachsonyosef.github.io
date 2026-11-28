#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reads the places files, the zones and a tree's resting
// lines (the line the page prints under each word at rest) and says, word
// by word, whether the line is STEP's own parts joined. It writes one table
// where asked, and nothing else.
//
// WHY. The fresh build derives STEP's parts at each word from STEP's file.
// The page as it stands prints a line under each word that was built
// another way (the store, the bridge lists). Where both are right they are
// the same words. This lays one beside the other for every word:
//
//   the same                       STEP's parts, each trimmed, joined by « + », are the line
//   the same but for hidden signs  they are the line once the signs the page hides at rest are taken off
//                                  both (a word in angle brackets; the page leaves a zero-width space)
//   different                      anything else, each listed with both and what the record says of the word
//   no line today                  the page prints none; the record's parts are given
//
// The parts taken are the read line's (a plain word; the read forms of a
// word written and read, in order); for a word written and not read, the
// written form's.
//
// Run: node tools/compare-place-answers-with-resting-lines-v1.mjs --lines <tree>/data/resting-lines [--places …] [--zones …] [--table out.tsv]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS, readZone } from "./place-answers-sources-v1.mjs";
import { openPlaces, meetingClass, KINDS } from "./place-answers-places-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const PLACES = arg("places", join(K3, "data", "place-answers-v1", "places")), ZONES = arg("zones", join(K3, "data", "zones")), LINES = arg("lines", join(K3, "data", "resting-lines")), TABLE = arg("table");
const nf = (x) => Number(x).toLocaleString("en-US");
const ZW = /[\u200b\u200c\u200d\u2060\ufeff]/gu;
/** A part with the words in angle brackets and the zero-width marks taken off. */
const bare = (p) => p.replace(ZW, "").replace(/<[^<>]*>/gu, "").replace(/\s+/gu, " ").trim();
/** What a whole part is when it is nothing but a sign: a word in angle
 *  brackets, a word in square brackets, the question sign, the exclamation
 *  sign. null where the part holds a word. */
const signOnly = (p) => { const t = p.replace(ZW, "").trim(); if (/^(<[^<>]*>\s*)+$/u.test(t)) return "<…>"; if (/^(\[[^\[\]]*\]\s*)+$/u.test(t)) return "[…]"; if (t === "¿") return "¿"; if (t === "!") return "!"; if (t === "") return "(empty)"; return null; };
/** Whether today's line is STEP's parts with whole sign parts left out and
 *  words in angle brackets taken off; returns the signs left out, or null. */
function sameButSigns(mineParts, todayParts) {
  const today = todayParts.map(bare).filter((x) => x !== ""); const dropped = []; let k = 0; let angle = false;
  for (const m of mineParts) {
    const b = bare(m);
    if (k < today.length && b !== "" && today[k] === b) { if (b !== m.trim()) angle = true; k += 1; continue; }
    const so = signOnly(m); if (so) { dropped.push(so); continue; }
    return null;
  }
  if (k !== today.length) return null;
  if (angle) dropped.push("a word in <…> inside a part");
  return dropped;
}
const SIGNS = {};
const C = {}; const bump = (k) => { C[k] = (C[k] || 0) + 1; };
const out = [];
let words = 0;
for (const [slug] of BOOKS) {
  const pf = join(PLACES, `${slug}.json.gz`), lf = join(LINES, `${slug}.json.gz`);
  if (!existsSync(pf) || !existsSync(lf)) { console.error(`${slug}: no places file or no resting lines`); process.exit(1); }
  const P = openPlaces(pf), zone = readZone(join(ZONES, `${slug}.bin`));
  const rl = JSON.parse(gunzipSync(readFileSync(lf)).toString("utf8"));
  if (rl.sections.length !== zone.sections.length) { console.error(`${slug}: the resting lines have ${rl.sections.length} sections, the zone ${zone.sections.length}`); process.exit(1); }
  zone.sections.forEach((sec, si) => {
    const [label, rows] = rl.sections[si];
    if (label !== sec.label) { console.error(`${slug}: section ${si} is ${sec.label}, the resting lines say ${label}`); process.exit(1); }
    const lineAt = new Map(); for (const r of rows) for (let k = 0; k < r[1]; k += 1) lineAt.set(r[0] + k, r);
    sec.entries.forEach((e, ei) => {
      if (e.mark) return;
      words += 1;
      const W = P.wordAt(si, ei);
      // the parts the page would print from the record: the read line's; a word written and not read, the written form's
      const picked = []; const classes = [];
      for (const f of W.forms) {
        const o = W.kind === "written, not read" ? f.step.written : f.role === "written" ? null : f.step.read;
        if (!o) continue;
        classes.push(meetingClass(W.kind === "written, not read" ? f.raw.W : f.raw.R));
        if (o.way === 0 || o.letters === "another word") continue;
        // two of ours sharing one part of theirs: the part's English stands under the first of them only when the page draws it once; here each word shows what it takes
        for (const p of o.parts) picked.push(p);
      }
      // a part shared by two read forms of one entry is one part
      const seen = new Set(); const parts = [];
      for (const p of picked) { const key = `${p.row}|${p.he}|${p.en}|${p.tagRaw}`; if (seen.has(key) && W.forms.length > 1) continue; seen.add(key); parts.push(p); }
      // a written form STEP records by its spelling alone has no English of its own
      const mine = parts.map((p) => (p.en || "").trim()).join(" + ");
      const row = lineAt.get(ei);
      const today = row ? row[2] : null, credit = row ? row[3] : "";
      let verdict;
      if (today === null) verdict = "no line today";
      else if (row[1] !== 1) verdict = "today's line stands under more than one word";
      else if (today === mine) verdict = "the same";
      else if (mine !== "" && sameButSigns(parts.map((p) => p.en || ""), today.split(" + "))) { verdict = "the same but for hidden signs"; for (const x of new Set(sameButSigns(parts.map((p) => p.en || ""), today.split(" + ")))) SIGNS[x] = (SIGNS[x] || 0) + 1; }
      else verdict = mine === "" ? "different: the record gives no parts of STEP's as this word's" : "different";
      bump(verdict);
      if (verdict !== "the same" && verdict !== "the same but for hidden signs") {
        const rows2 = []; for (const f of W.forms) for (const o of [f.step.read, f.step.written]) if (o) for (const r of o.rows) rows2.push(`${r.ref} ${r.hebrew || "(no Hebrew)"} «${r.translation}»${r.meaning_variants.trim() ? ` {${r.meaning_variants}}` : ""}`);
        out.push([slug, sec.label, si, ei, W.kind, e.s, verdict, today === null ? "" : today.replace(ZW, "\u2423"), credit, mine, classes.join(" ; "), [...new Set(rows2)].join(" ¦ ")].join("\t"));
      }
    });
  });
}
console.log(`${nf(words)} words`);
for (const [k, n] of Object.entries(C).sort((a, b) => b[1] - a[1])) console.log(`  ${nf(n).padStart(8)}  ${k}`);
console.log("\nthe signs today's page leaves out, by the words they are left out of:"); for (const [k, n] of Object.entries(SIGNS).sort((a, b) => b[1] - a[1])) console.log(`  ${nf(n).padStart(8)}  ${k}`);
if (TABLE) { writeFileSync(TABLE, ["book\tverse\tsection\tentry\tkind\tours\tverdict\ttoday's line\ttoday's credit\tSTEP's parts joined\tthe record's meeting\tSTEP's rows", ...out].join("\n") + "\n"); console.log(`\n${nf(out.length)} words listed in ${TABLE}`); }
