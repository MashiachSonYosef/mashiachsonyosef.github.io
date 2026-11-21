// Finding 7, what the reader then meets: after a first visit on which the Samaritan overlay's index failed once,
// does a card show Uhlemann's Latin (MSAM2), the source the owner ruled to rest off?
// At rest the Samaritan dictionaries are shut with the dictionaries that rest shut, so the card is read twice:
// at rest, and with "Shut at rest: open" pressed on the sources row.
// node f7-latin-on-card.mjs fail|ok [book]   (tikkunei-zohar: a work the record does not rest shut, so its cards are read at rest only)
import { chromium, BASE, ready, waitCard, U } from "./lib.mjs";
import { readFileSync } from "node:fs";
const mode = process.argv[2] || "fail";
const BOOK = process.argv[3] || "genesis";
const KEYS = Object.keys(JSON.parse(readFileSync(new URL("./msam2-keys.json", import.meta.url), "utf8")));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
if (mode === "fail") await p.route("**/data/overlays/samaritan/index.json", (route) => route.abort("failed"));
await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" }); await ready(p);
await p.unroute("**/data/overlays/samaritan/index.json").catch(() => {});
await p.reload({ waitUntil: "networkidle" }); await ready(p);
console.log(`second visit after a first visit ${mode === "fail" ? "with the overlay's index aborted" : "with nothing failing"}: off =`, JSON.stringify(await p.evaluate(() => window.__sourcesOff)), "| rests shut includes MSAM2:", await p.evaluate(() => (window.__restsOffIds || []).includes("MSAM2")), "| the dictionaries rest shut on this book's cards:", await p.evaluate(() => window.__kindsHere), "| pointing:", await p.evaluate(() => window.__masorah));
// the first word of the book, in its first sections, whose key Uhlemann has a row for
const at = await p.evaluate((keys) => { const K = new Set(keys); const z = window.__zone; for (let si = 0; si < z.sections.length; si += 1) { const wi = z.sections[si].words.findIndex((w) => w.k && !w.kq && K.has(w.k) && !(w.pg && w.pg.length > 1)); if (wi >= 0) return { si, wi, label: z.sections[si].label, k: z.sections[si].words[wi].k }; } return null; }, KEYS);
console.log("word:", at.label, "word", at.wi + 1, U(at.k));
const read = async (tag) => {
  await p.evaluate(async ({ si, wi }) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1200)); const z = window.__zone; const wb = [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === z.sections[si].words[wi]); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, at);
  await waitCard(p); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const by = window.__poolBy || []; const pool = window.__pool || []; const i = by.findIndex((x) => x.split(" ").includes("MSAM2")); return { pills: pool.length, uhlemannPill: i >= 0 ? `pill ${i + 1}: ${pool[i].slice(0, 90)}` : "none", kinds: window.__kinds }; });
  console.log(`  ${tag}: ${r.pills} pills; a pill from Uhlemann (MSAM2): ${r.uhlemannPill}`);
  const notes = await p.evaluate(() => [...document.querySelectorAll("#hud .rows p, #hud .rows .held-line, #hud .rows button.more, #hud .rows summary")].map((x) => x.textContent.trim()).filter((t) => /withheld|held back|switched off|does not point|shut/iu.test(t)).map((t) => t.slice(0, 200)));
  for (const n of notes) console.log("      card note:", n);
  console.log("      sources on the card's pills:", [...new Set((await p.evaluate(() => window.__poolBy || [])).join(" ").split(" "))].filter((x) => /SAM/.test(x)).join(" ") || "(no Samaritan id)");
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
};
await read("card at rest (dictionaries that rest shut: shut)");
if (await p.evaluate(() => window.__kindsHere)) {
  await p.evaluate(() => document.querySelector('#kindsRow button.kinds-opt[data-kinds="open"]').click()); await p.waitForTimeout(2500);
  await read("card with \"Shut at rest: open\" pressed");
}
await b.close();
