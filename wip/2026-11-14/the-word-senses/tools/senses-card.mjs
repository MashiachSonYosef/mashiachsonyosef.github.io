// A word's card under the word senses switch, off and on: its pills, the line that says what it withheld, and a picture.
// node senses-card.mjs <reader dir> <zone url> <book> <label> <word from 1, marks not counted> <out prefix>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, label, wnum, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
for (const senses of ["off", "on"]) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await p.goto(`${url}?b=${book}&senses=${senses}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const ok = await p.evaluate(async ([label, n]) => {
    const secs = [...document.querySelectorAll("section.seg")];
    const i = secs.findIndex((s) => ((s.querySelector(".vnum") || {}).textContent || "").trim() === label);
    if (i < 0) return "no section " + label;
    if (window.__materialise) await window.__materialise(i, i + 1);
    secs[i].scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 600));
    const wb = secs[i].querySelectorAll(".he-text .wb:not(.mark)")[n - 1];
    if (!wb) return "no word";
    wb.scrollIntoView({ block: "center" });
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
    return true;
  }, [label, Number(wnum)]);
  if (ok !== true) { console.log(senses, ok); continue; }
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const got = await p.evaluate(() => ({
    pills: [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.trim()}`),
    withheld: (document.querySelector("#hud .withheld-line") || {}).textContent || "",
    senses: window.__senses,
  }));
  console.log(`== senses ${senses} (page says ${got.senses}) · ${got.pills.length} pills`);
  console.log("   pills:", got.pills.slice(0, 14).join(" | ").slice(0, 600));
  console.log("   withheld line:", got.withheld);
  await p.screenshot({ path: `${out}-${senses}.png`, clip: await p.evaluate(() => { const r = document.getElementById("hud").getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(412, r.width), height: Math.min(915, r.height) }; }) });
  await p.close();
}
await b.close();
