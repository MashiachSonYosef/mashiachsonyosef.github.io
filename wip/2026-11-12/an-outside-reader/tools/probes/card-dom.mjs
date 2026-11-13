// The shape of a word's card as the page draws it: the tree of the card with every element by its tag and classes,
// its own text and its data attributes, long strings cut short, so the rungs, the cells and the pill row can be found
// by what the page calls them.
// node card-dom.mjs <reader dir> <zone url with its query> <section index> <word number, marks not counted> [--lift]
// Nothing is written. It prints; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const LIFT = argv.includes("--lift"); if (LIFT) argv.splice(argv.indexOf("--lift"), 1);
const [reader, url, secArg, wordArg] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(url, { waitUntil: "networkidle" });
if (LIFT) { await p.evaluate(() => { localStorage.setItem("fh.masorah", "keep"); localStorage.setItem("fh.signs", "printed"); localStorage.setItem("fh.sources.off", "[]"); }); await p.reload({ waitUntil: "networkidle" }); }
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
await p.evaluate(async ({ i, n }) => {
  const s = document.getElementById(`s${i}`);
  window.__materialise(i, i + 1);
  const wb = [...s.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
  wb.scrollIntoView({ block: "center" });
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
}, { i: Number(secArg), n: Number(wordArg) });
await p.waitForTimeout(2500);
const lines = await p.evaluate(() => {
  const out = [];
  const walk = (el, depth) => {
    if (depth > 6) return;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    const data = Object.entries(el.dataset || {}).map(([k, v]) => `${k}=${JSON.stringify(String(v).slice(0, 30))}`).join(" ");
    const aria = ["aria-pressed", "aria-expanded", "role", "type"].map((a) => (el.hasAttribute(a) ? `${a}=${el.getAttribute(a)}` : "")).filter(Boolean).join(" ");
    const kids = el.children.length;
    out.push(`${"  ".repeat(depth)}${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${[...el.classList].join(".")}${data ? ` {${data}}` : ""}${aria ? ` [${aria}]` : ""}${own ? ` "${own.slice(0, 50)}"` : ""}${depth === 6 && kids ? ` (+${kids} inside)` : ""}`);
    // a long row of pills: the first three and the count
    const list = [...el.children];
    const many = list.length > 8 && list.every((c) => c.tagName === list[0].tagName);
    (many ? list.slice(0, 3) : list).forEach((c) => walk(c, depth + 1));
    if (many) out.push(`${"  ".repeat(depth + 1)}… ${list.length - 3} more ${list[0].tagName.toLowerCase()}`);
  };
  walk(document.getElementById("hud"), 0);
  return out;
});
console.log(lines.join("\n"));
await b.close();
