// Finding 9: the page-level redraw hook keeps the previous block after the reader moves to a block with no pool.
// Open a divided word (pills arrive), press a division/block that stands on no pool, then press a rail switch that
// redraws the open card, and print the read row each time.
// node f9.mjs <book> <label> <idx> <cut index with no pool> <switch label> <position label> [extra query] [width]
import { chromium, BASE, ready, mask, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX, CUT, SW, POS, EXTRA = "", WIDTH = "412"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(WIDTH), height: 915 } });
const errors = []; p.on("pageerror", (e) => errors.push(String(e && e.message)));
await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
await p.goto(`${BASE}?b=${BOOK}${EXTRA}`, { waitUntil: "networkidle" }); await ready(p);
const src = cellSrc(LABEL, IDX);
// the rail opened first, as a reader who means to press its switches has it
await p.evaluate(() => { const d = document.querySelector("#rail"); d.querySelector("summary").click(); }); await p.waitForTimeout(600);
await p.evaluate(() => { const m = document.querySelector("#rail .more-switches"); if (m && !m.hidden) m.querySelector("summary").click(); }); await p.waitForTimeout(400);
console.log("rail open:", await p.evaluate(() => document.querySelector("#rail").open), "| the fold of the other switches:", await p.evaluate(() => { const m = document.querySelector("#rail .more-switches"); return m.hidden ? "not drawn (hidden)" : `drawn, open=${m.open}`; }));
const readRow = () => p.evaluate(() => { const r = document.querySelector("#hud > .rows .b-read"); if (!r) return null; const kids = [...(r.querySelector(".r-pills") ? r.querySelector(".r-pills").parentNode.children : r.children)].map((x) => x.classList.contains("r-pills") ? `[${x.querySelectorAll("button").length} pills]` : x.tagName === "P" ? `<${x.className}> ${x.textContent.slice(0, 110)}` : `(${x.tagName.toLowerCase()}.${x.className})`); const all = [...r.querySelectorAll("p")].map((x) => `<${x.className}> ${x.textContent.slice(0, 110)}`); return { kids, all, pills: r.querySelectorAll(".r-pills button").length, pool: (window.__pool || []).length, pool0: (window.__pool || [])[0] || null }; });
const show = async (tag) => { const r = await readRow(); console.log(`-- ${tag}: pills drawn ${r.pills}; window.__pool ${r.pool} (first ${JSON.stringify(mask(r.pool0))})`); for (const l of r.all.filter((x) => !/^<r-(dflt|piece)/u.test(x))) console.log("     " + mask(l)); };
await clickWord(p, src);
console.log("blocks (* pressed):", JSON.stringify(mask(await p.evaluate(() => [...document.querySelectorAll("#hud .b-cut .s-pills button, #hud .b-cell .s-pills button")].map((x) => `${x.closest(".b-cut") ? "cut" : "block"}:${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`).join("  ")))));
await show("1. the card as it opens (a block with a pool)");
await p.evaluate((c) => document.querySelectorAll("#hud .b-cut .s-pills button")[c].click(), Number(CUT)); await p.waitForTimeout(1200);
await show(`2. after pressing division ${CUT} (no pool)`);
// the switch, pressed as a reader presses it where a pointer can reach it
const where = await p.evaluate(({ sw, pos }) => {
  const l = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith(sw) && !(sw === "license" && x.textContent.startsWith("license runs")));
  const x = l && [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === pos);
  if (!x) return { found: false, labs: [...document.querySelectorAll(".row .lab")].map((q) => q.textContent.slice(0, 22)) };
  const rail = x.closest("#rail"); const railOpen = rail ? rail.open : null;
  let r = null, top = null;
  for (const block of ["center", "start", "end"]) { x.scrollIntoView({ block }); r = x.getBoundingClientRect(); top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (top === x || (top && x.contains(top))) break; }
  return { found: true, railOpen, shown: !!x.offsetParent, x: r.left + r.width / 2, y: r.top + r.height / 2, hit: top === x || (top && x.contains(top)), over: top ? `${top.tagName.toLowerCase()}#${top.id}.${String(top.className).slice(0, 30)}` : null, hudHidden: document.querySelector("#hud").hidden };
}, { sw: SW, pos: POS });
console.log("the switch button:", JSON.stringify(where));
let how = "";
if (where.found && where.shown && where.hit) { await p.mouse.click(where.x, where.y); how = "a real pointer click on the rail button, the card still open"; }
else if (where.found) { await p.evaluate(({ sw, pos }) => { const l = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith(sw) && !(sw === "license" && x.textContent.startsWith("license runs"))); [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === pos).click(); }, { sw: SW, pos: POS }); how = "the button's own click handler called in the page (no pointer reaches it here)"; }
await p.waitForTimeout(1500);
console.log("pressed by:", how, "| card open:", await p.evaluate(() => !document.querySelector("#hud").hidden));
await show(`3. after the switch «${SW}: ${POS}»`);
console.log("blocks now:", JSON.stringify(mask(await p.evaluate(() => [...document.querySelectorAll("#hud .b-cut .s-pills button, #hud .b-cell .s-pills button")].map((x) => `${x.closest(".b-cut") ? "cut" : "block"}:${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`).join("  ")))));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
