#!/usr/bin/env node
// emit-work-basis-v1 · the build's basis and its holds, put where a page can read them
//
// Every published work already has a basis in the plan — SEALED_Y_LEDGER or
// TYPED_AWAITING_LEDGER — and the Y lane already records commentary identities
// it is holding. Both facts existed only in the repo, which meant the reader's
// page presented a typed-basis work with the same face as a sealed one and
// silently dropped the held commentaries. Y's own rules name that failure:
// silent_drop_forbidden, false_reader_ready_forbidden.
//
// This tool derives one small file, data/work-basis-v1.json, from two inputs
// it does not invent: the plan (tools/plan-build-v1.mjs output) and any hold
// ledger CSV present in data/. Hold CSVs are found by shape — a header that
// carries hold_id, base_work_id and status — never by filename, so a new
// work's holds land by being put in data/, not by editing this file.
// Nothing here types a value: every field is copied from the plan or the CSV.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const PLAN = arg("plan", "build/build-plan-v1.json");
const DATA = arg("data", "data");
const OUT = arg("out", "data/work-basis-v1.json");

const plan = JSON.parse(readFileSync(PLAN, "utf8"));

// ---- holds, found by shape ------------------------------------------------
const splitCsvLine = (line) => {
  const out = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
};
const holdsByWork = {};
for (const f of readdirSync(DATA).filter((f) => f.endsWith(".csv")).sort()) {
  const text = readFileSync(join(DATA, f), "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) continue;
  const head = splitCsvLine(lines[0]);
  const col = (n) => head.indexOf(n);
  // the shape of a hold ledger, not a filename
  if (col("hold_id") < 0 || col("base_work_id") < 0 || col("status") < 0) continue;
  for (const line of lines.slice(1)) {
    const row = splitCsvLine(line);
    const workId = row[col("base_work_id")];
    if (!workId) continue;
    (holdsByWork[workId] ||= { source: f, holds: [] }).holds.push({
      hold_id: row[col("hold_id")],
      title: col("commentary_title") > -1 ? row[col("commentary_title")] : "",
      status: row[col("status")],
    });
  }
}

// ---- one row per published work, straight from the plan -------------------
// And one honesty scan per work: a commentary bin whose printed entries lean
// on the work-level licence record instead of carrying their own is the
// banned inheritance shape — truthful only while a work is uniform. The scan
// reads the bins as they are and counts, so the page can say it plainly until
// the commentary build carries each row's own rights.
import { existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const entryRights = (slug) => {
  const p = join(arg("zones", "data/zones"), `${slug}-commentary.bin`);
  if (!existsSync(p)) return null;
  const bin = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  let printed = 0, withoutOwn = 0;
  for (const U of Object.values(bin.units || {})) {
    const buckets = [];
    if (U.words) for (const arr of Object.values(U.words)) buckets.push(...arr);
    if (U.section) buckets.push(...[].concat(U.section));
    if (Array.isArray(U)) buckets.push(...U);
    for (const e of buckets) {
      if (e.held) continue;
      if (!(e.text && String(e.text).trim())) continue;
      printed++;
      if (!(e.license && String(e.license).trim())) withoutOwn++;
    }
  }
  return { printed_commentary_entries: printed, entries_without_own_licence: withoutOwn };
};
const works = {};
for (const w of plan.works) {
  const held = holdsByWork[w.work_id];
  const rights = entryRights(w.published_as);
  works[w.published_as] = {
    work_id: w.work_id,
    basis: w.basis,
    title_en: w.title_en,
    unit_count: w.unit_count,
    c0_first: w.c0_first,
    c0_last: w.c0_last,
    y_fixture: w.y_fixture || null,
    held_commentaries: held ? held.holds.length : 0,
    holds_source: held ? held.source : null,
    holds: held ? held.holds : [],
    ...(rights || {}),
  };
}

// ---- commentary names, sliced from each work's own Y fixture --------------
// A commentary work's name is the Y ledger's to give, and the Genesis fixture
// already gives it: COMMENTARY_WORK nodes carry the name twice — label_hebrew,
// the surface, and label_normalized_sequence, the same words as store keys —
// so the tokens a page can open are zipped from the record's two fields and
// nothing else. The slice goes to its own file: work-basis stays a no-text
// file by its own guard below, and this file's every Hebrew character is
// copied from a fixture it names as its receipt. A node whose two fields
// split to different token counts is a record disagreeing with itself, and
// the emit refuses rather than choosing a side.
const NAMES_OUT = arg("names-out", "data/commentary-names-v1.json");
const namesByWork = {};
const namesFixtures = [];
for (const [slug, w] of Object.entries(works)) {
  if (!w.y_fixture || !existsSync(w.y_fixture)) continue;
  const src = readFileSync(w.y_fixture, "utf8");
  const fx = JSON.parse(src.slice(src.indexOf("{"), src.lastIndexOf("}") + 1));
  const nodes = (fx.nodes || []).filter((n) => n.node_kind === "COMMENTARY_WORK");
  if (!nodes.length) continue;
  namesFixtures.push({ work: slug, path: w.y_fixture, fixture_id: fx.fixture_id || null, status: fx.status || null });
  const m = {};
  for (const n of nodes) {
    const ss = String(n.label_hebrew || "").split(/\s+/).filter(Boolean);
    const ks = String(n.label_normalized_sequence || "").split(/\s+/).filter(Boolean);
    if (!ss.length || ss.length !== ks.length)
      throw new Error(`LEDGER_LABEL_TOKENS_DISAGREE · ${n.y_node_id} in ${w.y_fixture}: label_hebrew splits to ${ss.length} tokens, label_normalized_sequence to ${ks.length} — the record must agree with itself before a page prints it`);
    m[n.public_ref] = {
      he: n.label_hebrew,
      he_tokens: ss.map((s, i) => ({ s, k: ks[i] })),
      y_node_id: n.y_node_id,
      content_work_id: n.content_work_id || null,
      label_basis: n.label_basis || null,
    };
  }
  namesByWork[slug] = m;
}

const doc = {
  schema_version: "WORK_BASIS_V1",
  emitted_by: "tools/emit-work-basis-v1.mjs",
  derived_from: { plan: PLAN, hold_ledgers: [...new Set(Object.values(holdsByWork).map((h) => h.source))] },
  plan_rule_id: plan.plan_rule_id || plan.rule_id || null,
  works,
};
// A page that carries no records may print no corpus text; neither may the
// file it reads its own basis from.
const text = JSON.stringify(doc, null, 2) + "\n";
if (/[\u0590-\u05FF]/.test(text)) throw new Error("work-basis carries a character of the text — refusing output");
writeFileSync(OUT, text);
const namesDoc = {
  schema_version: "COMMENTARY_NAMES_V1",
  emitted_by: "tools/emit-work-basis-v1.mjs",
  rule: "a commentary card head prints the Y ledger's name where a COMMENTARY_WORK node's public_ref equals the index the pack already carries; every Hebrew value below is copied from a fixture named in derived_from",
  derived_from: { fixtures: namesFixtures },
  names: namesByWork,
};
writeFileSync(NAMES_OUT, JSON.stringify(namesDoc, null, 2) + "\n");
console.log(`${OUT} · ${Object.keys(works).length} works · holds: ${Object.entries(works).filter(([, w]) => w.held_commentaries).map(([k, w]) => `${k}=${w.held_commentaries}`).join(" ") || "none"}`);
console.log(`${NAMES_OUT} · ${Object.entries(namesByWork).map(([k, m]) => `${k}=${Object.keys(m).length}`).join(" ") || "no fixtures carry COMMENTARY_WORK nodes"}`);
