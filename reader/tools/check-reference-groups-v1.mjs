#!/usr/bin/env node
// A page that gathers works under a traditional name owes each of them its
// own license, and owes its own name the same honesty as every other name.
//
// The owner's naming ruling (2026-08-30) lets a set of sealed pieces be
// referred to under the traditional name that gathers them. The page that
// does the gathering then presents several works at once — and works do not
// come to share a license because a name gathered them. When Kings unlocks,
// its two pieces could carry different rights, and a page that showed the
// gathered name over two unstated licenses would be the quiet flattening
// this project exists to refuse.
//
// So, per group page:
//   1. a member the shelf serves is presented WITH its own license
//   2. a member that does not serve presents no text, so owes no license —
//      it says what it awaits instead
//   3. the group's own English name says it is typed and waiting, because
//      it is: the ruling honors the TRADITIONAL name, and the English
//      standing in for it until an attested one arrives is the record's own
//
// Run: node tools/check-reference-groups-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const RECORD = arg("reference-groups", join(K3, "data", "reference-groups-v1.json"));
const OUT = arg("out", join(K3, "deploy-root"));
if (!existsSync(RECORD)) { console.log("SKIPPED — no reference record on this disk"); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const RG = JSON.parse(readFileSync(RECORD, "utf8"));
const groups = RG.groups || [];
check("the record carries the ruling and its author", !!RG.ruling && !!RG.ruled_by,
  RG.ruled_by || "unattributed");

// the shelf's own answer about what serves, derived the way the door derives
// it — a zone on disk at the member's address
const { zonesOnDisk } = await import("./zones-on-disk-v1.mjs");
const ON_DISK = new Set(zonesOnDisk());
const addressOf = (id) => {
  const segs = String(id).split("/");
  return segs[segs.length - 1];
};

for (const g of groups) {
  const page = join(OUT, g.slug, "index.html");
  if (!existsSync(page)) { check(`${g.slug} stands at its own address`, false, page); continue; }
  const html = readFileSync(page, "utf8");
  console.log(`— ${g.slug} —`);

  // 3 · the typed English name says so
  check("  its typed English name says it is typed and waiting",
    /typed in the reference record/.test(html) && /until a source on record uses one/.test(html),
    "disclosed");

  for (const id of g.members) {
    const addr = addressOf(id);
    const serving = ON_DISK.has(addr);
    // the member's paragraph — the line that names it on this page
    const plain = addr.replace(/[-_]+/g, " ");
    const line = html.split("\n").find((l) => l.startsWith("<p>") && l.includes(plain))
      || html.split("\n").find((l) => l.includes(`/${addr}"`));
    if (!line) { check(`  ${addr} is presented at all`, false, "no line names it"); continue; }
    if (serving) {
      // 1 · a served member carries its own license
      check(`  ${addr} serves, and its own license stands beside it`,
        /class="lics"/.test(line) && /class="lic"/.test(line),
        line.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90));
    } else {
      // 2 · an unserved member claims no license it cannot show
      check(`  ${addr} does not serve, and claims no license`,
        !/class="lic"/.test(line) && /awaits|census/.test(line),
        line.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90));
    }
  }
}
if (!groups.length) console.log("  (the record carries no groups)");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
