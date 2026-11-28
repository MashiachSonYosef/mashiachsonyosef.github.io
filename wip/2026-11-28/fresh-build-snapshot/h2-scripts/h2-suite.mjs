// Scratch (builder H2): the checks that read the card, run one at a time against the sandbox, the way the tree's own
// runner (tools/run-checks-v1.mjs) runs them, but on a port of this run's own: a server for the reader on PORT (the
// tree's checks ask SERVE_PORT, tools/zones-on-disk-v1.mjs), started here and stopped at the end, so that no other
// builder's server on the runner's 8899 is asked. A check is run by its own RUN line: tree and site with nothing, page
// with nothing (it picks its own work through SERVE_PORT) but for the one that types 8899 as its default address,
// which is handed the address it would pick; given is not run (it needs inputs named on its command line). The
// verdict is the check's exit code: 0 passed, 3 could not reach its inputs, anything else failed; no verdict in the
// limit is failed. Writes each check's output and a summary under <out dir>.
// node h2-suite.mjs <reader dir> <list file> <out dir> [--port 8946] [--timeout 900] [--from name]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, basename } from "node:path";
const [R, LIST, OUTDIR] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const PORT = Number(arg("port", "8946")), LIMIT = Number(arg("timeout", "900")), FROM = arg("from", null);
mkdirSync(OUTDIR, { recursive: true });
const names = readFileSync(LIST, "utf8").split("\n").map((l) => basename(l.trim(), ".mjs")).filter(Boolean);
const answers = async (url) => { try { const r = await fetch(url, { signal: AbortSignal.timeout(2500) }); return r.ok; } catch { return false; } };
if (await answers(`http://127.0.0.1:${PORT}/zone.html`)) { console.log(`port ${PORT} already answers: refusing to run against a server this run did not start`); process.exit(2); }
const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", R], { stdio: "ignore" });
for (let i = 0; i < 40 && !(await answers(`http://127.0.0.1:${PORT}/zone.html`)); i += 1) await new Promise((r) => setTimeout(r, 250));
const stop = () => { try { server.kill(); } catch { /* gone */ } };
process.on("exit", stop); process.on("SIGINT", () => { stop(); process.exit(130); }); process.on("SIGTERM", () => { stop(); process.exit(143); });
const { zonesServed } = await import(join(R, "tools", "zones-on-disk-v1.mjs"));
const first = zonesServed(join(R, "data", "zones"))[0];
const summary = existsSync(join(OUTDIR, "summary.json")) ? JSON.parse(readFileSync(join(OUTDIR, "summary.json"), "utf8")) : {};
let started = !FROM;
for (const name of names) {
  if (!started) { if (name === FROM) started = true; else continue; }
  const src = readFileSync(join(R, "tools", `${name}.mjs`), "utf8");
  const kind = (/^\/\/ RUN:[ \t]*([a-z]+)\b/mu.exec(src) || [])[1] || null;
  if (kind === "given" || !kind) { summary[name] = { kind, verdict: "not run", why: kind ? "needs inputs named on its own command line" : "declares no RUN line" }; console.log(`${name.padEnd(48)} not run (${kind})`); continue; }
  const args = /127\.0\.0\.1:8899\/zone\.html/u.test(src) && !/SERVE_PORT/u.test(src) ? [`http://127.0.0.1:${PORT}/zone.html?b=${first}`] : [];
  const t0 = Date.now();
  const res = await new Promise((done) => {
    const child = spawn("node", [join("tools", `${name}.mjs`), ...args], { cwd: R, env: { ...process.env, SERVE_PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "", timedOut = false;
    child.stdout.on("data", (d) => { out += d; }); child.stderr.on("data", (d) => { out += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, LIMIT * 1000);
    child.on("close", (code) => { clearTimeout(timer); done({ code, out, timedOut }); });
  });
  writeFileSync(join(OUTDIR, `${name}.log`), res.out);
  const lines = res.out.split("\n");
  const verdict = res.timedOut ? "FAILED" : res.code === 0 ? "ok" : res.code === 3 ? "skipped" : "FAILED";
  const said = verdict === "FAILED" ? (res.timedOut ? [`no verdict in ${LIMIT} s`] : (lines.filter((l) => /^FAIL|PAGE ERROR/u.test(l)).length ? lines.filter((l) => /^FAIL|PAGE ERROR/u.test(l)) : lines.filter((l) => l.trim()).slice(-3))) : verdict === "skipped" ? [(lines.find((l) => /^SKIPPED/u.test(l)) || lines.find((l) => l.trim()) || "").trim()] : [`${lines.filter((l) => /^ {2}ok {1,2}/u.test(l)).length} laws ok`];
  summary[name] = { kind, args, verdict, code: res.code, seconds: Math.round((Date.now() - t0) / 1000), said: said.map((l) => l.slice(0, 400)).slice(0, 12) };
  writeFileSync(join(OUTDIR, "summary.json"), JSON.stringify(summary, null, 1));
  console.log(`${name.padEnd(48)} ${verdict.padEnd(8)} ${String(summary[name].seconds).padStart(4)} s  ${said[0] ? said[0].slice(0, 160) : ""}`);
}
stop();
const v = Object.values(summary);
console.log(`\n${v.filter((x) => x.verdict === "ok").length} ok, ${v.filter((x) => x.verdict === "FAILED").length} FAILED, ${v.filter((x) => x.verdict === "skipped").length} skipped, ${v.filter((x) => x.verdict === "not run").length} not run`);
