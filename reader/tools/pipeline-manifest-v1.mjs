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
//   3. The stages the build files actually run (build.sh, which builds the
//      plan tier's works from the corpus lane's workspace, and
//      tools/round-v1.sh, which projects the served shelf again over the
//      records this repository holds), against the tools that exist.
//   4. The served shelf, read off the bins themselves: every published bin
//      names the tool that built it and every tool that wrote it after, and
//      the table says which of those a build file runs. Until 10 November
//      2026 this file printed "6 published artifacts, none without a build
//      step" over a site of 147 bins, because table 2 lists the plan's tier
//      and the plan's tier holds one work.
//
// A check claims what it guards by naming it, either in a GUARDS line —
//     // GUARDS: <one rule id>, <another rule id>
// — or anywhere else in its text. Claiming is cheap and deliberate: a check
// that does not name a rule is not counted as guarding it, however much of it
// it happens to exercise, because a guard nobody can find is not a guard.
//
// Run: node tools/pipeline-manifest-v1.mjs [--out PIPELINE-MANIFEST.md]

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";

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
// The per-work rows used to be typed here — six zone files by name — which
// was the manifest carrying the same disease it diagnoses. They now come from
// the build plan, which is what build.sh itself runs from, so a work added by
// its ledger appears here the same way it appears everywhere else: without
// anyone editing a list.
const plan = (() => {
  try { return JSON.parse(read("build/build-plan-v1.json")); } catch { return null; }
})();
const served = plan ? plan.works.filter((w) => (w.serve_state || "SERVED") !== "WITHHELD") : [];
const PUBLISHED = [
  { what: "zone.html", note: "the reader itself" },
  { what: "index.html", note: "the front door" },
  { what: "README.md", note: "the front door, for someone browsing the repository" },
  // Every address the plan names gets a page, held works included: a withheld
  // work's address still answers, and the page that answers is an artifact
  // this build makes. What a withheld work does NOT get is a zone — so this
  // table listed five zones and five sidecars the site does not carry, and
  // called them published.
  ...(plan ? plan.works.map((w) => ({
    what: `${w.published_as}/index.html`,
    note: w.serve_state === "WITHHELD" ? `the clean address · withheld since ${w.withheld_since}` : `the clean address · ${w.basis}`,
  })) : []),
  ...(plan ? served.map((w) => ({ what: `data/zones/${w.published_as}.bin`, note: w.basis })) : []),
  // A sidecar needs both works: the base to sit in and the commentary to
  // print. One side held means neither is built, which is the same rule the
  // plan's TSV applies — half a pair is not a commentary.
  ...(plan ? plan.attachments.filter((a) => a.pair.every((id) => served.some((x) => x.work_id === id)))
    .flatMap((a) => a.pair.map((id) => {
      const w = served.find((x) => x.work_id === id);
      return { what: `data/zones/${w.published_as}.commentary.bin`, note: `attached by ${a.by}` };
    })) : []),
  ...(plan ? plan.commentary_packs.map((c) => {
    const w = served.find((x) => x.work_id === c.work_id);
    return w ? { what: `data/zones/${w.published_as}.commentary.bin`, note: "from the pack and its map" } : null;
  }).filter(Boolean) : []),
  { what: "data/route-store", note: "index + 256 shards" },
  // One map per pack, named for the work it attaches to. There is no row here
  // when the record names no pack: a template row cannot have a build step,
  // and an artifact with no build step is the one thing this table is for.
  ...(plan ? plan.commentary_packs.map((c) => {
    const w = served.find((x) => x.work_id === c.work_id);
    return w ? { what: `data/attachment-map-${w.published_as}.js`, note: "which words of which section each commentary sits on" } : null;
  }).filter(Boolean) : []),
];
if (!plan) PUBLISHED.push({ what: "build/build-plan-v1.json", note: "NOT DERIVED YET — run tools/plan-build-v1.mjs; the per-work rows above are missing until it exists" });
const BUILD_FILES = ["build.sh", "tools/round-v1.sh"].filter((f) => files.has(f));
const buildSh = BUILD_FILES.map((f) => files.get(f)).join("\n");
const madeBy = (what) => {
  // The zone stages run from the plan, so a zone's builder is resolved from
  // the shape of its name rather than from a literal in the script.
  if (plan) {
    if (/^[a-z0-9-]+\/index\.html$/.test(what)) return "tools/build-front-door-v1.mjs";
    const m = what.match(/^data\/zones\/([a-z0-9-]+?)(-commentary)?\.bin$/);
    if (m && served.some((w) => w.published_as === m[1])) {
      if (!m[2]) return "tools/build-zone.mjs";
      const w = served.find((x) => x.published_as === m[1]);
      return plan.commentary_packs.some((c) => c.work_id === w.work_id)
        ? "tools/build-commentary-sidecar-v1.mjs" : "tools/build-commentary-zone.mjs";
    }
  }
  const base = what.split("/").pop();
  // a stage that stamps its output with the build date writes the name with a
  // variable in it, so the date is taken off both sides before comparing
  const dated = base.match(/^(.*?)\d{4}-\d{2}-\d{2}\./);
  const stem = dated ? dated[1] : null;
  const hit = (l) => l.includes(base) || l.includes(what) || (stem && l.includes(stem));
  if (!buildSh.split("\n").some(hit)) return null;
  const line = buildSh.split("\n").find(hit);
  const tool = (line || "").match(/tools\/[a-z0-9-]+\.mjs/);
  return tool ? tool[0] : (BUILD_FILES.find((f) => files.get(f).split("\n").some(hit)) || "build.sh");
};

// ---- 3 · stages ----------------------------------------------------------
const called = [...new Set((buildSh.match(/tools\/[a-z0-9-]+\.(mjs|sh)/g) || []))].sort();
const present = toolNames.filter((f) => /\.mjs$/.test(f) && !f.startsWith("check-")).map((f) => `tools/${f}`).sort();
const notCalled = present.filter((f) => !called.includes(f));

// ---- 4 · the served shelf, read off the bins -----------------------------
// A bin says who made it: a zone names its builder (emitted_from.build) and
// its route, and every tool that wrote it after its build is typed on it
// (emitted_from.post_build.by, under single-pass-exemption-v1). Nothing is
// typed here; a kind of bin nobody names a maker for prints as unnamed.
const kindOf = (f) => (/\.([a-z]+)\.bin$/.exec(f) || [null, "zone"])[1];
const shelf = new Map(); // kind -> { bins, routes: Set, builders: Set, wrote: Map(tool -> bins) }
for (const f of (existsSync("data/zones") ? readdirSync("data/zones") : []).filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-")).sort()) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(`data/zones/${f}`)).toString("utf8")); } catch { continue; }
  const k = kindOf(f);
  if (!shelf.has(k)) shelf.set(k, { bins: 0, routes: new Set(), builders: new Set(), wrote: new Map() });
  const s = shelf.get(k), ef = z.emitted_from || {};
  s.bins += 1;
  s.routes.add(String(z.route || z.schema_version || "unnamed"));
  const builder = (ef.build && ef.build.builder) || ef.projected_by || z.projected_by || z.emitted_by || null;
  s.builders.add(builder || "unnamed");
  const pb = ef.post_build || {};
  const writers = new Set([...String(pb.by || "").split(" + "), ...Object.values(pb.by_field || {}).flatMap((v) => String(v).split(" + "))].map((t) => t.trim()).filter((t) => t.startsWith("tools/")));
  for (const t of writers) s.wrote.set(t, (s.wrote.get(t) || 0) + 1);
}
const inABuildFile = (tool) => BUILD_FILES.find((f) => files.get(f).includes(tool)) || null;

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
L.push(`The build files (${BUILD_FILES.map((f) => `\`${f}\``).join(", ")}) call ${called.length} of the ${present.length} tools that are not checks.`, "");
if (notCalled.length) {
  L.push("Not called by any build stage:", "");
  for (const f of notCalled) L.push(`- \`${f}\``);
  L.push("");
}
L.push("## The served shelf", "");
L.push("Read off the bins in `data/zones`: who each kind says built it, and every tool");
L.push("typed on it as having written it after its build. A tool no build file runs");
L.push("is run by hand when its own input arrives; the bins it wrote cannot be made");
L.push("again from a checkout by a build file alone.", "");
L.push("| kind | bins | route or schema | built by | written after its build by |");
L.push("|---|---|---|---|---|");
const shelfTools = new Set();
for (const [k, s] of shelf) {
  const wrote = [...s.wrote.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([t, n]) => { shelfTools.add(t); const bf = inABuildFile(t); return `${t} (${n}; ${bf ? `run by ${bf}` : "**no build file runs it**"})`; });
  const built = [...s.builders].map((b) => (b === "unnamed" ? "**unnamed**" : `${b} (${b.startsWith("tools/") && inABuildFile(b) ? `run by ${inABuildFile(b)}` : "no build file runs it"})`));
  L.push(`| ${k} | ${s.bins} | ${[...s.routes].join(", ")} | ${built.join(", ")} | ${wrote.join("; ") || "—"} |`);
}
L.push("");
writeFileSync(OUT, `${L.join("\n")}\n`);

console.log(`${OUT}`);
console.log(`  rules      ${ordered.length} declared · ${unguarded.length} UNGUARDED`);
for (const [id] of unguarded) console.log(`               ${id}`);
console.log(`  published  ${PUBLISHED.length} artifacts · ${heirlooms.length} with NO BUILD STEP`);
for (const p of heirlooms) console.log(`               ${p.what}`);
console.log(`  stages     the build files (${BUILD_FILES.join(", ")}) call ${called.length} of ${present.length} non-check tools`);
{
  const bins = [...shelf.values()].reduce((n, s) => n + s.bins, 0);
  const outside = [...shelfTools].filter((t) => !inABuildFile(t)).sort();
  console.log(`  shelf      ${bins} bins in data/zones · written after their build by ${shelfTools.size} tools · ${outside.length} of them in no build file`);
  for (const t of outside) console.log(`               ${t}`);
}
