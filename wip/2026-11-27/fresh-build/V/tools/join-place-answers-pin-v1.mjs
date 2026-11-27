#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It joins the pins the parts of data/place-answers-v1/
// wrote into the folder's one pin; it updates no record of the frame.
//
// ONE PIN (27 November 2026, the fresh build). The place answers are made in
// parts, each by its own builder from its own sources, and each part pins
// what it read and what it made:
//
//   places/PIN.json    STEP and MACULA at every word (tools/build-place-answers-places-v1.mjs)
//   entries/PIN.json   each dictionary's entries, and the bridges (tools/build-place-answers-entries-v1.mjs)
//   page/PIN.json      the second reader's files, projected from the two (tools/project-place-answers-page-v1.mjs),
//                      where they have been made
//
// The folder's PIN.json is those records joined: each part's record stands
// in it whole, as its builder wrote it, under the part's own key, beside the
// bytes and sha256 of the part's pin file. Nothing is merged, renamed or
// counted again: a part's counts are its builder's, and its check holds them.
//
// --check judges the folder's pin against the parts' files as they stand
// now (a part rebuilt and not joined again fails it); it writes nothing.
//
// Run: node tools/join-place-answers-pin-v1.mjs [--dir data/place-answers-v1] [--check]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
let DIR = join(HERE, "..", "data", "place-answers-v1"), CHECK = false;
for (let i = 0; i < argv.length; i += 1) { if (argv[i] === "--dir") { DIR = argv[i + 1]; i += 1; } else if (argv[i] === "--check") CHECK = true; else { console.error("usage: join-place-answers-pin-v1.mjs [--dir <place answers folder>] [--check]"); process.exit(2); } }

const RULE_ID = "place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address";
// the parts in the order they are made; the first two must be there, the page's files are made after them
const PARTS = [
  ["places", "places/PIN.json", true, "STEP and MACULA at every word of our text"],
  ["entries_and_bridges", "entries/PIN.json", true, "each dictionary's entries by its own id, and the bridges from STEP's tag and from a verse to them"],
  ["page", "page/PIN.json", false, "the second reader's files, projected by rule from the two parts above"],
];

/** The joined pin as the parts' files stand now. */
function joined() {
  const parts = {};
  for (const [key, rel, must, what] of PARTS) {
    const p = join(DIR, rel);
    if (!existsSync(p)) { if (must) { console.error(`${rel} is not there: make that part first`); process.exit(3); } continue; }
    const buf = readFileSync(p);
    parts[key] = { what, pin_file: rel, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex"), record: JSON.parse(buf.toString("utf8")) };
  }
  return {
    schema: "PLACE_ANSWERS_PIN_JOINED_V1",
    rule_id: RULE_ID,
    what: "the one pin of data/place-answers-v1/: the pin of each part, whole and as its builder wrote it, under the part's own key (parts.<key>.record), with the bytes and sha256 of the part's pin file",
    made_by: "tools/join-place-answers-pin-v1.mjs, the last step of tools/make-place-answers-v1.sh <sources folder>",
    // the map of the sources folder the build was made from, kept beside the pins: what stands where in such a
    // folder and each source's revision. tools/fetch-place-answers-sources-v1.sh fills a folder again from it.
    sources_map: (() => { const p = join(DIR, "sources.json"); if (!existsSync(p)) return null; const buf = readFileSync(p); return { file: "sources.json", bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") }; })(),
    parts,
  };
}

const now = joined();
const text = JSON.stringify(now, null, 1) + "\n";
const out = join(DIR, "PIN.json");
if (CHECK) {
  if (!existsSync(out)) { console.log("FAIL  the folder has no PIN.json: the parts are not joined"); process.exit(1); }
  const have = readFileSync(out, "utf8");
  let bad = 0;
  const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
  let pin = null; try { pin = JSON.parse(have); } catch { pin = null; }
  check("the folder's pin is a joined pin", !!pin && pin.schema === "PLACE_ANSWERS_PIN_JOINED_V1" && !!pin.parts, pin ? String(pin.schema) : "not JSON");
  for (const [key, rel] of PARTS) {
    const a = pin && pin.parts ? pin.parts[key] : undefined, b = now.parts[key];
    if (!a && !b) { console.log(`  --  ${key}: not made here, and the pin does not name it`); continue; }
    check(`${key}: the pin holds the bytes of ${rel} as it stands`, !!a && !!b && a.sha256 === b.sha256 && a.bytes === b.bytes && JSON.stringify(a.record) === JSON.stringify(b.record), a && b ? `${b.bytes.toLocaleString("en-US")} bytes, sha256 ${b.sha256.slice(0, 12)}…` : a ? "the part's pin file is gone" : "the part was made after the join");
  }
  check("the map of the sources folder beside the pins is the one the pin names", JSON.stringify((pin || {}).sources_map || null) === JSON.stringify(now.sources_map), now.sources_map ? `sources.json, sha256 ${now.sources_map.sha256.slice(0, 12)}…` : "no map is kept");
  check("the folder's pin is the join, byte for byte", have === text);
  console.log(bad ? `\n${bad} FAILED` : "\nthe one pin holds");
  process.exit(bad ? 1 : 0);
}
writeFileSync(out, text);
console.log(`joined ${Object.keys(now.parts).join(", ")} into ${out} (${Buffer.byteLength(text).toLocaleString("en-US")} bytes)`);
