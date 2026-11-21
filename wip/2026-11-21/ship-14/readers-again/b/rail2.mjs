// Where a switch row lives and what hides it.
import { open } from "./lib.mjs";
const [BOOK = "ruth", W = "412"] = process.argv.slice(2);
const { b, p } = await open(`b=${BOOK}`);
await p.setViewportSize({ width: Number(W), height: 915 });
const chain = () => p.evaluate(() => { const row = document.querySelector('.row[data-toggle="names"]'); const out = []; for (let e = row; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); out.push(`${e.tagName.toLowerCase()}#${e.id}.${String(e.className).slice(0, 40)} display=${cs.display} hidden=${e.hidden} ${e.tagName === "DETAILS" ? "open=" + e.open : ""}`); } return out; });
console.log((await chain()).join("\n"));
await p.evaluate(() => document.querySelector("#rail > summary").click()); await p.waitForTimeout(500);
console.log("after pressing the rail's summary:"); console.log((await chain()).join("\n"));
console.log(await p.evaluate(() => [...document.querySelectorAll("#rail summary, #rail button.more, #rail [aria-expanded]")].map((x) => `${x.tagName.toLowerCase()}.${x.className} ${JSON.stringify(x.textContent.slice(0, 50))} expanded=${x.getAttribute("aria-expanded")}`).slice(0, 12)));
await b.close();
