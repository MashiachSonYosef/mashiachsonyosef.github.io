// Finding 13, by the sources' shelves: switch the shelves off in a given order (real clicks on the rail) and after each
// press say which run lines went bare, whether each is the element that stood before the press, and its title.
// node f13c.mjs <book> <label> <extra query> <order, e.g. 2,0,1>
import { open, noHe } from "./lib.mjs";
const [BOOK, LABEL, EXTRA = "", ORDER = "0,1,2"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}#${LABEL}`);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1500);
const snap = (tag) => p.evaluate((tag) => { const out = { n: 0, same: 0, bare: 0, stale: [], span: window.__spanStore ? `${window.__spanStore.laid} laid, ${window.__spanStore.rested} rested` : "" }; for (const r of document.querySelectorAll(".wjoin")) { if (!r.__key) continue; const g = r.querySelector(":scope > .g"); if (!g) continue; out.n++; const seen = !!g.__probeSeen; if (seen) out.same++; if (g.classList.contains("bare")) { out.bare++; if (g.title && out.stale.length < 3) out.stale.push(`${(r.closest("section.seg").querySelector(".vnum") || {}).textContent} key=${r.__key} line[${g.className}] text=${JSON.stringify(g.textContent)} title=${JSON.stringify(g.title)} ${seen ? "(the element that stood before this press)" : "(a new element)"}`); else if (g.title) out.stale.push(""); } g.__probeSeen = true; } return out; }, tag);
const s0 = await snap("before"); console.log(`before: run lines ${s0.n}; span places ${s0.span}`);
await p.evaluate(() => { window.scrollTo(0, 0); document.querySelector("#rail > summary").click(); }); await p.waitForTimeout(500);
for (const i of ORDER.split(",").map(Number)) {
  const box = await p.evaluate((i) => { const x = document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw')[i]; x.scrollIntoView({ block: "center" }); const r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, lab: x.getAttribute("aria-label") || x.title }; }, i);
  await p.mouse.click(box.x, box.y); await p.waitForTimeout(2500);
  const s = await snap();
  console.log(`pressed «${box.lab}» -> rail "${await p.evaluate(() => (document.querySelector("#rail .src-sum") || {}).textContent)}"; run lines ${s.n}, the same elements ${s.same}; span places ${s.span}; bare ${s.bare}; bare with a title ${s.stale.length}`);
  for (const l of s.stale.filter(Boolean)) console.log("     STALE " + noHe(l));
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
