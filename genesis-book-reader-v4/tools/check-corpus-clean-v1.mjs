#!/usr/bin/env node
// check-corpus-clean-v1 · does a served work carry only its own text?
//
// Written for the corpus lane, to be run there. The reader lane found that
// the sealed chain carries the Hebrew Wikisource page's HTML as scripture —
// 377 occurrences in I Kings, 51 in Genesis, printed to readers as words.
// The Aramaic Targum to Ruth is clean, so the ingest has a right path and a
// wrong one, and the difference is not visible from inside a single book.
// Ruth is clean of markup but still carries ketiv forms as occurrences and
// one mid-word split, so "no HTML" is not the same as clean and this reports
// all three faults apart.
//
// This makes it visible. Point it at a serve NDJSON (or several) and it
// classifies every occurrence by mechanism, refusing the run if any carries
// markup. Run it after a re-ingest and a clean report is the proof.
//
//   node tools/check-corpus-clean-v1.mjs serves/*.ndjson
//   node tools/check-corpus-clean-v1.mjs serves/genesis.ndjson --manifest out.json
//
// The three classes, and why each is separate:
//
//   RAW_MARKUP           HTML tags and entities inside exact_surface_form.
//                        Never anything but corruption. Exits non-zero.
//   APPARATUS_AS_TEXT    Unpointed Hebrew inside a pointed text — section
//                        markers, ketiv forms, footnote prose about
//                        manuscript variants. Real content of the edition,
//                        but not occurrences of the work: it belongs in its
//                        own recorded layer, where a reader can render it as
//                        what it is. Reported, does not fail.
//   MID_WORD_SPLIT       An occurrence whose whole surface is one base
//                        letter. Reported with its neighbours, because a
//                        genuine one-letter word exists and only the
//                        neighbours tell them apart. Does not fail.
//
// It reads the serve's own output and nothing else, so it makes no claim
// about what the text should say — only about what is not text at all.
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const mi = args.indexOf("--manifest");
const MANIFEST = mi > -1 ? args[mi + 1] : null;
// mi is -1 when --manifest is absent, and mi + 1 is then 0 — which silently
// dropped the first file. Only exclude the manifest's own value.
const FILES = args.filter((a, i) => !a.startsWith("--") && !(mi > -1 && i === mi + 1));
if (!FILES.length) {
  console.log("usage: check-corpus-clean-v1.mjs <serve.ndjson…> [--manifest out.json]");
  process.exit(3);
}

const MARKUP = /class=|<\/?span|<\/?b>|<\/?i>|<br\s*\/?>|&nbsp;|&thinsp;|&[a-z]+;|<\/?div|style=/;
const HEB = (s) => /[א-ת]/.test(s);
const POINTED = (s) => /[֑-ׇ]/.test(s);
const SECTION_MARKER = /^[({][פס][)}]$/;
const stripMarks = (s) => s.normalize("NFD").replace(/[֑-ׇ]/g, "");
const bare = (s) => stripMarks(s).replace(/[׃־()[\]{}]/g, "").trim();

const all = [];
for (const f of FILES) {
  const rows = readFileSync(f, "utf8").split("\n").filter((l) => l.trim())
    .map((l) => JSON.parse(l)).filter((r) => r.c0_numeric_id !== undefined);
  const name = f.split("/").pop().replace(/\.ndjson$/, "");
  const byId = new Map(rows.map((r) => [r.c0_numeric_id, r]));
  const found = [];
  for (const r of rows) {
    const s = String(r.exact_surface_form ?? "");
    let cls = null, note = null;
    if (MARKUP.test(s)) cls = "RAW_MARKUP";
    else if (HEB(s) && !POINTED(s)) {
      cls = "APPARATUS_AS_TEXT";
      note = SECTION_MARKER.test(s) ? "section marker" : "unpointed inside a pointed text";
    } else if (bare(s).length === 1 && HEB(s)) {
      cls = "MID_WORD_SPLIT";
      const prev = byId.get(r.c0_numeric_id - 1), next = byId.get(r.c0_numeric_id + 1);
      note = `${prev ? prev.exact_surface_form : "—"} [${s}] ${next ? next.exact_surface_form : "—"}`;
    }
    if (cls) found.push({ work: name, c0: r.c0_numeric_id, unit: r.terminal_unit_id,
      ordinal: r.token_ordinal_in_unit, surface: s, class: cls, note });
  }
  all.push({ file: f, work: name, rows: rows.length, found });
}

let markup = 0;
console.log("work                       rows      markup   apparatus   mid-word split");
for (const w of all) {
  const c = (k) => w.found.filter((x) => x.class === k).length;
  markup += c("RAW_MARKUP");
  console.log(`${w.work.padEnd(24)} ${String(w.rows).padStart(7)} ${String(c("RAW_MARKUP")).padStart(9)} ` +
    `${String(c("APPARATUS_AS_TEXT")).padStart(11)} ${String(c("MID_WORD_SPLIT")).padStart(15)}`);
}
for (const w of all) {
  const m = w.found.filter((x) => x.class === "RAW_MARKUP");
  if (!m.length) continue;
  console.log(`\n${w.work} · first markup occurrences (of ${m.length}):`);
  for (const x of m.slice(0, 6)) console.log(`   c0 ${x.c0} ord ${x.ordinal}  ${JSON.stringify(x.surface).slice(0, 74)}`);
  const splits = w.found.filter((x) => x.class === "MID_WORD_SPLIT");
  if (splits.length) {
    console.log(`${w.work} · every mid-word split (${splits.length}), with its neighbours:`);
    for (const x of splits) console.log(`   c0 ${x.c0}  ${x.note}`);
  }
}

if (MANIFEST) {
  const doc = {
    schema_version: "CORPUS_DEFECT_MANIFEST_V1",
    emitted_by: "tools/check-corpus-clean-v1.mjs",
    rule: "every entry below is one occurrence the serve returned whose exact_surface_form is not text of the work. Classified by mechanism, never repaired here: this lane measures and the corpus lane fixes. Re-run this tool after a re-ingest; an empty markup class is the proof.",
    counts: Object.fromEntries(all.map((w) => [w.work, {
      rows: w.rows,
      RAW_MARKUP: w.found.filter((x) => x.class === "RAW_MARKUP").length,
      APPARATUS_AS_TEXT: w.found.filter((x) => x.class === "APPARATUS_AS_TEXT").length,
      MID_WORD_SPLIT: w.found.filter((x) => x.class === "MID_WORD_SPLIT").length,
    }])),
    occurrences: all.flatMap((w) => w.found),
  };
  writeFileSync(MANIFEST, JSON.stringify(doc, null, 1) + "\n");
  console.log(`\n${MANIFEST} · ${doc.occurrences.length} occurrences listed`);
}

console.log();
if (markup) {
  console.log(`${markup} occurrences carry markup — the serve is returning the source page, not the source text`);
  process.exit(1);
}
console.log("no occurrence carries markup");
