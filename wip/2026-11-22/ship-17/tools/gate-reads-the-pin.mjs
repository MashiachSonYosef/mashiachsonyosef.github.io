// Ship 17 (22 November 2026): check-same-product-v1's expectation of the spelling bridge, run as the gate runs it,
// without two builds served. The gate's own code is lifted from its file: the branch of --expect that reads the pin
// (told by its rule_id, read by laidOf(readBridge(path))) and bridgeIn, the places it owes a line at in a book. They
// are run over the new build's zones as they stand on disk (the gate fetches the same files from the new origin).
// It also says whether the gate names any place. Reads only.
// Usage: node gate-reads-the-pin.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2];
const src = readFileSync(join(R, "tools/check-same-product-v1.mjs"), "utf8");
const B = await import(join(R, "tools/spelling-bridge-v1.mjs"));
const G = await import(join(R, "tools/gloss-store-v1.mjs"));
const { PinFault } = await import(join(R, "tools/pinned-v1.mjs"));
const cut = (start, end) => { const a = src.indexOf(start); const b = src.indexOf(end, a); if (a < 0 || b < 0) throw new Error(`the gate holds no «${start.slice(0, 40)}»`); return src.slice(a, b + end.length); };
// the --expect branch for the bridge, as the gate writes it
const branch = cut("  else if (rec.rule_id === SPELLING_BRIDGE_RULE_ID) {", "BRIDGE = { rec, path, laid, byBook: new Map(), credit: `PIECE:${PIECE_SOURCE.toUpperCase()}` };\n  }");
const bridgeInSrc = cut("const bridgeIn = (z) => {", "  return BRIDGE.byBook.get(z);\n};");
const path = join(R, "data/spelling-bridge/PIN.json");
const rec = JSON.parse(readFileSync(path, "utf8"));
let BRIDGE = null;
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(2); };
const run = new Function("rec", "path", "SPELLING_BRIDGE_RULE_ID", "PIECE_SOURCE", "laidOf", "readBridge", "PinFault", "refuse",
  `let BRIDGE = null; if (false) {} ${branch.replace(/^  else /u, "")} return BRIDGE;`);
BRIDGE = run(rec, path, B.SPELLING_BRIDGE_RULE_ID, B.PIECE_SOURCE, B.laidOf, B.readBridge, PinFault, refuse);
if (!BRIDGE) refuse("the gate's branch did not take the pin as the bridge's");
const zones = new Map();
const newOf = (z) => { if (!zones.has(z)) zones.set(z, { zone: JSON.parse(gunzipSync(readFileSync(join(R, "data/zones", `${z}.bin`))).toString("utf8")) }); return zones.get(z); };
const bridgeIn = new Function("BRIDGE", "newOf", "findBridgePlace", "signsOff", "printedForm", `${bridgeInSrc}\nreturn bridgeIn;`)(BRIDGE, newOf, B.findBridgePlace, G.signsOff, G.printedForm);
const books = [...new Set(BRIDGE.laid.map((p) => p.book))];
let owed = 0; const sample = [];
for (const z of books) {
  const m = bridgeIn(z);
  owed += m.size;
  for (const p of BRIDGE.laid.filter((q) => q.book === z && q.worded === "as_written").slice(0, 1)) { const f = B.findBridgePlace(newOf(z).zone, p); sample.push(`${z} ${p.place} «${m.get(`s${f.si}\u0001${f.at}`)}»`); }
}
const byRoad = (w) => BRIDGE.laid.filter((p) => p.worded === w).length;
console.log(`the gate's --expect branch takes ${path.split("/").slice(-3).join("/")} by its rule_id and reads ${BRIDGE.laid.length} laid places (${byRoad("form_row")} worded by their form rows, ${byRoad("as_written")} by v1.1's parts) · credit owed ${BRIDGE.credit}`);
console.log(`its bridgeIn owes a line at ${owed} places in ${books.length} books, on the new build's zones · e.g. ${sample.slice(0, 4).join(" · ")}`);
// does the gate name a place? a verse and word written out, or a laid book beside a verse
const hits = [...src.matchAll(/["'`][^"'`\n]*\b\d{1,3}:\d{1,3}(?::\d{1,3})?\b[^"'`\n]*["'`]/gu)].map((m) => m[0]).filter((t) => !/\$\{/u.test(t));
console.log(`string literals in the gate that hold a verse (chapter:verse): ${hits.length}${hits.length ? ` · ${hits.slice(0, 5).join(" · ")}` : ""}`);
