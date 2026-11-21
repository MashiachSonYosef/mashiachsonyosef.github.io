// AT REST NOTHING MOVES: every ketiv/qere pair of the books named, every section built, nothing ruled and no chip
// pressed, read on the page before the mends and on the page after them, and compared pair by pair: the line's
// text, its title and classes, the chip whole (its text, its title, the source lines it stands for), and which
// half is underlined.
// With --repaint <source chip key> the chip is pressed off and on again first (every pair painted again, nothing left
// off), so the repaint's path is compared too and not only the first drawing's.
// node rest-proof.mjs --before http://127.0.0.1:8899 --after http://127.0.0.1:8931 [--books ruth,daniel] [--query "&default=ubs"] [--repaint openscriptures_bdb_1906]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const BEFORE = arg("before", "http://127.0.0.1:8899"), AFTER = arg("after", null), BOOKS = arg("books", "ruth,daniel").split(","), QUERY = arg("query", ""), REPAINT = arg("repaint", "");
if (!AFTER) { console.error("usage: node rest-proof.mjs --before <base> --after <base> [--books a,b] [--query &x=y]"); process.exit(2); }
const read = async (base, book) => {
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
    const p = await ctx.newPage(); p.setDefaultTimeout(180000);
    const errors = []; p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
    await p.goto(`${base}/zone.html?b=${book}${QUERY}`, { waitUntil: "networkidle", timeout: 180000 });
    await p.waitForSelector("section.seg .he-text .wb", { state: "attached", timeout: 180000 });
    await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 180000 }).catch(() => {});
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.__materialise());
    await p.waitForTimeout(3000);
    await p.waitForFunction(() => !window.__livePending, null, { timeout: 180000 }).catch(() => {});
    await p.waitForTimeout(1500);
    for (let n = 0; REPAINT && n < 2; n += 1) {
      await p.evaluate((key) => document.querySelector(`#sourcesRow button.dfp[data-key="${key}"]`).click(), REPAINT);
      await p.waitForTimeout(2000);
      await p.waitForFunction(() => !window.__livePending, null, { timeout: 180000 }).catch(() => {});
      await p.waitForTimeout(1500);
    }
    const got = await p.evaluate(() => {
      const z = window.__zone; const out = [];
      z.sections.forEach((sec, si) => (sec.words || []).forEach((w, wi) => {
        if (!w || !w.kq) return;
        const el = document.getElementById(`s${si}`);
        const wb = el ? [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === w) : null;
        if (!wb) { out.push({ at: `${sec.label} word ${wi + 1}`, drawn: false }); return; }
        const g = wb.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
        const chip = g.querySelector(".g-lic");
        out.push({ at: `${sec.label} word ${wi + 1}`, drawn: true, line: c.textContent, title: g.title, cls: [...g.classList].sort().join(" "), data: JSON.stringify({ ...g.dataset }),
          chip: chip ? chip.outerHTML : null, chipLine: chip ? chip.dataset.line || "" : null,
          halves: [...wb.querySelectorAll(".w .wr")].map((x) => `${/^ketiv/.test(x.title) ? "ketiv" : "qere"}${x.classList.contains("backs-en") ? "*" : ""}`).join(","), wb: [...wb.classList].sort().join(" ") });
      }));
      return { rows: out, off: window.__sourcesOff || [] };
    });
    return { ...got, errors };
  } finally { await b.close(); }
};
let bad = 0;
for (const book of BOOKS) {
  const a = await read(BEFORE, book), c = await read(AFTER, book);
  const diffs = [];
  if (a.rows.length !== c.rows.length) diffs.push(`pairs counted: ${a.rows.length} before, ${c.rows.length} after`);
  a.rows.forEach((r, i) => { const s = c.rows[i]; if (JSON.stringify(r) !== JSON.stringify(s)) diffs.push(`${r.at}: before ${JSON.stringify(r)} | after ${JSON.stringify(s)}`); });
  const undrawn = a.rows.filter((r) => !r.drawn).length, chips = a.rows.filter((r) => r.chip).length, bare = a.rows.filter((r) => r.drawn && /\bbare\b/.test(r.cls)).length;
  const ok = !diffs.length && !undrawn && !a.errors.length && !c.errors.length && a.rows.length > 0;
  if (!ok) bad += 1;
  console.log(`${ok ? "  ok " : "FAIL "} ${book}${QUERY ? ` (${QUERY})` : ""}${REPAINT ? " (after a source chip off and on again)" : ""}: ${a.rows.length} pairs read before and after (${chips} wear a chip, ${bare} are bare, ${undrawn} not drawn; resting off ${JSON.stringify(a.off)}); ${diffs.length} differ in line, title, classes, chip or underlined half`);
  for (const d of diffs.slice(0, 12)) console.log("      " + d);
  if (a.errors.length || c.errors.length) console.log("      page errors:", a.errors.slice(0, 2), c.errors.slice(0, 2));
}
process.exit(bad ? 1 : 0);
