// Can a page stuck in a script loop be paused from outside, and its stack read? A control for probes/hang-hunt.mjs:
// one page spins in a plain loop, another in a regular expression that backtracks without end, and each is asked to
// pause. If the plain loop pauses and a real stall does not, the stall is not in the page's script.
// node pause-test.mjs <reader dir>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext();
for (const [name, body] of [
  ["a plain loop", "function spin() { let n = 0; for (;;) { n += 1; } } setTimeout(spin, 300);"],
  ["a backtracking regular expression", "function rx() { /^(a+)+$/.test('a'.repeat(34) + 'b'); } setTimeout(rx, 300);"],
]) {
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Debugger.enable");
  await p.setContent(`<script>${body}</script>`);
  await new Promise((q) => setTimeout(q, 1500));
  const paused = new Promise((res) => cdp.once("Debugger.paused", res));
  const t0 = Date.now();
  const sent = await Promise.race([cdp.send("Debugger.pause").then(() => "answered"), new Promise((r) => setTimeout(() => r("no answer in 8s"), 8000))]);
  const ev = await Promise.race([paused, new Promise((r) => setTimeout(() => r(null), 8000))]);
  console.log(`${name}: the pause request ${sent} after ${((Date.now() - t0) / 1000).toFixed(1)}s · ${ev ? `paused in ${ev.callFrames.slice(0, 3).map((f) => f.functionName || "(anonymous)").join(" < ")}` : "never paused"}`);
  await p.close({ runBeforeUnload: false }).catch(() => {});
}
await b.close().catch(() => {});
process.exit(0);
