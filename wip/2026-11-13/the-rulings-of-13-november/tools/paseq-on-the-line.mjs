// A place whose read form holds a paseq, on the line: its drawn text (the stylesheet's glyph included) with the marks
// off and on, whether the mark's own block shows, and what a press on the stroke opens. Changes nothing.
// node paseq-on-the-line.mjs <reader dir> <reader base url> <book> <label> <word number> [--shot <png>]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, book, label, nArg] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const shotAt = process.argv.indexOf("--shot");
const shot = shotAt > 0 ? process.argv[shotAt + 1] : null;
const n = Number(nArg);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: shot ? 2 : 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message || e)));
await page.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg", { timeout: 60000 });
const found = await page.evaluate(async (label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
  if (!sec) return false;
  sec.scrollIntoView({ block: "center" });
  for (let i = 0; i < 100 && !sec.querySelector(".he-text .wb"); i += 1) await new Promise((r) => setTimeout(r, 100));
  return !!sec.querySelector(".he-text .wb");
}, label);
if (!found) { console.log(`no drawn section ${label}`); await browser.close(); process.exit(1); }
const read = () => page.evaluate(({ label, n }) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
  const blocks = [...sec.querySelectorAll(".he-text .wb")];
  const words = blocks.filter((b) => !b.classList.contains("mark"));
  const site = words[n - 1];
  const at = blocks.indexOf(site);
  const mark = blocks[at + 1];
  // the text as drawn: text nodes, and the stroke's span as its drawn glyph set off by the space before a mark
  const drawn = (el) => {
    let out = "";
    const walk = (node) => {
      for (const c of node.childNodes) {
        if (c.nodeType === 3) out += c.data;
        else if (c.classList && c.classList.contains("kq-stroke")) {
          const ct = getComputedStyle(c, "::before").content;
          if (ct && ct !== "none" && ct !== "normal") out += ` ${JSON.parse(ct)}`;
        } else walk(c);
      }
    };
    walk(el);
    return out;
  };
  const w = site.querySelector(":scope > .w");
  const st = site.querySelector(".kq-stroke");
  const r = st ? st.getBoundingClientRect() : null;
  return {
    marksOn: document.body.classList.contains("marks-on"),
    text: w.textContent, drawn: drawn(w),
    stroke: st ? { data: st.dataset.s, inRegion: !!st.closest(".wr"), w: Math.round(r.width), h: Math.round(r.height) } : null,
    markShows: mark ? getComputedStyle(mark).display !== "none" : null,
    markClass: mark ? mark.className : null,
    before: at > 0 ? blocks[at - 1].querySelector(":scope > .w").textContent : null,
  };
}, { label, n });
const off = await read();
console.log("marks off:", JSON.stringify(off));
await page.evaluate(() => document.getElementById("marksToggle").click());
const on = await read();
console.log("marks on: ", JSON.stringify(on));
// a press on the stroke opens the mark's own card
const said = await page.evaluate(async ({ label, n }) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
  const site = [...sec.querySelectorAll(".he-text .wb")].filter((b) => !b.classList.contains("mark"))[n - 1];
  const st = site.querySelector(".kq-stroke");
  if (!st) return null;
  st.click();
  await new Promise((r) => setTimeout(r, 600));
  const hud = document.getElementById("hud");
  return hud && !hud.hidden ? hud.textContent.replace(/\s+/g, " ").trim().slice(0, 240) : "(no card)";
}, { label, n });
console.log("the stroke pressed:", said);
if (shot) {
  await page.evaluate(() => { const h = document.getElementById("hud"); if (h) h.hidden = true; });
  const sec = page.locator("section.seg", { has: page.locator(".vnum", { hasText: label }) }).first();
  await sec.screenshot({ path: shot });
  console.log("shot:", shot);
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await browser.close();
