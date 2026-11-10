#!/usr/bin/env node
// Synthesis lane · every check, in one run, a few at a time, with a verdict at the end
//
// LEDGER: -
// no frame letter. This runs the checks and reads their verdicts; the only
// files it writes are each check's own output under build/check-logs/, which
// is derived and not committed.
//
// HOW A CHECK IS RUN IS THE CHECK'S OWN DECLARATION. Until 10 November 2026
// the runner (run-all-checks.sh) carried a typed list of seventy-six checks
// that take no address and handed every other check a reader address. The
// list went stale as checks were written: a check of the door was handed a
// book's address and found no books; the check of the public site was handed
// one and waited ten minutes on a host it never reached; a check that needs
// a file named on its command line was handed one and printed its usage as a
// failure. Twenty-one checks that open no page at all were handed an address
// they never read. A whole run reported reds that were the runner's.
//
// So each check says, in a line of its own header, what it is run with:
//
//   // RUN: tree     nothing: it reads the checkout (and may open pages of
//                    its own choosing against the servers this runner keeps)
//   // RUN: page     a reader address, zone.html?b=<work>; with none it picks
//                    its own work. --zone hands it one; --panel hands it one
//                    work per shape the shelf carries
//   // RUN: site     the site's root, when --site gives one; with none it
//                    serves the checkout itself or asks 127.0.0.1:8912
//   // RUN: live     the public site: run with --live <origin>, as the deploy
//                    workflow does, and counted as not run here otherwise
//   // RUN: given    inputs named on its own command line (a shipment, a
//                    corpus package): counted as not run here, with its usage
//
// A check with no RUN line is not run and the run fails for it: a check
// nobody says how to run is a check that does not run.
//
// The verdicts are the checks' own exit codes: 0 passed, 3 could not reach
// its inputs here (counted apart, named, never as a pass), anything else
// failed. Three run at a time by default (--jobs); the chains this replaced
// ran three abreast for a month.
//
// A LAW NOT JUDGED IS NAMED. A check that passes may still hold a law it
// could not judge on this machine (the zone it wanted is held off the door;
// no work of the kind it presses is on this disk). The checks print such a
// law, and their side notes, on a line that begins "  --  ", where a judged
// law begins "  ok  " or "FAIL  ". Of those lines the run lists, under its
// verdict, every one that says a law went unjudged (not judged, not read,
// not witnessed, not asked, skipped, not counted as passed): a law nobody
// judged is not a law that passed. The side notes stay in the check's own
// output.
//
// Usage: node tools/run-checks-v1.mjs [--zone <reader address>] [--panel] [--site <origin>]
//          [--live <origin>] [--only <regex on the check's name>] [--jobs 3] [--timeout 600]
import { startedAs } from "./main-guard-v1.mjs";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const READER = join(HERE, "..");
const SITE = join(READER, "..");
const flag = (n) => process.argv.includes(`--${n}`);
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const JOBS = Math.max(1, Number(arg("jobs", "3")) || 3);
const TIMEOUT_S = Math.max(30, Number(arg("timeout", "600")) || 600);
const ONLY = arg("only") ? new RegExp(arg("only"), "u") : null;
const ZONE = arg("zone"), SITE_ORIGIN = arg("site"), LIVE = arg("live");
const KINDS = ["tree", "page", "site", "live", "given"];
export const runKindOf = (src) => { const m = /^\/\/ RUN:[ \t]*([a-z]+)\b/mu.exec(src); return m && KINDS.includes(m[1]) ? m[1] : null; };

// One work per shape the shelf carries: each coordinate shape, a titled and
// an untitled zone, a Hebrew-id and a Latin-id slug, a zone with ketiv/qere
// sites, the largest and the smallest bin, the shelf's first and last in
// sort order. Derived from the zones, never typed; the panel grows by itself
// the day a new shape appears.
export const shapePanel = () => {
  const all = zonesOnDisk();
  if (!all.length) return [];
  const pick = new Map();
  const size = (z) => readFileSync(join(READER, "data", "zones", `${z}.bin`)).length;
  const sizes = all.map((z) => [z, size(z)]);
  pick.set("first", all[0]); pick.set("last", all[all.length - 1]);
  pick.set("largest", sizes.reduce((a, c) => (c[1] > a[1] ? c : a))[0]);
  pick.set("smallest", sizes.reduce((a, c) => (c[1] < a[1] ? c : a))[0]);
  const want = ["titled", "untitled", "flat", "nested", "named", "hebrew-id", "latin-id", "kq"];
  for (const z of all) {
    if (want.every((w) => pick.has(w))) break;
    const zz = JSON.parse(gunzipSync(readFileSync(join(READER, "data", "zones", `${z}.bin`))).toString("utf8"));
    const shape = String((zz.emitted_from || {}).coordinate_shape || "");
    if (!pick.has("kq") && Number((zz.counts || {}).kq_sites) > 0) pick.set("kq", z);
    // three shapes, each its own slot: the named sequence shares a prefix
    // with the plain one and must not be allowed to fill its slot instead
    if (!pick.has("named") && shape.startsWith("SEALED_UNIT_SEQUENCE_NAMED")) pick.set("named", z);
    else if (!pick.has("flat") && shape.startsWith("SEALED_UNIT_SEQUENCE")) pick.set("flat", z);
    if (!pick.has("nested") && shape.startsWith("CHAPTER_SECTION")) pick.set("nested", z);
    if (!pick.has("titled") && (zz.work_he_tokens || []).some((t) => t.k)) pick.set("titled", z);
    if (!pick.has("untitled") && !(zz.work_he_tokens || []).length) pick.set("untitled", z);
    if (!pick.has("hebrew-id") && /[\u0590-\u05FF]/u.test(z)) pick.set("hebrew-id", z);
    if (!pick.has("latin-id") && !/[\u0590-\u05FF]/u.test(z)) pick.set("latin-id", z);
  }
  return [...new Set(pick.values())];
};

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  process.chdir(READER);
  const answers = async (url) => { try { const r = await fetch(url, { signal: AbortSignal.timeout(2500) }); return r.ok; } catch { return false; } };
  // The servers the page checks ask, owned by the run: the reader on 8899
  // and the site's root on 8912. One that already answers is used; one that
  // does not is started here and stopped when the run ends.
  const started = [];
  const serve = async (port, dir, probe) => {
    if (await answers(`http://127.0.0.1:${port}/${probe}`)) return;
    const child = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", dir], { stdio: "ignore" });
    started.push(child);
    for (let i = 0; i < 40; i += 1) { if (await answers(`http://127.0.0.1:${port}/${probe}`)) return; await new Promise((r) => setTimeout(r, 250)); }
    console.log(`no server answered on ${port}; the page checks that ask it will say so`);
  };
  const stop = () => { for (const c of started) { try { c.kill(); } catch { /* it is gone already */ } } };
  process.on("exit", stop); process.on("SIGINT", () => { stop(); process.exit(130); }); process.on("SIGTERM", () => { stop(); process.exit(143); });
  await serve(8899, READER, "zone.html");
  await serve(8912, SITE, "index.html");
  // The plan the tree checks read is derived and not committed: a fresh
  // checkout has no build/ and eight checks used to crash on its absence.
  spawnSync("node", ["tools/plan-build-v1.mjs", "--out", "build/build-plan-v1.json", "--tsv", "build/build-plan-v1.tsv"], { stdio: "ignore" });
  const LOGS = join(READER, "build", "check-logs");
  mkdirSync(LOGS, { recursive: true });

  const checks = readdirSync(HERE).filter((f) => /^check-.*\.mjs$/u.test(f)).sort().map((f) => ({ name: f.replace(/\.mjs$/u, ""), file: join("tools", f), kind: runKindOf(readFileSync(join(HERE, f), "utf8")) }))
    .filter((c) => !ONLY || ONLY.test(c.name));
  const panel = flag("panel") ? shapePanel().map((z) => `http://127.0.0.1:8899/zone.html?b=${z}`) : [];
  if (flag("panel")) console.log(`shape panel: ${panel.map((u) => u.split("b=")[1]).join(" ")}`);
  const jobs = [];
  const notRun = [];
  for (const c of checks) {
    if (!c.kind) { notRun.push({ ...c, why: "declares no RUN line, so nothing says how it is run" , fault: true }); continue; }
    if (c.kind === "given") { notRun.push({ ...c, why: "needs inputs named on its own command line" }); continue; }
    if (c.kind === "live") { if (LIVE) jobs.push({ ...c, args: [LIVE], tag: "" }); else notRun.push({ ...c, why: "reads the public site; the deploy workflow runs it (--live <origin>)" }); continue; }
    if (c.kind === "site") { jobs.push({ ...c, args: SITE_ORIGIN ? [SITE_ORIGIN] : [], tag: "" }); continue; }
    if (c.kind === "page" && panel.length) { for (const u of panel) jobs.push({ ...c, args: [u], tag: u.split("b=")[1] }); continue; }
    jobs.push({ ...c, args: c.kind === "page" && ZONE ? [ZONE] : [], tag: "" });
  }
  const results = [];
  const runOne = (j) => new Promise((done) => {
    const t0 = process.hrtime.bigint();
    const child = spawn("node", [j.file, ...j.args], { cwd: READER, stdio: ["ignore", "pipe", "pipe"] });
    let out = ""; let timedOut = false;
    child.stdout.on("data", (d) => { out += d; }); child.stderr.on("data", (d) => { out += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, TIMEOUT_S * 1000);
    child.on("close", (code) => {
      clearTimeout(timer);
      const seconds = Number((process.hrtime.bigint() - t0) / 1000000n) / 1000;
      const label = j.tag ? `${j.name} [${j.tag}]` : j.name;
      writeFileSync(join(LOGS, `${j.name}${j.tag ? `.${j.tag}` : ""}.log`), out);
      const lines = out.split("\n");
      let verdict, say;
      if (timedOut) { verdict = "FAILED"; say = [`    ¦ no verdict in ${TIMEOUT_S} s; stopped`]; }
      // a check that could not reach its inputs says why on a line of its own
      // that begins SKIPPED; some print a heading above it
      else if (code === 3) { verdict = "skipped"; say = [(lines.find((l) => /^SKIPPED\b/u.test(l)) || lines.find((l) => l.trim()) || "").replace(/^SKIPPED\s*(—|-|:)?\s*/u, "")]; }
      // a check in another lane's style judges without an "ok" line; it is
      // shown saying what it said, never as "0 assertions"
      else if (code === 0) { verdict = "ok"; const n = lines.filter((l) => /^ {2}ok {1,2}/u.test(l)).length; say = [n ? `${n} assertions` : `no law printed as judged · ${(lines.filter((l) => l.trim()).pop() || "(it printed nothing)").trim()}`]; }
      else { verdict = "FAILED"; const f = lines.filter((l) => /^FAIL|PAGE ERROR/u.test(l)); say = (f.length ? f : lines.filter((l) => l.trim()).slice(-3).map((l) => `¦ ${l}`)).map((l) => `    ${l}`); }
      const unjudged = lines.filter((l) => /^ {2}-- {2}/u.test(l) && /\bnot (judged|read|witnessed|asked|counted as passed)\b|\bskipped\b|\bunread\b/iu.test(l)).map((l) => l.trim().replace(/^--\s+/u, ""));
      results.push({ label, name: j.name, verdict, say, seconds, unjudged });
      if (verdict === "FAILED") { console.log(`${label.padEnd(44)} FAILED  (${seconds.toFixed(0)} s)`); for (const l of say) console.log(l.slice(0, 600)); }
      else console.log(`${label.padEnd(44)} ${verdict === "ok" ? "ok  " : "skipped —"} ${say[0].slice(0, 300)}${verdict === "ok" ? `  (${seconds.toFixed(0)} s)` : ""}`);
      done();
    });
  });
  let next = 0;
  const worker = async () => { while (next < jobs.length) { const j = jobs[next]; next += 1; await runOne(j); } };
  const began = Date.now();
  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, worker));
  stop();

  const failed = results.filter((r) => r.verdict === "FAILED").map((r) => r.label).sort();
  const skipped = results.filter((r) => r.verdict === "skipped").map((r) => r.label).sort();
  const passed = results.filter((r) => r.verdict === "ok").length;
  const undeclared = notRun.filter((c) => c.fault);
  console.log();
  // What the checks do not cover is as much a result as what they do. The
  // manifest reads it out of the source every run; written to a scratch
  // path, never over the committed manifest.
  const man = spawnSync("node", ["tools/pipeline-manifest-v1.mjs", "--stamp", new Date().toISOString().slice(0, 10), "--out", join(LOGS, "manifest.md")], { cwd: READER, encoding: "utf8" });
  for (const l of String(man.stdout || "").split("\n").filter((l) => /^\s+(rules|published|shelf)\b|NO BUILD STEP/u.test(l))) console.log(`  ${l}`);
  console.log();
  console.log(failed.length ? `${failed.length} of ${passed + failed.length} FAILED: ${failed.join(" ")}` : `all ${passed} passed`);
  if (skipped.length) console.log(`${skipped.length} could not reach their inputs here: ${skipped.join(" ")}`);
  const partial = results.filter((r) => r.verdict !== "skipped" && r.unjudged.length).sort((a, b) => a.label.localeCompare(b.label));
  if (partial.length) {
    console.log(`${partial.reduce((n, r) => n + r.unjudged.length, 0)} law(s) not judged here, in ${partial.length} check(s) that ran:`);
    for (const r of partial) for (const l of r.unjudged) console.log(`  ${r.label} · ${l.slice(0, 260)}`);
  }
  for (const c of notRun.filter((x) => !x.fault)) console.log(`not run here · ${c.name} · ${c.why}`);
  for (const c of undeclared) console.log(`NOT RUN · ${c.name} · ${c.why}`);
  console.log(`${results.length} runs in ${Math.round((Date.now() - began) / 60000)} min, ${JOBS} at a time · each check's whole output: build/check-logs/`);
  process.exit(failed.length || undeclared.length ? 1 : 0);
}
