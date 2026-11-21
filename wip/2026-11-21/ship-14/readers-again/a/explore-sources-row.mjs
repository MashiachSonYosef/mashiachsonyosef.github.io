// the sources row a reader has at rest: its chips, how one is pressed
import { open, T } from "./lib.mjs";
const { b, p } = await open(process.argv[2] || "daniel");
const out = await p.evaluate(() => {
  const row = [...document.querySelectorAll(".row")].find((r) => (r.querySelector(".lab") || {}).textContent.startsWith("sources"));
  const html = row.outerHTML;
  const chips = [...row.querySelectorAll("button")].map((x) => `${x.className}|${x.textContent.slice(0, 30)}|${x.getAttribute("aria-pressed")}|${x.title.slice(0, 80)}|vis=${!!x.offsetParent}|${Object.entries(x.dataset).map((e) => e.join("=")).join(",")}`);
  return { len: html.length, head: html.slice(0, 1500), chips, off: window.__sourcesOff };
});
console.log(out.len); console.log(out.head); console.log(out.chips.join("\n")); console.log(out.off);
await b.close();
