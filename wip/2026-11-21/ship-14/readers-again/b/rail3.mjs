// What a reader at rest can press that reaches the open card's redraw hook: #readsRow, #defRow, the Menu.
import { open, mask } from "./lib.mjs";
const [BOOK = "ruth", EXTRA = ""] = process.argv.slice(2);
const { b, p } = await open(`b=${BOOK}${EXTRA}`);
const say = () => p.evaluate(() => {
  const vis = (x) => !!(x && x.offsetParent);
  const one = (id) => { const r = document.getElementById(id); return r ? `#${id} shown=${vis(r)} in=${(r.closest("details") || {}).id || (r.closest("details") || {}).className || "-"} buttons: ${[...r.querySelectorAll("button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${vis(x) ? "" : "(hidden)"}`).join(" | ")}` : `#${id} absent`; };
  const menu = document.getElementById("menuPick");
  return [one("readsRow"), one("defRow"), `#nav hidden=${document.getElementById("nav").hidden}`, `#menuPick hidden=${menu.hidden}: ${[...menu.querySelectorAll("button, a")].map((x) => x.textContent.slice(0, 30) + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join(" | ")}`,
    `default pills: ${[...document.querySelectorAll(".default-pills button, #defaultPills button, .dflt-pill")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join(" | ")}`,
    `more-switches hidden=${(document.querySelector(".more-switches") || {}).hidden}`];
});
console.log((await say()).map(mask).join("\n"));
await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(600);
await p.evaluate(() => { const m = document.getElementById("navMenu"); if (m) m.click(); }); await p.waitForTimeout(500);
console.log("after scrolling down and pressing Menu:"); console.log((await say()).map(mask).join("\n"));
await p.screenshot({ path: "shot-menu.png" });
await b.close();
