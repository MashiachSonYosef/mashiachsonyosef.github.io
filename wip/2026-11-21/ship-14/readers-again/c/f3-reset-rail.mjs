// Finding 3: does the reset pill (or any switch that draws the rail again) leave the rail without its dictionary strip?
// node f3-reset-rail.mjs [book] [extra query]
import { open } from "./lib.mjs";
const [BOOK = "obadiah", EXTRA = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}`);
const rail = () => p.evaluate(() => {
  const n = (id) => { const x = document.getElementById(id); return x ? x.childElementCount : null; };
  const mt = document.getElementById("marksToggle");
  return {
    sourcesRow: n("sourcesRow"), chips: document.querySelectorAll("#sourcesRow .src-row").length,
    kindsRow: n("kindsRow"), defRow: n("defRow"), pairRow: n("pairRow"), readsRow: n("readsRow"),
    marksToggle: mt ? (mt.isConnected ? `in ${mt.parentElement.className}` : "detached") : null,
    railNow: document.getElementById("railNow").textContent,
    reset: { disabled: document.getElementById("resetPill").disabled, state: document.getElementById("resetState").textContent },
  };
});
console.log("at load:", JSON.stringify(await rail()));
// at rest the reader's road to a second railSwitch: the word senses pill, then reset
await p.click("#sensesPill"); await p.waitForTimeout(1200);
console.log("word senses on:", JSON.stringify(await rail()));
await p.click("#resetPill"); await p.waitForTimeout(1500);
console.log("after reset:", JSON.stringify(await rail()));
if (EXTRA.includes("rail=all")) {
  // the report's own road: source signs "as printed", then reset
  await p.evaluate(() => { document.getElementById("rail").open = true; const m = document.querySelector("#railRows details.more-switches"); if (m) m.open = true; });
  const pressed = await p.evaluate(() => { const row = document.querySelector('#railRows .row[data-toggle="signs"]'); const bs = row ? [...row.querySelectorAll("button")] : []; const x = bs.find((y) => y.getAttribute("aria-pressed") !== "true" && !y.disabled); if (x) x.click(); return x ? x.textContent : `no button (${bs.map((y) => y.textContent).join("|")})`; });
  await p.waitForTimeout(1200);
  console.log("signs pressed:", pressed, JSON.stringify(await rail()));
  await p.click("#resetPill"); await p.waitForTimeout(1500);
  console.log("after reset (rail=all):", JSON.stringify(await rail()));
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
