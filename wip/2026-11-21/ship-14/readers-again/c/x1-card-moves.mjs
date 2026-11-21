// X1: on a phone (412x915), at rest, does a card move when a second pill is pressed on it?
// node x1-card-moves.mjs [book] [query, default &commentary=on; "-" for none] [word index in the first section] [which pill, default 1]
import { open, mask } from "./lib.mjs";
const [BOOK = "obadiah", Q = "&commentary=on", W = "0", PILL = "1"] = process.argv.slice(2);
const QUERY = Q === "-" ? "" : Q;
const { b, p, errors } = await open(`b=${BOOK}${QUERY}`);
await p.evaluate(() => {
  window.__trace = []; const t0 = performance.now();
  const hud = document.getElementById("hud");
  const snap = (why) => {
    const rows = hud.querySelector(".rows");
    const bands = rows ? [...rows.children].map((c) => `${(c.className.match(/b-\w+/u) || ["?"])[0]}:${c.offsetHeight}`).join(",") : "";
    window.__trace.push(`${Math.round(performance.now() - t0)}ms ${why}: style.top ${hud.style.top || "-"} box.top ${Math.round(hud.getBoundingClientRect().top * 10) / 10} h ${hud.offsetHeight} maxH ${hud.style.maxHeight || "-"} cls[${hud.className}] bands[${bands}] scrollY ${Math.round(window.scrollY)}`);
  };
  new MutationObserver((ms) => { for (const m of ms) if (m.attributeName === "style" || m.attributeName === "class") snap(m.attributeName); }).observe(hud, { attributes: true });
  window.__snap = snap;
});
const WB = `[...document.querySelector("section.seg").querySelectorAll(".he-text .wb:not(.mark)")][${Number(W)}]`;
const at = () => p.evaluate((src) => {
  const hh = document.getElementById("hud"), wb = eval(src), r = wb.getBoundingClientRect(), hr = hh.getBoundingClientRect();
  const bar = document.querySelector("section.seg .c-barrow"), br = bar ? bar.getBoundingClientRect() : null;
  const g = wb.querySelector(":scope > .g") || (wb.closest(".wjoin") || wb).querySelector(".g");
  return {
    cardTop: Math.round(hr.top * 10) / 10, cardBottom: Math.round(hr.bottom * 10) / 10, cardH: hh.offsetHeight, styleTop: hh.style.top,
    position: getComputedStyle(hh).position, word: `${Math.round(r.top)}..${Math.round(r.bottom)}`, scrollY: Math.round(window.scrollY),
    pills: hh.querySelectorAll(".r-pills button").length,
    lit: [...hh.querySelectorAll(".r-pills button")].findIndex((x) => x.getAttribute("aria-pressed") === "true" || x.classList.contains("on")),
    commentaryBar: br ? `${Math.round(br.top)}..${Math.round(br.bottom)}` : null, line: g ? g.textContent.slice(0, 40) : null,
  };
}, WB);
// the reader's press on the word: the first word of Obadiah stands at the foot of a phone's first screen (its top at 894
// of 915), so the browser brings it into view as a finger would have to, and no further
const target = await p.evaluateHandle((src) => { const wb = eval(src); return wb.querySelector(".w span") || wb.querySelector(".w"); }, WB);
if (process.argv[6] === "center") await p.evaluate((src) => eval(src).scrollIntoView({ block: "center" }), WB);
await target.asElement().click();
await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 20000 });
await p.waitForTimeout(1500);
await p.evaluate(() => window.__snap("the card at rest"));
const before = await at();
console.log(`${BOOK}${QUERY}, word ${W}, 412x915`);
console.log("card open:       ", mask(JSON.stringify(before)));
const pills = await p.$$("#hud .b-read .r-pills button");
const texts = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.textContent));
console.log("pills:", mask(JSON.stringify(texts.slice(0, 8))));
await p.evaluate((n) => window.__snap(`--- pill ${n} pressed`), Number(PILL) + 1);
if (pills.length > Number(PILL)) await pills[Number(PILL)].click(); else console.log("the card has no such pill");
await p.waitForTimeout(120);
const a1 = await at();
console.log("after 120ms:     ", mask(JSON.stringify(a1)));
await p.waitForTimeout(1600);
const a2 = await at();
console.log("after 1.7s:      ", mask(JSON.stringify(a2)));
const d = (x, y) => Math.round((x - y) * 10) / 10;
console.log(`the card's top moved ${d(a2.cardTop, before.cardTop)}px, its bottom ${d(a2.cardBottom, before.cardBottom)}px; the word moved ${Number(a2.word.split("..")[0]) - Number(before.word.split("..")[0])}px; the page scrolled ${a2.scrollY - before.scrollY}px`);
// the trace, one line per change of the card's place or size (a run of the same state is said once)
const trace = (await p.evaluate(() => window.__trace)).map(mask), said = [];
for (const t of trace) { const body = t.replace(/^\d+ms [^:]*: /u, ""); if (t.includes("---") || t.includes("at rest") || !said.length || said[said.length - 1].body !== body) said.push({ t, body }); }
console.log(said.map((x) => x.t).join("\n"));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
