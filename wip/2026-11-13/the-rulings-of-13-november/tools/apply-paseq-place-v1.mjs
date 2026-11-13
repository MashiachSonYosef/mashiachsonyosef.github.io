// apply-paseq-place-v1 · a paseq the edition writes inside a read form is written on the zone as standing there
//
// RULE: paseq-place-rule-v1-a-paseq-the-edition-writes-inside-a-read-form-prints-there-and-not-after-the-place
// LEDGER: -
// no frame letter. This reads the corpus lane's list of such strokes, pinned
// in data/paseq-place/, and writes two small facts on the zones it names; it
// moves no word, no position, no count and no key.
//
// THE DEFECT IT MENDS IS THE CORPUS LANE'S, named by the lane in relay v167
// and mended in relay v179 (Moses, 13 November 2026 AD). At 16 places written
// one way and read another, the edition (Miqra according to the Masorah)
// writes a paseq inside the read form: after its only read word, closing the
// bracket (11 places), or between its two read words (5). The lane's restore
// v5 made every scribal mark its own position, as the owner's rule 11 has it,
// and in doing so stood each of these strokes after the whole place; lattice
// v12 serves that order, and so does every zone built from it. At Job 38:1
// the edition reads (מנהסערה) [מִ֥ן ׀ הַסְּעָרָ֗ה] and the zone (מנהסערה)
// [מִ֥ן הַסְּעָרָ֗ה] ׀.
//
// WHAT THIS WRITES. The stroke stays its own position (rule 11): the mark
// word after the place keeps its place in the section's words, its kind and
// its count. On that mark it writes in_read_form: true, which says the mark
// prints inside the read form of the place before it and not at its own
// place. On the place it writes kq.stroke = { s, after_read_word }: the
// stroke's glyph, copied from the mark's own s (nothing is typed here), and
// the read word it follows, counted over the place's read words. The reader
// prints the stroke there, inside the bracket, when the marks are shown
// (zone.html, wordBlock), and the mark's own block never shows.
//
// WHAT IT PROVES FIRST, every one a refusal that writes nothing. The pin's
// three files are the bytes the relay names. Each line finds its section by
// its verse, the place by its word number (marks are not counted, as the
// page numbers words), a place written one way and read another whose
// surface is the lattice's site and whose read words are the line's count;
// where a maqaf joins the site to the word before, the two together are the
// lattice's row. The word after the place is a paseq mark whose s is its
// glyph. And the place drawn as the page draws it, with the stroke after
// read word k, is the line's `prints`, character for character (where a
// maqaf joins it, with the word before it). A place or mark already carrying
// the facts with the same values is counted and left; with other values, or
// a fact on a word no line names, is a refusal.
//
// The lane's next reissue of the restore, the streams and the lattice stands
// each stroke in its place itself. A zone built from it no longer holds a
// place followed by its stroke, so this tool refuses there, and the pin is
// retired then; it is never to be run past a refusal.
//
// The write is typed on each zone it changes (single-pass-exemption-v1,
// tools/zone-post-build-v1.mjs), with what it read in
// emitted_from.paseq_place.
//
// Run: node tools/apply-paseq-place-v1.mjs --stamp <YYYY-MM-DD> [--zones data/zones] [--pin data/paseq-place/PIN.json] [--dry-run]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";

export const PASEQ_PLACE_RULE_ID = "paseq-place-rule-v1-a-paseq-the-edition-writes-inside-a-read-form-prints-there-and-not-after-the-place";
const TOOL = "tools/apply-paseq-place-v1.mjs";

const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const STAMP = arg("stamp"), ZONES = arg("zones", "data/zones"), PIN = arg("pin", "data/paseq-place/PIN.json");
const DRY = process.argv.includes("--dry-run");
if (!STAMP || !/^\d{4}-\d{2}-\d{2}$/.test(STAMP)) { console.log("usage: --stamp <YYYY-MM-DD> [--zones data/zones] [--pin data/paseq-place/PIN.json] [--dry-run]"); process.exit(2); }

const sha = (b) => createHash("sha256").update(b).digest("hex");
const faults = [];
const fault = (say) => { faults.push(say); console.log(`FAIL  ${say}`); };
const refuse = () => { console.log(`\napply-paseq-place-v1: ${faults.length} fault(s); nothing written`); process.exit(1); };

// ── the pin and its three files ─────────────────────────────────────────
const pin = JSON.parse(readFileSync(PIN, "utf8"));
if (pin.schema_version !== "PASEQ_PLACE_PIN_V1") { fault(`${PIN}: schema ${pin.schema_version}, not PASEQ_PLACE_PIN_V1`); refuse(); }
const folder = join(dirname(PIN), pin.folder);
const take = (d) => {
  const p = join(folder, d.file);
  if (!existsSync(p)) { fault(`${p}: not on disk`); return null; }
  const b = readFileSync(p);
  if (b.length !== d.bytes || sha(b) !== d.sha256) fault(`${d.file}: ${b.length} bytes, sha256 ${sha(b).slice(0, 12)}; the pin names ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
  return b;
};
take(pin.rule); take(pin.receipt);
const listBytes = take(pin.places);
if (faults.length) refuse();
const lines = listBytes.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
if (lines.length !== pin.places.lines) { fault(`${pin.places.file}: ${lines.length} lines, the pin names ${pin.places.lines}`); refuse(); }

// ── the place drawn as the page draws it ────────────────────────────────
// The page (zone.html, wordBlock) prints a place's carrier whole and cuts
// each region out of it in order; the stroke goes after the read region it
// follows, inside that region's closing bracket when the region carries one,
// set off by one space before it. This is that drawing, as text.
const drawn = (word, stroke) => {
  let rest = String(word.s), out = "", readN = 0;
  for (const r of word.w || []) {
    const at = rest.indexOf(r.s);
    if (at < 0) return null;
    out += rest.slice(0, at);
    rest = rest.slice(at + r.s.length);
    const here = stroke && r.role === "QERE" && (readN += 1) === stroke.after_read_word;
    if (here && r.s.endsWith("]")) out += `${r.s.slice(0, -1)} ${stroke.s}]`;
    else out += r.s + (here ? ` ${stroke.s}` : "");
  }
  return out + rest;
};

// ── each line, on its zone ─────────────────────────────────────────────
const byBook = new Map();
for (const line of lines) {
  if (!byBook.has(line.book)) byBook.set(line.book, []);
  byBook.get(line.book).push(line);
}
const zones = new Map(), wanted = new Map();   // book -> zone; book -> Map(word object -> fact)
let already = 0, toWrite = 0;
const here = [];
for (const [book, ls] of byBook) {
  const zPath = join(ZONES, `${book}.bin`);
  if (!existsSync(zPath)) { fault(`${book}: ${zPath} is not on disk`); continue; }
  const zone = JSON.parse(gunzipSync(readFileSync(zPath)).toString("utf8"));
  zones.set(book, { zone, zPath });
  const facts = new Map();
  wanted.set(book, facts);
  for (const line of ls) {
    const at = `${book} ${line.place}`;
    const sec = (zone.sections || []).find((s) => s.label === line.ref);
    if (!sec) { fault(`${at}: no section ${line.ref}`); continue; }
    const n = Number(String(line.place).split(":")[2]);
    let count = 0, i = -1;
    (sec.words || []).forEach((w, j) => { if (!w.mark && (count += 1) === n) i = j; });
    const site = i >= 0 ? sec.words[i] : null, mark = i >= 0 ? sec.words[i + 1] : null;
    const L = line.lattice_v12 || {}, S = L.site || {};
    if (!site || !site.kq) { fault(`${at}: word ${n} of ${line.ref} is not a place written one way and read another`); continue; }
    if (site.s !== S.surface) { fault(`${at}: the place reads ${site.s}; the lattice's site is ${S.surface}`); continue; }
    const read = (site.w || []).filter((r) => r.role === "QERE");
    const k = line.the_stroke_follows_read_word;
    if (read.length !== line.read_words) { fault(`${at}: ${read.length} read word(s) on the zone, the line counts ${line.read_words}`); continue; }
    if (!Number.isInteger(k) || k < 1 || k > read.length) { fault(`${at}: the stroke follows read word ${k}, of ${read.length}`); continue; }
    if ((line.class === "CLOSES_THE_READ_FORM") !== (k === read.length)) { fault(`${at}: class ${line.class} and read word ${k} of ${read.length} disagree`); continue; }
    if (read.map((r) => r.s.replace(/[[\]]/gu, "")).join(" ") !== String(site.kq.q)) { fault(`${at}: the read regions do not spell the place's read form ${site.kq.q}`); continue; }
    if (!mark || !mark.mark || mark.mark.kind !== "PASEQ" || mark.mark.glyph !== mark.s) { fault(`${at}: the word after the place is not a paseq mark (${mark ? JSON.stringify(mark.mark || mark.s) : "none"})`); continue; }
    // a maqaf joins the site to the word before: the two are the lattice's row
    let before = "";
    if (S.part != null) {
      const prev = sec.words[i - 1];
      if (!site.after_maqaf || !prev || `${prev.s}${site.s}` !== S.row || S.part !== S.of_parts) { fault(`${at}: the site is part ${S.part} of ${S.of_parts} of ${S.row}, and the zone's words do not join to it`); continue; }
      before = prev.s;
    } else if (site.after_maqaf) { fault(`${at}: the zone joins the place to the word before and the lattice names no part`); continue; }
    const stroke = { s: mark.s, after_read_word: k };
    const printed = drawn(site, stroke);
    if (`${before}${printed}` !== line.prints) { fault(`${at}: drawn as the page draws it, ${before}${printed}; the line prints ${line.prints}`); continue; }
    if (drawn(site, null) !== site.s) { fault(`${at}: the place drawn without the stroke is not its carrier`); continue; }
    // already written, the same: counted and left; otherwise, to write
    const has = site.kq.stroke, hasMark = mark.mark.in_read_form;
    if (has !== undefined || hasMark !== undefined) {
      if (has && has.s === stroke.s && has.after_read_word === k && Object.keys(has).length === 2 && hasMark === true) already += 1;
      else { fault(`${at}: the zone already carries ${JSON.stringify({ stroke: has, in_read_form: hasMark })}, not this line's`); continue; }
    } else toWrite += 1;
    facts.set(site, { kind: "site", stroke }); facts.set(mark, { kind: "mark" });
    here.push({ book, place: line.place, ref: line.ref, section_word: i, stroke_word: i + 1, after_read_word: k, of_read_words: read.length, class: line.class, prints: line.prints });
  }
}

// no fact on a word no line names, in any zone on disk (a work's zone is
// <slug>.bin; its sidecars carry a second dot)
for (const f of readdirSync(ZONES).filter((x) => /^[a-z0-9-]+\.bin$/u.test(x))) {
  const book = f.replace(/\.bin$/u, "");
  const zone = zones.has(book) ? zones.get(book).zone : JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  const facts = wanted.get(book);
  for (const sec of zone.sections || []) for (const w of sec.words || [])
    if (((w.kq && w.kq.stroke !== undefined) || (w.mark && w.mark.in_read_form !== undefined)) && !(facts && facts.has(w)))
      fault(`${book} ${sec.label}: ${w.s} carries a paseq-place fact no line names`);
}
if (faults.length) refuse();

console.log(`${lines.length} lines · ${zones.size} zones · ${toWrite} place(s) to write · ${already} already written, the same`);
for (const h of here) console.log(`  ${h.book} ${h.place} · after read word ${h.after_read_word} of ${h.of_read_words} · ${h.prints}`);
if (!toWrite) { console.log("nothing to write"); process.exit(0); }
if (DRY) { console.log("--dry-run: nothing written"); process.exit(0); }

// ── the write ───────────────────────────────────────────────────────────
for (const [book, { zone, zPath }] of zones) {
  const facts = wanted.get(book);
  let wrote = 0;
  for (const [w, f] of facts) {
    if (f.kind === "site" && w.kq.stroke === undefined) { w.kq.stroke = { ...f.stroke }; wrote += 1; }
    if (f.kind === "mark" && w.mark.in_read_form === undefined) w.mark.in_read_form = true;
  }
  if (!wrote) continue;
  const ef = zone.emitted_from || (zone.emitted_from = {});
  ef.paseq_place = {
    rule_id: PASEQ_PLACE_RULE_ID,
    applied_on: STAMP,
    applied_by: TOOL,
    pin: "data/paseq-place/PIN.json",
    relay: pin.relay,
    letter: pin.letter,
    places: { file: `${pin.folder}/${pin.places.file}`, sha256: pin.places.sha256, lines: pin.places.lines },
    here: here.filter((h) => h.book === book).map(({ book: _b, ...h }) => h),
    what: "the paseq after each of these places is written inside its read form by the edition: the place carries the stroke's glyph and the read word it follows (kq.stroke), the mark carries in_read_form, and the reader prints the stroke inside the read form, with the marks, and nothing at the mark's own place. No word, position, count or key moved",
  };
  typePostBuildWrite(zone, {
    tool: TOOL,
    fields: ["emitted_from.paseq_place", "sections[].words[].kq.stroke", "sections[].words[].mark.in_read_form"],
    why: "a paseq the edition writes inside a read form stood after the whole place in the lattice the zone was built from; the corpus lane's list (relay v179) says where it stands",
    expires: "with this zone's rebuild from the corpus lane's next lattice, which stands each stroke in its place itself",
    stamp: STAMP,
  });
  writeZone(zPath, zone);
  console.log(`wrote ${zPath} · ${wrote} place(s)`);
}
