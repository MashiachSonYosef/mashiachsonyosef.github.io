// Read-only: print one walked card in the clear. Usage: node show.mjs <book> <label> <word number> [pills to show] [state]
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = dirname(fileURLToPath(import.meta.url));
const [book, label, n, show = "12", state = "rest"] = process.argv.slice(2);
const lines = gunzipSync(readFileSync(join(OUT, `walk-${state}`, `${book}.jsonl.gz`))).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const meta = lines[0];
const c = lines.slice(1).find((x) => x.label.trim().endsWith(label) && x.n === Number(n));
if (!c) { console.log("no such card"); process.exit(1); }
const sec = meta.lines[c.si];
console.log("line units of the verse:", JSON.stringify(sec.units.filter((u) => u[0] <= c.e && c.e < u[0] + u[1])));
console.log("head:", c.head, "| wn:", c.wn, "| over:", c.over, "| joined:", c.joined, "| kq:", c.kq);
for (const k of ["forms", "chain", "chain_words", "divisions", "blocks"]) if (c[k]) console.log(k, JSON.stringify(c[k]));
console.log("bands:", c.bands.join(" | "));
for (const h of c.here) console.log("HERE:", JSON.stringify(h));
for (const d of c.dflt) console.log("DFLT:", JSON.stringify(d));
for (const o of c.other) console.log("OTHER:", JSON.stringify(o));
console.log("entry:", c.entry, "| name:", c.name, "| gradedBy:", c.gradedBy, "| place:", c.place);
console.log("ds:", JSON.stringify(c.ds));
console.log("dcard:", JSON.stringify(c.dcard));
console.log("pills:", c.pills.length);
c.pills.slice(0, Number(show)).forEach((p, i) => console.log(`  ${i + 1}${p[3] ? "*" : " "} ${JSON.stringify(p[0])} | ${p[1]} | by ${p[2]} | grade ${p[4]}${p[5] ? ` | pointer ${JSON.stringify(p[5])}` : ""}${p[7] ? ` | read ${p[7]}` : ""}${p[8] ? ` | ${p[8]}` : ""} | lead ${c.lead ? c.lead[i] : ""} | place ${c.poolPlace ? c.poolPlace[i] : ""}`));
const on = c.pills.findIndex((p) => p[3]);
if (on >= Number(show)) console.log(`  pressed is pill ${on + 1}: ${JSON.stringify(c.pills[on])}`);
