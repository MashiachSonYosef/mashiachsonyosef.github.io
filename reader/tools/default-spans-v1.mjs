// Synthesis lane · the one reading of the corpus lane's spans list (relay v209): the words each default source's line reads
// GUARDS: default-spans-rule-v1-a-default-sources-line-that-reads-several-words-is-one-unit-of-those-words-read-from-the-sources-own-data
// LEDGER: -
// no frame letter. It reads the pinned files and the list they name, and
// writes nothing.
//
// A DEFAULT SOURCE'S LINE THAT READS SEVERAL WORDS IS ONE UNIT OF THOSE WORDS,
// READ FROM THE SOURCE'S OWN DATA.
//
// The default picks give each source's own line at every word place. Some of
// those lines read more than the word they are filed at: the UBS
// dictionary's lemma of two words («Kadesh-Barnea», filed at the first word
// and at no other), the unabridged BDB's headword of two words («Beersheba»,
// filed at both), a MACULA word our text writes as two. The page printed
// each line under the word it is filed at, so with UBS first the name stood
// under its first word and another source's reading of the second word
// beside it, and with BDB first the name stood twice. The page could tell
// such a unit only from marks that are not the source's: TAHOT's hyphen at
// the end of a piece, the lattice's headword running across two words.
//
// The corpus lane's relay v209 (Moses, 20 November 2026 AD; asked for on 15
// November, ask 7) gives, for every default-pick line, the first and the
// last word the line reads, judged by its own source's data and never by the
// English. The rule and the two receipts are kept under
// data/default-picks/spans-v1/ byte for byte, named by their pin. The list
// stays on the lane's store beside the default picks and is read only as
// the bytes the pin names.
//
// WHAT LANDS, said here once for the bake that lays it
// (tools/bake-default-picks-v1.mjs), the page that reads it (zone.html,
// dfltSpanUnit) and the check that holds it (tools/check-default-spans-v1.mjs):
//
//   the sources   MACULA, the UBS dictionary and the unabridged BDB. STEP's
//                 own mark across words (its «+») is the line at rest and is
//                 not read here: nothing at rest moves.
//   the lines     a line of the list lands where it is its source's first
//                 pick at its place (n 1; MACULA gives one pick and no
//                 number) and the list gives it two or more places. Those
//                 places are the unit; the place the line is filed at is
//                 kept with it, since a line may be filed beside the words
//                 it reads (UBS's «Aram Zoba» at the object marker of II
//                 Samuel 10:6).
//   one unit      the lines of one source that read the same places are one
//                 unit. A unit whose every place stands inside a longer unit
//                 of the same source gives way to the longer and is counted
//                 (nested). Two units of one source that share a place and
//                 neither holds the other are refused: the list has none.
//   not landed    a line that reads one word other than the one it is filed
//                 at; a line whose span the source's data cannot give; the
//                 branches (other_forms_fit); any pick after the first.
//                 Each is counted by its class.
//
// WHAT THE PAGE DOES WITH A UNIT (default-spans-rule-v1): with the source
// first, the words of a unit whose line is filed with a line pick take that
// one line. Standing in one cell (a stroke joins them, or a run holds them)
// the line prints once over them. Standing apart, each keeps the line as it
// rests and the card says what the source reads across them, as the page
// already did at the units it could tell. A line filed beside the words it
// reads is not printed under the word it is filed at.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";

export const DEFAULT_SPANS_RULE_ID = "default-spans-rule-v1-a-default-sources-line-that-reads-several-words-is-one-unit-of-those-words-read-from-the-sources-own-data";
export const DEFAULT_SPANS_HOME = "data/default-picks/spans-v1";
export const DEFAULT_SPANS_FOLDER = "spans-v1";
export const SPAN_SOURCES = ["macula", "ubs", "bdb"];
const KEPT = ["rule", "receipt", "verify_receipt"];
const SHA = /^[0-9a-f]{64}$/;

/** The pin of this tree, held to its shape and to the files kept beside it; null where the tree pins no spans. */
export const readDefaultSpansPin = (pinPath) => {
  if (!existsSync(pinPath)) return null;
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "DEFAULT_SPANS_PIN_V1" || pin.rule_id !== DEFAULT_SPANS_RULE_ID) throw new PinFault(`${pinPath} is not a pin of ${DEFAULT_SPANS_RULE_ID}`);
  for (const k of [...KEPT, "spans"]) {
    const e = pin[k];
    if (!e || typeof e.file !== "string" || !Number.isInteger(e.bytes) || !SHA.test(e.sha256 || "")) throw new PinFault(`the spans' pin names no file, bytes and sha256 for ${k}`);
  }
  if (!Number.isInteger(pin.spans.lines)) throw new PinFault("the spans' pin names no count of lines for its list");
  for (const k of KEPT) readPinned(join(dirname(pinPath), pin[k].file), pin[k]);
  // the receipt names the list and the rule by the same bytes
  const receipt = JSON.parse(readFileSync(join(dirname(pinPath), pin.receipt.file), "utf8"));
  const out = (receipt.outputs || []).find((o) => o && o.file === pin.spans.file);
  if (!out || out.bytes !== pin.spans.bytes || out.sha256 !== pin.spans.sha256 || out.lines !== pin.spans.lines) throw new PinFault("the spans' receipt names other bytes for the list than the pin");
  if (!receipt.rule || receipt.rule.sha256 !== pin.rule.sha256) throw new PinFault("the spans' receipt names another rule than the pin");
  const verify = JSON.parse(readFileSync(join(dirname(pinPath), pin.verify_receipt.file), "utf8"));
  if (verify.agree !== true || verify.failures !== 0) throw new PinFault("the spans' second count does not say it agrees");
  return pin;
};

/** Whether a line of the list lands: its source's first pick, reading two or more places. */
export const lineLands = (r) => SPAN_SOURCES.includes(r.source) && (r.n === 1 || (r.source === "macula" && r.n == null))
  && Array.isArray(r.places) && r.places.length >= 2 && r.places.every((p) => typeof p === "string" && p);

/** The list, as the bytes the pin names, read from the folder of the default picks' ledgers (<ledger>/spans-v1/). */
export const readDefaultSpans = (pinPath, ledger) => {
  const pin = readDefaultSpansPin(pinPath);
  if (!pin) return null;
  const rows = readPinnedLines(join(ledger, DEFAULT_SPANS_FOLDER, pin.spans.file), pin.spans, `${DEFAULT_SPANS_FOLDER}/${pin.spans.file}`);
  const byBook = new Map();
  const classes = {};
  rows.forEach((r, i) => {
    if (!r || typeof r.book !== "string" || typeof r.p !== "string" || typeof r.source !== "string" || typeof r.class !== "string") throw new PinFault(`${pin.spans.file} line ${i + 1} is not {book, p, source, class}`);
    const c = (classes[r.source] = classes[r.source] || {});
    const k = `${r.class}${lineLands(r) ? "" : " (not landed)"}`;
    c[k] = (c[k] || 0) + 1;
    if (!lineLands(r)) return;
    if (!byBook.has(r.book)) byBook.set(r.book, []);
    byBook.get(r.book).push(r);
  });
  return { pin, rows, byBook, classes };
};

/** A book's units by source: [{ places, filed }] in the order of their first place as `order` ranks a place (a map
 *  of place to its rank), with what was counted. Throws a PinFault where a place is unknown to `order` or two units
 *  of one source share a place and neither holds the other. */
export const unitsOfBook = (book, lines, order) => {
  const out = Object.fromEntries(SPAN_SOURCES.map((s) => [s, { units: [], lines: 0, nested: 0, filed_beside: 0 }]));
  const rank = (p) => { const r = order.get(p); if (r === undefined) throw new PinFault(`${book}: the spans list names the place ${p}, which the zone does not hold`); return r; };
  for (const src of SPAN_SOURCES) {
    const by = new Map();
    for (const r of lines) {
      if (r.source !== src) continue;
      out[src].lines += 1;
      const places = [...r.places].sort((a, b) => rank(a) - rank(b));
      if (places.some((p, i) => i && rank(p) === rank(places[i - 1]))) throw new PinFault(`${book} ${r.p}: the spans list names a place twice in one span`);
      const key = places.join(" ");
      if (!by.has(key)) by.set(key, { places, filed: [] });
      rank(r.p);
      if (!by.get(key).filed.includes(r.p)) by.get(key).filed.push(r.p);
    }
    const all = [...by.values()].sort((a, b) => b.places.length - a.places.length || rank(a.places[0]) - rank(b.places[0]));
    const held = new Map();   // a place -> the kept unit that holds it
    const kept = [];
    for (const u of all) {
      const over = [...new Set(u.places.map((p) => held.get(p)).filter(Boolean))];
      if (over.length === 1 && u.places.every((p) => held.get(p) === over[0])) { out[src].nested += 1; continue; }
      if (over.length) throw new PinFault(`${book}: two units of ${src} share a place and neither holds the other (${u.places.join(", ")} and ${over[0].places.join(", ")})`);
      u.filed.sort((a, b) => rank(a) - rank(b));
      for (const p of u.places) held.set(p, u);
      kept.push(u);
    }
    kept.sort((a, b) => rank(a.places[0]) - rank(b.places[0]));
    out[src].units = kept;
    out[src].filed_beside = kept.reduce((n, u) => n + u.filed.filter((p) => !u.places.includes(p)).length, 0);
  }
  return out;
};
