// Read-only: for each line of a list of rows (k, rank, m, sha), the store's rows under its key of the same m and sha16,
// with rank, the route text and the facts. Usage: node peek-rows.mjs <reader dir> <list.jsonl>
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
const [R, LIST] = process.argv.slice(2);
const { openRouteStore, factsOf } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const store = openRouteStore(join(R, "data", "route-store"));
const sha16 = (t) => createHash("sha256").update(Buffer.from(String(t ?? ""), "utf8")).digest("hex").slice(0, 16);
for (const line of readFileSync(LIST, "utf8").split("\n").filter(Boolean)) {
  const l = JSON.parse(line);
  const rows = store.routesFor(l.k) || [];
  const same = rows.filter((r) => String(r[3]) === l.m && sha16(r[1]) === l.sha);
  const atRank = same.filter((r) => r[0] === l.rank);
  console.log(JSON.stringify({ k: l.k, rank: l.rank, m: l.m, sha: l.sha, rows_under_key: rows.length, same_m_sha: same.map((r) => [r[0], String(r[1]).slice(0, 40), factsOf(r)]), at_rank: atRank.length }));
}
