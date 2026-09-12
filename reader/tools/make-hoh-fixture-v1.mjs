#!/usr/bin/env node
// hoh-fixture-rule-v1-a-real-chapter-with-entries-made-only-of-its-own-verses
//
// A test instrument, never served and never deployed.
//
// Nothing of Ben Yehuda's has been delivered, and the reader's panel for a
// Hebrew-on-Hebrew entry still has to be pressed by a check and looked at by
// the owner. So this makes a fixture from a zone somebody named: its first
// chapter exactly as it is, plus an entries file in the delivered shape whose
// every entry is one of that chapter's own headwords and whose every stratum
// is a QUOTE — a verse of that chapter, word for word as the zone carries it,
// cited by its own label. No prose is written, because his prose is not here
// to copy and this project invents no Hebrew. No foreign gloss is written;
// one foreign stratum is declared with its language and an empty text so the
// builder's withholding can be seen to happen.
//
// The volumes are the instrument's, not the dictionary's: the first entries
// are given volume 1 so they serve, one is given a volume the posture record
// does not declare so it holds, and one is marked with an asterisk so it
// holds for that reason. Every fiction is stated in the file.
//
// Run: node tools/make-hoh-fixture-v1.mjs --from <slug> --stamp YYYY-MM-DD
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const SRC = arg("--from"), stamp = arg("--stamp");
if (!SRC || !stamp) { console.error("usage: --from <slug> --stamp YYYY-MM-DD — a fixture is made from a zone somebody named"); process.exit(2); }
const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const save = (p, o) => writeFileSync(p, gzipSync(Buffer.from(JSON.stringify(o), "utf8"), { level: 9 }));

const base = load(join(ZONES, `${SRC}.bin`));
const chapter = (base.sections || []).filter((s) => s.unit.startsWith(`${SRC}-1-`));
if (!chapter.length) { console.error(`NO_FIRST_CHAPTER in ${SRC}`); process.exit(1); }
const posture = JSON.parse(readFileSync(join(K3, "data", "ben-yehuda-posture-v1.json"), "utf8"));
const undeclared = (posture.not_declared && posture.not_declared.volumes || [9])[0];
const pastLetters = new Set((posture.floor && posture.floor.letters_past_the_floor) || []);

// the chapter's own headwords, in the order the words stand, under the floor
// (a headword past the floor could not stand in a served volume, and the
// builder would refuse the entry — which is the right answer, and not this
// instrument's to exercise)
const seen = new Map();
for (const sec of chapter) for (const w of sec.words || []) {
  if (!w.h || !w.hp || pastLetters.has(w.h[0]) || seen.has(w.h)) continue;
  seen.set(w.h, { headword: w.hp, key: w.h, ref: sec.label, text: (sec.words || []).filter((x) => !x.mark && x.s).map((x) => x.s).join(" ") });
}
const picks = [...seen.values()].slice(0, 6);
if (picks.length < 4) { console.error(`TOO_FEW_HEADWORDS in ${SRC} chapter 1: ${picks.length}`); process.exit(1); }
const rows = picks.map((p, i) => ({
  headword: p.headword, headword_key: p.key,
  // the instrument's volumes: served, served, served, held by volume, held by asterisk, served with a withheld foreign stratum
  volume: i === 3 ? undeclared : 1,
  asterisk: i === 4,
  strata: [
    { kind: "quote", text: p.text, ref: p.ref },
    ...(i === 5 ? [{ kind: "foreign", text: "", lang: "de" }] : []),
  ],
}));
mkdirSync(join(K3, "build", "fixtures"), { recursive: true });
const entriesPath = join(K3, "build", "fixtures", "hoh-fixture-entries-v1.jsonl");
writeFileSync(entriesPath, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");

// the zone: its first chapter, as it is; the rest of the record copied through.
// A receipt that counts positions is recounted over the sections kept, so the
// file does not claim a whole book's numbers for one chapter of it; the
// recount is named below as one of the instrument's fictions.
const fx = { ...base, sections: chapter, work: `${base.work} (fixture · chapter 1)`, emitted_from: JSON.parse(JSON.stringify(base.emitted_from || {})) };
// the component layer, restricted to the keys the kept sections carry, and
// its count recounted over them — a table for a whole book under one chapter
// reads as keys the zone does not hold
{
  const keep = new Set();
  let regions = 0, spanned = 0;
  for (const s of chapter) for (const w of s.words || []) {
    const rs = w.w ? w.w : (w.k ? [{ k: w.k }] : []);
    for (const r of rs) { if (r.k) keep.add(r.k); regions += 1; if (r.k && base.spans && base.spans[r.k]) spanned += 1; }
  }
  fx.spans = Object.fromEntries(Object.entries(base.spans || {}).filter(([k]) => keep.has(k)));
  // the receipt's own arithmetic over the restricted table, as respan writes it
  const rows = Object.values(fx.spans);
  let hist = {};
  for (const sp of rows) hist[sp[0].length] = (hist[sp[0].length] || 0) + 1;
  hist = Object.fromEntries(Object.entries(hist).sort((a, b) => a[0] - b[0]));
  fx.emitted_from.span_layer = { ...(fx.emitted_from.span_layer || {}), forms_with_a_component_system: rows.length,
    component_count_histogram: hist,
    derived_cells: rows.reduce((n, sp) => n + (sp[0].length * (sp[0].length + 1)) / 2, 0),
    derived_complete_covers: rows.reduce((n, sp) => n + 2 ** (sp[0].length - 1), 0),
    restricted_for_the_fixture: `to the ${keep.size} form keys the ${chapter.length} sections kept carry` };
  fx.counts = { ...(base.counts || {}), w_regions_with_a_component_system: spanned, w_regions: regions,
    recounted_for_the_fixture: `sections, words and component regions over the ${chapter.length} sections kept` };
}
const hw = fx.emitted_from.toggles && fx.emitted_from.toggles.headword;
if (hw && hw.counts) {
  let withH = 0, differs = 0, on = 0, more = 0;
  for (const s of chapter) for (const w of s.words || []) {
    if (w.mark || !(w.k || w.w)) continue;
    on += 1;
    if (!w.h) continue;
    withH += 1; if (w.h !== w.k) differs += 1;
  }
  hw.counts = { ...hw.counts, verses: chapter.length, verses_joined: chapter.length, words_on: on, words_with_headword: withH, headword_differs_from_form: differs,
    recounted_for_the_fixture: `over the ${chapter.length} sections kept; headword_reaches_more and the held/absent verse counts are the whole book's` };
}
fx.fixture = {
  rule_id: "hoh-fixture-rule-v1-a-real-chapter-with-entries-made-only-of-its-own-verses",
  made_from: `data/zones/${SRC}.bin`, sections_kept: chapter.length, sections_dropped: (base.sections || []).length - chapter.length,
  entries_file: "build/fixtures/hoh-fixture-entries-v1.jsonl", entries: rows.length,
  fictions: [
    "the volumes are the instrument's: entries 1-3 and 6 are given volume 1 so they serve; entry 4 is given a volume the posture record does not declare so it holds; entry 5 is marked with an asterisk so it holds",
    "every stratum is a quote of a verse of this chapter, cited by the verse's own label; nothing of the dictionary's own text is here and no Hebrew was written",
    "entry 6 declares one foreign stratum with an empty text, so the builder's withholding of foreign glosses can be seen to count",
    "the headword toggle's receipt is recounted over the sections kept (words on, with a headword, differing from their form); its other numbers are the whole book's",
  ],
  never_served: "test instrument — not deployed, not linked, not part of any book",
  made: stamp,
};
save(join(ZONES, "fixture-hoh.bin"), fx);
console.log(`fixture-hoh.bin (${chapter.length} sections of ${SRC}) + ${entriesPath.replace(K3 + "/", "")} (${rows.length} entries: ${rows.map((r) => r.headword_key).join(" ")})`);
console.log(`  next: node tools/build-hoh-sidecar-v1.mjs --zone fixture-hoh --entries ${entriesPath.replace(K3 + "/", "")} --stamp ${stamp}`);
