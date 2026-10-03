// project-run-cards-v1 · the corpus lane's run cards, laid on the zones the page draws
//
// RULE: run-cards-rule-v1-one-card-for-a-run-a-license-names-and-its-rungs-are-every-tiling
// LEDGER: -
// no frame letter. This reads a run-card ledger and the zones on disk and
// writes one small file per book; it decides no card.
//
// The owner, 2026-10-03: "youll need to do 1 single hud whereever words happen
// to match across xyz span. A+...+V", and from the record, as the corpus lane
// quotes it: "ABC…V / A+…+V unless you happened to get another match like ABC
// then it would include ABC + D+…+V." The cards are the corpus lane's: which
// stretch a license names, under which combination of the open axes, is cut
// there and ruled by the owner (CORPUS-RELAY-2026-10-03-the-run-card.md). This
// only says where each card stands in the zone the page draws:
//
//   - a ledger place is a word that has a key (k, or a ketiv/qere pair's w),
//     counted from 0 across the whole shelf, book after book in the order the
//     zones sort (the corpus lane's books39.json is the same order); the
//     verse-end, paseq and paragraph marks the zone also holds as words are not
//     places (Amos 1:4 בֶּן־ is place 59 and the zone's word 65; Genesis 1:8
//     יוֹם is place 67,575)
//   - every card's own text is read back against the zone: its words' letters
//     must be the zone words' keys, or the card is held
//   - a card is written as its section and the index of each of its words in
//     that section's words, with each word's own key, and each run named inside
//     it as the span of its words, counted within the card
//   - a card that crosses a section, or holds a ketiv/qere pair, is held and
//     counted, never cut
//
// Run: node tools/project-run-cards-v1.mjs --cards <cards.jsonl[.gz]> --combo "<combo>" [--out data/run-cards]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const RULE = "run-cards-rule-v1-one-card-for-a-run-a-license-names-and-its-rungs-are-every-tiling";
const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const CARDS = arg("cards"), COMBO = arg("combo"), OUT = arg("out", "data/run-cards");
if (!CARDS || !COMBO) { console.log("usage: --cards <cards.jsonl[.gz]> --combo \"P0 V0 M0 K0 G=BOTH T=ANY O=SEP\" [--out dir]"); process.exit(2); }

const raw = readFileSync(CARDS);
const text = (CARDS.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8");
const sha256 = createHash("sha256").update(raw).digest("hex");

// the shelf's places, in order: place -> { book, unit, idx, k, kq }
const places = [];
const books = new Set(zonesOnDisk());
for (const slug of zonesOnDisk()) {
  const zone = JSON.parse(gunzipSync(readFileSync(join("data", "zones", `${slug}.bin`))).toString("utf8"));
  for (const sec of zone.sections || []) (sec.words || []).forEach((w, idx) => { if (w.k || w.w) places.push({ book: slug, unit: sec.unit, label: sec.label, idx, k: w.k || null, kq: !!w.w }); });
}
const lettersOf = (t) => String(t).replace(/[^\u05D0-\u05EA]/gu, "");

const byBook = new Map();
const held = { crosses_a_section: 0, holds_a_ketiv_qere_pair: 0, place_not_on_this_shelf: 0, book_not_on_this_shelf: 0, letters_differ_from_the_zone: 0 };
let read = 0;
for (const line of text.split("\n")) {
  if (!line.trim()) continue;
  const c = JSON.parse(line);
  if (c.combo !== COMBO) continue;
  read += 1;
  if (!books.has(c.book)) { held.book_not_on_this_shelf += 1; continue; }
  const span = [];
  for (let p = c.A; p <= c.Z; p += 1) span.push(places[p]);
  if (span.some((x) => !x || x.book !== c.book)) { held.place_not_on_this_shelf += 1; continue; }
  if (span.some((x) => x.unit !== span[0].unit)) { held.crosses_a_section += 1; continue; }
  if (span.some((x) => x.kq || !x.k)) { held.holds_a_ketiv_qere_pair += 1; continue; }
  const written = String(c.text || "").split(/\s+/u).map(lettersOf).filter(Boolean);
  if (written.length !== span.length || written.some((l, j) => l !== span[j].k)) { held.letters_differ_from_the_zone += 1; continue; }
  const named = (c.named_inside || []).map((n) => [n.a - c.A, n.z - c.A]).filter(([f, t]) => f >= 0 && t < span.length && t > f);
  const list = byBook.get(c.book) || [];
  list.push({ unit: span[0].unit, label: span[0].label, idx: span.map((x) => x.idx), keys: span.map((x) => x.k), named, text: c.text });
  byBook.set(c.book, list);
}

mkdirSync(OUT, { recursive: true });
let cards = 0;
for (const [book, list] of [...byBook].sort()) {
  cards += list.length;
  writeFileSync(join(OUT, `${book}.json`), `${JSON.stringify({
    schema_version: "RUN_CARDS_V1",
    rule_id: RULE,
    book,
    from: { ledger: basename(CARDS), sha256, combo: COMBO },
    place_axis: "a ledger place is a word with a key, counted from 0 across the shelf in the zones' sorted order; written here as the section's unit and each word's index in that section's words",
    cards: list,
  })}\n`);
}
// the index the page reads first: a book it does not list has no run cards
writeFileSync(join(OUT, "index.json"), `${JSON.stringify({
  schema_version: "RUN_CARDS_INDEX_V1",
  rule_id: RULE,
  from: { ledger: basename(CARDS), sha256, combo: COMBO },
  books: Object.fromEntries([...byBook].sort().map(([book, list]) => [book, { cards: list.length }])),
  held,
}, null, 1)}\n`);
console.log(`${OUT} · ${byBook.size} books · ${cards} cards of ${read} under "${COMBO}" · held: ${Object.entries(held).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
