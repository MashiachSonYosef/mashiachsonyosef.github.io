// GUARDS: store-manifest-rule-v1-what-ships-is-pinned
//
// The shipped route store answers for every reading on every page, and each
// of its files must be exactly the bytes its manifest pins. A shard that
// moved without its pin is a reading that moved under a word with nothing
// saying so — the drift this check exists to catch. The manifest itself is
// derived (tools/emit-store-manifest-v1.mjs); this recomputes, never trusts.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const STORE = join(HERE, "..", "data", "route-store");
const MANIFEST = join(STORE, "store-manifest-v1.json");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(MANIFEST)) { console.log("SKIPPED — the store carries no manifest to check against"); process.exit(3); }
const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

// every pinned file is here and is its pin
let moved = [], missing = [];
for (const [rel, pin] of Object.entries(m.files)) {
  const p = join(STORE, rel);
  if (!existsSync(p)) { missing.push(rel); continue; }
  const bytes = readFileSync(p);
  if (bytes.length !== pin.bytes || sha256(bytes) !== pin.sha256) moved.push(rel);
}
check(`every pinned file is exactly its pin (${Object.keys(m.files).length} files)`,
  moved.length === 0 && missing.length === 0,
  [...moved.map((f) => `moved: ${f}`), ...missing.map((f) => `missing: ${f}`)].slice(0, 4).join(" · ") || "all match");

// and nothing serves beside the pins — an unpinned file in the store is a
// file a reader can fetch that nothing vouches for
const onDisk = [];
for (const f of readdirSync(STORE).sort()) {
  if (f === "store-manifest-v1.json") continue;
  if (statSync(join(STORE, f)).isDirectory()) continue;
  onDisk.push(f);
}
for (const f of readdirSync(join(STORE, "shards")).sort()) onDisk.push(`shards/${f}`);
const unpinned = onDisk.filter((f) => !m.files[f]);
check("and nothing serves beside the pins", unpinned.length === 0, unpinned.slice(0, 4).join(" · ") || "nothing stray");

console.log();
process.exit(bad ? 1 : 0);
