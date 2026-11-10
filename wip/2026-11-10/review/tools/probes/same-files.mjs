// Two folders: is every file of the first, by name, the same bytes in the second? Read-only.
// node same-files.mjs <folder a> <folder b>
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
const [A, B] = process.argv.slice(2);
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const walk = (d, pre = "") => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n), `${pre}${n}/`) : [`${pre}${n}`]));
const a = walk(A), b = new Set(walk(B));
let same = 0; const differ = [], missing = [];
let bytes = 0;
for (const f of a) {
  if (!existsSync(join(B, f))) { missing.push(f); continue; }
  if (statSync(join(A, f)).size === statSync(join(B, f)).size && sha(join(A, f)) === sha(join(B, f))) { same += 1; bytes += statSync(join(A, f)).size; } else differ.push(f);
}
const extra = [...b].filter((f) => !a.includes(f));
console.log(`${a.length} files in the first · ${same} the same bytes in the second (${bytes.toLocaleString()} bytes) · ${differ.length} differ${differ.length ? `: ${differ.slice(0, 5).join(", ")}` : ""} · ${missing.length} missing from the second${missing.length ? `: ${missing.slice(0, 5).join(", ")}` : ""} · ${extra.length} only in the second${extra.length ? `: ${extra.slice(0, 5).join(", ")}` : ""}`);
