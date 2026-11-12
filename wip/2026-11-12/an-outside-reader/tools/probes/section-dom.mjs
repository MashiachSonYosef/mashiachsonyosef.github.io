// The shape of a built section as the page draws it: the tree under its Hebrew text, every element by its tag and
// classes with its own text and data attributes, the Hebrew letters and the long strings cut short, so the way a
// line stands under a word, a joined run and a pair can be read off the page itself.
// node section-dom.mjs <reader dir> <zone url with its query> <section index> [<section index> ...]
// Nothing is written. It prints; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, ...secs] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
for (const i of secs) {
  const out = await p.evaluate(async (i) => {
    const s = document.getElementById(`s${i}`);
    for (let g = 0; g < 400 && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 20)); }
    await new Promise((q) => setTimeout(q, 700));
    const lines = [];
    const walk = (el, depth) => {
      if (depth > 7) return;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
      const data = Object.entries(el.dataset || {}).map(([k, v]) => `${k}=${JSON.stringify(String(v).slice(0, 40))}`).join(" ");
      const cs = getComputedStyle(el);
      const hidden = cs.display === "none" ? " [display:none]" : cs.visibility === "hidden" ? " [hidden]" : "";
      lines.push(`${"  ".repeat(depth)}${el.tagName.toLowerCase()}.${[...el.classList].join(".")}${hidden}${data ? ` {${data}}` : ""}${own ? ` "${own.slice(0, 60)}"` : ""}`);
      for (const c of el.children) walk(c, depth + 1);
    };
    walk(s.querySelector(".he-text"), 0);
    return { label: (s.querySelector(".vnum") || {}).textContent || "", lines };
  }, Number(i));
  console.log(`== section ${i} (${out.label}) ==`);
  console.log(out.lines.join("\n"));
}
await b.close();
