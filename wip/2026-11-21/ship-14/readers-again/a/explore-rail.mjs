// what switches a reader has at rest (the rail's rows and their buttons), and how a pair is drawn at Daniel 2:43
import { open, T } from "./lib.mjs";
const { b, p } = await open(process.argv[2] || "daniel");
const rail = await p.evaluate(() => [...document.querySelectorAll(".row")].map((r) => { const l = r.querySelector(".lab"); const vis = !!(r.offsetParent); return `${vis ? "shown" : "hidden"} | ${l ? l.textContent : "?"} | ${[...r.querySelectorAll("button, input")].map((x) => (x.textContent || x.type) + (x.getAttribute("aria-pressed") === "true" || x.classList.contains("on") ? "*" : "")).join(" / ")}`; }));
console.log(rail.map(T).join("\n"));
const pair = await p.evaluate(async () => {
  const el = document.getElementById("s63"); el.scrollIntoView({ block: "center" });
  await new Promise((r) => setTimeout(r, 1500));
  const wb = el.querySelector(".he-text .wb");
  return wb ? wb.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>") : "none";
});
console.log(T(pair));
await b.close();
