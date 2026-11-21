// Finding 5, the other half: is a line repainted by a source switch gated by the card opened last?
// Amos, every section built; STEP TAHOT and Strong's (OS) pressed off on the main rail so the lines are read live.
// Run 1: no card ever opened. Run 2: first the cards at 3:7 word 6, 4:10 word 3 and 3:1 word 6 (one key, three
// pointings) opened and shut, the last of them 3:1's. Every line of the book compared.
import { open, U, waitCard } from "./lib.mjs";
const run = async (cards) => {
  const { b, p, errors } = await open("amos");
  await p.evaluate(() => window.__materialise()); await p.waitForTimeout(2500);
  for (const [si, wi] of cards) {
    await p.evaluate(({ si, wi }) => { const z = window.__zone; const wb = [...document.querySelectorAll(`#s${si} .he-text .wb`)].find((x) => x.__word === z.sections[si].words[wi]); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, { si, wi });
    await waitCard(p); await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  }
  for (const key of ["stepbible_tahot_aligned_translation", "openscriptures_strongs"]) { await p.evaluate((key) => document.querySelector(`#sourcesRow button.dfp.on[data-key="${key}"]`).click(), key); await p.waitForTimeout(1500); }
  await p.waitForFunction(() => !window.__livePending, null, { timeout: 90000 }).catch(() => {}); await p.waitForTimeout(3000);
  const lines = await p.evaluate(() => { const z = window.__zone; const out = {}; z.sections.forEach((sec, si) => { const wbs = [...document.querySelectorAll(`#s${si} .he-text .wb`)]; sec.words.forEach((w, wi) => { const wb = wbs.find((x) => x.__word === w); if (!wb) return; const g = wb.querySelector(":scope > .g"); if (!g) return; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); const chip = g.querySelector(".g-lic"); out[`${sec.label}:${wi + 1}`] = `${c.textContent.trim()} [${chip ? chip.dataset.line : ""}]${g.dataset.live ? " live" : ""} k=${w.k || ""}`; }); }); return { out, live: window.__liveLines, off: window.__sourcesOff }; });
  await b.close();
  return { ...lines, errors };
};
const a = await run([]);
const c = await run([[37, 5], [55, 2], [31, 5]]);
const keys = Object.keys(a.out);
const diff = keys.filter((k) => a.out[k] !== c.out[k]);
console.log("off:", JSON.stringify(a.off), "| lines read:", keys.length, "| lines read live:", keys.filter((k) => / live /.test(a.out[k])).length, "| differing between the runs:", diff.length);
for (const k of diff.slice(0, 10)) console.log(" ", k, "| no card:", U(a.out[k]), "| cards first:", U(c.out[k]));
const dk = keys.filter((k) => / k=דבר$/u.test(a.out[k]));
for (const k of dk) console.log("  the key's own places:", k, "| no card:", a.out[k].replace(/ k=.*/u, ""), "| cards first:", c.out[k].replace(/ k=.*/u, ""));
if (a.errors.length || c.errors.length) console.log("page errors:", a.errors.slice(0, 2), c.errors.slice(0, 2));
