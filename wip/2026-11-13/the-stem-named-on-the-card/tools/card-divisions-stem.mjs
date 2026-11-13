// One word's card, every division it offers pressed in turn (and every block of each): what the row of pills says
// the stem withheld, the stems it names, the line that says what was withheld, and how many pills stand. For
// proving whether the stem's count survives when the page keeps a filtered copy of a pool.
// node card-divisions-stem.mjs <reader dir (for its tools)> <zone.html address> <book> <section label> <word number>
// It measures; it changes nothing.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, address, book, label, wordArg] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
try {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
  await p.goto(`${address}?b=${book}&at=${encodeURIComponent(label)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(900);
  const out = await p.evaluate(async ({ label, n }) => {
    const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
    const words = sec ? [...sec.querySelectorAll(".he-text .wb")].filter((x) => !x.classList.contains("mark")) : [];
    const wb = words[n - 1];
    if (!wb) return [{ fault: "the word is not on the page" }];
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    const hud = document.getElementById("hud");
    const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
    const rest = async () => { const t0 = Date.now(); while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50)); await new Promise((r) => setTimeout(r, 500)); };
    await rest();
    const say = (what) => { const pills = hud.querySelector(".r-pills"); return { what, pills: pills ? pills.querySelectorAll("button").length : 0, stem: pills ? pills.dataset.stemWithheld : null, stems: pills ? pills.dataset.stems ?? null : null, withheld: pills ? pills.dataset.withheld : null, line: (hud.querySelector(".withheld-line") || {}).textContent || "", none: (hud.querySelector(".b-read .sources-withheld:not(span)") || {}).textContent || "", says: pills ? "" : [...hud.querySelectorAll(":scope > .rows > .b-read > p")].map((x) => x.textContent).join(" | ") }; };
    const rows = [say("as the card opens")];
    const names = (q) => [...hud.querySelectorAll(`:scope > .rows > ${q} .s-pills button`)].map((x) => x.textContent);
    const cuts = names(".b-cut");
    for (let c = 0; c < cuts.length; c += 1) {
      hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")[c].click();
      await rest();
      const cells = names(".b-cell");
      for (let k = 0; k < Math.max(1, cells.length); k += 1) {
        const btn = hud.querySelectorAll(":scope > .rows > .b-cell .s-pills button")[k];
        if (btn) { btn.click(); await rest(); }
        rows.push(say(`division ${c + 1} of ${cuts.length} «${cuts[c]}»${cells.length ? `, block ${k + 1} of ${cells.length} «${cells[k]}»` : ""}`));
      }
    }
    return rows;
  }, { label, n: Number(wordArg) });
  for (const r of out) console.log(JSON.stringify(r));
} finally { await b.close(); }
