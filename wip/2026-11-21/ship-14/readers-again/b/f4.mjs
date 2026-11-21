// Finding 4: with the concordance on, a block whose dictionary shard fails is asked again from inside its own failure.
// The shard requests are counted; from the moment a block is pressed every shard request is failed (page.route abort),
// for SECS seconds; then the network is let through again.
// node f4.mjs <book> <label> <idx> [secs] [block index to press]
import { open, mask, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX, SECS = "5", BLOCK = ""] = process.argv.slice(2);
let failing = false; const asked = []; const t0 = Date.now();
const { b, p, errors } = await open(`b=${BOOK}&dict=on`, { route: async (p) => {
  await p.route("**/data/dictionary-store/shards/*", (r) => { asked.push({ t: Date.now() - t0, u: r.request().url().replace(/^.*shards\//u, ""), failed: failing }); return failing ? r.abort("failed") : r.continue(); });
} });
const src = cellSrc(LABEL, IDX);
await clickWord(p, src);
await p.waitForSelector("#hud .dict-tab table, #hud .dict-tab .note", { timeout: 10000 }).catch(() => {});
await p.waitForTimeout(1500);
const blocks = () => p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-cell .s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`));
const tabSays = () => p.evaluate(() => { const t = document.querySelector("#hud .dict-tab"); if (!t) return null; const hit = [...t.querySelectorAll("*")].find((x) => x.children.length === 0 && /did not answer/u.test(x.textContent)); return hit ? hit.textContent : `(no failure line; ${t.querySelectorAll("tr").length} table rows)`; });
console.log("blocks on the card (* pressed):", JSON.stringify((await blocks()).map(mask)));
console.log("shard requests before the block is pressed:", asked.length, JSON.stringify(asked.map((a) => a.u)));
const before = asked.length;
// press a block that is not pressed (and whose letters are not the whole word's)
failing = true;
const pressedBlock = await p.evaluate((want) => { const xs = [...document.querySelectorAll("#hud > .rows .b-cell .s-pills button")]; const x = want !== "" ? xs[Number(want)] : xs.find((y) => y.getAttribute("aria-pressed") !== "true"); if (x) x.click(); return x ? xs.indexOf(x) : -1; }, BLOCK);
const tPress = Date.now() - t0;
console.log("pressed block index:", pressedBlock, "with every shard request failing from now");
for (let s = 1; s <= Number(SECS); s++) {
  await p.waitForTimeout(1000);
  const n = asked.length - before;
  console.log(`  after ${s}s: ${n} shard requests since the press; table says: ${JSON.stringify(await tabSays())}`);
}
const during = asked.slice(before);
const urls = [...new Set(during.map((a) => a.u))];
console.log("distinct shard files asked while failing:", JSON.stringify(urls));
console.log("no reader action was taken after the one press; requests in the last second:", during.filter((a) => a.t > tPress + (Number(SECS) - 1) * 1000).length);
failing = false; const mark = asked.length;
await p.waitForTimeout(2000);
console.log("network restored, no press: requests in the next 2s:", asked.length - mark, "| table says:", JSON.stringify(await tabSays()));
console.log("blocks now:", JSON.stringify((await blocks()).map(mask)));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
