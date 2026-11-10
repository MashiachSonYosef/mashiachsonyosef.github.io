// A pair's card opened on the half the reader chose, then a switch that closes and reopens the
// open card: which half stands open afterwards? Asked of each switch that reopens the card.
// node probe-reopen.mjs <reader dir> <zone url base> [book]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, bookArg] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
const book = bookArg || "ruth";
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
// read through until a pair is drawn
await p.evaluate(async () => { let g = 0; while (g < 3000 && !document.querySelector("section.seg .he-text .wb.kq")) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 10)); g += 1; } });
const state = () => p.evaluate(() => {
  const hud = document.getElementById("hud");
  if (!hud || hud.hidden) return { open: false };
  const segs = [...hud.querySelectorAll(".head b > span:not(.mq)")].map((s) => ({ t: s.textContent, lit: !s.style.color && s.style.fontWeight !== "400" }));
  const role = ((hud.querySelector(".head .kq-role") || {}).textContent || "").split(" ")[0];
  return { open: true, lit: segs.findIndex((s) => s.lit), segs: segs.length, role };
});
const openOther = async () => {
  await p.evaluate(() => { const w = document.querySelector("section.seg .he-text .wb.kq"); w.scrollIntoView({ block: "center" }); w.querySelectorAll(".wr")[0].click(); });
  await p.waitForTimeout(900);
  const first = await state();
  // the other half, pressed in the card's head
  await p.evaluate((lit) => { const segs = [...document.querySelectorAll("#hud .head b > span:not(.mq)")]; const other = segs.findIndex((s, i) => i !== lit && s.getAttribute("role") === "button"); if (other > -1) segs[other].click(); }, first.lit);
  await p.waitForTimeout(900);
  return { first, moved: await state() };
};
const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb.kq").length);
console.log(`${book}: ${n} pair(s) drawn`);
if (!n) { await b.close(); process.exit(0); }
const switches = {
  "the dictionary pill, twice": async () => { for (let i = 0; i < 2; i += 1) { await p.evaluate(() => document.getElementById("dictPill").click()); await p.waitForTimeout(1100); } },
  "the pointing position, there and back": async () => {
    for (let i = 0; i < 2; i += 1) {
      await p.evaluate(() => { document.querySelectorAll(".rail details").forEach((d) => { d.open = true; }); const row = document.querySelector('.rail .row[data-toggle="masorah"]'); const btn = row && [...row.querySelectorAll(".dfp")].find((e) => e.getAttribute("aria-pressed") !== "true" && !e.disabled); if (btn) btn.click(); });
      await p.waitForTimeout(1500);
    }
  },
  "one source off and on": async () => {
    for (let i = 0; i < 2; i += 1) {
      await p.evaluate(() => { document.querySelectorAll(".rail details").forEach((d) => { d.open = true; }); const row = document.querySelector('.rail .row[data-toggle="sources"]'); const btn = row && row.querySelector("button, .dfp, input"); if (btn) btn.click(); });
      await p.waitForTimeout(1300);
    }
  },
};
for (const [name, press] of Object.entries(switches)) {
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  const { first, moved } = await openOther();
  await press();
  const after = await state();
  console.log(`  ${name}: opened on half ${first.lit} (${first.role}), the reader pressed the other: half ${moved.lit} (${moved.role}); after the switch: ${after.open ? `half ${after.lit} (${after.role})` : "no card"} · ${after.open && after.lit === moved.lit ? "the same card" : "NOT the card the reader had open"}`);
}
await b.close();
