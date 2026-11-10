// Every tool the ledger-declaration law would name, not only the first five it prints.
// node ledger-undeclared.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const { readDeclaration } = await import(pathToFileURL(join(R, "tools", "emit-ledger-index-v1.mjs")).href);
const out = [];
for (const f of readdirSync(join(R, "tools")).filter((x) => x.endsWith(".mjs")).sort()) {
  const src = readFileSync(join(R, "tools", f), "utf8");
  const writes = [...[...src.matchAll(/data[/\\]([a-z0-9-]+\.json)/gi)].map((m) => m[1]), ...[...src.matchAll(/"data"\s*,\s*"([a-z0-9-]+\.json)"/gi)].map((m) => m[1])];
  const isWriter = /writeFileSync/.test(src) && writes.length > 0;
  const d = readDeclaration(src);
  if (!d) { if (isWriter) out.push(`${f}: no LEDGER line · names ${[...new Set(writes)].slice(0, 4).join(", ")}`); continue; }
  if (!d.why) out.push(`${f}: declares ${d.letters.join(" ") || "-"}, no why`);
}
console.log(out.length, "tools"); console.log(out.join("\n"));
