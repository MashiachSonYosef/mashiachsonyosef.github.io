// Finding 9 on its own: Lamentations 1:6 word 2, a pair whose written branch is two words (the several-word branch
// keeps a ruled written word on the line at a repaint). Rule one written word, read the chip; press a source chip
// off and on (a repaint); read the chip again.
import { open, T, waitCard } from "./lib.mjs";
const SI = 5;
const { b, p, errors } = await open("lamentations");
await p.evaluate(async (si) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); }, SI);
const pairLine = () => p.evaluate((si) => {
  const wb = document.querySelector(`#s${si} .he-text .wb.kq`); if (!wb) return "no pair drawn";
  const g = wb.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chip = g.querySelector(".g-lic");
  const halves = [...wb.querySelectorAll(".w .wr")].map((x) => `${/^ketiv/.test(x.title) ? "ketiv" : "qere"}${x.classList.contains("backs-en") ? "*" : ""}`);
  return `line=${JSON.stringify(c.textContent.trim())} chip=${chip ? `${chip.textContent}/${chip.dataset.line || ""}` : "NONE"} backs=${halves.join(",")} chosen=${wb.classList.contains("chosen")}`;
}, SI);
const flip = async (key) => { const r = await p.evaluate((key) => { const x = document.querySelector(`#sourcesRow button.dfp[data-key="${key}"]`); if (!x) return "no chip"; x.click(); return `pressed ${key}; off now: ${JSON.stringify(window.__sourcesOff)}`; }, key); await p.waitForTimeout(2500); return r; };
console.log("at rest:        ", await pairLine());
await p.evaluate((si) => document.querySelector(`#s${si} .he-text .wb.kq .w .wr.backs-en`).click(), SI);
await waitCard(p);
await p.evaluate(() => document.querySelector("#hud .head b span[role=button]").click());
await p.waitForTimeout(600); await waitCard(p);
const dump = () => p.evaluate(() => { const h = document.getElementById("hud"); return { head: h.querySelector(".head b").textContent + " | " + [...h.querySelectorAll(".head .kq-role")].map((x) => x.textContent).join(" | "), rows: [...h.querySelectorAll(".rows > *")].map((x) => `${x.className} :: ${x.textContent.slice(0, 160)}`), pills: [...h.querySelectorAll(".b-read .r-pills button")].map((x) => x.textContent + (x.classList.contains("on") || x.getAttribute("aria-pressed") === "true" ? "*" : "")) }; });
let d = await dump();
console.log("card on the written branch:", T(d.head)); console.log(d.rows.map(T).join("\n")); console.log("pills:", JSON.stringify(d.pills.slice(0, 8).map(T)));
// the card opens on the written branch whole; its blocks are the two written words. Take the second block and a pill not lit.
const step = async (sel, pick) => { const r = await p.evaluate(({ sel, pick }) => { const xs = [...document.querySelectorAll(sel)]; const x = new Function("xs", pick)(xs); if (x) x.click(); return x ? x.textContent : null; }, { sel, pick }); await p.waitForTimeout(900); return r; };
console.log("cut:", T(await step("#hud .b-cut .s-pills button", process.argv[2] === "whole" ? "return null" : "return xs.find((x) => x.textContent.includes('+'))")));
console.log("cells:", JSON.stringify((await p.evaluate(() => [...document.querySelectorAll("#hud .b-cell .s-pills button")].map((x) => x.textContent + (x.classList.contains("on") || x.getAttribute("aria-pressed") === "true" ? "*" : "")))).map(T)));
console.log("cell:", T(await step("#hud .b-cell .s-pills button", process.argv[2] === "whole" ? "return null" : `return xs[${process.argv[3] || 1}]`)));
d = await dump(); console.log("pills now:", JSON.stringify(d.pills.slice(0, 8).map(T)));
const pressed = await step("#hud .b-read .r-pills button", process.argv[2] === "whole" ? "return xs[0]" : "return xs.find((y) => !(y.classList.contains('on') || y.getAttribute('aria-pressed') === 'true'))");
await p.waitForTimeout(900);
console.log("pressed pill:", JSON.stringify(T(pressed)), "| card says:", JSON.stringify(T(await p.evaluate(() => (document.querySelector("#hud .r-now") || {}).textContent))));
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
console.log("ruled (written):", await pairLine());
console.log(await flip("openscriptures_bdb_1906"));
console.log("one source off: ", await pairLine());
console.log(await flip("openscriptures_bdb_1906"));
console.log("source back on: ", await pairLine());
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
