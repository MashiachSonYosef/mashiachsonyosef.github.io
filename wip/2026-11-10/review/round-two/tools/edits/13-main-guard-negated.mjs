// The twelfth tool asked the same question the other way round ("if I was imported, do nothing; else ...").
// It asks tools/main-guard-v1.mjs too.
// node 13-main-guard-negated.mjs <reader dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const p = join(process.argv[2], "tools", "emit-apparatus-baseline-v1.mjs");
let s = readFileSync(p, "utf8");
const OLD = "if (import.meta.url !== `file://${process.argv[1]}`) {";
if (s.split(OLD).length - 1 !== 1) throw new Error("expected one negated main guard");
const at = s.search(/^import /mu);
if (at < 0) throw new Error("no import line to stand beside");
s = `${s.slice(0, at)}import { startedAs } from "./main-guard-v1.mjs";\n${s.slice(at)}`.replace(OLD, "if (!startedAs(import.meta.url)) {");
writeFileSync(p, s);
console.log("emit-apparatus-baseline-v1.mjs: the main guard asks main-guard-v1");
