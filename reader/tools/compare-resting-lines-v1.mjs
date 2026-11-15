#!/usr/bin/env node
// Synthesis lane · every resting line of every work, before and after, set side by side: a report the round prints after its lines step
//
// LEDGER: -
// no frame letter. This reads the records of the resting lines at two states
// and writes a report beside the round's work (build/round-v1 by default); it
// writes nothing into data/ and chooses no line.
// GUARDS: -
// a report, not a law: it judges no line, and fails only where it cannot read
// a record. The lead names each ship's owed classes from what it lists.
//
// WHY THIS IS A STEP OF THE ROUND (the completeness critic of 15 November
// 2026, a process point taken). The records of the resting lines
// (data/resting-lines/<work>.json.gz, tools/bake-resting-lines-v1.mjs) are
// every line a first visit draws, word by word, with the source its chip
// credits. A ship that moves resting lines has said how many moved by
// sampling: the gate's S1 reads a few chapters, a reviewer reads a few more,
// and the integration notes of 15 November said «41 the same» of pills alone
// and owed 232 lines the gate sampled 8 of. The next ships move resting lines
// on purpose (the dictionaries that rest shut, the corpus lane's calls), so
// the round now sets every line of every record beside the line the same word
// had before and says each one that moved, with the counts by work and by the
// source each line is credited to, before and after.
//
// BEFORE is a git revision of this repository (HEAD by default: the records
// as last committed, which the round's lines step has just read again);
// AFTER is the records as they stand on disk. A line is the record's own:
// [first entry, how many entries it stands over, the text as drawn, who the
// chip credits] (tools/resting-lines-v1.mjs). Each word is set beside the
// line over it before and after; the words of a run whose line moved the
// same way are one moved line, so a run's one line that now reads word by
// word is said once per word's line, and a word that gains a line where it
// had none is said as «bare before». A place is named as the reader names
// it, the section's label and the word's number among the words that are not
// marks, read from the zone on disk; where that zone is not there, by its
// entry. A work kept at one state and not the other is listed, not failed.
//
// Run (from reader/): node tools/compare-resting-lines-v1.mjs [--before <git revision, default HEAD>]
//   [--records <folder of the records after, default data/resting-lines>] [--works <work,work>]
//   [--out <the report, default build/round-v1/resting-lines-compare.json>]
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startedAs } from "./main-guard-v1.mjs";
import { RESTING_DIR } from "./resting-lines-v1.mjs";

export const COMPARE_SCHEMA = "RESTING_LINES_COMPARE_V1";
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
// numbers grouped by threes, the same on every machine (no locale)
const n0 = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
const NONE_NAMED = "(no source named)";
const creditOf = (u) => (u && String(u[3] || "").trim()) || NONE_NAMED;

/** A record's sections, each keyed by its label and the label's occurrence among them, with its lines. */
const sectionsOf = (rec) => {
  const seen = new Map(), out = new Map();
  for (const s of (rec && Array.isArray(rec.sections) ? rec.sections : [])) {
    const label = String(s[0]), k = seen.get(label) || 0;
    seen.set(label, k + 1);
    out.set(`${label}#${k}`, { label, lines: Array.isArray(s[1]) ? s[1].filter(Array.isArray) : [] });
  }
  return out;
};
/** entry -> the line over it */
const overOf = (lines) => { const m = new Map(); for (const u of lines) for (let e = u[0]; e < u[0] + u[1]; e += 1) m.set(e, u); return m; };
const sameLine = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
const howMoved = (a, b) => {
  if (!a) return "bare before";
  if (!b) return "bare after";
  return [a[0] !== b[0] || a[1] !== b[1] ? "span" : null, a[2] !== b[2] ? "text" : null, a[3] !== b[3] ? "credit" : null].filter(Boolean).join(" and ");
};

/** Every line of two records of one work, set side by side: the moved lines (each word set beside the line over it at
 *  each state; the words of one line that moved the same way said once), and each state's lines by credit. `placeOf`
 *  names an entry of a section as the reader does. */
export const compareRecords = (work, before, after, placeOf = (label, e) => `${label} entry ${e + 1}`) => {
  const moved = [], credits = new Map();
  const tally = (rec, side) => { for (const s of sectionsOf(rec).values()) for (const u of s.lines) { const c = creditOf(u); if (!credits.has(c)) credits.set(c, { before: 0, after: 0 }); credits.get(c)[side] += 1; } };
  tally(before, "before"); tally(after, "after");
  const A = sectionsOf(before), B = sectionsOf(after);
  let wordsMoved = 0;
  for (const key of new Set([...A.keys(), ...B.keys()])) {
    const sa = A.get(key), sb = B.get(key), label = (sa || sb).label;
    const oa = overOf(sa ? sa.lines : []), ob = overOf(sb ? sb.lines : []);
    let last = null;
    for (const e of [...new Set([...oa.keys(), ...ob.keys()])].sort((x, y) => x - y)) {
      const a = oa.get(e) || null, b = ob.get(e) || null;
      if (a && b && sameLine(a, b)) { last = null; continue; }
      wordsMoved += 1;
      if (last && last.a === a && last.b === b && last.to === e - 1) { last.to = e; last.row.words += 1; continue; }
      const row = { work, place: placeOf(label, e, key), words: 1, how: howMoved(a, b),
        before: a ? { text: a[2], credit: creditOf(a), over: a[1] } : null, after: b ? { text: b[2], credit: creditOf(b), over: b[1] } : null };
      moved.push(row);
      last = { a, b, to: e, row };
    }
  }
  const lines = (rec) => [...sectionsOf(rec).values()].reduce((n, s) => n + s.lines.length, 0);
  return { work, lines_before: lines(before), lines_after: lines(after), moved, words_moved: wordsMoved, credits };
};

/** A zone's places as the reader names them: section key ("label#k") -> entry -> "label:n", n the word's number among
 *  the section's words that are not marks; null where the zone cannot be read. */
const placesFrom = (zonePath) => {
  if (!existsSync(zonePath)) return null;
  try {
    const z = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
    const seen = new Map(), out = new Map();
    for (const sec of z.sections || []) {
      const label = String(sec.label), k = seen.get(label) || 0;
      seen.set(label, k + 1);
      let n = 0;
      out.set(`${label}#${k}`, (sec.words || []).map((w) => (w && w.mark ? null : `${label}:${++n}`)));
    }
    return out;
  } catch { return null; }
};

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
  const BEFORE = arg("before", "HEAD");
  const RECORDS = resolve(arg("records", join(K3, RESTING_DIR)));
  const OUT = resolve(arg("out", join(K3, "build", "round-v1", "resting-lines-compare.json")));
  const ONLY = arg("works") ? new Set(arg("works").split(",").filter(Boolean)) : null;
  const cannot = (what, e) => { console.log(`compare-resting-lines-v1: cannot read ${what}: ${String((e && e.message) || e).split("\n")[0]}`); process.exit(1); };
  const git = (args, encoding = "utf8") => execFileSync("git", ["-C", K3, ...args], { encoding, maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
  const gz = (bytes) => JSON.parse(gunzipSync(bytes).toString("utf8"));
  const name = (f) => f.replace(/\.json\.gz$/u, "");
  let commit = null, beforeNames = [];
  try {
    commit = git(["rev-parse", "--short=10", `${BEFORE}^{commit}`]).trim();
    beforeNames = git(["ls-tree", "--name-only", BEFORE, "--", `./${RESTING_DIR}/`]).split("\n").filter((x) => x.endsWith(".json.gz")).map((x) => name(x.split("/").pop()));
  } catch (e) { cannot(`the records at ${BEFORE}`, e); }
  let afterNames = [];
  try { afterNames = readdirSync(RECORDS).filter((f) => f.endsWith(".json.gz")).map(name); } catch (e) { cannot(`the records in ${RECORDS}`, e); }
  const works = [...new Set([...beforeNames, ...afterNames])].filter((w) => !ONLY || ONLY.has(w)).sort();
  if (ONLY) for (const w of ONLY) if (!works.includes(w)) cannot(`the work ${w}`, "no record of it at either state");
  const results = [], onlyBefore = [], onlyAfter = [], sources = {};
  for (const w of works) {
    let before = null, after = null;
    if (beforeNames.includes(w)) { try { before = gz(git(["show", `${BEFORE}:./${RESTING_DIR}/${w}.json.gz`], "buffer")); } catch (e) { cannot(`${w} at ${BEFORE}`, e); } }
    if (afterNames.includes(w)) { try { after = gz(readFileSync(join(RECORDS, `${w}.json.gz`))); } catch (e) { cannot(`${w} in ${RECORDS}`, e); } }
    if (!before) onlyAfter.push(w);
    if (!after) onlyBefore.push(w);
    for (const rec of [before, after]) for (const [id, s] of Object.entries((rec && rec.sources) || {})) if (!sources[id]) sources[id] = s.label || null;
    // the zone names the places, read only where a line moved
    let places;
    const placeOf = (label, e, key) => {
      if (places === undefined) places = placesFrom(join(K3, "data", "zones", `${w}.bin`));
      const at = places && places.get(key);
      return (at && at[e]) || `${label} entry ${e + 1}`;
    };
    results.push(compareRecords(w, before, after, placeOf));
  }
  // the counts: in all, by work, by credit, and by how each line moved
  const counts = { works: works.length, lines_before: 0, lines_after: 0, moved: 0, words_moved: 0 };
  const byBook = {}, byCredit = {}, byHow = {};
  for (const r of results) {
    counts.lines_before += r.lines_before; counts.lines_after += r.lines_after; counts.moved += r.moved.length; counts.words_moved += r.words_moved;
    byBook[r.work] = { lines_before: r.lines_before, lines_after: r.lines_after, moved: r.moved.length, words_moved: r.words_moved };
    for (const [c, k] of r.credits) { if (!byCredit[c]) byCredit[c] = { before: 0, after: 0 }; byCredit[c].before += k.before; byCredit[c].after += k.after; }
    for (const m of r.moved) byHow[m.how] = (byHow[m.how] || 0) + 1;
  }
  const report = {
    schema_version: COMPARE_SCHEMA,
    generated_by: "tools/compare-resting-lines-v1.mjs",
    what: "every resting line of every work at two states, word by word: each line that moved (work, place, before and after with the text as drawn and who the chip credits, how many words it moved over), and the counts by work and by credit at each state. A report, not a law: it judges no line.",
    before: { revision: BEFORE, commit, records: beforeNames.length },
    after: { records: relative(K3, RECORDS) || ".", count: afterNames.length },
    counts, by_how: byHow, by_book: byBook, by_credit: byCredit, sources,
    works_only_before: onlyBefore, works_only_after: onlyAfter,
    moved: results.flatMap((r) => r.moved),
  };
  try { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`); } catch (e) { cannot(`the report's folder ${dirname(OUT)} (writing)`, e); }
  // the summary: the totals, the works where most moved, the credits whose counts moved, how the lines moved
  const movedIn = Object.entries(byBook).filter(([, b]) => b.moved).sort((a, b) => b[1].moved - a[1].moved || (a[0] < b[0] ? -1 : 1));
  const creditMoves = Object.entries(byCredit).filter(([, c]) => c.before !== c.after).sort((a, b) => Math.abs(b[1].after - b[1].before) - Math.abs(a[1].after - a[1].before) || (a[0] < b[0] ? -1 : 1));
  const signed = (d) => (d > 0 ? `+${n0(d)}` : `\u2212${n0(-d)}`);
  console.log(`the resting lines at ${BEFORE} (${commit}) and as they stand: ${counts.works} work(s) · ${n0(counts.lines_before)} lines before, ${n0(counts.lines_after)} after · ${n0(counts.moved)} moved, over ${n0(counts.words_moved)} word(s), in ${movedIn.length} work(s)`);
  if (movedIn.length) console.log(`  where: ${movedIn.slice(0, 8).map(([w, b]) => `${w} ${n0(b.moved)}`).join(", ")}${movedIn.length > 8 ? `, and ${movedIn.length - 8} more` : ""}`);
  if (creditMoves.length) console.log(`  by credit: ${creditMoves.slice(0, 8).map(([c, k]) => `${c} ${n0(k.before)} \u2192 ${n0(k.after)} (${signed(k.after - k.before)})`).join(", ")}${creditMoves.length > 8 ? `, and ${creditMoves.length - 8} more` : ""}`);
  if (counts.moved) console.log(`  how: ${Object.entries(byHow).sort((a, b) => b[1] - a[1]).map(([h, k]) => `${h} ${n0(k)}`).join(", ")}`);
  if (onlyBefore.length || onlyAfter.length) console.log(`  kept at one state only: ${onlyBefore.length ? `before ${onlyBefore.join(", ")}` : ""}${onlyBefore.length && onlyAfter.length ? "; " : ""}${onlyAfter.length ? `after ${onlyAfter.join(", ")}` : ""}`);
  console.log(`  every moved line: ${relative(process.cwd(), OUT) || OUT}`);
}
