// Finding 13, the other switches: with the fold of switches drawn (?rail=all), press each position of a switch on a fresh
// load and say which run lines of the sections drawn went bare, whether the line is the element that stood before
// (the section was not laid again), and what its title says.
// node f13b.mjs <book> <label> <extra query> <switch label> [switch label ...]
import { chromium, BASE, ready, noHe, mask } from "./lib.mjs";
const [BOOK, LABEL, EXTRA, ...SWS] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const load = async () => { const p = await ctx.newPage(); await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } }); await p.goto(`${BASE}?b=${BOOK}${EXTRA}&rail=all#${LABEL}`, { waitUntil: "domcontentloaded" }); await ready(p); await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(1500); return p; };
const rowOf = (sw) => `[...document.querySelectorAll(".row .lab")].find((x) => (x.firstChild ? x.firstChild.textContent : x.textContent) === ${JSON.stringify(sw)})`;
for (const SW of SWS) {
  const p0 = await load();
  const positions = await p0.evaluate((src) => { const l = eval(src); return l ? [...l.nextElementSibling.querySelectorAll("button")].filter((x) => !x.disabled && x.textContent).map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true" })) : []; }, rowOf(SW));
  await p0.close();
  for (const pos of positions.filter((x) => !x.on)) {
    const p = await load();
    const before = await p.evaluate(() => { let n = 0, titled = 0; for (const r of document.querySelectorAll(".wjoin")) { if (!r.__key) continue; const g = r.querySelector(":scope > .g"); if (!g) continue; n++; g.__probeSeen = true; g.__probeTitle = g.title; if (g.title) titled++; } return { n, titled }; });
    await p.evaluate(({ src, t }) => { const l = eval(src); const x = [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === t); x.click(); }, { src: rowOf(SW), t: pos.t });
    await p.waitForTimeout(3500);
    const after = await p.evaluate(() => { const out = { n: 0, same: 0, bare: 0, bareSame: 0, stale: [] }; for (const r of document.querySelectorAll(".wjoin")) { if (!r.__key) continue; const g = r.querySelector(":scope > .g"); if (!g) continue; out.n++; if (g.__probeSeen) out.same++; if (g.classList.contains("bare")) { out.bare++; if (g.__probeSeen) out.bareSame++; if (g.title) out.stale.push(`${(r.closest("section.seg").querySelector(".vnum") || {}).textContent} key=${r.__key} line[${g.className}] text=${JSON.stringify(g.textContent)} title=${JSON.stringify(g.title)} ${g.__probeSeen ? "(the element that stood before)" : "(a new element)"}`); } } return out; });
    console.log(`${SW}: ${pos.t} -> run lines ${after.n} (were ${before.n}); still the same element ${after.same}; bare ${after.bare}, of which the same element ${after.bareSame}; bare with a title ${after.stale.length}`);
    for (const s of after.stale.slice(0, 4)) console.log("     STALE " + noHe(s));
    await p.close();
  }
}
await b.close();
