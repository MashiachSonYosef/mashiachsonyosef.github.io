#!/usr/bin/env node
// Synthesis lane · pipeline-manifest-rule-v1-a-rule-with-no-guard-is-printed-as-having-none
//
// What makes this a pipeline rather than a pile of sessions.
//
// The answer cannot be a document somebody wrote, because a document drifts
// the moment the code moves and nothing tells you it has. PIPELINE.md was
// written on 2026-08-15 and was four days stale before anybody noticed. So
// this reads the pipeline instead of describing it, and prints three tables
// that are true at the moment they are printed:
//
//   1. Every rule the code declares, where it is declared, and which check
//      guards it. A rule no check names is printed as UNGUARDED. It is not an
//      error and it does not stop a build — it is a number that should go
//      down, and it is on the page so it cannot be forgotten.
//   2. Every artifact the site publishes, and whether a build step makes it.
//      An artifact with no build step is an heirloom: it exists because
//      somebody made it once and nobody can make it again.
//   3. The stages build.sh actually runs, against the tools that exist.
//
// A check claims what it guards by naming it, either in a GUARDS line —
//     // GUARDS: zone-gloss-rule-v3-..., regloss-rule-v1-...
// — or anywhere else in its text. Claiming is cheap and deliberate: a check
// that does not name a rule is not counted as guarding it, however much of it
// it happens to exercise, because a guard nobody can find is not a guard.
//
// Run: node tools/pipeline-manifest-v1.mjs [--out PIPELINE-MANIFEST.md]

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg("out", "PIPELINE-MANIFEST.md");
const STAMP = arg("stamp", null);

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const toolNames = existsSync("tools") ? readdirSync("tools").filter((f) => /\.(mjs|json|sh)$/.test(f)) : [];
const files = new Map();
for (const f of toolNames) files.set(`tools/${f}`, read(`tools/${f}`));
for (const f of ["zone.html", "build.sh"]) if (existsSync(f)) files.set(f, read(f));

// ---- 1 · the rules -------------------------------------------------------
const RULE = /\b[a-z][a-z0-9]*(?:-[a-z0-9]+)*-rule-(?:v[0-9][a-z0-9-]*|[a-z0-9-]+)/g;
const rules = new Map(); // id -> { declaredIn: Set, guardedBy: Set }
const SELF = "tools/pipeline-manifest-v1.mjs";
for (const [path, body] of files) {
  for (const m of body.match(RULE) || []) {
    const id = m.replace(/[-.,;:"')\]]+$/, "");
    if (!rules.has(id)) rules.set(id, { declaredIn: new Set(), guardedBy: new Set() });
    if (/^tools\/check-/.test(path)) rules.get(id).guardedBy.add(path.replace("tools/", "").replace(".mjs", ""));
    // this file quotes other rules by way of example; quoting is not declaring
    else if (path !== SELF || id.startsWith("pipeline-manifest-rule-")) rules.get(id).declaredIn.add(path);
  }
}
// an id that is only a prefix of a longer id is the same rule written short
for (const id of [...rules.keys()])
  for (const other of rules.keys())
    if (other !== id && other.startsWith(`${id}-`)) {
      const a = rules.get(id), b = rules.get(other);
      a.declaredIn.forEach((x) => b.declaredIn.add(x));
      a.guardedBy.forEach((x) => b.guardedBy.add(x));
      rules.delete(id);
      break;
    }
// a rule only a check mentions is that check's own name for itself
for (const [id, r] of rules) if (!r.declaredIn.size && r.guardedBy.size) r.declaredIn.add(`tools/${[...r.guardedBy][0]}.mjs`);

// ---- 2 · what the site publishes, and what makes it ----------------------
//
// The list is written here rather than discovered, because "what this site
// publishes" is a decision and not a fact about a directory. Adding a
// published file without adding it here is the mistake this table exists to
// catch, so the list is short and it is read out loud in the manifest.
const PUBLISHED = [
  { what: "zone.html", note: "the reader itself" },
  { what: "index.html", note: "the front door" },
  { what: "README.md", note: "the front door, for someone browsing the repository" },
  { what: "genesis/index.html", note: "the clean address for Genesis" },
  { what: "1kings/index.html", note: "the clean address for I Kings" },
  { what: "data/zones/genesis.bin", note: "" },
  { what: "data/zones/1kings.bin", note: "" },
  { what: "data/zones/targum-1kings.bin", note: "" },
  { what: "data/zones/genesis-commentary.bin", note: "" },
  { what: "data/zones/1kings-commentary.bin", note: "" },
  { what: "data/zones/targum-1kings-commentary.bin", note: "" },
  { what: "data/route-store", note: "index + 256 shards" },
  { what: "data/v5-attachment-map-2026-08-19.js", note: "which words of which section each commentary sits on" },
];
const buildSh = files.get("build.sh") || "";
const madeBy = (what) => {
  const base = what.split("/").pop();
  // a stage that stamps its output with the build date writes the name with a
  // variable in it, so the date is taken off both sides before comparing
  const dated = base.match(/^(.*?)\d{4}-\d{2}-\d{2}\./);
  const stem = dated ? dated[1] : null;
  const hit = (l) => l.includes(base) || l.includes(what) || (stem && l.includes(stem));
  if (!buildSh.split("\n").some(hit)) return null;
  const line = buildSh.split("\n").find(hit);
  const tool = (line || "").match(/tools\/[a-z0-9-]+\.mjs/);
  return tool ? tool[0] : "build.sh";
};

// ---- 3 · stages ----------------------------------------------------------
const called = [...new Set((buildSh.match(/tools\/[a-z0-9-]+\.(mjs|sh)/g) || []))].sort();
const present = toolNames.filter((f) => /\.mjs$/.test(f) && !f.startsWith("check-")).map((f) => `tools/${f}`).sort();
const notCalled = present.filter((f) => !called.includes(f));

// ---- write ---------------------------------------------------------------
const ordered = [...rules.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const unguarded = ordered.filter(([, r]) => !r.guardedBy.size);
const heirlooms = PUBLISHED.filter((p) => !madeBy(p.what));

const L = [];
L.push("# The Tabernacle · what the pipeline can prove about itself", "");
L.push("Generated by `tools/pipeline-manifest-v1.mjs`. Do not edit — edit the code");
L.push("and run it again. Every number below is read out of the source at the moment");
L.push("of writing, so this file cannot drift the way a hand-written one does.", "");
if (STAMP) L.push(`Read on ${STAMP}.`, "");
L.push(`**${ordered.length} rules declared · ${ordered.length - unguarded.length} named by a check · ${unguarded.length} unguarded.**`);
L.push(`**${PUBLISHED.length} published artifacts · ${PUBLISHED.length - heirlooms.length} with a build step · ${heirlooms.length} without.**`, "");
L.push("## The rules", "");
L.push("A rule with no check is not wrong. It is unwitnessed: it holds as long as");
L.push("whoever is working remembers it, and stops holding the moment they do not.", "");
L.push("| rule | declared in | guarded by |");
L.push("|---|---|---|");
for (const [id, r] of ordered)
  L.push(`| \`${id}\` | ${[...r.declaredIn].join(", ") || "—"} | ${[...r.guardedBy].join(", ") || "**UNGUARDED**"} |`);
L.push("", "## What the site publishes", "");
L.push("An artifact with no build step exists because somebody made it once. If the");
L.push("machine it was made on is gone, so is the ability to make it again.", "");
L.push("| published | made by |");
L.push("|---|---|");
for (const p of PUBLISHED)
  L.push(`| \`${p.what}\`${p.note ? ` · ${p.note}` : ""} | ${madeBy(p.what) || "**no build step**"} |`);
L.push("", "## Stages", "");
L.push(`\`build.sh\` calls ${called.length} of the ${present.length} tools that are not checks.`, "");
if (notCalled.length) {
  L.push("Not called by any build stage:", "");
  for (const f of notCalled) L.push(`- \`${f}\``);
  L.push("");
}
writeFileSync(OUT, `${L.join("\n")}\n`);

console.log(`${OUT}`);
console.log(`  rules      ${ordered.length} declared · ${unguarded.length} UNGUARDED`);
for (const [id] of unguarded) console.log(`               ${id}`);
console.log(`  published  ${PUBLISHED.length} artifacts · ${heirlooms.length} with NO BUILD STEP`);
for (const p of heirlooms) console.log(`               ${p.what}`);
console.log(`  stages     build.sh calls ${called.length} of ${present.length} non-check tools`);
