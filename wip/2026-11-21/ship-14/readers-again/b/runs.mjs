// The cells of one verse as the page lays them: which words stand in a joined cell (.wjoin), its key, and its line.
// Then (optionally) a word is pressed and the card's head is printed, each word of it with its weight.
// node runs.mjs <book> <label> [idx to press | -] [extra query]
import { open, mask, noHe, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX = "-", EXTRA = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}#${LABEL}`);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1500);
const cells = await p.evaluate((label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
  const txt = (el) => { if (!el) return null; const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
  return [...sec.querySelectorAll(".he-text .wb")].map((wb, i) => {
    const run = wb.closest(".wjoin"), g = wb.querySelector(":scope > .g"), rg = run ? run.querySelector(":scope > .g") : null;
    return `${i} ${wb.querySelector(".w") ? wb.querySelector(".w").textContent : ""} | ${run ? `cell[${run.className}] key=${run.__key ? JSON.stringify(run.__key) : "none"} chain=${!!run.__chain} named=${!!run.__run} words=${run.__words ? run.__words.length : "-"}` : "own"} | wb.__run=${wb.__run ? JSON.stringify(wb.__run.spanKey || (wb.__run.keys || []).join(" ")) : "no"} | line=${JSON.stringify(txt(g))}${rg ? ` runline[${rg.className}]=${JSON.stringify(txt(rg))} fs=${rg.style.fontSize || "-"} title=${JSON.stringify(rg.title || "")}` : ""}`;
  });
}, LABEL);
console.log(cells.map(noHe).join("\n"));
if (IDX !== "-") {
  await clickWord(p, cellSrc(LABEL, IDX));
  const head = await p.evaluate(() => ({ wn: (document.querySelector("#hud .head .wn") || {}).textContent, segs: [...document.querySelectorAll("#hud .head b > span")].map((x) => `${JSON.stringify(x.textContent)} class=${x.className || "-"} weight=${getComputedStyle(x).fontWeight} inline=${x.style.fontWeight || "-"} role=${x.getAttribute("role") || "-"}`), b: (document.querySelector("#hud .head b") || {}).textContent, bw: document.querySelector("#hud .head b") ? getComputedStyle(document.querySelector("#hud .head b")).fontWeight : null,
    cuts: [...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`), cells: [...document.querySelectorAll("#hud .b-cell .s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`), bands: [...document.querySelectorAll("#hud > .rows > *")].map((x) => x.className), now: (document.querySelector("#hud .r-now") || {}).textContent, foot: [...document.querySelectorAll("#hud .prov, #hud .foot, #hud .r-prov")].map((x) => x.textContent.slice(0, 200)) }));
  console.log("card number:", head.wn, "| head:", noHe(head.b), "| b weight", head.bw);
  console.log(head.segs.map(noHe).join("\n"));
  console.log("bands:", head.bands.join(", "));
  console.log("divisions:", noHe(JSON.stringify(head.cuts)), "blocks:", noHe(JSON.stringify(head.cells)));
  console.log("label+reading:", mask(head.now));
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
