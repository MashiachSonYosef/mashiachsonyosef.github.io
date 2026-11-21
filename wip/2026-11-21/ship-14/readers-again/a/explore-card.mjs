// open the card on the pair at Daniel 2:43 and dump its head and its rows
import { open, T, waitCard } from "./lib.mjs";
const { b, p, errors } = await open("daniel");
await p.evaluate(async () => { const el = document.getElementById("s63"); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); });
await p.evaluate(() => { const wb = document.querySelector("#s63 .he-text .wb"); wb.querySelector(".w .wr").click(); });
await waitCard(p);
const dump = () => p.evaluate(() => { const h = document.getElementById("hud"); return { head: h.querySelector(".head") ? h.querySelector(".head").outerHTML : null, rows: [...h.querySelectorAll(".rows > *")].map((x) => `${x.className} :: ${x.textContent.slice(0, 260)}`), pills: [...h.querySelectorAll(".b-read .r-pills button")].map((x) => x.textContent + (x.classList.contains("on") || x.getAttribute("aria-pressed") === "true" ? "*" : "")) }; });
let d = await dump();
console.log(T(d.head)); console.log(d.rows.map(T).join("\n")); console.log("pills:", JSON.stringify(d.pills.map(T)));
console.log(errors);
await b.close();
