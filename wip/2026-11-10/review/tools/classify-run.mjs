// What each check is run with, proposed from its own source: page (a reader address), site (the
// site's root), live (the public site), given (inputs named on its command line), tree (nothing).
// Prints the proposal with the line it rests on, for reading; --json writes name -> kind.
// node classify-run.mjs <reader dir> [--json out]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json"); const jsonOut = jsonAt > -1 ? args.splice(jsonAt, 2)[1] : null;
const [reader] = args;
const T = join(reader, "tools");
// read by hand where the source does not say it in one line
const BY_HAND = {
  "check-live-v1": ["live", "fetches the public site and holds it to the checkout"],
  "check-lone-letters-v1": ["given", "--zone and --marks are required; it prints its usage without them"],
  "check-corpus-clean-v1": ["given", "serve NDJSON files named on the command line"],
  "check-same-product-v1": ["given", "--old and --new, two builds to compare"],
  "check-mam-q-shipment-v1": ["given", "--shipment, a shipment that is not kept in the tree"],
};
const out = {};
const rows = [];
for (const f of readdirSync(T).filter((x) => /^check-.*\.mjs$/u.test(x)).sort()) {
  const name = f.replace(/\.mjs$/u, "");
  const code = readFileSync(join(T, f), "utf8").split("\n").filter((l) => !/^\s*\/\//u.test(l));
  let kind = "tree", why = "reads no positional argument";
  const find = (re) => code.find((l) => re.test(l));
  const site = find(/ORIGIN\s*=.*process\.argv\[2\]|new URL\(process\.argv\[2\]\)\.origin|given = process\.argv\[2\] && !\/zone/u);
  const page = find(/defaultZoneUrl\(\s*\)|defaultZoneUrl\(\/\^https|defaultZoneUrl\(positional|process\.argv\[2\] \|\| defaultZoneUrl|process\.argv\[2\] \|\| "http:\/\/127\.0\.0\.1:8899\/zone\.html"|ARG \|\| "http:\/\/127\.0\.0\.1:8899\/zone\.html"|const URL_ARG = process\.argv\[2\]|ARG = \/\^https\?:\/u\.test\(process\.argv\[2\]|base = \/\^https\?:\/u\.test\(process\.argv\[2\]/u);
  if (BY_HAND[name]) [kind, why] = BY_HAND[name];
  else if (site) { kind = "site"; why = site.trim().slice(0, 110); }
  else if (page) { kind = "page"; why = page.trim().slice(0, 110); }
  out[name] = kind; rows.push([name, kind, why]);
}
const n = (k) => rows.filter((r) => r[1] === k).length;
console.log(`${rows.length} checks: tree ${n("tree")} · page ${n("page")} · site ${n("site")} · live ${n("live")} · given ${n("given")}`);
for (const k of ["site", "live", "given", "page", "tree"]) { console.log(`\n== ${k}`); for (const r of rows.filter((x) => x[1] === k)) console.log(`  ${r[0].padEnd(42)} ${r[2]}`); }
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1));
