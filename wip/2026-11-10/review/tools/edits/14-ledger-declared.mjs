// Six tools write a record and either declared no letter or declared one and said nothing about why.
// Each now declares, with its reason, and the check names every tool it refuses (it printed the first five).
// node 14-ledger-declared.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "apply-route-delta-v1.mjs"), [
[`// LEDGER: M R
//
// THE 88 SHARDS THAT NEVER LANDED, LANDED AS A DELTA.`,
 `// LEDGER: M R
// it lands rows in the route store: each row is a source's reading (R) under
// that source's license record (M). The rows are the corpus lane's; this tool
// places them and decides nothing about them.
//
// THE 88 SHARDS THAT NEVER LANDED, LANDED AS A DELTA.`],
]);
edit(join(T, "apply-source-years-v1.mjs"), [
[`// LEDGER: M
//
// THE YEAR EACH SOURCE'S ENGLISH WAS WRITTEN, ON ITS ROWS.`,
 `// LEDGER: M S
// it writes the year a source's English was written (S, the year that sorts)
// on the rows of that source (M), from the corpus lane's list, kept here byte
// for byte. No year is decided here.
//
// THE YEAR EACH SOURCE'S ENGLISH WAS WRITTEN, ON ITS ROWS.`],
]);
edit(join(T, "bake-dictionary-store-v1.mjs"), [
[`// THE DICTIONARY STORE, SERVED (Moses, FOR-ELIJAH-v79, dictionary store`,
 `// LEDGER: D M
// the served copy of the corpus lane's dictionary records: each record is a
// source's own definition (D) under the source it names (M). The shards are
// the lane's bytes, copied; the index beside them is this tool's.
//
// THE DICTIONARY STORE, SERVED (Moses, FOR-ELIJAH-v79, dictionary store`],
]);
edit(join(T, "bake-form-of-pills-v1.mjs"), [
[`#!/usr/bin/env node
// HEBREW DEFINED BY HEBREW, THE MAP THE CARD READS (the owner, on the card`,
 `#!/usr/bin/env node
// LEDGER: R
// which readings of the route catalog (R) are a pointer to another entry, and
// the English the pointer resolves to. The corpus lane classed and resolved
// them; this folds its file into the one map the card reads.
//
// HEBREW DEFINED BY HEBREW, THE MAP THE CARD READS (the owner, on the card`],
]);
edit(join(T, "bake-span-store-v2.mjs"), [
[`// THE SPAN STORE, SERVED FROM V2 (Moses's relay v80, 22 October 2026: "span`,
 `// LEDGER: COMPspan D
// the served span store: at each place, the spans a word divides into
// (COMPspan) and the dictionary records that stand on each (D). The claims
// are the corpus lane's; this tool writes the shape the page reads and
// withholds what the owner's rules withhold.
//
// THE SPAN STORE, SERVED FROM V2 (Moses's relay v80, 22 October 2026: "span`],
]);
edit(join(T, "repin-zone-store-v1.mjs"), [
[`#!/usr/bin/env node
// Synthesis lane · the zone store re-pinned from the bins on this disk (7 November 2026: the`,
 `#!/usr/bin/env node
// LEDGER: O
// the named stream: which zone bin is published, and its bytes. This re-pins
// the record emit-zone-store-v1 writes, from the bins on this disk.
//
// Synthesis lane · the zone store re-pinned from the bins on this disk (7 November 2026: the`],
]);
edit(join(T, "check-ledger-declared-v1.mjs"), [
[`  undeclared.length ? undeclared.slice(0, 5).join(" · ") : \`\${declared} declared, \${noLetter} of them "no letter" with a reason\`);`,
 `  // every one is named: a list cut at five hid the sixth tool for as long as
  // five stood ahead of it
  undeclared.length ? \`\${undeclared.length} — \${undeclared.join(" · ")}\` : \`\${declared} declared, \${noLetter} of them "no letter" with a reason\`);`],
[`  unknown.length ? unknown.slice(0, 4).join(" · ") : \`all letters drawn from the frame's own \${KNOWN.size}\`);`,
 `  unknown.length ? \`\${unknown.length} — \${unknown.join(" · ")}\` : \`all letters drawn from the frame's own \${KNOWN.size}\`);`],
]);
