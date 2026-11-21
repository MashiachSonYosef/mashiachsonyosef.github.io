import { open, mask } from "./lib.mjs";
const { b, p } = await open("b=obadiah&commentary=on");
const info = await p.evaluate(() => {
  const wb = document.querySelector("section.seg .he-text .wb:not(.mark)"); const t = wb.querySelector(".w span") || wb.querySelector(".w"); const r = t.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], scrollY: window.scrollY, at: el ? el.tagName + "." + el.className : null, wbCls: wb.className, firstWbIsMark: document.querySelector("section.seg .he-text .wb").classList.contains("mark"), sec: document.querySelector("section.seg .vnum").textContent };
});
console.log(JSON.stringify(info));
await p.click("section.seg .he-text .wb");
await p.waitForTimeout(3000);
console.log(mask(await p.evaluate(() => { const h = document.getElementById("hud"); return JSON.stringify({ hidden: h.hidden, kids: [...h.children].map((c) => c.className), pills: h.querySelectorAll(".r-pills button").length, sel: !!h.querySelector("#hud > .rows .b-read .r-pills button"), html: h.innerHTML.slice(0, 600) }); })));
await b.close();
