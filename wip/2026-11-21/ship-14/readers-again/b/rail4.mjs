// The sources row of the rail: its controls, as drawn.
import { open } from "./lib.mjs";
const { b, p } = await open(`b=genesis`);
await p.evaluate(() => document.querySelector("#rail > summary").click()); await p.waitForTimeout(400);
const out = await p.evaluate(() => { const row = document.querySelector('.row[data-toggle="sources"]'); return [...row.querySelectorAll("button, input, summary")].filter((x) => !x.disabled).map((x) => `${x.tagName.toLowerCase()}.${x.className}${x.type ? "[" + x.type + "]" : ""} text=${JSON.stringify(x.textContent.slice(0, 26))} pressed=${x.getAttribute("aria-pressed")} checked=${x.checked} label=${JSON.stringify(x.getAttribute("aria-label") || x.title || "").slice(0, 80)} shown=${!!x.offsetParent}`); });
console.log(out.join("\n"));
await b.close();
