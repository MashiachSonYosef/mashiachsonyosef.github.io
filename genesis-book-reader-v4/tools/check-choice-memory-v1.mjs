import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d="") => { if(!ok) bad++; console.log(`${ok?"  ok  ":"FAIL  "}${n}${d?"  ·  "+d:""}`); };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", e => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto("http://127.0.0.1:8899/zone.html?b=1kings", { waitUntil: "networkidle" });
await p.waitForSelector("section.seg");

// Kyle's case: the first word of 1 Kings, read under a finer division, with a
// reading chosen for one of its blocks.
await (await p.$("section.seg .he-text .wb")).click();
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
const g1 = await p.evaluate(() => document.querySelector("section.seg .he-text .wb .g").textContent.trim());
console.log(`  chose division "${cuts[1]}" and reading "${pool[pick]}"  →  ${g1}`);

await p.evaluate(() => document.querySelector("#hud .head button").click());
await p.waitForTimeout(300);
const g2 = await p.evaluate(() => document.querySelector("section.seg .he-text .wb .g").textContent.trim());
check("closing the card leaves it on the page", g2 === g1, g2);

await (await p.$("section.seg .he-text .wb")).click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.waitForTimeout(700);
const after = await p.evaluate(() => ({
  gloss: document.querySelector("section.seg .he-text .wb .g").textContent.trim(),
  cut: [...document.querySelectorAll("#hud .s-pills button")].find(b => b.getAttribute("aria-pressed") === "true")?.textContent.trim(),
  lit: [...document.querySelectorAll("#hud .r-pills button")].find(b => b.getAttribute("aria-pressed") === "true")?.textContent.trim(),
}));
check("reopening keeps the division", after.cut === cuts[1], `${after.cut}`);
check("reopening keeps the reading lit", after.lit === pool[pick], `${after.lit}`);
check("reopening keeps the page gloss", after.gloss === g1, after.gloss);

// a second word is untouched
const wbs = await p.$$("section.seg .he-text .wb");
await wbs[2].click();
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
