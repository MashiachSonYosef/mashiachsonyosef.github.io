// What the page holds for one pointed surface: the baked leader, the table, the order columns, the pool the card offers.
// node why-line.mjs <reader dir> <zone url base> <book> <cases.json> <index into cases> [--ls key=value]...
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const argv = process.argv.slice(2);
const ls = []; for (let i = argv.indexOf("--ls"); i > -1; i = argv.indexOf("--ls")) { ls.push(argv[i + 1]); argv.splice(i, 2); }
const [reader, base, book, casesPath, at] = argv;
// <cases.json> <index>, or the two words "at" <label>:<key> (the first word of that section under that key)
const byKey = casesPath === "at" ? { label: at.split(":").slice(0, -1).join(":"), k: at.split(":").pop() } : null;
let surface = byKey ? null : JSON.parse(readFileSync(casesPath, "utf8"))[Number(at)];
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
if (ls.length) await p.addInitScript((pairs) => { try { for (const kv of pairs) { const i = kv.indexOf("="); localStorage.setItem(kv.slice(0, i), kv.slice(i + 1)); } } catch { /* nothing remembered */ } }, ls);
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
const where = await p.evaluate(({ surface, byKey }) => {
  const secs = window.__zone.sections || [];
  for (let i = 0; i < secs.length; i += 1) { const ws = secs[i].words || []; if (byKey && secs[i].label !== byKey.label) continue; for (let j = 0; j < ws.length; j += 1) if (ws[j] && !ws[j].mark && !ws[j].kq && (byKey ? ws[j].k === byKey.k : ws[j].s === surface)) return { i, j, label: secs[i].label, word: ws[j] }; }
  return null;
}, { surface, byKey });
if (!where) { console.log("no such word"); await b.close(); process.exit(1); }
surface = where.word.s;
console.log(`${book} ${where.label} ${surface} · word ${JSON.stringify({ k: where.word.k, h: where.word.h, hg: where.word.hg, pg: where.word.pg, pj: where.word.presentation_join })}`);
await p.evaluate(async (idx) => { const s = document.getElementById(`s${idx}`); for (let g = 0; g < 400 && s && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 25)); } }, where.i);
await p.waitForTimeout(300);
const held = await p.evaluate(({ surface, k }) => {
  const z = window.__zone, ls = window.__latticeStore;
  const cols = {}; for (const [o, t] of Object.entries(z.gloss_orders || {})) if (t && Object.prototype.hasOwnProperty.call(t, k)) cols[o] = t[k];
  return { gloss: z.gloss[k], name: (z.gloss_names || {})[k] ?? null, gloss_m: (z.gloss_m || {})[k] ?? null, columns: cols, lattice: ls && ls.grades ? ls.grades[surface] : "(no lattice store on the page)", masorah: window.__masorah, signs: window.__signs };
}, { surface, k: where.word.k });
console.log("held:", JSON.stringify(held, null, 1).slice(0, 3000));
await p.evaluate(({ idx, surface }) => { const wb = [...document.querySelectorAll(`#s${idx} .he-text .wb`)].find((x) => { const w = x.querySelector(".w"); return w && w.textContent.normalize("NFC") === surface.normalize("NFC"); }); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, { idx: where.i, surface });
const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(60);
await p.waitForTimeout(600);
const card = await p.evaluate(() => ({ pool: window.__pool, lead: window.__poolLead, place: window.__poolPlace, pressed: [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.getAttribute("aria-pressed") === "true"), notes: [...document.querySelectorAll("#hud .b-read > *:not(.r-pills), #hud .kq-role")].map((x) => x.textContent.replace(/\s+/g, " ").trim().slice(0, 200)).filter(Boolean) }));
console.log("card:", JSON.stringify(card, null, 1).slice(0, 2500));
await b.close();
