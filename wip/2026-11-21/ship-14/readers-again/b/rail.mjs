// The rail's switches as the page draws them: each row's label and its buttons (* pressed), and whether it is shown.
// node rail.mjs <book> [extra query]
import { open, mask } from "./lib.mjs";
const [BOOK = "ruth", EXTRA = ""] = process.argv.slice(2);
const { b, p } = await open(`b=${BOOK}${EXTRA}`);
const rows = await p.evaluate(() => [...document.querySelectorAll(".row .lab")].map((l) => { const row = l.closest(".row"); const bs = l.nextElementSibling ? [...l.nextElementSibling.querySelectorAll("button")] : []; return `${l.firstChild ? l.firstChild.textContent : l.textContent} [${row.dataset.toggle || ""}] shown=${!!l.offsetParent} in=${(l.closest("details") || {}).id || "-"}: ${bs.map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" || x.classList.contains("on") ? "*" : ""}${x.disabled ? "(disabled)" : ""}`).join(" | ")}`; }));
console.log(rows.map(mask).join("\n"));
console.log("rail:", await p.evaluate(() => { const d = document.querySelector("#rail"); const s = d.querySelector("summary"); const r = s.getBoundingClientRect(); return `open=${d.open} summary=${JSON.stringify(s.textContent.slice(0, 60))} at ${Math.round(r.top)} position=${getComputedStyle(d).position}; hud position=${getComputedStyle(document.querySelector("#hud")).position}`; }));
await b.close();
