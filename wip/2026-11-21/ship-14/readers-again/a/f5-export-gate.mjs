// Finding 5: is a verse's export gated by the pointing of whichever card was opened last?
// Amos holds the letters U+05D3 U+05D1 U+05E8 under several pointings and entries: 4:10 word 3 (H1698), 3:7 word 6 (H1697),
// 3:1 word 6 (H1696). A reading is ruled on the card at 4:10; the verse 4:10 is exported; then a card on the same
// letters elsewhere is only opened and shut, and the same verse exported again; then a card on other letters.
// node f5-export-gate.mjs [pill text to press]
import { open, T, U, waitCard } from "./lib.mjs";
import { readFileSync } from "node:fs";
const WANT = process.argv[2] || "";
const { b, p, errors } = await open("amos");
const goto = (si) => p.evaluate(async (si) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); }, si);
const cellSel = (si, wi) => p.evaluate(({ si, wi }) => { const z = window.__zone; const wb = [...document.querySelectorAll(`#s${si} .he-text .wb`)].find((x) => x.__word === z.sections[si].words[wi]); if (!wb) return null; wb.dataset.probe = `c${si}-${wi}`; return `[data-probe="c${si}-${wi}"]`; }, { si, wi });
const lineOf = (sel) => p.evaluate((sel) => { const wb = document.querySelector(sel); const run = wb.closest(".wjoin"); const g = wb.querySelector(":scope > .g") || (run && run.querySelector(":scope > .g")); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); const chip = g.querySelector(".g-lic"); return `${JSON.stringify(c.textContent.trim())} chip=${chip ? `${chip.textContent}/${chip.dataset.line || ""}` : "NONE"}`; }, sel);
const openCard = async (sel) => { await p.evaluate((sel) => { const wb = document.querySelector(sel); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, sel); await waitCard(p); };
const shut = async () => { await p.keyboard.press("Escape"); await p.waitForTimeout(700); };
const exportVerse = async (si, tag) => {
  await goto(si);
  await p.evaluate((si) => { const sec = document.getElementById(`s${si}`); const o = sec.querySelector(".xp-open"); const m = sec.querySelector(".xp-menu"); if (!m || !m.offsetParent || o.getAttribute("aria-expanded") !== "true") o.click(); }, si);
  await p.waitForTimeout(500);
  const btn = p.locator(`#s${si} .xp-menu .xp-row`).first().locator('button[aria-label="Export Hebrew + English"]');
  await btn.click();
  await p.waitForFunction((si) => { const x = document.querySelector(`#s${si} .xp-menu .xp-row button[aria-label="Export Hebrew + English"]`); return x && x.classList.contains("armed"); }, si, { timeout: 30000 });
  const note = await p.evaluate((si) => document.querySelector(`#s${si} .xp-menu .xp-row .xp-note`).textContent, si);
  const [dl] = await Promise.all([p.waitForEvent("download"), btn.click()]);
  const path = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s18w/readers-again/a/out-f5-${tag}.md`;
  await dl.saveAs(path);
  const text = readFileSync(path, "utf8");
  console.log(`  [${tag}] the menu says: ${note.replace(/ · in our words:.*?(?= · \d+ reading|\. Press)/u, "")}`);
  // the record block of 4:10:3 in "Records, as received", and any line under "Withheld" that names it
  const blocks = text.split(/\n\n+/u);
  const mine = blocks.filter((x) => /Amos 4:10:3\b|\b4:10:3\b/u.test(x));
  console.log(`  [${tag}] the file on 4:10:3:`); for (const x of mine) console.log(x.split("\n").map((l) => "      " + U(l).slice(0, 300)).join("\n"));
  if (!mine.length) console.log("      (no block names 4:10:3)");
  return text;
};
await goto(55);
const W = await cellSel(55, 2);
console.log("4:10 word 3 at rest:", await lineOf(W));
await openCard(W);
const pills = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.textContent + (x.classList.contains("on") || x.getAttribute("aria-pressed") === "true" ? "*" : "")));
console.log("its card, graded by", U(await p.evaluate(() => window.__cardGradedBy)), "pills:", JSON.stringify(pills.slice(0, 12)));
const pressed = await p.evaluate((want) => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = (want && xs.find((y) => y.textContent.trim() === want)) || xs.find((y) => !(y.classList.contains("on") || y.getAttribute("aria-pressed") === "true")); x.click(); return x.textContent; }, WANT);
await p.waitForTimeout(900); await shut();
console.log("pressed:", JSON.stringify(pressed), "| the line now:", await lineOf(W));
const t1 = await exportVerse(55, "1-own-card-last");
// a card on the same letters, another pointing: opened and shut, nothing pressed
await goto(37); const W2 = await cellSel(37, 5);
await openCard(W2); console.log("opened and shut 3:7 word 6, graded by", U(await p.evaluate(() => window.__cardGradedBy)), "entry", await p.evaluate(() => window.__cardEntry)); await shut();
const t2 = await exportVerse(55, "2-other-pointing-last");
// a card on other letters, opened and shut
await goto(55); const W3 = await cellSel(55, 0);
await openCard(W3); console.log("opened and shut 4:10 word 1, graded by", U(await p.evaluate(() => window.__cardGradedBy))); await shut();
const t3 = await exportVerse(55, "3-other-letters-last");
const strip = (t) => t.split("\n").filter((l) => !/this file left|exported|^- .*sha256/iu.test(l)).join("\n");
console.log("file 1 == file 2:", strip(t1) === strip(t2), "| file 1 == file 3:", strip(t1) === strip(t3), "| file 2 == file 3:", strip(t2) === strip(t3));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
