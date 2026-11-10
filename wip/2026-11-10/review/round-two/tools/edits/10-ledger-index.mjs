// The ledger index says what it reads (the fifth reader's finding 13). Under "writes" it listed every record a
// tool's source NAMES: the re-gloss tool, whose own declaration says it writes no record into data/, "wrote" the
// corpus record it reads, and the door "wrote" twenty records it only reads. The field is called what it is.
// The day it carries is the round's, not the clock's.
// node 10-ledger-index.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "emit-ledger-index-v1.mjs"), [
  [`// Run: node tools/emit-ledger-index-v1.mjs [--out data/ledger-index-v1.json]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";`,
   `// WHAT IT CAN AND CANNOT SAY ABOUT A RECORD. The letter is declared, so it
// is known. Which records a tool WRITES is not declared anywhere, and
// reading a tool's source can only tell which records it NAMES: a tool that
// reads a record names it as surely as the tool that writes it. So the index
// lists, per tool, the records its source names, under that word. Until 10
// November 2026 the list was called "writes".
//
// Run: node tools/emit-ledger-index-v1.mjs --stamp YYYY-MM-DD [--out data/ledger-index-v1.json]
//      (the round's day; without it the record keeps the day it carries)
import { readFileSync, writeFileSync, readdirSync, existsSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";`],
  [`if (import.meta.url === \`file://\${process.argv[1]}\`) {
  // The letters are read from the frame record so this file cannot invent one.`,
   `// run as a program, not imported by the check: asked of the path itself (a
// path with a space or a link in it is still this file)
const startedHere = (() => { try { return !!process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } })();
if (startedHere) {
  const given = arg("stamp", null);
  if (given !== null && !/^\\d{4}-\\d{2}-\\d{2}$/u.test(String(given))) { console.error("--stamp YYYY-MM-DD"); process.exit(2); }
  const before = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;
  const day = given || (before && typeof before.emitted_on === "string" ? before.emitted_on.slice(0, 10) : null);
  if (!day) { console.error("no --stamp given and no record to keep the day of"); process.exit(2); }
  // The letters are read from the frame record so this file cannot invent one.`],
  [`    // Only a tool that writes into data/ is asked. A check reads; it is not a ledger.
    // Two forms in this tree: a literal "data/x.json" path, and the join form
    // join(K3, "data", "x.json") where the separator is an argument boundary.
    // Missing the second made two records read as unclaimed when they are not.
    const writes = [
      ...[...src.matchAll(/data[/\\\\]([a-z0-9-]+\\.json)/gi)].map((m) => m[1]),
      ...[...src.matchAll(/"data"\\s*,\\s*"([a-z0-9-]+\\.json)"/gi)].map((m) => m[1]),
    ];
    const isWriter = /writeFileSync/.test(src) && writes.length > 0;
    const d = readDeclaration(src);
    if (d) {
      byTool[f] = { ...d, writes: [...new Set(writes)] };`,
   `    // The records under data/ this tool's source NAMES, read or written.
    // Two forms in this tree: a literal "data/x.json" path, and the join form
    // join(K3, "data", "x.json") where the separator is an argument boundary.
    // Missing the second made two records read as unclaimed when they are not.
    const names = [
      ...[...src.matchAll(/data[/\\\\]([a-z0-9-]+\\.json)/gi)].map((m) => m[1]),
      ...[...src.matchAll(/"data"\\s*,\\s*"([a-z0-9-]+\\.json)"/gi)].map((m) => m[1]),
    ];
    // a tool that writes a file and names a record is asked for a declaration
    const isWriter = /writeFileSync/.test(src) && names.length > 0;
    const d = readDeclaration(src);
    if (d) {
      byTool[f] = { ...d, names: [...new Set(names)] };`],
  [`  const claimed = new Set(Object.values(byTool).flatMap((t) => t.writes));
  const unclaimed = records.filter((r) => !claimed.has(r));`,
   `  const named = new Set(Object.values(byTool).flatMap((t) => t.names));
  const unclaimed = records.filter((r) => !named.has(r));`],
  [`    emitted_on: new Date().toISOString().slice(0, 10),`, `    emitted_on: day,`],
  [`    by_tool: byTool,
    tools_that_write_a_record_and_declare_nothing: undeclared,
    records_no_tool_in_this_tree_claims_to_write: unclaimed,`,
   `    by_tool: byTool,
    by_tool_says: "per tool: its letters, its own words about them, and names — every record under data/ that its source names, whether it reads the record or writes it (a tool's source cannot say which)",
    tools_that_write_a_record_and_declare_nothing: undeclared,
    records_no_declared_tool_names: unclaimed,`],
  [`  if (unclaimed.length) console.log(\`\\n  unclaimed records: \${unclaimed.join(", ")}\`);`,
   `  if (unclaimed.length) console.log(\`\\n  records no declared tool names: \${unclaimed.join(", ")}\`);`],
]);

edit(join(R, "tools", "round-v1.sh"), [
  [`  node tools/emit-ledger-index-v1.mjs > /dev/null`, `  node tools/emit-ledger-index-v1.mjs --stamp "$STAMP" > /dev/null`],
]);
