// Finding 9: the rail's one line says "N dictionaries · K off"; is K a count of chips (dictionaries) or of ledger ids?
// node f9-rail-count.mjs [book]
import { open } from "./lib.mjs";
const [BOOK = "obadiah"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
const say = () => p.evaluate(() => {
  const chips = [...document.querySelectorAll("#sourcesRow .src-row")];
  return {
    railLine: document.querySelector('#railNow b[data-toggle="sources"]').textContent,
    foldLine: (document.querySelector("#sourcesRow .src-sum") || {}).textContent,
    idsOff: (window.__sourcesOff || []).join(" ") || "(window.__sourcesOff unset)",
    chipsOff: chips.filter((c) => c.classList.contains("off")).map((c) => `${c.dataset.key}[${c.querySelector("button.dfp").dataset.ids}]`),
  };
});
console.log("at rest:", JSON.stringify(await say()));
console.log("stored fh sources key:", await p.evaluate(() => Object.entries(localStorage).filter(([k]) => /source/i.test(k)).map(([k, v]) => `${k}=${v}`).join(" ; ") || "(none)"));
const chips = await p.evaluate(() => [...document.querySelectorAll("#sourcesRow .src-row")].map((c) => ({ key: c.dataset.key, name: c.querySelector(".src-name").textContent, ids: c.querySelector("button.dfp").dataset.ids.split(" ").length, on: c.querySelector("button.dfp").getAttribute("aria-pressed") })));
console.log("chips:", chips.map((c) => `${c.name}:${c.ids}${c.on === "true" ? "" : " (off)"}`).join(", "));
const many = chips.filter((c) => c.on === "true").sort((x, y) => y.ids - x.ids)[0];
await p.evaluate(() => { document.getElementById("rail").open = true; });
// the reader's press: the box of the chip that carries the most ledger ids
await p.evaluate((key) => { const c = [...document.querySelectorAll("#sourcesRow .src-row")].find((x) => x.dataset.key === key); c.querySelector("button.dfp").click(); }, many.key);
await p.waitForTimeout(1500);
console.log(`one chip off (${many.name}, ${many.ids} ids):`, JSON.stringify(await say()));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
