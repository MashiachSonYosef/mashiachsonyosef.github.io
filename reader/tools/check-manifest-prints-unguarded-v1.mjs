#!/usr/bin/env node
// GUARDS: pipeline-manifest-rule-v1-a-rule-with-no-guard-is-printed-as-having-none
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The manifest is the one document in this tree that claims it cannot drift.
// Its own header says so: "Every number below is read out of the source at
// the moment of writing, so this file cannot drift the way a hand-written one
// does." Its first table is the rules table. The declaring file says what a
// row of it means: "Every rule the code declares, where it is declared, and
// which check guards it. A rule no check names is printed as UNGUARDED. It is
// not an error and it does not stop a build — it is a number that should go
// down, and it is on the page so it cannot be forgotten." And what counts as
// a guard: "A check claims what it guards by naming it ... a check that does
// not name a rule is not counted as guarding it, however much of it it
// happens to exercise, because a guard nobody can find is not a guard."
//
// So the rule has a scanner and a promise. The scanner: tools/*, zone.html
// and build.sh are read for ids in the shape the RULE regex recognizes, and a
// rule is guarded only if a tools/check-*.mjs names it. The promise: what is
// printed is what the scan found. The promise can break in two places. The
// emitter can be wrong — miss a rule, credit a guard nothing names, print a
// header count the table does not add up to. Or the emitter can be right and
// the page in the tree stale, because nobody ran it after the last check
// landed, so the page still prints UNGUARDED beside rules that now have a
// guard, or the reverse. The rule is about what is PRINTED, so both are
// checked: a fresh emission first, then the committed file against it.
//
// The scan here is the manifest's own, not a paraphrase of it. The RULE regex
// is read out of the emitter's source at run time rather than copied, so the
// two cannot disagree without this check saying so. The rest of the scan is
// reproduced step for step: the same three places, the same strip of trailing
// punctuation, the same merge of a short id into the longer id it prefixes,
// the same test for a guard.
//
//   L0  the emitter still declares its RULE regex where this check reads it
//   L1  every rule the scan finds is a row of the fresh table, and the fresh
//       table has no row the scan did not find
//   L2  every rule no check names is printed UNGUARDED in the fresh table
//   L3  every rule some check names is printed as guarded, and credited to
//       exactly the checks that name it
//   L4  the fresh header count line adds up to the fresh table
//   L5  the committed PIPELINE-MANIFEST.md prints the same rules table a fresh
//       emission prints; otherwise it is stale
//   L6  the committed header count line adds up to the committed table
//
// What this does NOT prove: that a check which names a rule exercises it.
// Naming is the manifest's whole test for a guard, on purpose, and this check
// inherits that test rather than improving on it. It says nothing about the
// "declared in" column, the published table, or the stages table.
//
// Run: node tools/check-manifest-prints-unguarded-v1.mjs [--root .]
//        [--manifest tools/pipeline-manifest-v1.mjs]
//        [--committed PIPELINE-MANIFEST.md]
//        [--fresh <path for the fresh emission; default a temp dir, removed after>]
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ROOT = resolve(arg("root", K3));
const MANIFEST = resolve(arg("manifest", join(K3, "tools", "pipeline-manifest-v1.mjs")));
const COMMITTED = resolve(arg("committed", join(ROOT, "PIPELINE-MANIFEST.md")));
const FRESH = arg("fresh", null);

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (xs, n = 3) => xs.slice(0, n).join(" · ") + (xs.length > n ? ` · +${xs.length - n} more` : "");

if (!existsSync(MANIFEST)) { console.log(`SKIPPED — no emitter at ${MANIFEST}, so there is no scan to repeat`); process.exit(3); }
if (!existsSync(join(ROOT, "tools"))) { console.log(`SKIPPED — no tools directory under ${ROOT}, so there is nothing to scan`); process.exit(3); }

// ── L0 · the scanner is the emitter's own ─────────────────────────────────
// The regex is lifted out of the emitter's source. A copy typed here would be
// a second opinion, and the day the emitter changed its mind this check would
// go on measuring with the old one.
const emitterSrc = readFileSync(MANIFEST, "utf8");
const ruleLine = emitterSrc.match(/^const RULE = \/(.+)\/g;\s*$/m);
check("L0  the emitter declares its RULE regex where this check reads it",
  !!ruleLine,
  ruleLine ? `/${ruleLine[1]}/g` : "no line of the form `const RULE = /.../g;` in the emitter — this check has no scanner until it is rewritten");
if (!ruleLine) { console.log(`\n${bad} FAILED`); process.exit(1); }
const RULE = new RegExp(ruleLine[1], "g");

// ── the scan, step for step ───────────────────────────────────────────────
const readOr = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const toolNames = readdirSync(join(ROOT, "tools")).filter((f) => /\.(mjs|json|sh)$/.test(f));
const files = new Map();
for (const f of toolNames) files.set(`tools/${f}`, readOr(join(ROOT, "tools", f)));
for (const f of ["zone.html", "build.sh"]) if (existsSync(join(ROOT, f))) files.set(f, readOr(join(ROOT, f)));

const rules = new Map(); // id -> Set of the checks that name it
let rawHits = 0;
for (const [path, body] of files) {
  for (const m of body.match(RULE) || []) {
    rawHits += 1;
    const id = m.replace(/[-.,;:"')\]]+$/, "");
    if (!rules.has(id)) rules.set(id, new Set());
    if (/^tools\/check-/.test(path)) rules.get(id).add(path.replace("tools/", "").replace(".mjs", ""));
  }
}
const idsBeforeMerge = rules.size;
// A short id that is a prefix of more than one long id is merged into
// whichever the scan met first. That is the emitter's choice and it is
// reproduced here, but it is named below, because "first" is not "meant".
const ambiguous = [];
for (const id of rules.keys()) {
  const longer = [...rules.keys()].filter((o) => o !== id && o.startsWith(`${id}-`));
  if (longer.length > 1) ambiguous.push(`${id} -> ${longer.length} rules`);
}
for (const id of [...rules.keys()])
  for (const other of rules.keys())
    if (other !== id && other.startsWith(`${id}-`)) {
      rules.get(id).forEach((x) => rules.get(other).add(x));
      rules.delete(id);
      break;
    }
const scanIds = [...rules.keys()].sort();
const unguardedByScan = scanIds.filter((id) => rules.get(id).size === 0);
const guardedByScan = scanIds.filter((id) => rules.get(id).size > 0);

console.log(`— ${files.size} files scanned · ${rawHits} hits · ${idsBeforeMerge} ids, ${scanIds.length} rules after the short forms merge · ${unguardedByScan.length} with no check naming them —`);
if (ambiguous.length) console.log(`  note: ${ambiguous.length} short id(s) prefix more than one rule and were credited to the first met: ${few(ambiguous, 4)}`);
console.log("");

// ── a fresh emission ──────────────────────────────────────────────────────
const scratch = FRESH ? null : mkdtempSync(join(tmpdir(), "manifest-fresh-"));
const freshPath = FRESH ? resolve(FRESH) : join(scratch, "PIPELINE-MANIFEST.md");
const run = spawnSync(process.execPath, [MANIFEST, "--out", freshPath], { cwd: ROOT, encoding: "utf8" });
const ranClean = run.status === 0 && existsSync(freshPath);
if (!ranClean) {
  check("the emitter ran to completion", false,
    `exit ${run.status ?? run.error} — ${String(run.stderr || run.stdout || "").trim().split("\n")[0] || "no output"}`);
  if (scratch) rmSync(scratch, { recursive: true, force: true });
  console.log(`\n${bad} FAILED`);
  process.exit(1);
}

// The rules table is the rows between "## The rules" and the next heading.
// The guard column is either the literal **UNGUARDED** or a list of checks.
const parseManifest = (text) => {
  const lines = text.split("\n");
  const start = lines.indexOf("## The rules");
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  const rows = new Map();
  const dup = [];
  if (start > -1) {
    for (const l of lines.slice(start + 1, end > -1 ? end : lines.length)) {
      const m = l.match(/^\| `([^`]+)` \| (.*?) \| (.*?) \|$/);
      if (!m) continue;
      if (rows.has(m[1])) dup.push(m[1]);
      const g = m[3].trim();
      const unguarded = g === "**UNGUARDED**";
      rows.set(m[1], { unguarded, guards: unguarded ? [] : g.split(",").map((s) => s.trim()).filter(Boolean) });
    }
  }
  const h = text.match(/^\*\*(\d+) rules declared · (\d+) named by a check · (\d+) unguarded\.\*\*$/m);
  return { rows, dup, tableFound: start > -1, header: h ? { declared: +h[1], named: +h[2], unguarded: +h[3] } : null };
};
const fresh = parseManifest(readFileSync(freshPath, "utf8"));
if (scratch) rmSync(scratch, { recursive: true, force: true });

// ── L1..L4 · the emitter against the scan ─────────────────────────────────
const missingRows = scanIds.filter((id) => !fresh.rows.has(id));
const strayRows = [...fresh.rows.keys()].filter((id) => !rules.has(id));
check("L1  every rule the scan finds is a row of the fresh table, and no row is one it did not find",
  fresh.tableFound && missingRows.length === 0 && strayRows.length === 0 && fresh.dup.length === 0,
  !fresh.tableFound ? "no `## The rules` section in the fresh emission"
    : (missingRows.length || strayRows.length || fresh.dup.length)
      ? [missingRows.length ? `${missingRows.length} found and not printed: ${few(missingRows)}` : "",
        strayRows.length ? `${strayRows.length} printed and not found: ${few(strayRows)}` : "",
        fresh.dup.length ? `${fresh.dup.length} printed twice: ${few(fresh.dup)}` : ""].filter(Boolean).join(" · ")
      : `${fresh.rows.size} rows, one per rule the scan found`);

const creditedWithNothing = unguardedByScan.filter((id) => fresh.rows.has(id) && !fresh.rows.get(id).unguarded);
check("L2  every rule no check names is printed UNGUARDED",
  creditedWithNothing.length === 0,
  creditedWithNothing.length
    ? `${creditedWithNothing.length} printed as guarded though nothing names them: ${few(creditedWithNothing)}`
    : unguardedByScan.length
      ? `${unguardedByScan.length} have no guard and every one says so: ${few(unguardedByScan)}`
      : "every rule in the tree is named by some check");

const printedUnguarded = guardedByScan.filter((id) => fresh.rows.has(id) && fresh.rows.get(id).unguarded);
const misCredited = guardedByScan.filter((id) => {
  const r = fresh.rows.get(id);
  if (!r || r.unguarded) return false;
  return [...rules.get(id)].sort().join(",") !== [...r.guards].sort().join(",");
});
check("L3  every rule some check names is printed as guarded, by exactly the checks that name it",
  printedUnguarded.length === 0 && misCredited.length === 0,
  (printedUnguarded.length || misCredited.length)
    ? [printedUnguarded.length ? `${printedUnguarded.length} named by a check yet printed UNGUARDED: ${few(printedUnguarded)}` : "",
      misCredited.length ? `${misCredited.length} credited to the wrong checks: ${few(misCredited)}` : ""].filter(Boolean).join(" · ")
    : `${guardedByScan.length} guarded rules, each credited to the checks that name it`);

const addsUp = (m) => {
  if (!m.header) return { ok: false, why: "no header count line found" };
  const u = [...m.rows.values()].filter((r) => r.unguarded).length;
  const ok = m.header.declared === m.rows.size && m.header.named === m.rows.size - u && m.header.unguarded === u;
  return { ok, why: `header says ${m.header.declared} declared · ${m.header.named} named · ${m.header.unguarded} unguarded; table holds ${m.rows.size} · ${m.rows.size - u} · ${u}` };
};
const freshSum = addsUp(fresh);
check("L4  the fresh header count line adds up to the fresh table", freshSum.ok, freshSum.why);

// ── L5..L6 · the committed page against the fresh one ────────────────────
if (!existsSync(COMMITTED)) {
  check("L5  the committed manifest prints the same rules table a fresh emission prints", false,
    `no manifest at ${COMMITTED} — nothing is printed at all; run the emitter and commit what it writes`);
  console.log("  --  L6 went unasked: there is no committed header to add up");
} else {
  const committed = parseManifest(readFileSync(COMMITTED, "utf8"));
  const onlyCommitted = [...committed.rows.keys()].filter((id) => !fresh.rows.has(id));
  const onlyFresh = [...fresh.rows.keys()].filter((id) => !committed.rows.has(id));
  const nowGuarded = [], nowUnguarded = [], otherChecks = [];
  for (const [id, f] of fresh.rows) {
    const c = committed.rows.get(id);
    if (!c) continue;
    if (c.unguarded && !f.unguarded) nowGuarded.push(id);
    else if (!c.unguarded && f.unguarded) nowUnguarded.push(id);
    else if (!c.unguarded && [...c.guards].sort().join(",") !== [...f.guards].sort().join(",")) otherChecks.push(id);
  }
  const headerSame = !!committed.header && !!fresh.header
    && committed.header.declared === fresh.header.declared
    && committed.header.named === fresh.header.named
    && committed.header.unguarded === fresh.header.unguarded;
  const same = committed.tableFound && !onlyCommitted.length && !onlyFresh.length
    && !nowGuarded.length && !nowUnguarded.length && !otherChecks.length && headerSame;
  check("L5  the committed manifest prints the same rules table a fresh emission prints",
    same,
    same ? `${committed.rows.size} rows agree, and so do the counts`
      : !committed.tableFound ? "STALE — no `## The rules` section in the committed file"
        : ["STALE",
          nowGuarded.length ? `${nowGuarded.length} printed UNGUARDED though a check now names them: ${few(nowGuarded)}` : "",
          nowUnguarded.length ? `${nowUnguarded.length} printed as guarded though nothing names them now: ${few(nowUnguarded)}` : "",
          otherChecks.length ? `${otherChecks.length} credited to a different set of checks: ${few(otherChecks)}` : "",
          onlyCommitted.length ? `${onlyCommitted.length} printed that the scan no longer finds: ${few(onlyCommitted)}` : "",
          onlyFresh.length ? `${onlyFresh.length} found that the page does not print: ${few(onlyFresh)}` : "",
          !headerSame ? `header says ${committed.header ? committed.header.unguarded : "?"} unguarded, a fresh run says ${fresh.header ? fresh.header.unguarded : "?"}` : "",
          "run the emitter and commit what it writes"].filter(Boolean).join(" · "));
  const committedSum = addsUp(committed);
  check("L6  the committed header count line adds up to the committed table", committedSum.ok, committedSum.why);
}

console.log("\n  what this does not say: that a check which names a rule exercises it. The");
console.log("  manifest counts a guard by its name and nothing else, on purpose, and this");
console.log("  check repeats that count rather than second-guessing it. A red L5 is not a");
console.log("  wrong emitter; it is a page nobody regenerated, and the fix is to run it.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
