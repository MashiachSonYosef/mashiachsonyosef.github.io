// A page that stops answering while it is scrolled: the page is opened and scrolled as a reader would, again and
// again, and the first time a scroll does not come back within the watch time the page's own script is paused where
// it stands and its call stack printed (the function names and the lines of the page's script).
// node hang-hunt.mjs <reader dir> <zone url with its query> [--rounds N] [--watch seconds] [--step px] [--to px] [--nums]
// Prints one line per round, and the stack when a round hangs. Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
const argv = process.argv.slice(2);
// the processor time each of this browser's processes has used (user + system ticks), by pid, with its kind
const ticks = (rootPid) => {
  const out = new Map();
  let ps = ""; try { ps = execSync("ps -eo pid,ppid,args", { encoding: "utf8" }); } catch { return out; }
  const rows = ps.split("\n").slice(1).map((l) => /^\s*(\d+)\s+(\d+)\s+(.*)$/u.exec(l)).filter(Boolean).map((m) => ({ pid: Number(m[1]), ppid: Number(m[2]), args: m[3] }));
  const kids = new Set([rootPid]); let grew = true;
  while (grew) { grew = false; for (const r of rows) if (kids.has(r.ppid) && !kids.has(r.pid)) { kids.add(r.pid); grew = true; } }
  for (const r of rows) if (kids.has(r.pid)) {
    try { const st = readFileSync(`/proc/${r.pid}/stat`, "utf8"); const f = st.slice(st.lastIndexOf(")") + 2).split(" "); out.set(r.pid, { t: Number(f[11]) + Number(f[12]), kind: (/--type=([a-z-]+)/u.exec(r.args) || [0, "browser"])[1] }); } catch { /* gone */ }
  }
  return out;
};
const has = (f) => { const i = argv.indexOf(f); if (i < 0) return false; argv.splice(i, 1); return true; };
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const ROUNDS = Number(flag("--rounds", "30")), WATCH = Number(flag("--watch", "15")) * 1000, STEP = Number(flag("--step", "1500")), TO = Number(flag("--to", "24000")), NUMS = has("--nums");
const [reader, url] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const within = (promise, ms) => Promise.race([promise.then(() => "ok"), new Promise((r) => setTimeout(() => r("hung"), ms))]);
let hung = false;
for (let round = 1; round <= ROUNDS && !hung; round += 1) {
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Debugger.enable");
  const t0 = Date.now();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.evaluate((on) => { const pill = document.getElementById("numsPill"); if (pill && (pill.getAttribute("aria-pressed") === "true") !== on) pill.click(); }, NUMS);
  let at = -1;
  for (let y = 0; y <= TO && !hung; y += STEP) {
    at = y;
    const r = await within(p.evaluate((y) => window.scrollTo(0, y), y), WATCH);
    if (r === "hung") { hung = true; break; }
    await new Promise((q) => setTimeout(q, 80));
  }
  if (!hung) { const r = await within(p.evaluate(() => window.scrollTo(0, 0)), WATCH); if (r === "hung") { hung = true; at = 0; } }
  if (!hung) { console.log(`round ${round}: scrolled to ${TO}px and back in ${((Date.now() - t0) / 1000).toFixed(1)}s${errors.length ? ` · page errors: ${errors[0]}` : ""}`); await p.close(); continue; }
  console.log(`round ${round}: THE PAGE STOPPED ANSWERING at a scroll to ${at}px, ${((Date.now() - t0) / 1000).toFixed(1)}s after it was opened`);
  // is something working, or is everything waiting? the processor time of each of the browser's processes over 3 seconds
  { const root = process.pid; const a = ticks(root); await new Promise((q) => setTimeout(q, 3000)); const c = ticks(root);
    const used = [...c].map(([pid, v]) => ({ pid, kind: v.kind, d: v.t - ((a.get(pid) || {}).t ?? v.t) })).sort((x, y) => y.d - x.d);
    console.log(`   processor time used in 3s (100 ticks a second), this program and its browser: ${used.slice(0, 8).map((u) => `${u.kind} ${u.pid}: ${u.d}`).join(" · ")}`); }
  // pause the page's script where it stands and read its stack
  const paused = new Promise((res) => cdp.once("Debugger.paused", res));
  await cdp.send("Debugger.pause");
  const ev = await Promise.race([paused, new Promise((r) => setTimeout(() => r(null), 20000))]);
  if (!ev) console.log("   the script could not be paused in 20s (it may be waiting outside script: layout, style, or the compositor)");
  else for (const f of ev.callFrames.slice(0, 14)) console.log(`   at ${f.functionName || "(anonymous)"} · ${(f.url || "").split("/").pop()}:${f.location.lineNumber + 1}:${f.location.columnNumber + 1}`);
  // twice more, a moment apart: a loop shows the same frames, a slow pass moves on
  for (let k = 0; k < 2 && ev; k += 1) {
    const again = new Promise((res) => cdp.once("Debugger.paused", res));
    await cdp.send("Debugger.resume"); await new Promise((q) => setTimeout(q, 1500)); await cdp.send("Debugger.pause");
    const e2 = await Promise.race([again, new Promise((r) => setTimeout(() => r(null), 20000))]);
    console.log(`   ${1.5 * (k + 1)}s later: ${e2 ? e2.callFrames.slice(0, 5).map((f) => `${f.functionName || "(anonymous)"}:${f.location.lineNumber + 1}`).join(" < ") : "could not be paused"}`);
  }
}
if (!hung) console.log(`no round of ${ROUNDS} stopped answering`);
await b.close().catch(() => {});
process.exit(0);
