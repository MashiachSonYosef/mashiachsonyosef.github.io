// Lamentations 1:6 word 2: a pair whose written branch is two words. How it is drawn, and its card.
import { open, T, waitCard } from "./lib.mjs";
const { b, p, errors } = await open("lamentations");
await p.evaluate(async () => { const el = document.getElementById("s5"); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); });
console.log(T(await p.evaluate(() => document.querySelector("#s5 .he-text .wb.kq").outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>"))));
const dump = () => p.evaluate(() => { const h = document.getElementById("hud"); return { head: h.querySelector(".head") ? h.querySelector(".head").innerHTML.replace(/<p class="kq-key">[\s\S]*?<\/p>/g, "") : null, rows: [...h.querySelectorAll(".rows > *")].map((x) => `${x.className} :: ${x.textContent.slice(0, 200)}`), pills: [...h.querySelectorAll(".b-read .r-pills button")].map((x) => x.textContent + (x.classList.contains("on") || x.getAttribute("aria-pressed") === "true" ? "*" : "")) }; });
const n = await p.evaluate(() => document.querySelectorAll("#s5 .he-text .wb.kq .w .wr").length);
for (let i = 0; i < n; i += 1) {
  await p.evaluate((i) => document.querySelectorAll("#s5 .he-text .wb.kq .w .wr")[i].click(), i);
  await waitCard(p);
  const d = await dump();
  console.log(`\n== pressed half ${i}`); console.log(T(d.head)); console.log(d.rows.map(T).join("\n")); console.log("pills:", JSON.stringify(d.pills.slice(0, 10).map(T)));
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
console.log(errors);
await b.close();
