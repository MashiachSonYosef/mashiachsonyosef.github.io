// The word senses for the owner: Obadiah 1:3 word 11 at rest, switched on, a purple pill pressed (the record, the legend), the header pill.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, label, wnum, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: Number(process.env.H || 915) }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" });
await p.evaluate(() => { try { localStorage.clear(); } catch { /* none */ } });
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const hud = async (name) => {
  const box = await p.evaluate(() => { const r = document.getElementById("hud").getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(innerWidth - Math.max(0, r.x), r.width), height: Math.min(innerHeight - Math.max(0, r.y), r.height) }; });
  await p.screenshot({ path: `${out}-${name}.png`, clip: box });
};
await p.evaluate((h) => { location.hash = h; }, `${label}:${wnum}`);
await p.waitForTimeout(2500);
const rest = await p.evaluate(() => {
  const w = document.querySelector("#hud .withheld-line");
  if (w) { let s = w.parentElement; while (s && s.scrollHeight <= s.clientHeight + 1) s = s.parentElement; if (s) s.scrollTop = s.scrollHeight; w.scrollIntoView({ block: "end" }); }
  return { line: w ? w.textContent.trim() : null, senses: document.querySelectorAll("#hud .r-pills button.sense").length };
});
console.log("1 at rest:", JSON.stringify(rest));
console.log("  where:", JSON.stringify(await p.evaluate(() => { const w = document.querySelector("#hud .withheld-line"); const h = document.getElementById("hud"); const r = w.getBoundingClientRect(), q = h.getBoundingClientRect(); return { line: [r.y, r.height], hud: [q.y, q.height, h.scrollHeight, h.clientHeight], inner: innerHeight, parent: w.parentElement.className }; })));
await p.waitForTimeout(400);
await hud("1-at-rest");
const sw = await p.evaluate(() => { const x = document.querySelector("#hud .withheld-line .senses-switch"); if (!x) return null; x.click(); return x.textContent.trim(); });
await p.waitForTimeout(1500);
const on = await p.evaluate(() => {
  const xs = [...document.querySelectorAll("#hud .r-pills button.sense")];
  if (xs[0]) xs[0].scrollIntoView({ block: "center" });
  return { pressedSwitch: null, pills: xs.map((x) => x.textContent.trim()), ink: xs[0] ? getComputedStyle(xs[0]).color : null };
});
console.log("2 switched on via «" + sw + "»:", JSON.stringify(on));
await p.waitForTimeout(400);
await hud("2-switched-on");
const pressed = await p.evaluate(async () => {
  const x = document.querySelector("#hud .r-pills button.sense"); if (!x) return null; x.click();
  await new Promise((r) => setTimeout(r, 400));
  const d = document.querySelector("#hud .d-card"); const lg = d && d.querySelector(".sense-legend");
  if (d) d.scrollIntoView({ block: "center" });
  return { pill: x.textContent.trim(), row: d ? d.dataset.row : null, text: d ? (d.querySelector(".d-text") || d).textContent.trim().slice(0, 160) : null, legend: lg ? lg.textContent.trim() : null };
});
console.log("3 pressed:", JSON.stringify(pressed));
await p.waitForTimeout(400);
await hud("3-pressed-record");
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
const pill = await p.evaluate(() => {
  const x = document.getElementById("sensesPill"); if (!x) return null;
  x.scrollIntoView({ block: "center" });
  const a = (x.closest(".mode-pick") || x).parentElement.getBoundingClientRect(); const r = { y: a.y - 70, height: a.height + 110 };
  return { text: x.textContent.trim(), pressed: x.getAttribute("aria-pressed"), visible: !!(x.offsetWidth || x.offsetHeight), box: { x: 0, y: Math.max(0, r.y - 12), width: innerWidth, height: Math.min(innerHeight - Math.max(0, r.y - 12), r.height + 24) } };
});
console.log("4 header pill:", JSON.stringify(pill && { text: pill.text, pressed: pill.pressed, visible: pill.visible }));
if (pill && pill.visible && pill.box.height > 0) { await p.waitForTimeout(300); await p.screenshot({ path: `${out}-4-header-pill.png`, clip: pill.box }); }
await b.close();
