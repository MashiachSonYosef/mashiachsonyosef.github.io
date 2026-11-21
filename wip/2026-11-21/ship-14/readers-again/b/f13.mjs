// Finding 13: when a run's line goes bare, its title keeps the old reading.
// Print the run lines of a verse, switch every shelf of sources off on the rail (real clicks), print them again.
// node f13.mjs <book> <label> [extra query] [only these source names off, comma separated]
import { open, noHe, mask } from "./lib.mjs";
const [BOOK, LABEL, EXTRA = "", ONLY = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}#${LABEL}`);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1500);
const lines = () => p.evaluate((label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
  const runs = [...sec.querySelectorAll(".wjoin")].filter((r) => r.__key);
  const out = runs.map((r) => { const g = r.querySelector(":scope > .g"); const same = g ? (g.__probeSeen ? "the same line element as before" : "a line element not seen before") : ""; if (g) g.__probeSeen = true; return `cell key=${r.__key} class="${r.className}" line[${g ? g.className : "-"}] text=${JSON.stringify(g ? g.textContent : null)} title=${JSON.stringify(g ? g.title : null)}${g && g.dataset.off ? " data-off=" + g.dataset.off : ""} (${same})`; });
  return out.length ? out : [`no keyed cell in ${label}; its words' lines: ${[...sec.querySelectorAll(".he-text .wb > .g")].map((g) => JSON.stringify(g.textContent.trim())).join(" ")}`];
}, LABEL);
console.log("-- before"); for (const l of await lines()) console.log("     " + noHe(l));
await p.evaluate(() => { window.scrollTo(0, 0); document.querySelector("#rail > summary").click(); }); await p.waitForTimeout(500);
if (ONLY) {
  for (const name of ONLY.split(",")) {
    const box = await p.evaluate((name) => { const o = [...document.querySelectorAll('.row[data-toggle="sources"] button.src-open')].find((x) => x.textContent === name); const x = o && o.previousElementSibling; if (!x) return null; x.scrollIntoView({ block: "center" }); const r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, pressed: x.getAttribute("aria-pressed") }; }, name);
    if (box) { await p.mouse.click(box.x, box.y); await p.waitForTimeout(700); console.log(`pressed the box of ${name} (was on=${box.pressed})`); } else console.log(`no box for ${name}`);
  }
} else {
  const n = await p.evaluate(() => document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw').length);
  for (let i = 0; i < n; i++) {
    const box = await p.evaluate((i) => { const x = document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw')[i]; x.scrollIntoView({ block: "center" }); const r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, lab: x.getAttribute("aria-label") || x.title }; }, i);
    await p.mouse.click(box.x, box.y); await p.waitForTimeout(800);
    console.log("pressed:", box.lab);
  }
}
await p.waitForTimeout(2500);
console.log("rail says:", JSON.stringify(await p.evaluate(() => (document.querySelector("#rail .src-sum") || {}).textContent)));
console.log("-- after"); for (const l of await lines()) console.log("     " + noHe(l));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
