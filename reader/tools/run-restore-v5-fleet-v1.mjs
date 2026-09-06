#!/usr/bin/env node
// Synthesis lane · the counted works, built through the one pipeline
//
// RULE: serve-from-restore-rule-v1-the-restore-is-the-text-the-split-is-this-lanes-the-rights-are-the-records
// LEDGER: C0
// the ledger it writes says, book by book, how many rows of the restore became
// how many positions, and names verbatim whatever refused instead.
//
// One loop over the thirty-nine files of the corpus lane's restore v5 —
// twenty-four books of the Tanakh. For each: the serve (tools/serve-from-
// restore-v5.mjs, which holds the restore's hash, rejoins every row, reads
// every site back and holds the count to the corpus lane's cards), then the
// zone (tools/build-zone.mjs, the same builder every work goes through, with
// the count stamped beside the witnesses). A book that refuses at either
// step is named in the ledger with the refusal verbatim, and the loop goes
// on; nothing is retried with different inputs.
//
// The plan's parameters (title, Hebrew title, coordinate labels, licence
// links) are read from the plan where the plan carries the work, so a title
// that reaches a zone came from a record and not from this file.
//
// Run: node tools/run-restore-v5-fleet-v1.mjs --restore-dir <dir> --cards <book-cards-v2.json>
//        [--witnesses data/masorah-witnesses-v1.json] [--rights data/mam-restore-v5-rights-v1.json]
//        [--plan build/build-plan-v1.json] [--work build/restore-v5] [--zones data/zones]
//        [--stamp YYYY-MM-DD] [--only <slug>[,<slug>]]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const RDIR = arg("restore-dir") || die("MISSING_ARG", "--restore-dir");
const CARDS = arg("cards") || die("MISSING_ARG", "--cards");
const WITNESSES = arg("witnesses", join(K3, "data", "masorah-witnesses-v1.json"));
const RIGHTS = arg("rights", join(K3, "data", "mam-restore-v5-rights-v1.json"));
const PLAN = arg("plan", join(K3, "build", "build-plan-v1.json"));
const WORK = arg("work", join(K3, "build", "restore-v5"));
const ZONES = arg("zones", join(K3, "data", "zones"));
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const ONLY = arg("only", null) ? new Set(arg("only").split(",")) : null;
const LINKS = join(K3, "data", "license-links-tanakh.json");

mkdirSync(WORK, { recursive: true });
const plan = existsSync(PLAN) ? JSON.parse(readFileSync(PLAN, "utf8")) : { works: [] };
const planOf = (workId) => (plan.works || []).find((w) => w.work_id === workId) || null;
const titleOf = (slug) => slug.split("-").map((w) => (/^i+$/u.test(w) ? w.toUpperCase() : w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");

const slugs = readdirSync(RDIR).filter((f) => f.endsWith(".csv.gz")).map((f) => f.replace(/\.csv\.gz$/u, "")).sort().filter((s) => !ONLY || ONLY.has(s));
if (!slugs.length) die("NO_RESTORES", RDIR);
const ledger = { schema_version: "RESTORE_V5_FLEET_LEDGER_V1", rule_id: "serve-from-restore-rule-v1-the-restore-is-the-text-the-split-is-this-lanes-the-rights-are-the-records", ran_on: STAMP, works: [] };
const run = (args) => execFileSync("node", args, { cwd: K3, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const said = (e) => String(e.stderr || e.stdout || e.message).split("\n").map((l) => l.trim()).find((l) => /^[A-Z][A-Z_]+/u.test(l)) || String(e.message).slice(0, 160);
let built = 0, refusedN = 0;
for (const slug of slugs) {
  const workId = `tanakh/${slug}`;
  const p = planOf(workId);
  const serve = join(WORK, `${slug}.ndjson`), bridge = join(WORK, `${slug}-bridge.csv.gz`), out = join(ZONES, `${slug}.bin`);
  const entry = { work_id: workId, slug };
  try {
    const s1 = run([join(HERE, "serve-from-restore-v5.mjs"), "--work", workId, "--restore", join(RDIR, `${slug}.csv.gz`), "--receipt", join(RDIR, `${slug}.json`),
      "--cards", CARDS, "--rights", RIGHTS, "--out", serve, "--bridge-out", bridge]);
    entry.serve = s1.trim().split("\n")[0].split(": ").slice(1).join(": ");
  } catch (e) { entry.refused_at = "serve"; entry.refusal = said(e); refusedN += 1; ledger.works.push(entry); console.log(`  REFUSED  ${slug.padEnd(16)} serve: ${entry.refusal}`); continue; }
  const zoneArgs = [join(HERE, "build-zone.mjs"), "--serve", serve, "--bridge", bridge, "--store", join(K3, "data", "route-store"),
    "--work", workId, "--title", (p && p.title_en) || titleOf(slug), "--title-from-c0",
    "--coord-labels", (p && p.coord_labels) || "chapter,verse",
    "--license-links", (p && p.license_links && p.license_links !== "-") ? join(K3, p.license_links) : LINKS,
    "--count-witnesses", WITNESSES, "--out", out, "--stamp", STAMP];
  if (p && p.title_he && p.title_he !== "-") zoneArgs.push("--title-he", p.title_he);
  try {
    const s2 = run(zoneArgs);
    const lines = s2.trim().split("\n");
    entry.zone = lines[0].split(": ").slice(1).join(": ");
    entry.measure = (lines.find((l) => l.includes("measure:")) || "").trim();
    entry.title_he_from = p && p.title_he && p.title_he !== "-" ? `the plan (${p.basis})` : "none — no promoted record names this book in Hebrew";
    // The title's key is attached inside build-zone, in its one pass, under
    // title-key-rule-v1. This loop ran name-the-titles-v1 over the finished
    // bin for one day and that was a patch: the file on the shelf was not an
    // output of the builder, which zone-emit-rule-v8 forbids and the receipts
    // check caught. Nothing is written here after the builder writes.
    built += 1;
    console.log(`  built    ${slug.padEnd(16)} ${entry.zone}`);
    console.log(`           ${entry.measure}`);
  } catch (e) { entry.refused_at = "zone"; entry.refusal = said(e); refusedN += 1; console.log(`  REFUSED  ${slug.padEnd(16)} zone: ${entry.refusal}`); }
  ledger.works.push(entry);
}
ledger.totals = { restores: slugs.length, built, refused: refusedN };
writeFileSync(join(WORK, "ledger.json"), JSON.stringify(ledger, null, 2) + "\n");
console.log(`\n${built} built · ${refusedN} refused · ledger ${join(WORK, "ledger.json").replace(K3 + "/", "")}`);
process.exit(refusedN ? 1 : 0);
