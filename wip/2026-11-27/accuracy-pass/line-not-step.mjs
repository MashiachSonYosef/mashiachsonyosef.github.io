// Read-only: the words of the thirty-nine books whose line at rest is not STEP's, each with its zone word.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2];
const { wordListsOf } = await import(join(R, "tools", "zone-walk-v1.mjs"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const out = [];
for (const f of readdirSync(join(R, "data", "resting-lines")).filter((x) => x.endsWith(".json.gz") && !x.startsWith("tikkunei")).sort()) {
  const book = f.replace(".json.gz", "");
  const rl = gz(join(R, "data", "resting-lines", f));
  const zone = gz(join(R, "data", "zones", `${book}.bin`));
  const lists = [...wordListsOf(zone)];
  if (lists.length !== rl.sections.length) { console.error(book, "sections differ", lists.length, rl.sections.length); continue; }
  rl.sections.forEach(([label, rows], si) => {
    for (const [i, n, text, credit] of rows) {
      if (credit === "PIECE:TAHOT" || /^M4(:|$)/.test(credit || "")) continue;
      const w = lists[si][i] || {};
      const keep = {}; for (const k of Object.keys(w)) if (!["s", "k"].includes(k)) keep[k] = w[k];
      out.push({ book, label, i: i + 1, n, text, credit, s: w.s, k: w.k, w: keep });
    }
  });
}
console.log(JSON.stringify(out));
