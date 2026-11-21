// Findings 1 and 9: a one-word ketiv/qere pair (Daniel 2:43, word 1; its ketiv's letters stand as a plain word at
// 235 places of the book).
//   A  rule the pair's written half on its card; press a source chip off and on again (a repaint); read the line
//   B  rule a plain word spelled like the ketiv (2:44, word 2); the same switch; read the pair's line
//   C  B's ruling, then A's: the one state in which a one-word pair keeps a ruled ketiv on its line at a repaint,
//      so the chip of that line can be read before and after (finding 9 apart from finding 1)
//   S  no switch at all: rule a plain word spelled like the ketiv far above (2:8), then scroll on to 2:43,
//      whose section is built only then
// node f1-f9-pair-ruling.mjs A|B|C|S
import { open, T, U, waitCard } from "./lib.mjs";
const which = process.argv[2] || "A";
const SI = 63;   // Daniel 2:43
const { b, p, errors } = await open("daniel");
const goto = (si) => p.evaluate(async (si) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); }, si);
const pairLine = () => p.evaluate((si) => {
  const wb = document.querySelector(`#s${si} .he-text .wb.kq`); if (!wb) return "no pair drawn (section not built)";
  const g = wb.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chip = g.querySelector(".g-lic");
  const halves = [...wb.querySelectorAll(".w .wr")].map((x) => `${/^ketiv/.test(x.title) ? "ketiv" : "qere"}${x.classList.contains("backs-en") ? "*" : ""}`);
  return `line=${JSON.stringify(c.textContent.trim())} chip=${chip ? `${chip.textContent}/${chip.dataset.line || ""}` : "NONE"} underlined=${halves.join(",")} chosen=${wb.classList.contains("chosen")}`;
}, SI);
const flip = async (key) => { const r = await p.evaluate((key) => { const x = document.querySelector(`#sourcesRow button.dfp[data-key="${key}"]`); if (!x) return "no chip"; x.click(); return `source chip ${key} pressed; off now: ${JSON.stringify(window.__sourcesOff)}`; }, key); await p.waitForTimeout(2500); return r; };
const ruleKetiv = async () => {
  await p.evaluate((si) => document.querySelector(`#s${si} .he-text .wb.kq .w .wr.backs-en`).click(), SI);
  await waitCard(p);
  // the written half, in the card's head (pressed again if the card has not moved to it)
  for (let n = 0; n < 3; n += 1) {
    if (/^ketiv/.test(await p.evaluate(() => (document.querySelector("#hud .head .kq-role") || {}).textContent || ""))) break;
    await p.evaluate(() => { const x = document.querySelector('#hud .head b span[role=button][title*="ketiv"]'); if (x) x.click(); });
    await p.waitForTimeout(900); await waitCard(p);
  }
  console.log("card moved to:", await p.evaluate(() => (document.querySelector("#hud .head .kq-role") || {}).textContent));
  const pills = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.textContent + (x.classList.contains("on") || x.getAttribute("aria-pressed") === "true" ? "*" : "")));
  console.log("its pills:", JSON.stringify(pills.slice(0, 6).map(U)));
  const pressed = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = xs[1]; x.click(); return x.textContent; });
  await p.waitForTimeout(900);
  console.log("pressed:", JSON.stringify(U(pressed)));
  await p.keyboard.press("Escape"); await p.waitForTimeout(700);
};
const rulePlain = async (from, span) => {
  const where = await p.evaluate(({ si, from, span }) => {
    const z = window.__zone, kk = z.sections[si].words.find((w) => w.kq).w.find((x) => x.role === "KETIV").k;
    for (const d of span) { const sec = z.sections[from + d]; const wi = sec.words.findIndex((w) => !w.kq && w.k === kk); if (wi >= 0) return { si: from + d, wi, label: sec.label }; }
    return null;
  }, { si: SI, from, span });
  await goto(where.si);
  const cell = await p.evaluate(({ si, wi }) => {
    const z = window.__zone; const el = document.getElementById(`s${si}`);
    const wb = [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === z.sections[si].words[wi]);
    if (!wb) return "cell not found";
    wb.dataset.probe = "plain"; (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return "opened";
  }, where);
  await waitCard(p);
  const pressed = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = xs.find((y) => y.textContent.trim() === "whom") || xs[1]; x.click(); return x.textContent; });
  await p.waitForTimeout(900);
  await p.keyboard.press("Escape"); await p.waitForTimeout(700);
  const line = await p.evaluate(() => { const wb = document.querySelector('[data-probe="plain"]'); const run = wb.closest(".wjoin"); const g = wb.querySelector(":scope > .g") || (run && run.querySelector(":scope > .g")); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); });
  console.log(`a plain word with the ketiv's letters, ${where.label} word ${where.wi + 1}: ${cell}, pressed ${JSON.stringify(pressed)}, its line now ${JSON.stringify(line)}`);
};
if (which === "S") {
  await goto(28);   // 2:8
  console.log("2:43 before anything:", await pairLine());
  await rulePlain(28, [0, 1, -1, 2, -2, 3]);
  console.log("2:43 still:", await pairLine());
  await goto(SI);
  console.log("scrolled to 2:43:", await pairLine());
} else {
  await goto(SI);
  console.log("at rest:        ", await pairLine());
  if (which === "B" || which === "C") { await rulePlain(SI, [0, 1, -1, 2, -2]); await goto(SI); console.log("plain word ruled:", await pairLine()); }
  if (which === "A" || which === "C") { await ruleKetiv(); console.log("ketiv ruled:    ", await pairLine()); }
  console.log(await flip("openscriptures_bdb_1906"));
  console.log("one source off: ", await pairLine());
  console.log(await flip("openscriptures_bdb_1906"));
  console.log("source back on: ", await pairLine());
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
