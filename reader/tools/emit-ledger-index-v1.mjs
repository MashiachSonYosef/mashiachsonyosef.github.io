#!/usr/bin/env node
// LEDGER: -
// no frame letter. This is the index OF the ledgers, not one of them.
//
// Which ledger does a piece of work update?
//
// The question was asked because two lanes are writing into the same frame
// and nobody could answer it. Every tool here writes a record, and until now
// nothing anywhere said which letter of the frame that record is the ledger
// FOR. So "what updates N?" had no answer, and a fact could be rewritten in
// one place while the lane that depended on it never learned.
//
// The answer is not derivable — no amount of reading a JSON file tells you
// whether it is about B or about Y. So it is DECLARED, and declared in the
// one place that cannot drift away from the truth: a "// LEDGER:" line in
// the header of the tool that writes the file, directly above the code that
// writes it. This tool reads those declarations and nothing else. It does
// not know a single letter by itself and cannot invent one.
//
// A tool that legitimately updates no letter declares "-" and says why.
// That is a declaration too. What is refused is silence, for the same
// reason silence is refused of a source's language: an absent claim has
// never been a claim anywhere in this project.
//
// WHAT IT CAN AND CANNOT SAY ABOUT A RECORD. The letter is declared, so it
// is known. Which records a tool WRITES is not declared anywhere, and
// reading a tool's source can only tell which records it NAMES: a tool that
// reads a record names it as surely as the tool that writes it. So the index
// lists, per tool, the records its source names, under that word. Until 10
// November 2026 the list was called "writes".
//
// Run: node tools/emit-ledger-index-v1.mjs --stamp YYYY-MM-DD [--out data/ledger-index-v1.json]
//      (the round's day; without it the record keeps the day it carries)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { startedAs } from "./main-guard-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const OUT = arg("out", join(K3, "data", "ledger-index-v1.json"));

export const LEDGER_RULE_ID = "ledger-index-rule-v1-the-writer-declares-which-letter-it-is-the-ledger-for";

/** The declaration in one tool's header, or null if it made none. */
export const readDeclaration = (src) => {
  const m = /^\/\/ LEDGER:[ \t]*(.*)$/m.exec(src);
  if (!m) return null;
  const raw = m[1].trim();
  // The prose under the declaration, up to the first line that is not a
  // comment. The slice begins at the newline that ends the LEDGER line, so
  // the first element is always the empty string left of it — dropping it is
  // what makes the reason readable at all. Without the shift every
  // declaration in the tree read as reasonless.
  const after = src.slice(m.index + m[0].length).split("\n").slice(1);
  const why = [];
  for (const line of after) {
    if (!/^\/\//.test(line)) break;
    const t = line.replace(/^\/\/ ?/, "").trim();
    if (!t) break;
    why.push(t);
  }
  const letters = raw === "-" ? [] : raw.split(/[\s,]+/).filter(Boolean);
  return { letters, updates_no_letter: raw === "-", why: why.join(" ") };
};

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  const given = arg("stamp", null);
  if (given !== null && !/^\d{4}-\d{2}-\d{2}$/u.test(String(given))) { console.error("--stamp YYYY-MM-DD"); process.exit(2); }
  const before = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;
  const day = given || (before && typeof before.emitted_on === "string" ? before.emitted_on.slice(0, 10) : null);
  if (!day) { console.error("no --stamp given and no record to keep the day of"); process.exit(2); }
  // The letters are read from the frame record so this file cannot invent one.
  const win = {};
  new Function("window", readFileSync(join(K3, "data", "frame-record-v1.js"), "utf8"))(win);
  const stated = ((win.FRAME_RECORD_V1 || {}).owner_stated_frame_2026_08_31 || {}).letters || {};
  const KNOWN = new Set(Object.keys(stated));

  const tools = readdirSync(join(K3, "tools")).filter((f) => f.endsWith(".mjs")).sort();
  const byLetter = {}, byTool = {}, undeclared = [], unknownLetters = [];
  for (const f of tools) {
    const src = readFileSync(join(K3, "tools", f), "utf8");
    // The records under data/ this tool's source NAMES, read or written.
    // Two forms in this tree: a literal "data/x.json" path, and the join form
    // join(K3, "data", "x.json") where the separator is an argument boundary.
    // Missing the second made two records read as unclaimed when they are not.
    const names = [
      ...[...src.matchAll(/data[/\\]([a-z0-9-]+\.json)/gi)].map((m) => m[1]),
      ...[...src.matchAll(/"data"\s*,\s*"([a-z0-9-]+\.json)"/gi)].map((m) => m[1]),
    ];
    // a tool that writes a file and names a record is asked for a declaration
    const isWriter = /writeFileSync/.test(src) && names.length > 0;
    const d = readDeclaration(src);
    if (d) {
      byTool[f] = { ...d, names: [...new Set(names)] };
      for (const L of d.letters) {
        if (!KNOWN.has(L)) unknownLetters.push(`${f} declares ${L}`);
        (byLetter[L] ||= []).push(f);
      }
    } else if (isWriter) undeclared.push(f);
  }

  // and the other direction: a record on the shelf with nobody claiming it
  const records = existsSync(join(K3, "data"))
    ? readdirSync(join(K3, "data")).filter((f) => f.endsWith(".json")).sort() : [];
  const named = new Set(Object.values(byTool).flatMap((t) => t.names));
  const unclaimed = records.filter((r) => !named.has(r));

  const out = {
    schema_version: 1,
    rule_id: LEDGER_RULE_ID,
    emitted_by: "tools/emit-ledger-index-v1.mjs",
    emitted_on: day,
    what_this_is: "which letter of the frame each of this lane's records is the ledger for, read "
      + "from the '// LEDGER:' declaration in the header of the tool that writes it. Declared by "
      + "the writer, never inferred here.",
    letters_known_to_the_frame: [...KNOWN],
    by_letter: Object.fromEntries(Object.entries(byLetter).sort()),
    by_tool: byTool,
    by_tool_says: "per tool: its letters, its own words about them, and names — every record under data/ that its source names, whether it reads the record or writes it (a tool's source cannot say which)",
    tools_that_write_a_record_and_declare_nothing: undeclared,
    records_no_declared_tool_names: unclaimed,
    letters_declared_that_the_frame_does_not_name: unknownLetters,
    standing_caveat: "this indexes THIS LANE only. A letter with no tool here is not a letter "
      + "nobody keeps — the corpus lane keeps most of them. An empty list under a letter means "
      + "this lane writes nothing to it, never that the letter is unowned.",
  };
  writeFileSync(OUT, JSON.stringify(out, null, 1));

  console.log(`— ${LEDGER_RULE_ID} —\n`);
  for (const [L, ts] of Object.entries(out.by_letter))
    console.log(`  ${L.padEnd(9)} ${ts.map((t) => t.replace(/\.mjs$/, "")).join(", ")}`);
  const silent = Object.entries(byTool).filter(([, t]) => t.updates_no_letter).map(([f]) => f.replace(/\.mjs$/, ""));
  if (silent.length) console.log(`\n  no letter  ${silent.join(", ")}`);
  if (undeclared.length) console.log(`\n  UNDECLARED (writes a record, names no letter): ${undeclared.join(", ")}`);
  if (unclaimed.length) console.log(`\n  records no declared tool names: ${unclaimed.join(", ")}`);
  console.log(`\n${OUT}`);
}
