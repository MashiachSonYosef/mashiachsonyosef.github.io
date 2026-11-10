// One word's card, opened and pressed step by step, the line under the word read after each step.
// node probe-card.mjs <reader dir> <zone url base> <book> <section label, e.g. 2:7> <word number> [step...] [--ls key=value]...
// steps: cut:<n>  cell:<n>  read:<n>  head:<n>  esc  open  wait:<ms>  rail:<toggle>:<label>  eval:<js>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const ls = []; for (let i = argv.indexOf("--ls"); i > -1; i = argv.indexOf("--ls")) { ls.push(argv[i + 1]); argv.splice(i, 2); }
const [reader, base, book, label, wordN, ...steps] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
if (ls.length) await p.addInitScript((pairs) => { try { for (const kv of pairs) { const i = kv.indexOf("="); localStorage.setItem(kv.slice(0, i), kv.slice(i + 1)); } } catch { /* nothing remembered */ } }, ls);
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const idx = await p.evaluate((label) => (window.__zone.sections || []).findIndex((s) => s.label === label), label);
if (idx < 0) { console.log(`no section labeled ${label}`); await b.close(); process.exit(1); }
await p.evaluate(async (idx) => { const s = document.getElementById(`s${idx}`); for (let g = 0; g < 400 && s && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 25)); } }, idx);
await p.waitForTimeout(500);
const wsel = `#s${idx} .he-text .wb`;
const state = () => p.evaluate(({ wsel, n }) => {
  const wb = document.querySelectorAll(wsel)[n - 1]; if (!wb) return { none: true };
  const g = wb.querySelector(":scope > .g") || (wb.closest(".wjoin") || document).querySelector(":scope > .g");
  const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const hud = document.getElementById("hud");
  const pills = (sel) => (hud && !hud.hidden ? [...hud.querySelectorAll(sel)].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "[" : ""}${x.textContent.trim().replace(/\s+/g, " ")}${x.getAttribute("aria-pressed") === "true" ? "]" : ""}`) : []);
  return {
    he: (wb.querySelector(".w") || {}).textContent, line: c ? c.textContent.replace(/\s+/g, " ").trim() : null, title: g ? g.title : null, fontSize: g ? g.style.fontSize : null,
    card: !!(hud && !hud.hidden), head: hud && !hud.hidden ? [...hud.querySelectorAll(".head b > span:not(.mq)")].map((s) => `${s.textContent}${!s.style.color && s.style.fontWeight !== "400" ? "*" : ""}`) : [],
    now: hud && !hud.hidden ? ((hud.querySelector(".r-now") || {}).textContent || "").replace(/\s+/g, " ").trim().slice(0, 160) : "",
    cuts: pills(".b-cut .s-pills button"), cells: pills(".b-cell .s-pills button"), reads: pills(".b-read .r-pills button").slice(0, 8),
    notes: hud && !hud.hidden ? [...hud.querySelectorAll(".b-read > *:not(.r-pills), .rows .band > p, .foot, .r-prov")].map((x) => x.textContent.replace(/\s+/g, " ").trim().slice(0, 200)).filter(Boolean).slice(0, 6) : [],
    stem: hud && !hud.hidden ? ((hud.querySelector(".r-pills") || { dataset: {} }).dataset.stemWithheld ?? null) : null,
  };
}, { wsel, n: Number(wordN) });
const show = async (what) => { const s = await state(); console.log(`— ${what}\n   line: ${JSON.stringify(s.line)}${s.fontSize ? ` (font ${s.fontSize})` : ""} · title: ${JSON.stringify(s.title)}\n   head: ${s.head.join(" ")} · now: ${s.now}\n   divisions: ${s.cuts.join(" | ")}\n   blocks: ${s.cells.join(" | ")}\n   readings: ${s.reads.join(" | ")}${s.stem !== null ? `\n   stem withheld: ${s.stem}` : ""}${s.notes.length ? `\n   notes: ${s.notes.join(" ¦ ")}` : ""}`); return s; };
await show(`${book} ${label} word ${wordN}, before the card`);
const open = async () => { await p.evaluate(({ wsel, n }) => { const wb = document.querySelectorAll(wsel)[n - 1]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, { wsel, n: Number(wordN) }); const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(80); await p.waitForTimeout(700); };
await open();
await show("the card open");
const SEL = { cut: "#hud .b-cut .s-pills button", cell: "#hud .b-cell .s-pills button", read: "#hud .b-read .r-pills button", head: "#hud .head b > span:not(.mq)" };
for (const st of steps) {
  const [kind, ...rest] = st.split(":");
  if (kind === "esc") { await p.keyboard.press("Escape"); await p.waitForTimeout(500); }
  else if (kind === "open") await open();
  else if (kind === "wait") await p.waitForTimeout(Number(rest[0]));
  else if (kind === "rail") { await p.evaluate(({ t, lab }) => { document.querySelectorAll(".rail details").forEach((d) => { d.open = true; }); const row = document.querySelector(`.rail .row[data-toggle="${t}"]`); const btn = row && [...row.querySelectorAll(".dfp, button")].find((e) => e.textContent.trim() === lab); if (btn) btn.click(); else console.log("no such position"); }, { t: rest[0], lab: rest.slice(1).join(":") }); await p.waitForTimeout(1500); }
  else if (kind === "eval") { const r = await p.evaluate(rest.join(":")); console.log("   eval:", JSON.stringify(r)); await p.waitForTimeout(600); }
  else if (SEL[kind]) { const ok = await p.evaluate(({ sel, i }) => { const x = document.querySelectorAll(sel)[i]; if (x) x.click(); return !!x; }, { sel: SEL[kind], i: Number(rest[0]) }); if (!ok) console.log(`   (no ${kind} ${rest[0]})`); await p.waitForTimeout(1000); }
  await show(`after ${st}`);
}
await b.close();
