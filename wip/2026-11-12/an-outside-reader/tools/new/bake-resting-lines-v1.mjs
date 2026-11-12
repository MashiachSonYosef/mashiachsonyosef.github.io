#!/usr/bin/env node
// Synthesis lane · the resting lines of every served work, read off the page and kept beside the zones
//
// LEDGER: -
// no frame letter. This opens the reader as a first visit opens it, reads the
// lines it drew and writes one record per work,
// data/resting-lines/<work>.json.gz. It chooses no reading: the page did.
//
// The rule, and why the plain list under a chapter is a recording and not a
// second copy of the page's rule, is in tools/resting-lines-v1.mjs, which
// also holds the one reading of "a line" this tool and its check share.
//
// WHAT A RECORD SAYS OF ITSELF. The page it was read off and every file that
// page asked for while it drew, each by its sha256 (read_off.files): the
// same page over the same files draws the same lines, so the record is good
// for exactly that tree, and the door refuses it for any other. The state it
// was read in, as the page reports it. Its own counts. Who is credited, by
// the name the line's chip carries, with the label the catalog gives that
// name and the license in the chip's own words. Then every section's lines:
// [first entry, how many entries the line stands under, the text, who is
// credited]. No date: the same lines are the same bytes.
//
// A BROWSER THAT STOPS ANSWERING IS SAID AND THE WORK READ AGAIN. Each work
// is given a time (RESTING_STALL_MS, 300 s). Past it the browser is closed
// whole and opened again and the work read once more; a work unread twice
// fails the bake in words. Nothing is scrolled here: the page builds its own
// sections (window.__materialise).
//
// A RECORD THAT IS STILL OF THIS TREE IS KEPT, NOT READ AGAIN: the page it
// names and every file it names stand as it names them, so the lines are
// the same lines. --all reads every work whatever is kept. Several works are
// read at once (--jobs, 3), each by a browser and a server of its own, so
// the files one work's page asked for are never counted to another's.
//
// Run (from reader/):
//   node tools/bake-resting-lines-v1.mjs                 every served work whose record is not of this tree
//   node tools/bake-resting-lines-v1.mjs --all           every served work
//   node tools/bake-resting-lines-v1.mjs --only a,b      those works
//   node tools/bake-resting-lines-v1.mjs --verify        read every work again, write nothing, fail where a record differs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { startedAs } from "./main-guard-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { RESTING_LINES_RULE_ID, RESTING_LINES_SCHEMA, recordPath, readAtRest, readRecord, writeRecord, sha256Of, whyNotOfThisTree } from "./resting-lines-v1.mjs";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const num = (v) => Number(v).toLocaleString("en-US");

/** Every name a line's chip can carry, with the label the catalog gives it:
 *  the store's sources, the dictionaries beside the store, the span store's
 *  own; and a place's piece, credited as the page credits it, to the source
 *  the zone names as that piece's witness. */
const labelsFor = (readerDir, zone) => {
  const labels = new Map();
  const take = (p) => { if (!existsSync(p)) return; const ix = JSON.parse(readFileSync(p, "utf8")); for (const [id, m] of Object.entries(ix.m_sources || {})) if (!labels.has(id)) labels.set(id, m.label || id); };
  take(join(readerDir, "data/route-store/index.json"));
  const ov = join(readerDir, "data/overlays");
  for (const d of (existsSync(ov) ? readdirSync(ov).sort() : [])) take(join(ov, d, "index.json"));
  take(join(readerDir, "data/span-store/index.json"));
  const wit = ((((zone.emitted_from || {}).toggles || {}).lattice || {}).pieces || {}).witnesses || {};
  for (const [k, w] of Object.entries(wit)) {
    const m = /^english_(.+)$/u.exec(k);
    if (m && w) labels.set(`PIECE:${m[1].toUpperCase()}`, (w.m && labels.get(w.m)) || w.label || k);
  }
  return labels;
};

/** One work's record, from what the page drew. Throws where the reading does
 *  not fit the zone it is of. */
const recordOf = (readerDir, work, got, asked) => {
  const zone = JSON.parse(gunzipSync(readFileSync(join(readerDir, "data/zones", `${work}.bin`))).toString("utf8"));
  const zs = zone.sections || [];
  if (got.of !== zs.length || got.sections.length !== zs.length) throw new Error(`the page drew ${got.sections.length} of its ${got.of} sections and the zone has ${zs.length}`);
  const labels = labelsFor(readerDir, zone);
  const counts = { sections: zs.length, entries: 0, words: 0, lines: 0, words_under_a_line: 0, words_under_no_line: 0, lines_over_more_than_one_word: 0, lines_credited_to_no_named_source: 0 };
  const used = new Set();
  const sections = got.sections.map((s, i) => {
    const words = zs[i].words || [];
    if (s.odd.length) throw new Error(`${zs[i].label}: ${s.odd[0]}`);
    if (s.entries !== words.length) throw new Error(`${zs[i].label}: the page drew ${s.entries} entries and the zone has ${words.length}`);
    if (s.label && String(zs[i].label ?? "") && s.label.trim() !== String(zs[i].label).trim() && !s.label.trim().endsWith(String(zs[i].label).trim())) throw new Error(`section ${i}: the page calls it "${s.label}" and the zone "${zs[i].label}"`);
    counts.entries += words.length;
    const nw = words.filter((w) => !w.mark).length;
    counts.words += nw;
    const taken = new Set();
    for (const [first, count, , line] of s.units) {
      if (!(first >= 0 && count >= 1 && first + count <= words.length)) throw new Error(`${zs[i].label}: a line stands under entries ${first}..${first + count - 1} of ${words.length}`);
      for (let x = first; x < first + count; x += 1) {
        if (taken.has(x)) throw new Error(`${zs[i].label}: two lines stand under entry ${x}`);
        taken.add(x);
      }
      if (words[first].mark) throw new Error(`${zs[i].label}: a line opens on a scribal mark`);
      counts.lines += 1;
      if (count > 1) counts.lines_over_more_than_one_word += 1;
      if (!line) counts.lines_credited_to_no_named_source += 1;
      for (const id of String(line).split(" ").filter(Boolean)) used.add(id);
    }
    const under = [...taken].filter((x) => !words[x].mark).length;
    counts.words_under_a_line += under;
    counts.words_under_no_line += nw - under;
    return [String(zs[i].label ?? ""), s.units];
  });
  // who is credited: the label the catalog gives the name, the license in the chip's own words
  const says = new Map();
  for (const [line, c] of Object.entries(got.credits)) {
    const ids = line.split(" ").filter(Boolean);
    if (ids.length === 1) says.set(ids[0], c.says);
  }
  for (const [line, c] of Object.entries(got.credits)) {
    const ids = line.split(" ").filter(Boolean);
    if (ids.length < 2) continue;
    // a chip of several licenses lists them in its title, one a line, each opening with the license
    const each = String(c.title || "").split("\n").map((x) => x.split(" — ")[0].trim());
    ids.forEach((id, x) => { if (!says.has(id) && each.length === ids.length && each[x]) says.set(id, each[x]); });
  }
  const sources = {};
  for (const id of [...used].sort()) {
    if (!labels.has(id)) throw new Error(`a line credits ${id}, which no index here names`);
    if (!says.has(id)) throw new Error(`a line credits ${id} and no chip says its license`);
    sources[id] = { label: labels.get(id), license: says.get(id) };
  }
  // a chip that names no one source: its title opens with the label it credits, which is found among the
  // labels the indexes hold (the longest the title opens with, a separator after it), and its license is
  // the chip's own words
  const known = [...new Set(labels.values())].sort((x, y) => y.length - x.length);
  const unnamed = (got.unnamed || []).map(([i, j, license, title]) => {
    const label = known.find((l) => title.startsWith(`${l} `));
    if (!label) throw new Error(`${zs[i].label}: a line's chip names no source and its title opens with no label an index holds ("${title.slice(0, 80)}")`);
    if (/^\d+ licenses$/u.test(license)) throw new Error(`${zs[i].label}: a line's chip names no source and prints several licenses`);
    return [i, j, label, license];
  });
  const files = {};
  for (const rel of [...asked].sort()) files[rel] = sha256Of(join(readerDir, rel));
  return {
    schema_version: RESTING_LINES_SCHEMA, rule_id: RESTING_LINES_RULE_ID, generated_by: "tools/bake-resting-lines-v1.mjs", work,
    line: "[first entry of the section, how many entries the line stands under, the text as drawn with its license chip taken off, who the chip credits]; an entry is a word or a scribal mark, counted from 0 in the section's own order",
    read_off: { address: `zone.html?b=${work}`, as: "a first visit: nothing kept on the device, the page's own defaults, every section built by the page's own function, nothing scrolled", state: got.state, files },
    counts, sources,
    ...(unnamed.length ? { unnamed_says: "[section, line, label, license]: a line whose chip names no one source, because more than one source of that label carries the reading; it is credited by the label the chip's own title opens with", unnamed } : {}),
    sections,
  };
};

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  const READER = ".";
  const only = arg("--only");
  const VERIFY = process.argv.includes("--verify");
  const ALL = process.argv.includes("--all");
  const JOBS = Math.max(1, Number(arg("--jobs", "3")) || 3);
  const STALL = Number(process.env.RESTING_STALL_MS) || 300000;
  const served = zonesServed();
  const works = only ? only.split(",").filter(Boolean) : served;
  const strangers = works.filter((w) => !served.includes(w));
  if (strangers.length) { console.error(`not served here: ${strangers.join(", ")}`); process.exit(2); }
  if (!works.length) { console.error("no served work on this disk"); process.exit(2); }
  const pw = await loadPlaywright();
  const queue = works.map((work, at) => ({ work, at }));
  const done = new Array(works.length);
  const seen = new Map();
  const stalled = [];
  const worker = async () => {
    const tree = await serveTree(READER);
    let browser = null;
    try {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const { work, at } = job;
        const path = recordPath(READER, work);
        const old = readRecord(path);
        if (!VERIFY && !ALL && old && !whyNotOfThisTree(READER, old, seen).length) { done[at] = { work, record: old, how: "kept " }; continue; }
        let got = null, why = "";
        for (let attempt = 0; attempt < 2 && !got; attempt += 1) {
          if (!browser) browser = await pw.chromium.launch(launchOptions());
          tree.asked.clear();
          let timer = null;
          const late = new Promise((_, no) => { timer = setTimeout(() => no(new Error("STALLED")), STALL); });
          try { got = await Promise.race([readAtRest(browser, tree.base, work), late]); }
          catch (e) {
            why = String((e && e.message) || e).split("\n")[0];
            if (why === "STALLED") { stalled.push(work); await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))]).catch(() => {}); browser = null; }
            else attempt = 2;
          } finally { clearTimeout(timer); }
        }
        if (!got) { done[at] = { work, failed: why === "STALLED" ? `the browser stopped answering twice (${STALL / 1000} s each)` : why }; continue; }
        let record;
        try { record = recordOf(READER, work, got, tree.asked); }
        catch (e) { done[at] = { work, failed: String((e && e.message) || e) }; continue; }
        const unchanged = !!old && JSON.stringify(old) === JSON.stringify(record);
        const linesSame = !!old && JSON.stringify(old.sections) === JSON.stringify(record.sections) && JSON.stringify(old.sources) === JSON.stringify(record.sources);
        if (unchanged) done[at] = { work, record, how: "same ", readings: got.readings };
        else if (VERIFY) done[at] = { work, record, how: "DIFF ", readings: got.readings, moved: !old ? "no record is kept" : linesSame ? "the lines are the same and the tree they were read off has moved" : "the lines read now are not the lines kept" };
        else { writeRecord(path, record); done[at] = { work, record, how: "wrote", readings: got.readings }; }
      }
    } finally { if (browser) await browser.close().catch(() => {}); await tree.close(); }
  };
  await Promise.all(Array.from({ length: Math.min(JOBS, works.length) }, () => worker()));
  const total = { lines: 0, words: 0, bare: 0 };
  const count = (how) => done.filter((d) => d && d.how === how).length;
  const failed = done.filter((d) => d && d.failed), moved = done.filter((d) => d && d.moved);
  for (const d of done) {
    if (d.failed) { console.log(`FAIL  ${d.work}  ·  ${d.failed}`); continue; }
    const c = d.record.counts;
    total.lines += c.lines; total.words += c.words; total.bare += c.words_under_no_line;
    console.log(`  ${d.how} ${d.work}  ·  ${num(c.sections)} sections · ${num(c.words)} words · ${num(c.lines)} lines (${num(c.lines_over_more_than_one_word)} over more than one word) · ${num(c.words_under_no_line)} words under no line · ${Object.keys(d.record.sources).length} sources credited${c.lines_credited_to_no_named_source ? ` · ${c.lines_credited_to_no_named_source} lines credited to no named source` : ""}${d.readings ? ` · read ${d.readings} times` : ""} · ${Object.keys(d.record.read_off.files).length} files asked for`);
  }
  if (stalled.length) console.log(`the browser stopped answering and was opened again for: ${stalled.join(", ")}`);
  console.log(`${works.length} works · ${num(total.words)} words · ${num(total.lines)} lines · ${num(total.bare)} words under no line · ${VERIFY ? `${count("same ")} records the same, ${moved.length} not` : `${count("wrote")} records written, ${count("same ")} read again and the same, ${count("kept ")} kept as still of this tree`}${failed.length ? ` · ${failed.length} FAILED` : ""}`);
  for (const m of moved) console.log(`DIFF  ${m.work}: ${m.moved}`);
  if (failed.length || (VERIFY && moved.length)) process.exit(1);
}
