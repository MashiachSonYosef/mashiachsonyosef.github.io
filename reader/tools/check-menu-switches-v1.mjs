// THE BOTTOM MENU HOLDS THE TOP ROW'S SWITCHES (the owner, 2026-10-19: "we
// would want the same toggles on the menu bar at the bottom").
//   M1  the bar's Menu holds one button for every switch the top row shows,
//       in the row's order, in the row's words
//   M2  each wears its pill's state: pressed, its state line, disabled
//   M3  a press in the menu presses the row's pill: the English reader, blobs,
//       card numbering and the concordance hud each flip, the page with them,
//       and the menu stays open for the next press
//   M4  reset in the menu puts the switches at their default, and its button
//       then says "default" and cannot be pressed, as the row's does
//   M5  the menu closes on a press outside it and on the Menu button again;
//       no page errors
// The page is found by the served zones, never named here (check-scope-derived S1).
// Usage: node tools/check-menu-switches-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const URL = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

// the row as the page shows it, and the menu as it stands
const row = () => p.evaluate(() => [...document.querySelectorAll("#modeRow button")].filter((x) => x.id && !x.hidden && !x.closest("[hidden]")).map((x) => {
  const said = document.getElementById(x.getAttribute("aria-describedby") || "");
  return { id: x.id, text: x.textContent, pressed: x.getAttribute("aria-pressed"), on: x.classList.contains("on"), disabled: x.disabled, said: said ? said.textContent : "" };
}));
const menu = () => p.evaluate(() => {
  const m = document.getElementById("menuPick");
  return { open: !m.hidden, items: [...m.querySelectorAll("button")].map((x) => ({ id: x.dataset.for, text: x.firstChild.textContent, pressed: x.getAttribute("aria-pressed"), on: x.classList.contains("on"), disabled: x.disabled, said: x.lastChild.textContent })) };
});
const same = (r, m) => r.length === m.length && r.every((x, i) => m[i].id === x.id && m[i].text === x.text && m[i].pressed === x.pressed && m[i].on === (x.pressed === "true" || x.on) && m[i].disabled === x.disabled && m[i].said === x.said);
const openMenu = async () => {
  await p.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight - innerHeight, 2400)));
  await p.waitForTimeout(500);
  await p.waitForSelector("#nav:not([hidden])", { timeout: 5000 }).catch(() => {});
  if (await p.evaluate(() => document.getElementById("menuPick").hidden)) await p.click("#navMenu");
  await p.waitForTimeout(200);
};
const press = async (id) => { await p.click(`#menuPick button[data-for="${id}"]`); await p.waitForTimeout(700); };

await openMenu();
let r = await row(), m = await menu();
const ids = r.map((x) => x.id);
check("M1 the menu holds every switch the row shows, in its order and words", m.open && m.items.length === r.length && m.items.every((x, i) => x.id === r[i].id && x.text === r[i].text),
  m.items.map((x) => x.text).join(" | "));
check("M2 each wears its pill's state", same(r, m.items), JSON.stringify(m.items.map((x) => [x.text, x.pressed, x.said, x.disabled])));

const flips = [];
for (const [id, read] of [["modeEn", () => p.evaluate(() => document.body.classList.contains("en"))], ["blobPill", null], ["numsPill", () => p.evaluate(() => document.body.classList.contains("nums"))], ["dictPill", null]]) {
  if (!ids.includes(id)) { flips.push(`${id} absent`); continue; }
  const before = (await row()).find((x) => x.id === id), page0 = read ? await read() : null;
  await press(id);
  const after = (await row()).find((x) => x.id === id), page1 = read ? await read() : null;
  const mm = await menu();
  const flipped = before.pressed !== after.pressed && (!read || page0 !== page1);
  flips.push(`${after.text}: ${before.pressed} to ${after.pressed}${read ? `, page ${page0} to ${page1}` : ""}${flipped ? "" : " (did not flip)"}${mm.open ? "" : " (menu closed)"}`);
  if (!flipped || !mm.open || !same(await row(), mm.items)) flips.bad = true;
}
check("M3 a press in the menu presses the row's pill, and the menu stays open", !flips.bad && flips.length === 4 && !flips.some((x) => / absent$/u.test(x)), flips.join(" | "));

await press("resetPill");
r = await row(); m = await menu();
const at = (id) => (r.find((x) => x.id === id) || {}).pressed;
const reset = m.items.find((x) => x.id === "resetPill") || {};
check("M4 reset in the menu puts the switches at their default, and says so",
  at("modeEn") === "false" && at("blobPill") === "false" && at("numsPill") === "true" && at("dictPill") === "false" && reset.said === "default" && reset.disabled === true && same(r, m.items),
  `English ${at("modeEn")}, blobs ${at("blobPill")}, numbering ${at("numsPill")}, concordance ${at("dictPill")}, reset "${reset.said}" ${reset.disabled ? "disabled" : "pressable"}`);

// the press outside lands in the page's gutter, where no word stands: a
// press on a word opened its card over the Menu button (the row grew by a
// pill on 2026-10-23 and the page below it moved)
await p.mouse.click(6, 300);
await p.waitForTimeout(200);
const closedOut = !(await menu()).open;
await p.keyboard.press("Escape"); await p.waitForTimeout(150);
await openMenu();
await p.click("#navMenu");
await p.waitForTimeout(200);
const closedBtn = !(await menu()).open;
check("M5 the menu closes on a press outside it and on the Menu button", closedOut && closedBtn, `outside ${closedOut}, button ${closedBtn}`);

await b.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
