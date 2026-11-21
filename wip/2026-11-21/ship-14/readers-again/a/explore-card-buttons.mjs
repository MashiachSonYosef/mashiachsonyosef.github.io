// the presses a card offers besides its pills (Genesis 1:1 word 2, dictionaries that rest shut opened)
import { open, waitCard } from "./lib.mjs";
const { b, p } = await open("genesis");
await p.evaluate(() => document.querySelector('#kindsRow button.kinds-opt[data-kinds="open"]').click()); await p.waitForTimeout(2000);
await p.evaluate(() => { const wb = document.querySelectorAll("#s0 .he-text .wb")[1]; (wb.querySelector(".w span") || wb.querySelector(".w")).click(); });
await waitCard(p);
console.log((await p.evaluate(() => [...document.querySelectorAll("#hud button, #hud [role=button], #hud summary, #hud a")].filter((x) => !x.closest(".r-pills")).map((x) => `${x.tagName} .${x.className} «${x.textContent.trim().slice(0, 70)}» ${x.title.slice(0, 60)}`))).join("\n"));
await b.close();
