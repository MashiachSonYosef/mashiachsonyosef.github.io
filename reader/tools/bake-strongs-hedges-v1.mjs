#!/usr/bin/env node
// GUARDS: strongs-hedges-rule-v1-where-strongs-derivation-of-a-word-hedges-his-own-words-stand-under-his-reading-as-a-note
// LEDGER: D
// it writes the page's file of the entries of Strong's dictionary whose
// derivation hedges, each with the derivation in Strong's own words, from
// the corpus lane's ledger kept byte for byte beside it. The card prints the
// derivation as a note under the record (D) of a reading of his. It writes no
// row of the store and decides no hedge: the lane's ledger names them.
//
// WHERE STRONG SAYS HE IS NOT SURE (strongs-hedges-rule-v1, 16 November 2026).
// The owner asked on 12 November 2026 «did we record where Strong is guessing
// by his own declaration?». It was not recorded. The corpus lane (Moses,
// relay v170) read the three clauses of every entry of the Open Scriptures
// file of Strong's Hebrew dictionary (HebrewStrong.xml) and wrote one line
// per entry and clause whose text holds a hedge in Strong's own words
// (apparent, apparently, probably, perhaps, possibly, uncertain, doubtful,
// supposed, seems, unknown, obscure, and «or else»), with its place in the
// text: data/strongs-hedges-v1/, its RULE.md, its receipt and its second
// count, each the bytes its PIN.json names. 965 of the 8,543 entries the
// store serves hedge: 833 in the derivation (the clause «source», where the
// word comes from), 173 in the meaning, 5 in the renderings. The meaning
// already prints inside his reading («the hoopoe or else the grouse»); the
// derivation is printed nowhere for this source.
//
// The owner took card 2 of the four cards on 16 November 2026
// (wip/2026-11-16/the-four-cards/FOUR-CARDS-2026-11-16.md, «ok go ahead»):
// under his reading on the card, at the 833, a note in his own words,
// «Strong, on where the word comes from: probably of foreign derivation;
// perhaps meaning fire;» (H143), and no mark on the reading itself: a doubt
// about where a word comes from is not a doubt about what it means. So this
// file holds exactly the ledger's lines whose clause is «source» and whose
// entry the store serves (served true), each as { text, hedges }: the text
// byte for byte as the ledger gives it (the provider's words, its own notes
// taken out as the lane's rule takes them), and each hedge with its word and
// its place [start, end) in UTF-16 units of the text, so the page may mark
// the words and never changes one. The note's opening names who says it and
// of what: `by`, the name the owner's card gives him, and `says`, the
// ledger's own words for the clause ("where the word comes from").
//
// WHICH ROWS A NOTE STANDS UNDER is the page's to find (zone.html, THE
// DERIVATION'S HEDGES): a row of this source whose facts name an entry of
// this file (row[10].n, the entries the source files the row under, as the
// corpus lane's row entries ledger gives them, relay v172). The source is
// named here by its key, and by the m id the store's index gives that key.
//
// REFUSED, in words and with nothing written:
//   - a pinned file that is not its bytes, a receipt or a second count that
//     names other bytes for the ledger, a second count whose verdict is not
//     AGREE, or a receipt that names another rule;
//   - a line that is not well formed: an entry that is not H and a number, a
//     clause not one of the three, a hedge whose place does not hold its word
//     in the text, hedges out of order, a text holding < or >, an entry and
//     clause named twice;
//   - a clause «source» whose `says` is not the one every other says;
//   - a count of the served derivation lines that is not the receipt's;
//   - a store whose index does not name exactly one source under the key, or
//     names it under another m id than the lane's receipt;
//   - a file as baked that is not the bytes the pin names (made_here.page).
//     --dry prints what would be written, with its sha256, and writes
//     nothing; that is how the pin was first written.
//
// Run twice on the same inputs it writes the same bytes: it holds no clock.
//
// Usage: node tools/bake-strongs-hedges-v1.mjs [--pins data/strongs-hedges-v1] [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";

export const STRONGS_HEDGES_RULE_ID = "strongs-hedges-rule-v1-where-strongs-derivation-of-a-word-hedges-his-own-words-stand-under-his-reading-as-a-note";
// the source the ledger is of, by its key in the store's index (the ledger's own folder on the lane's store is named
// so: r2:mishkan/v2/ledgers/openscriptures_strongs/hedges/)
export const STRONGS_HEDGES_SOURCE_KEY = "openscriptures_strongs";
// who says the note, as the owner's card 2 of 16 November 2026 names him («Strong, on where the word comes from: …»)
export const STRONGS_HEDGES_BY = "Strong";
// the clause the card prints, and the ledger's three clauses
export const STRONGS_HEDGES_CLAUSE = "source";
const CLAUSES = ["source", "meaning", "usage"];
export const STRONGS_HEDGES_PAGE_SCHEMA = "STRONGS_HEDGES_PAGE_V1";

// run as a program, not imported: the check of this rule reads the constants above and runs nothing
// (tools/main-guard-v1.mjs; import-side-effect-rule-v1)
const bake = () => {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const K3 = join(HERE, "..");
  const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
  const DRY = process.argv.includes("--dry");
  const PINS = arg("pins", join(K3, "data", "strongs-hedges-v1"));
  const STORE = arg("store", join(K3, "data", "route-store"));
  const HOME = "reader/data/strongs-hedges-v1";   // the folder as the file names it
  const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
  const n0 = (x) => Number(x).toLocaleString("en-US");
  const pinned = (fn) => { try { return fn(); } catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; } };

  // ---- the pin, and the lane's files as their bytes -----------------------------------------------
  const pinPath = join(PINS, "PIN.json");
  if (!existsSync(pinPath)) refuse(`the pin of Strong's hedges is missing (${pinPath})`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "STRONGS_HEDGES_PIN_V1" || pin.rule_id !== STRONGS_HEDGES_RULE_ID || !pin.rule || !pin.receipt || !pin.ledger || !pin.second_count)
    refuse(`${pinPath} is not a pin of Strong's hedges under ${STRONGS_HEDGES_RULE_ID} (STRONGS_HEDGES_PIN_V1: the rule, the receipt, the ledger and the second count's receipt)`);
  pinned(() => readPinned(join(PINS, pin.rule.file), pin.rule));   // the rule, held to its bytes
  const receipt = JSON.parse(pinned(() => readPinned(join(PINS, pin.receipt.file), pin.receipt)).toString("utf8"));
  const second = JSON.parse(pinned(() => readPinned(join(PINS, pin.second_count.file), pin.second_count)).toString("utf8"));
  const lines = pinned(() => readPinnedLines(join(PINS, pin.ledger.file), pin.ledger));
  const ledgerSha = pin.ledger.sha256;
  // the lane's receipt and its second count name the ledger by the same bytes, and the rule by the one pinned
  const out0 = (receipt.outputs || []).find((o) => o.file === pin.ledger.file) || null;
  if (!out0 || out0.sha256 !== ledgerSha || out0.bytes !== pin.ledger.bytes || out0.lines !== pin.ledger.lines) refuse(`the lane's receipt does not name the ledger by the bytes its pin names (${pin.ledger.file}: ${pin.ledger.bytes} bytes, ${pin.ledger.lines} lines, ${ledgerSha})`);
  if (!receipt.rule || receipt.rule.sha256 !== pin.rule.sha256) refuse(`the lane's receipt names another rule (${String((receipt.rule || {}).sha256).slice(0, 12)}) than the pinned ${pin.rule.file} (${pin.rule.sha256.slice(0, 12)})`);
  if (second.verdict !== "AGREE" || !second.checked || !second.checked.list || second.checked.list.sha256 !== ledgerSha || !second.checked.receipt || second.checked.receipt.sha256 !== pin.receipt.sha256)
    refuse(`the lane's second count does not AGREE with the pinned ledger and receipt (its verdict ${second.verdict})`);

  // ---- every line, as the lane's rule says a line is -----------------------------------------------
  const seen = new Set(), said = new Map(), page = [];
  lines.forEach((l, at) => {
    const where = `${pin.ledger.file} line ${at + 1}`;
    if (!l || typeof l.entry !== "string" || !/^H[1-9][0-9]*$/u.test(l.entry)) refuse(`${where} names no entry of the form H and a number`);
    if (!CLAUSES.includes(l.clause)) refuse(`${where} (${l.entry}) names the clause ${JSON.stringify(l.clause)}, not one of ${CLAUSES.join(", ")}`);
    const id = `${l.entry} ${l.clause}`;
    if (seen.has(id)) refuse(`${where} names ${id}, which an earlier line names`);
    seen.add(id);
    if (typeof l.text !== "string" || !l.text || /[<>]/u.test(l.text)) refuse(`${where} (${id}): its text is empty or holds a < or a > (the rule's check 3)`);
    if (typeof l.says !== "string" || !l.says) refuse(`${where} (${id}) says nothing of its clause`);
    if (typeof l.served !== "boolean") refuse(`${where} (${id}) does not say whether the store serves its entry`);
    if (!Array.isArray(l.hedges) || !l.hedges.length) refuse(`${where} (${id}) names no hedge`);
    l.hedges.forEach((h, i) => {
      const ok = h && typeof h.word === "string" && Array.isArray(h.at) && h.at.length === 2 && Number.isInteger(h.at[0]) && Number.isInteger(h.at[1]) && h.at[0] >= 0 && h.at[0] < h.at[1] && h.at[1] <= l.text.length && l.text.slice(h.at[0], h.at[1]) === h.word;
      if (!ok) refuse(`${where} (${id}): hedge ${i + 1} does not hold its word at its place in the text (the rule's check 2)`);
      if (i && h.at[0] < l.hedges[i - 1].at[1]) refuse(`${where} (${id}): its hedges are not in the text's order`);
    });
    (said.get(l.clause) || said.set(l.clause, new Set()).get(l.clause)).add(l.says);
    if (l.clause === STRONGS_HEDGES_CLAUSE && l.served) page.push(l);
  });
  const says = [...(said.get(STRONGS_HEDGES_CLAUSE) || [])];
  if (says.length !== 1) refuse(`the ledger's lines of the clause ${STRONGS_HEDGES_CLAUSE} say ${says.length} things of it (${says.join(" | ")}), not one`);
  const stated = (((receipt.over_the_served_entries || {}).by_clause) || {})[STRONGS_HEDGES_CLAUSE];
  if (page.length !== stated) refuse(`${page.length} lines of the clause ${STRONGS_HEDGES_CLAUSE} name an entry the store serves, and the lane's receipt counts ${stated}`);

  // ---- the source, as the store's index names it ------------------------------------------------
  const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
  const ms = Object.entries(index.m_sources || {}).filter(([, s]) => s && s.key === STRONGS_HEDGES_SOURCE_KEY).map(([m]) => m);
  if (ms.length !== 1) refuse(`the store's index names ${ms.length} sources under the key ${STRONGS_HEDGES_SOURCE_KEY}, not one`);
  // the lane read the served records of two sources (the Open Scriptures file's, and the Wikisource edition's to compare
  // words with), each under its m id: the one the store files under this key is this file's
  const theirM = Object.keys(((receipt.inputs || {}).dictionary_store_records) || {}).filter((x) => /^M[0-9]+$/u.test(x) && (index.m_sources[x] || {}).key === STRONGS_HEDGES_SOURCE_KEY);
  if (theirM.length !== 1 || theirM[0] !== ms[0]) refuse(`the store names ${STRONGS_HEDGES_SOURCE_KEY} ${ms[0]}, and the lane's receipt read the served records of ${theirM.length ? theirM.join(", ") : "no m id the store files under that key"}`);
  const m = ms[0];

  // ---- the file ----------------------------------------------------------------------------------
  const byWord = {};
  let hedges = 0;
  for (const l of page) for (const h of l.hedges) { hedges += 1; byWord[h.word.toLowerCase()] = (byWord[h.word.toLowerCase()] || 0) + 1; }
  const head = {
    schema_version: STRONGS_HEDGES_PAGE_SCHEMA,
    rule_id: STRONGS_HEDGES_RULE_ID,
    what: "the entries of Strong's dictionary whose derivation (the clause «source», where the word comes from) hedges in Strong's own words, each { text, hedges }: the derivation byte for byte as the corpus lane's ledger gives it, and each hedge's word and its place [start, end) in UTF-16 units of the text. The card prints it as a note under the record of a reading of this source whose row's facts name the entry (row[10].n), opening with who says it and of what: «<by>, on <says>: <text>»; the hedge words may be marked and are never changed. No mark on the reading itself",
    ruling: "the owner, 16 November 2026, card 2 of the four cards (wip/2026-11-16/the-four-cards/FOUR-CARDS-2026-11-16.md, «ok go ahead»): «Strong, on where the word comes from: probably of foreign derivation; perhaps meaning fire;» (H143) under his reading on the card, at the 833; no mark on the reading: a doubt about where a word comes from is not a doubt about what it means",
    source: { key: STRONGS_HEDGES_SOURCE_KEY, m, label: (index.m_sources[m] || {}).label || null },
    by: STRONGS_HEDGES_BY,
    says: says[0],
    clause: STRONGS_HEDGES_CLAUSE,
    from: { pin: `${HOME}/PIN.json`, relay: pin.relay, ledger: { file: `${HOME}/${pin.ledger.file}`, bytes: pin.ledger.bytes, sha256: ledgerSha, lines: pin.ledger.lines }, lines_taken: `every line whose clause is ${STRONGS_HEDGES_CLAUSE} and whose entry the store serves (served true), in the ledger's order` },
    counts: { entries: page.length, hedges, by_word: Object.fromEntries(Object.entries(byWord).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))) },
  };
  // one entry to a line, so a change to one is a change to one line
  const body = page.map((l) => `${JSON.stringify(l.entry)}:${JSON.stringify({ text: l.text, hedges: l.hedges.map((h) => ({ word: h.word, at: h.at })) })}`).join(",\n");
  const text = `${JSON.stringify(head, null, 1).replace(/\n\}$/u, "")},\n "entries": {\n${body}\n}}\n`;
  const bytes = Buffer.from(text, "utf8");
  try { if (JSON.stringify(JSON.parse(text).entries) === undefined) throw new Error("no entries"); } catch (e) { refuse(`the file as baked is not JSON (${e.message})`); }
  const made = (pin.made_here || {}).page || null;
  console.log(`${STRONGS_HEDGES_RULE_ID}\n  the ledger: ${n0(lines.length)} lines (relay ${pin.relay}); of the clause ${STRONGS_HEDGES_CLAUSE}, ${n0(page.length)} whose entry the store serves, as the receipt counts · ${n0(hedges)} hedges · the source ${STRONGS_HEDGES_SOURCE_KEY} is ${m} in the store's index`);
  console.log(`  the file: ${n0(bytes.length)} bytes, sha256 ${sha256Of(bytes)}`);
  if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
  if (!made || !heldToPin(bytes, undefined, made)) refuse(`the file as baked (${bytes.length} bytes, ${sha256Of(bytes)}) is not the bytes the pin names under made_here.page (${made ? `${made.bytes} bytes, ${made.sha256}` : "nothing"})`);
  writeFileSync(join(PINS, made.file), bytes);
  console.log(`written · ${HOME}/${made.file}`);
};
if (startedAs(import.meta.url)) bake();
