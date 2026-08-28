import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

// The address is derived, never typed: a check naming a book by hand goes
// stale the day that work is renamed, and this one did — it still asked for
// "1kings", an address retired in August. The argument wins; the fallback
// names a work that is actually published.
const URL = defaultZoneUrl();
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d="") => { if(!ok) bad++; console.log(`${ok?"  ok  ":"FAIL  "}${n}${d?"  ·  "+d:""}`); };
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", e => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg");

// The remembered case: a word read under a finer division, with a reading
// chosen for one of its blocks. The word is derived like the zone is — the
// first word of the first zone was true only while the first zone was a
// targum whose opening word carried a component system; at fleet scale the
// first zone is whatever sorts first, and its first word may carry none.
// So: the first word among the opening words that offers divisions.
const wordIx = await p.evaluate(async () => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb")].slice(0, 60);
  for (let i = 0; i < wbs.length; i += 1) {
    wbs[i].click();
    await new Promise((r) => setTimeout(r, 400));
    if (document.querySelectorAll("#hud .s-pills button").length > 1) return i;
    const x = document.querySelector("#hud .head button");
    if (x) x.click();
    await new Promise((r) => setTimeout(r, 150));
  }
  return -1;
});
if (wordIx < 0) { console.log("SKIPPED — none of the first 60 words offers a division; nothing to remember"); process.exit(3); }
await p.waitForSelector("#hud .s-pills button", { timeout: 20000 });
const cuts = await p.evaluate(() => [...document.querySelectorAll("#hud .s-pills button")].map(b => b.textContent.trim()));
check("the form offers its divisions", cuts.length > 1, cuts.slice(0, 4).join(" | "));
await p.evaluate(() => document.querySelectorAll("#hud .s-pills button")[1].click());
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.waitForTimeout(600);
const pool = await p.evaluate(() => [...document.querySelectorAll("#hud .r-pills button")].map(b => b.textContent.trim()));
const pick = Math.min(1, pool.length - 1);
await p.evaluate((i) => document.querySelectorAll("#hud .r-pills button")[i].click(), pick);
await p.waitForTimeout(400);
const g1 = await p.evaluate((i) => document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g").textContent.trim(), wordIx);
console.log(`  chose division "${cuts[1]}" and reading "${pool[pick]}"  →  ${g1}`);

await p.evaluate(() => document.querySelector("#hud .head button").click());
await p.waitForTimeout(300);
const g2 = await p.evaluate((i) => document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g").textContent.trim(), wordIx);
check("closing the card leaves it on the page", g2 === g1, g2);

await p.evaluate((i) => document.querySelectorAll("section.seg .he-text .wb")[i].click(), wordIx);
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.waitForTimeout(700);
const after = await p.evaluate((i) => ({
  gloss: document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g").textContent.trim(),
  cut: [...document.querySelectorAll("#hud .s-pills button")].find(b => b.getAttribute("aria-pressed") === "true")?.textContent.trim(),
  lit: [...document.querySelectorAll("#hud .r-pills button")].find(b => b.getAttribute("aria-pressed") === "true")?.textContent.trim(),
}), wordIx);
check("reopening keeps the division", after.cut === cuts[1], `${after.cut}`);
check("reopening keeps the reading lit", after.lit === pool[pick], `${after.lit}`);
check("reopening keeps the page gloss", after.gloss === g1, after.gloss);

// a second word is untouched
await p.evaluate((i) => document.querySelectorAll("section.seg .he-text .wb")[i + 1].click(), wordIx);
await p.waitForSelector("#hud .s-pills button, #hud .r-pills button", { timeout: 20000 });
await p.waitForTimeout(400);
const other = await p.evaluate(() => {
  const cs = [...document.querySelectorAll("#hud .s-pills button")];
  return { firstLit: cs.length ? cs[0].getAttribute("aria-pressed") === "true" : true };
});
check("another word still opens on the whole form", other.firstLit);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
